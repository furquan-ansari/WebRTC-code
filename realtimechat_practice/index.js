const express = require('express')
const socket = require('socket.io')
var app = express()

var server = app.listen(3000,()=>{
    console.log('listening on port 3000');
})

app.use(express.static('public'))

var upgradedServer = socket(server)

upgradedServer.on('connection',(socket)=>{
    socket.on('sendingMsg',(data)=>{
        upgradedServer.emit('broadcastMessage',data)
    })
    console.log('websocket connected',socket.id);
})