import { applyInput } from "../game/physics.js"

export const handleInput = (ws, data) => {
    applyInput(ws.id, data.x, data.y)
}