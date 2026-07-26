import { getPlayerCount } from '../services/stats.service.js'

export const handleGetPlayerCount = async (req, res) => {
    try {
        const count = await getPlayerCount()
        res.json({ totalPlayers: count })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to fetch player count' })
    }
}