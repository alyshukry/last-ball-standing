import express from 'express'
import { initSocket } from './socket.js'

const PORT = 8000

const app = express()

const server = app.listen(PORT, () => {
    console.log('yo')
})

initSocket(server)