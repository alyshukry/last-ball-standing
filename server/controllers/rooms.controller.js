import { createRoom, getRooms, getRoom, deleteRoom } from "../services/rooms.service.js"

export const handleCreateRoom = (req, res) => {
    const { name, password, arenas } = req.body

    res.status(201).json(createRoom({ name, password, arenas }))
}

export const handleGetRooms = (req, res) => {
    res.status(200).json(getRooms())
}

export const handleGetRoom = (req, res) => {
    const room = getRoom(req.params.id)
    if (!room) return res.status(404).json({ error: 'room not found' })
    res.status(200).json(room)
}

export const handleDeleteRoom = (req, res) => {
    const exists = getRoom(req.params.id)
    if (!exists) return res.status(404).json({ error: 'room not found' })
    deleteRoom(req.params.id)
    res.status(204).send()
}