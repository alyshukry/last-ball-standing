import { applyInput, applyMove } from "../game/world.js"
import { getFullRoom } from "../services/rooms.service.js"

export const handleInput = (ws, data) => {
    if (!data.move) {
        if (data.x && data.y)
            applyInput(getFullRoom(ws.room), ws.id, data.x, data.y)
        else throw new AppError('No x and or y values provided', 'invalid_input')
    }
    if (data.move) { applyMove(getFullRoom(ws.room), ws.id, data.move) }
}