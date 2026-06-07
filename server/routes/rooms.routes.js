import { Router } from 'express'
import { handleCreateRoom, handleGetRooms, handleGetRoom, handleDeleteRoom } from '../controllers/rooms.controller.js'

const router = Router()

router.post('/', handleCreateRoom)
router.get('/', handleGetRooms)
router.get('/:id', handleGetRoom)
router.delete('/:id', handleDeleteRoom)

export default router