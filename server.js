require('dotenv').config()

const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')

const app = express()

const PORT = process.env.PORT || 4000

// app.use(cors({ origin: process.env.HEROKU_ORIGIN }))
app.use(cors())

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: ['https://chat-room-client-psi.vercel.app/', 'https://chat-room-client-patrick564.vercel.app/', 'https://chat-room-client-git-main-patrick564.vercel.app/'],
    // origin: 'https://chat-room-client-*.vercel.app',
    methods: ['GET', 'POST'],
    credentials: true,
  }
})

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
