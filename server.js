const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:4000'],
    credentials: true,
  }
})

app.use(cors())

const crypto = require('crypto')

server.listen(4000, () => {
  console.log('Listening on *:3000')
})

io.on('connection', (socket) => {
  const uuid = crypto.randomUUID()

  socket.on('user-connected', (username) => {
    let userData = { username, uuid }

    socket.emit('user-info', userData)
    console.log(userData)
  })

  socket.on('send-message', (msg) => {
    io.emit('message', msg)
  })
})
