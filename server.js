const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const rooms = {}; 

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use('/audios', express.static(path.join(__dirname, 'audios')));

io.on('connection', (socket) => {
    let currentRoom = null;
    let currentUsername = null;

    socket.on('createRoom', () => {
        const roomCode = generateRoomCode();
        rooms[roomCode] = new Set();
        socket.emit('roomCreated', roomCode);
    });

    socket.on('joinRoom', ({ roomKey, username }) => {
        if (username.length > 16) {
            socket.emit('error', 'Username must be 16 characters or less.');
            return;
        }

        if (!rooms[roomKey]) {
            rooms[roomKey] = new Set();
        }

        if (rooms[roomKey].has(username)) {
            socket.emit('error', 'Username already taken in this room.'); 
            return;
        }

        if (currentRoom) {
            socket.emit('error', 'You are already in a room. Please refresh to join a new room.');
            return;
        }
        
        currentRoom = roomKey;
        currentUsername = username;
        rooms[roomKey].add(username);
        socket.join(roomKey);
        socket.emit('joinedRoom', { roomKey, username });
        io.to(roomKey).emit('userJoined', `${username} has joined the chat!`);
    });

    socket.on('disconnect', () => {
        if (currentRoom && rooms[currentRoom] && currentUsername) {
            rooms[currentRoom].delete(currentUsername); // Use the stored username
            io.to(currentRoom).emit('userLeft', `${currentUsername} has left the chat`);
            currentRoom = null;
            currentUsername = null;
        }
    });

    socket.on('sendMessage', (data) => {
        const { roomKey, message } = data;
        if (rooms[roomKey]) {
            io.to(roomKey).emit('receiveMessage', message);
        }
    });

    socket.on('sendImage', (data) => {
        const { roomKey, username, imageData } = data;
        if (rooms[roomKey]) {
            io.to(roomKey).emit('receiveImage', { username, imageData });
        }
    });

    socket.on('sendFile', (data) => {
        const { roomKey, username, fileName, fileData } = data;
        if (rooms[roomKey]) {
            console.log(`File received from ${username}: ${fileName}`);
            io.to(roomKey).emit('receiveFile', { username, fileName, fileData });
        }
    });

    socket.on('leaveRoom', (data) => {
        const { roomKey } = data;
        if (rooms[roomKey]) {
            socket.leave(roomKey);
            io.to(roomKey).emit('userLeft', `${currentUsername} has left the chat.`);
        }
    });
});

function generateRoomCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?\'"^+%&';
    let result = '';
    for (let i = 0; i < 32; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

server.listen(3000, () => {
    console.log('Server is running on port http://localhost:3000');
});

