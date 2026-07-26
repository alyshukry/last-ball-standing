import { Router } from 'express'
import { handleGetPlayerCount } from '../controllers/stats.controller.js'

const router = Router()

router.get('/', handleGetPlayerCount)

export default router