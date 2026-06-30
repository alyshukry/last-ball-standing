import { startGame } from '../services/rooms.service.js'

export const handleStartGame = (ws) => {
    if (!ws.id || !ws.room) throw new AppError('User ID and or room ID not attached', 'missing_id', true)

    startGame(ws.room, ws.id)
}