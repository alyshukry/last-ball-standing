import { startGame } from '../services/rooms.service.js'

export const handleStartGame = (ws, data) => {
    if (!ws.id || !ws.room) return

    startGame(ws.room, ws.id)
}