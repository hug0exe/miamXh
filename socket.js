const express = require("express")
const app = express()
const http = require("http")
const server = http.createServer(app)
const { Server } = require("socket.io")
const io = new Server(server, {
	cors: {
    	origin: "*",
	},
})

app.get("/", (req, res) => {
	res.sendFile(__dirname + "/index.html")
})

var usernames = {}
var rooms = ["room1", "room2", "room3"]

var theRoomTable = null
var userRoomOne = []
var userRoomTwo = []
var userRoomThree = []

var deleteinRoomFrist = null
var deleteinRoomSecond = null

io.on("connection", (socket) => {
	console.log("a user connected")
	socket.on("disconnect", () => {
    console.log("user disconnected")
	})
	socket.on("chat message", (msg) => {
    io.emit("chat message", msg)
	})
	socket.on("clicked", function () {
    io.emit("clicked")
	})
})

io.sockets.on("connection", function (socket) {
  // when the client emits 'adduser', this listens and executes
	socket.on("adduser", function (username) {
    // store the username in the socket session for this client
    socket.username = username
    // store the room name in the socket session for this client
    socket.room = "room1"
    // add the client's username to the global list
    usernames[username] = username
    // send client to room 1
    socket.join("room1")
    // echo to client they've connected
    socket.emit("updatechat", "SERVER", "you have connected to room1")
    // echo to room 1 that a person has connected to their room
    socket.broadcast
    	.to("room1")
    	.emit("updatechat", "SERVER", username + " has connected to this room")
    socket.emit("updaterooms", rooms, "room1")
	})

  // when the client emits 'sendchat', this listens and executes
	socket.on("sendchat", function (data) {
    // we tell the client to execute 'updatechat' with 2 parameters
    	io.sockets.in(socket.room).emit("updatechat", socket.username, data)
	})

  socket.on("switchRoom", function (newroom) {
    // leave the current room (stored in session)
    socket.leave(socket.room)
    // join new room, received as function parameter
    socket.join(newroom)
    socket.emit("updatechat", "SERVER", "you have connected to " + newroom)
    // sent message to OLD room
    socket.broadcast
      .to(socket.room)
      .emit("updatechat", "SERVER", socket.username + " has left this room")
    // update socket session room title
    socket.room = newroom
    socket.broadcast
      .to(newroom)
      .emit("updatechat", "SERVER", socket.username + " has joined this room")
    socket.emit("updaterooms", rooms, newroom)

    if (socket.room == "room1") {
      console.log("room 1")
      deleteinRoomFrist = userRoomTwo
      deleteinRoomSecond = userRoomThree
      deleteInRooms()

      userRoomOne.push(socket.username)
      theRoomTable = userRoomOne
    } else if (socket.room == "room2") {
      console.log("room 2")
      deleteinRoomFrist = userRoomOne
      deleteinRoomSecond = userRoomThree
      deleteInRooms()

      userRoomTwo.push(socket.username)
      theRoomTable = userRoomTwo
    } else if (socket.room == "room3") {
      console.log("room 3")
      deleteinRoomFrist = userRoomOne
      deleteinRoomSecond = userRoomTwo
      deleteInRooms()

      userRoomThree.push(socket.username)
      theRoomTable = userRoomThree
    }
    console.log(theRoomTable)
    socket.broadcast.to(socket.room).emit("userRoomList", theRoomTable)
  })

  function deleteInRooms() {
    var item = socket.username
    deleteinRoomFrist.remove = function (value) {
      this.splice(this.indexOf(value), 1)
    }
    deleteinRoomSecond.remove = function (value) {
      this.splice(this.indexOf(value), 1)
    }
    deleteinRoomFrist.remove(item)
    deleteinRoomSecond.remove(item)
  }

  // when the user disconnects.. perform this
  socket.on("disconnect", function () {
    // remove the username from global usernames list
    delete usernames[socket.username]
    // update list of users in chat, client-side
    io.sockets.emit("updateusers", usernames)
    // echo globally that this client has left
    socket.broadcast.emit(
      "updatechat",
      "SERVER",
      socket.username + " has disconnected"
    )
    socket.leave(socket.room)
  })
})

server.listen(3000, () => {
  console.log("listening on *:3000")
})
