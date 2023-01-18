var socket =io.connect('http://localhost:3000')

var message = document.getElementById('message')
var button = document.getElementById('send')
var username= document.getElementById('username')
var output = document.getElementById('output')

button.addEventListener('click',()=>{
    socket.emit('sendingMsg',{
        'message':message.value,
        'username':username.value
    })
})

socket.on('broadcastMessage',()=>(data)=>{
 output.innerHTML += "<p><strong>" + data.username + ":</strong>" + data.message + "</p>"
})