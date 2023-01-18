const express = require('express')
const socket  = require('socket.io')
const app = express()

let server = app.listen(2000,()=>{
    console.log('Server is running on 2000');
})

app.use(express.static('public'))

let io = socket(server)

io.on('connection',(socket)=>{
    console.log('User connected :'+ socket.id);
    
    socket.on('join',(roomName)=>{
        let rooms = io.sockets.adapter.rooms
        // console.log(rooms);
        // let room = io.socket.adapter.rooms.get(roomName)
        let room = rooms.get(roomName)

        if(room == undefined){
            socket.join(roomName)
            // console.log('Room Created');
            socket.emit('created')
        }
        else if(room.size == 1){
            socket.join(roomName)
            // console.log("Room Joined");
            socket.emit('joined')
        }
        else{
            // console.log("Room Full for Now");
            socket.emit('full')
        }
        console.log(rooms);

    })
    socket.on('ready',(roomName)=>{
        console.log('ready');
        socket.broadcast.to(roomName).emit('ready')
    })
    socket.on('candidate',(candidate,roomName)=>{
        console.log(candidate);
        socket.broadcast.to(roomName).emit('candidate',candidate)
    })
    socket.on('offer',(offer,roomName)=>{
        console.log(offer);
        socket.broadcast.to(roomName).emit('offer',offer)
    })
    socket.on('answer',(answer,roomName)=>{
        console.log('answer');
        socket.broadcast.to(roomName).emit('answer',answer)
    })
    socket.on('leave',(roomName)=>{
        socket.leave(roomName)
        socket.broadcast.to(roomName).emit('leave')
    })
})