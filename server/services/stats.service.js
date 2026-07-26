import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

export const incrementPlayerCount = async () => await redis.incr('totalPlayers')
export const getPlayerCount = async () => await redis.get('totalPlayers')