import { applyInput } from "../game/world.js"

export const handleInput = (ws, data) => {
    applyInput(ws.id, data.x, data.y)
}