const express = require("express")
const { createServer } = require("node:http")
const { Server } = require("socket.io")
const cors = require("cors")
const { randomUUID } = require("node:crypto")
const prisma = require("./prisma/prisma")
const {
    createPlayer,
    createGame,
    getGame,
    createGameboard,
    getGameBoard,
    deleteGame,
} = require("./controllers/gameController")
// const { permission } = require("node:process")

const app = express()
const server = createServer(app)
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
    },
    connectionStateRecovery: { maxDisconnectionDuration: 2 * 60 * 1000 },
})

app.use(
    cors({
        origin: "http://localhost:5173",
    })
)

io.on("connection", (socket) => {
    socket.on("createGame", async ({ existingGameId }, callback) => {
        console.log("Existing game id:", existingGameId)
        const gameId = randomUUID()
        socket.join(gameId)
        const playerId = randomUUID()

        if (existingGameId) {
            await deleteGame({ gameId: existingGameId })
        }

        await createGame({ gameId, playerTurn: playerId })
        await createPlayer({ playerId, gameId })
        await createGameboard({ playerId })

        callback({ gameId, playerId })

        // const room = io.sockets.adapter.rooms.get(gameId)
        // console.log(room)
        // console.log("Room size:", room.size)
    })

    socket.on("joinGame", async ({ gameIdInput }, callback) => {
        const gameId = gameIdInput
        let joined = false
        let errorMsg = null
        let roomSize = null
        const playerId = randomUUID()
        console.log("joinGame event")

        // if game (room) exists
        if (io.sockets.adapter.rooms.has(gameId)) {
            roomSize = io.sockets.adapter.rooms.get(gameId).size
            console.log("room size while trying to join game:", roomSize)
            // check room capacity
            if (roomSize >= 2) {
                console.log("Game full")
                errorMsg = "Game full"
            } else if (roomSize === 1) {
                socket.join(gameId)
                await createPlayer({ playerId, gameId })
                await createGameboard({ playerId })

                const game = await getGame({ gameId })
                console.log(game)

                io.to(gameId).emit("userJoin", {
                    msg: "User has joined",
                    game,
                })
                joined = true
            }
        } else {
            console.log("Game does not exist")
            errorMsg = "Game does not exist"
        }
        // const room = io.sockets.adapter.rooms.get(gameId)
        // console.log(room)
        // console.log("Room size:", room.size)

        callback({ joined, errorMsg, gameId, playerId })
    })

    socket.on("placeShips", async ({ gameId, playerId, userShipCoordsSelection }) => {
        console.log("placeShips() " + "playerId: " + playerId)
        try {
            const gameboard = await getGameBoard({ playerId })

            if (gameboard.Ships.length > 0) {
                return
            }

            const ship = await prisma.ship.create({
                data: {
                    id: randomUUID(),
                    gameBoardId: gameboard.id,
                    length: 5,
                    shipType: "CARRIER",
                },
            })

            await prisma.coordinate.createMany({
                data: userShipCoordsSelection.map((el) => ({
                    id: randomUUID(),
                    row: el.row,
                    col: el.col,
                    shipType: "CARRIER",
                    gameBoardId: gameboard.id,
                })),
            })

            const game = await prisma.game.update({
                where: {
                    id: gameId,
                },
                data: {
                    playersReadyCount: {
                        increment: 1,
                    },
                },
            })
            if (game.playersReadyCount === 2) {
                const game = await getGame({ gameId })
                console.log("Game ready game: ", game)

                io.to(gameId).emit("startGame", game)
            }
        } catch (error) {
            console.log(error)
        }
    })

    socket.on("attackSpot", async ({ gameId, playerId, oppId, oppBoardId, row, col }, callback) => {
        try {
            console.log("attack-spot event")
            console.log("Row: ", row)
            console.log("Col: ", col)
            console.log("Opponent board id: ", oppBoardId)
            const shipCoord = await prisma.coordinate.findFirst({
                where: {
                    gameBoardId: oppBoardId,
                    row: row,
                    col: col,
                    shipType: {
                        not: null,
                    },
                },
            })
            const isHit = shipCoord ? true : false
            if (isHit) {
                await prisma.coordinate.update({
                    where: {
                        id: shipCoord.id,
                    },
                    data: {
                        isHit: isHit,
                    },
                })
            } else if (!isHit) {
                await prisma.coordinate.create({
                    data: {
                        id: randomUUID(),
                        gameBoardId: oppBoardId,
                        row: row,
                        col: col,
                        isHit: false,
                    },
                })
            }

            let ship = null
            if (isHit) {
                ship = await prisma.ship.update({
                    where: {
                        gameBoardId_shipType: {
                            shipType: shipCoord.shipType,
                            gameBoardId: oppBoardId,
                        },
                    },
                    data: {
                        length: {
                            decrement: 1,
                        },
                    },
                })
            }

            const isSunk = ship?.length === 0

            const game = await prisma.game.update({
                where: {
                    id: gameId,
                },
                data: {
                    playerTurn: oppId,
                    winner: isSunk ? playerId : null,
                },
                include: {
                    Players: {
                        include: {
                            gameBoard: {
                                include: {
                                    Coordinates: true,
                                    Ships: true,
                                },
                            },
                        },
                    },
                },
            })
            callback({ ok: true })
            io.to(gameId).emit("attackAttempt", game)
        } catch (error) {
            console.log(error)
        }
    })

    socket.on("endGame", async (gameId) => {
        try {
            await prisma.game.delete({
                where: {
                    id: gameId,
                },
            })
            io.to(gameId).emit("endGame")
        } catch (error) {
            console.log(error)
        }
    })
})

PORT = 3000
server.listen(PORT, () => {
    console.log(`server running at PORT ${PORT} !`)
})
