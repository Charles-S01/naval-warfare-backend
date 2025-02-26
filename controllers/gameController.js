const prisma = require("../prisma/prisma")
const { randomUUID } = require("node:crypto")

async function createPlayer({ playerId, gameId }) {
    try {
        const player = await prisma.player.create({
            data: {
                id: playerId,
                gameId: gameId,
            },
        })
        return player
    } catch (error) {
        console.log(error)
    }
}

async function createGameboard({ playerId }) {
    try {
        const gameboard = await prisma.gameBoard.create({
            data: {
                id: randomUUID(),
                playerId: playerId,
            },
        })
        return gameboard
    } catch (error) {
        console.log(error)
    }
}

async function getGameBoard({ playerId }) {
    try {
        console.log("DOING getGameBoard()" + "playerId: " + playerId)
        const gameboard = await prisma.gameBoard.findUnique({
            where: {
                playerId: playerId,
            },
        })
        console.log("Gameboard:", gameboard)
        return gameboard
    } catch (error) {
        console.log(error)
    }
}

async function createGame({ gameId, playerTurn }) {
    try {
        const game = await prisma.game.create({
            data: {
                id: gameId,
                playerTurn: playerTurn,
            },
        })
        return game
    } catch (error) {
        console.log(error)
    }
}

async function getGame({ gameId }) {
    try {
        const game = await prisma.game.findUnique({
            where: {
                id: gameId,
            },
            include: {
                Players: true,
            },
        })
        return game
    } catch (error) {
        console.log(error)
    }
}
module.exports = {
    createPlayer,
    createGame,
    getGame,
    createGameboard,
    getGameBoard,
}
