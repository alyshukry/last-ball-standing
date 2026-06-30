import { applyInput, applyMove } from "../game/world.js"
import { getFullRoom } from "../services/rooms.service.js"
import { AppError } from "../utils/errors.js"

export const handleInput = (ws, data) => {
    if (!data.move) {
        if (data.x !== undefined && data.y !== undefined)
            applyInput(getFullRoom(ws.room), ws.id, data.x, data.y)
        else throw new AppError('No x and or y values provided', 'invalid_input')
    }
    if (data.move) { applyMove(getFullRoom(ws.room), ws.id, data.move) }
}