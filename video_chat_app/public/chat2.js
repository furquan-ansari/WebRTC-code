// Below code is purely ES6

let socket = io();
let divVideoChatLobby = document.getElementById('video-chat-lobby')
let divVideoChat = document.getElementById('video-chat-room')
let joinButton = document.getElementById('join')
let userVideo = document.getElementById('user-video')
let peerVideo = document.getElementById('peer-video')
let roomInput = document.getElementById('roomName')
let roomName; 
let creator = false;
let rtcPeerConnection;
let userStream;

let divButtonGroup = document.getElementById('btn-group')
let muteButton = document.getElementById('muteButton')
let hideCameraButton = document.getElementById('hideCameraButton')
let leaveRoomButton = document.getElementById('leaveRoomButton')

let muteFlag = false;
let hideCameraFlag = false;

let iceServers = {
    iceServers: [
{ urls: "stun:stun.services.mozilla.com" },
{ urls: "stun:stun.l.google.com:19302" },
],

}

joinButton.addEventListener("click", ()=> {
if(roomInput.value == ""){
    alert('Please Enter a Room Name')
}
else{
    roomName = roomInput.value
    socket.emit('join',roomName)
}
})


    

muteButton.addEventListener('click',()=>{
    muteFlag =!muteFlag
    if(muteFlag){
        userStream.getTracks()[0].enabled = false
        muteButton.textContent="Unmute"
    }else{
        userStream.getTracks()[0].enabled = true
        muteButton.textContent="Mute"
    }
  
})
hideCameraButton.addEventListener('click',()=>{
  hideCameraFlag = !hideCameraFlag
  if(hideCameraFlag){
    userStream.getTracks()[1].enabled = false
    hideCameraButton.textContent="Show Camera"
}else{
    userStream.getTracks()[1].enabled = true
    hideCameraButton.textContent="Hide Camera"
}
})


leaveRoomButton.addEventListener('click',()=>{
    socket.emit('leave',roomName)
    
    divVideoChatLobby.style = "display:block"
    divButtonGroup.style = "display:none"

    if(userVideo.srcObject){
    userVideo.srcObject.getTracks()[0].stop()
    userVideo.srcObject.getTracks()[1].stop()
    
// if you want to write above logic in foreach loop
// userVideo.srcObject.getTracks().forEach((track)=>track.stop())
    }
    if(peerVideo.srcObject){
    peerVideo.srcObject.getTracks()[0].stop()
    peerVideo.srcObject.getTracks()[1].stop()

// if you want to write above logic in foreach loop
// peerVideo.srcObject.getTracks().forEach((track)=>track.stop())
    }

    if(rtcPeerConnection){
        rtcPeerConnection.ontrack = null
        rtcPeerConnection.onicecandidate = null
        rtcPeerConnection.close()
        rtcPeerConnection = null
    }
})

socket.on('created',()=>{
    creator = true
 
navigator.mediaDevices.getUserMedia({
    audio:true,
    video:{width:500, height:500} 
})
.then((stream)=>{
    userStream = stream
    divVideoChatLobby.style ="display:none"
    divButtonGroup.style ="display:flex"
        userVideo.srcObject = stream;
        userVideo.onloadedmetadata = (e)=>{
            userVideo.play()
        }

})
.catch((err)=>{
    alert("Couldn't access user media")
})


   /*  navigator.getUserMedia({
        audio:true,
        video:{width:1280, height:720} 
    },(stream)=>{
        divVideoChatLobby.style ="display:none"
        userVideo.srcObject = stream;
        userVideo.onloadeddata = (e)=>{
            userVideo.play()
        }
    },()=>{
        alert("Couldn't access user media")
    }) */

})
socket.on('joined',()=>{
    creator = false

    navigator.mediaDevices.getUserMedia({
        audio:true,
        video:{width:500, height:500} 
    })
    .then((stream)=>{
        userStream = stream
        divVideoChatLobby.style = "display:none"
        divButtonGroup.style = "display:flex"
        userVideo.srcObject = stream;
        userVideo.onloadedmetadata = (e)=>{
            userVideo.play()
        }
        socket.emit('ready',roomName)
    
    })
    .catch((err)=>{
        alert("Couldn't access user media")
    })

   /*  navigator.getUserMedia({
        audio:true,
        video:{width:1280, height:720} 
    },(stream)=>{
        divVideoChatLobby.style ="display:none"
        userVideo.srcObject = stream;
        userVideo.onloadeddata = (e)=>{
            userVideo.play()
        }
    },()=>{
        alert("Couldn't access user media")
    }) */

})
socket.on('full',()=>{
    alert("Room is full can't join")
})


socket.on('ready',()=>{
    if(creator){
        rtcPeerConnection = new RTCPeerConnection(iceServers)
        rtcPeerConnection.onicecandidate = OnIceCandidateFunction
        rtcPeerConnection.ontrack = OnTrackFunction
        rtcPeerConnection.addTrack(userStream.getTracks()[0],userStream)
        rtcPeerConnection.addTrack(userStream.getTracks()[1],userStream)

        rtcPeerConnection.createOffer()
        .then((offer)=>{
            rtcPeerConnection.setLocalDescription(offer)
            socket.emit('offer',offer, roomName)
        })
        .catch((error)=>{
            console.log(error);
        })
        
    }
})

socket.on('candidate',(candidate)=>{

let icecandidate = new RTCIceCandidate(candidate)
rtcPeerConnection.addIceCandidate(icecandidate)

})

socket.on('offer',(offer)=>{
    if(!creator){
        rtcPeerConnection = new RTCPeerConnection(iceServers)
        rtcPeerConnection.onicecandidate = OnIceCandidateFunction
        rtcPeerConnection.ontrack = OnTrackFunction
        rtcPeerConnection.addTrack(userStream.getTracks()[0],userStream)
        rtcPeerConnection.addTrack(userStream.getTracks()[1],userStream)
        rtcPeerConnection.setRemoteDescription(offer)


        rtcPeerConnection.createAnswer()
        .then((answer)=>{
            rtcPeerConnection.setLocalDescription(answer)
                socket.emit('answer',answer,roomName)
            
        })
        .catch((error)=>{
            console.log(error);
        })
        
    }

})

socket.on('answer',(answer)=>{
rtcPeerConnection.setRemoteDescription(answer)
})



socket.on('leave',()=>{
    creator = true

    if(peerVideo.srcObject){
        peerVideo.srcObject.getTracks()[0].stop()
        peerVideo.srcObject.getTracks()[1].stop()
    }

    if(rtcPeerConnection){
        rtcPeerConnection.ontrack = null
        rtcPeerConnection.onicecandidate = null
        rtcPeerConnection.close()
        rtcPeerConnection = null
    }
   
})


const OnIceCandidateFunction=(event)=>{
    console.log("Candidate");
    if(event.candidate){
        socket.emit('candidate',event.candidate, roomName)
    }
}

const OnTrackFunction=(event)=>{
    peerVideo.srcObject = event.streams[0];
    peerVideo.onloadedmetadata = (e)=>{
        peerVideo.play()
    }
    
}


