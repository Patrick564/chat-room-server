require('dotenv').config()

const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true,
  }
})

const PORT = process.env.PORT || 4000

app.use(cors())

const crypto = require('crypto')

server.listen(PORT, () => {
  console.log(`Server at ${PORT}`)
})

io.on('connection', (socket) => {
  const uuid = crypto.randomUUID()

  socket.on('user-connected', (username) => {
    let userData = { username, uuid }

    socket.emit('user-info', userData)
  })

  socket.on('send-message', (msg) => {
    io.emit('message', msg)
  })
})
