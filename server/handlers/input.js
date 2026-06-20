import { applyInput, applyMove } from "../game/world.js"
import { getFullRoom } from "../services/rooms.service.js"

export const handleInput = (ws, data) => {
    if (!data.move)
        applyInput(getFullRoom(ws.room), ws.id, data.x, data.y)
    if (data.move)
        applyMove(getFullRoom(ws.room), ws.id, data.move)
}