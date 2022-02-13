require('dotenv').config()

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

  socket.on('join-room', (room) => {
    socket.join(room)
  })

  socket.on('user-connected', (username) => {
    users.set(socket.id, { id: uuid, username })
    socket.emit('user-info', users.get(socket.id))
    io.emit('user-info-public', Array.from(users.values()))
  })

  socket.on('send-message', (msg) => {
    let userSender = users.get(socket.id)

    io.to('general').emit('message', { msg, user: userSender })
  })

  socket.on('disconnect', () => {
    let deletedUser = users.get(socket.id)

    users.delete(socket.id)
    // io.emit('logout', {
    //   deletedUser,
    //   usersList: Array.from(users.values())
    // })
    io.emit('logout', deletedUser)
    io.emit('user-info-public', Array.from(users.values()))
    socket.leave('general')
  })
})
