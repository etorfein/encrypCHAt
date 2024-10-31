const socket = io();
const messagesDiv = document.getElementById('messages');
const roomCodeInput = document.getElementById('roomKey');
const joinBtn = document.getElementById('joinButton');
const createBtn = document.getElementById('createButton');
const chatDiv = document.getElementById('chat');
const messageInput = document.getElementById('messageInput');
const usernameInput = document.getElementById('username');
let currentRoom = null;

socket.on('roomCreated', (roomCode) => {
    roomCodeInput.value = roomCode;
    showChat();
    showCustomNotification(`Room created with code: ${roomCode}`);
});

socket.on('joinedRoom', (data) => {
    currentRoom = data.roomKey;
    showChat();
    showCustomNotification(`You have joined the room ${data.roomKey} as ${data.username}`);
    messageInput.focus(); 
});

socket.on('userJoined', (message) => {
    const msgElement = document.createElement('div');
    msgElement.classList.add('message', 'system');
    msgElement.innerText = message;
    messagesDiv.appendChild(msgElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

socket.on('error', (message) => {
    const usernameError = document.getElementById('usernameError');
    usernameError.textContent = message; 
    usernameError.classList.remove('hidden');
    setTimeout(() => {
        usernameError.classList.add('hidden'); 
    }, 3000);
});

socket.on('receiveMessage', (message) => {
    const msgElement = document.createElement('div');
    msgElement.classList.add('message');
    if (message.startsWith(usernameInput.value)) {
        msgElement.classList.add('self'); 
    }
    msgElement.innerText = message;
    messagesDiv.appendChild(msgElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

function createRoom() {
    socket.emit('createRoom');
}

function joinRoom() {
    const roomCode = roomCodeInput.value;
    const username = usernameInput.value || 'Anonymous';
    if (!roomCode) {
        showCustomNotification('Please enter a room code');
        return;
    }
    if (currentRoom) {
        showCustomNotification('You are already in a room. Please refresh to join a new room.');
        return;
    }
    socket.emit('joinRoom', { roomKey: roomCode, username }, (response) => {
        if (response.error) {
            const usernameError = document.getElementById('usernameError');
            usernameError.textContent = response.error;
            usernameError.classList.remove('hidden');
            setTimeout(() => {
                usernameError.classList.add('hidden');
            }, 3000);
        } else {
            currentRoom = response.roomKey;
            showChat();
            showCustomNotification(`You have joined the room ${response.roomKey} as ${response.username}`);
        }
    });
}

function sendMessage() {
    if (!currentRoom) return;
    const msg = messageInput.value.trim();
    if (!msg) return;
    const username = usernameInput.value || 'Anonymous';
    const fullMessage = `${username}: ${msg}`;
    socket.emit('sendMessage', { roomKey: currentRoom, message: fullMessage });
    messageInput.value = '';
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function showCustomNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'custom-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

createBtn.onclick = createRoom;
joinBtn.onclick = joinRoom;

function showChat() {
    chatDiv.classList.remove('hidden');
    messageInput.focus(); 
}

function leaveRoom() {
    if (currentRoom) {
        socket.emit('leaveRoom', { roomKey: currentRoom });
        currentRoom = null;
        chatDiv.classList.add('hidden');
        messagesDiv.innerHTML = '';
        showCustomNotification('You have left the room');
    }
}



const audioFiles = [
    'audios/traphouse.mp3',
    'audios/canada.mp3',
    'audios/audemar.mp3',
    'audios/lsd.mp3',
];

let currentAudioIndex = 0;
const audioElement = document.getElementById('siteLoadSound');
const audioImage = document.getElementById('audioImage'); 



const playLogo = document.getElementById('playLogo');
const stopLogo = document.getElementById('stopLogo');
const audioName = document.getElementById('audioName');

function updateAudioName() {    
    const fileName = audioFiles[currentAudioIndex].split('/').pop().split('.')[0];
    audioName.textContent = fileName;
}

updateAudioName();

const audioImages = [
    'images/hai.jpg',
    'images/canadashii.peg.jpeg',
    'images/audemarr.jpeg',
    'images/lsdd.png',



];

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function updateAudioImage() {
    audioImage.src = audioImages[currentAudioIndex]; 
}

playLogo.addEventListener('click', () => {
    audioElement.play();
    playLogo.style.display = 'none';
    stopLogo.style.display = 'inline';
});
stopLogo.addEventListener('click', () => {
    audioElement.pause();
    audioElement.currentTime = 0; 
    playLogo.style.display = 'inline';
    stopLogo.style.display = 'none';
});
document.getElementById('nextLogo').addEventListener('click', () => {
    currentAudioIndex = (currentAudioIndex + 1) % audioFiles.length;
    audioElement.src = audioFiles[currentAudioIndex];
    audioElement.play();
    updateAudioName();
    updateAudioImage(); 
    playLogo.style.display = 'none';
    stopLogo.style.display = 'inline';
});

document.getElementById('prevLogo').addEventListener('click', () => {
    currentAudioIndex = (currentAudioIndex - 1 + audioFiles.length) % audioFiles.length;
    audioElement.src = audioFiles[currentAudioIndex];
    audioElement.play();
    updateAudioName();
    updateAudioImage(); 
    playLogo.style.display = 'none';
    stopLogo.style.display = 'inline';
});

const progressBar = document.getElementById('progressBar');
const currentTimeDisplay = document.getElementById('currentTime');
const durationDisplay = document.getElementById('duration');

audioElement.addEventListener('loadedmetadata', () => {
    progressBar.max = Math.floor(audioElement.duration);
    durationDisplay.textContent = formatTime(audioElement.duration);
});

audioElement.addEventListener('timeupdate', () => {
    const progress = (audioElement.currentTime / audioElement.duration) * 100;
    progressBar.value = audioElement.currentTime;
    progressBar.style.setProperty('--progress-width', `${progress}%`);
    currentTimeDisplay.textContent = formatTime(audioElement.currentTime);
});

progressBar.addEventListener('input', function() {
    audioElement.currentTime = this.value;
});

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${secs}`;
}

 