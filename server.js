require('dotenv').config()

const dayjs = require('dayjs')
const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')

const app = express()

const PORT = process.env.PORT || 4000

app.use(cors())

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.ORIGIN,
    // credentials: true,
  }
})

const crypto = require('crypto')
let users = new Map()

server.listen(PORT, () => {
  console.log(`Server at ${PORT}`)
})

io.on('connection', async (socket) => {
  const uuid = crypto.randomUUID()

  // Join rooms
  socket.on('join-room', (room) => {
    socket.join(room)
  })

  socket.on('user-connected', (username) => {
    users.set(socket.id, { id: uuid, username })

    socket.emit('user-info', users.get(socket.id))
    io.emit('user-info-public', Array.from(users.values()))
  })

  // User info
  socket.on('get-user', () => {
    let userInfo = users.get(socket.id) || { id: '', username: ''  }

    socket.emit('send-user', userInfo)
  })

  // Messages
  socket.on('send-message', (msg) => {
    let timeNow = dayjs()
    let userSender = {
      user: users.get(socket.id),
      message: msg,
      sendTime: `${timeNow?.$H}:${timeNow?.$m}`
    }

    io.to('general').emit('message', userSender)
  })

  // Disconnect users
  socket.on('disconnect', () => {
    let deletedUser = users.get(socket.id)

    users.delete(socket.id)

    io.emit('logout', deletedUser)
    io.emit('user-info-public', Array.from(users.values()))
    socket.leave('general')
  })
})
