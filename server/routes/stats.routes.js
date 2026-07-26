import { Router } from 'express'
import { getPlayerCount } from '../services/stats.service.js'

const router = Router()

router.get('/', getPlayerCount)

export default router