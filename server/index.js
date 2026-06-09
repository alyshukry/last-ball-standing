import express from 'express'
import cors from 'cors'
import { initSocket } from './socket.js'
import roomsRouter from './routes/rooms.routes.js'

const PORT = 8000

const app = express()

app.use(cors())
app.use(express.json())

app.use('/rooms', roomsRouter)

const server = app.listen(PORT, () => {
    console.log('server online listening on port ' + PORT)
})


initSocket(server)