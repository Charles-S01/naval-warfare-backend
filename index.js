const express = require("express")
const { createServer } = require("node:http")
const { Server } = require("socket.io")
const cors = require("cors")
const { randomUUID } = require("node:crypto")
const prisma = require("./prisma/prisma")

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

        const game = await prisma.game.create({
            data: {
                id: gameId,
                playerTurn: playerId,
            },
        })
        const player = await prisma.player.create({
            data: {
                id: playerId,
                gameId: gameId,
            },
        })

        callback({ gameId, playerId })

        const room = io.sockets.adapter.rooms.get(gameId)
        console.log(room)
        console.log("Room size:", room.size)
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
                } else if (roomSize < 2) {
                    socket.join(gameId)
                    if (!userId) {
                        const player = await prisma.player.create({
                            data: {
                                id: playerId,
                                gameId: gameId,
                            },
                        })
                    }
                    // else if (userId) {
                    //     const isValidPlayer = await prisma.player.findUnique({
                    //         where: {
                    //             id: userId,
                    //             gameId: gameId,
                    //         },
                    //     })
                    //     if (isValidPlayer) {
                    //         socket.join(gameId)
                    //         msg = "User has joined"
                    //         io.to(gameId).emit("userJoin", {
                    //             msg: "User has joined",
                    //             isFullGame,
                    //         })
                    //     }
                    // }

                    isFullGame = roomSize === 1 ? true : false
                    io.to(gameId).emit("userJoin", {
                        msg: "User has joined",
                        isFullGame,
                    })
                    joined = true
                }
            } else {
                errorMsg = "Game does not exist"
            }
            // console.log("new room size:", io.sockets.adapter.rooms.get(gameId).size)
            callback({ joined, errorMsg, isFullGame, gameId, playerId })
        }
    )

    // socket.on("endGame", async (gameId) => {
    //     await prisma.
    // })
})

PORT = 3000
server.listen(PORT, () => {
    console.log(`server running at PORT ${PORT} !!`)
})
