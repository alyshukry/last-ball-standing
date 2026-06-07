import { applyInput } from "../game/world.js"
import { getFullRoom } from "../services/rooms.service.js"

export const handleInput = (ws, data) => {
    applyInput(getFullRoom(ws.room), ws.id, data.x, data.y)
}