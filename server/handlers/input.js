import { applyInput } from "../game/engine.js"

export const handleInput = (ws, data) => {
    applyInput(ws.id, data.x, data.y)
}