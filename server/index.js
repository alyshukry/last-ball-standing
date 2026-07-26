import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { initSocket } from './socket.js'
import roomsRouter from './routes/rooms.routes.js'
import statsRouter from './routes/stats.routes.js'
import path from 'path'
import { fileURLToPath } from 'url'

const PORT = process.env.PORT || 8000

const app = express()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
app.use(express.static(path.join(__dirname, '../client')))
app.use(cors())
app.use(express.json())

app.use('/rooms', roomsRouter)
app.use('/stats', statsRouter)

const server = app.listen(PORT, () => {
    console.log('server online listening on port ' + PORT)
})


initSocket(server)