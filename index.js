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
} = require("./controllers/gameController")
const { permission } = require("node:process")

const app = express()
const server = createServer(app)
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5174",
        // methods: ["GET", "POST"],
    },
    connectionStateRecovery: { maxDisconnectionDuration: 2 * 60 * 1000 },
})

app.use(
    cors({
        origin: "http://localhost:5174",
    })
)

// app.get("/", (req, res) => {
//     res.send("ok")
// })

let count = 0
io.on("connection", (socket) => {
    count++
    // console.log("user connected" + ` ${count}`)

    socket.on("smt", (msg) => {
        console.log(msg)
    })
    socket.on("createGame", async (callback) => {
        const gameId = randomUUID()
        socket.join(gameId)
        const playerId = randomUUID()

        await createGame({ gameId, playerTurn: playerId })
        await createPlayer({ playerId, gameId })
        await createGameboard({ playerId })

        callback({ gameId, playerId })

        // const room = io.sockets.adapter.rooms.get(gameId)
        // console.log(room)
        // console.log("Room size:", room.size)
    })

    socket.on(
        "joinGame",
        async ({ gameIdInput, playerId: userId }, callback) => {
            const gameId = gameIdInput
            let joined = false
            let errorMsg = null
            let roomSize = null
            let isFullGame = false
            const playerId = randomUUID()
            console.log("joinGame event")

            // if game (room) exists
            if (io.sockets.adapter.rooms.has(gameId)) {
                roomSize = io.sockets.adapter.rooms.get(gameId).size
                console.log("room size while trying to join game:", roomSize)
                // check room capacity
                if (roomSize >= 2) {
                    errorMsg = "Game full"
                } else if (roomSize === 1) {
                    socket.join(gameId)
                    await createPlayer({ playerId, gameId })
                    await createGameboard({ playerId })

                    const game = await getGame({ gameId })
                    console.log(game)

                    // isFullGame = roomSize === 1 ? true : false
                    io.to(gameId).emit("userJoin", {
                        msg: "User has joined",
                        game,
                    })
                    joined = true
                }
            } else {
                errorMsg = "Game does not exist"
            }
            // const room = io.sockets.adapter.rooms.get(gameId)
            // console.log(room)
            // console.log("Room size:", room.size)

            callback({ joined, errorMsg, gameId, playerId })
        }
    )

    socket.on("placeShips", async ({ gameId, playerId, r, c }) => {
        console.log("placeShips() " + "playerId: " + playerId)
        const gameboard = await getGameBoard({ playerId })

        const ship = await prisma.ship.create({
            data: {
                id: randomUUID(),
                gameBoardId: gameboard.id,
            },
        })
        await prisma.coordinate.create({
            data: {
                id: randomUUID(),
                row: r,
                col: c,
                ship: {
                    connect: {
                        id: ship.id,
                    },
                },
            },
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
            const game = await prisma.game.findUnique({
                where: {
                    id: gameId,
                },
                include: {
                    Players: {
                        include: {
                            gameBoard: {
                                include: {
                                    Ship: {
                                        include: {
                                            Coordinate: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            })
            console.log("Game ready game: ", game)
            // const gameboard = await prisma.gameBoard.findUnique({
            //     where: {
            //         playerId: playerId,
            //     },
            //     include: {
            //         Coordinates: true,
            //         Ship: true,
            //     },
            // })
            io.to(gameId).emit("startGame", game)
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
    console.log(`server running at PORT ${PORT} !!`)
})
