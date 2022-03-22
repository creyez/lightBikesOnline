// server.js
// where your node app starts
const express = require('express');
const socket = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// listen for requests :)
const server = app.listen(3000, () => {
    console.log(`Your app is listening on port ${server.address().port}`);
});

// Socket IO
const io = socket(server);
let players = [];

io.on('connect', OnConnect);

function OnConnect(socket) {
    if (players.length >= 2) return;
    console.log(`Connection ID: ${socket.id}`);
    // Setup up callback for socket disconnnection
    socket.on('disconnect', OnDisconnect(socket));
    //
    const data = getPlayerStartData(players.length + 1, socket.id);
    players = [...players, [socket.id, data]];
    //
    Init(socket);
    LocalUpdate(socket);
    Lost(socket);
}

function OnDisconnect(socket) {
    return () => {
        players = players.filter(([id]) => id !== socket.id);
        console.log(`Socket Disconnected: ${socket.id}`);
    };
}

function Init(socket) {
    socket.on('Init:Request', () => {
        socket.emit('Init:Response', players);
    });
}

function LocalUpdate(socket) {
    socket.on('LocalUpdate', data => {
        players = players.map(([id, plr]) => [id, id === socket.id ? data : plr]);
    });
}

function Lost(socket) {
    socket.on('Lost', () => {
        players = players.filter(([id]) => id !== socket.id);
        setTimeout(() => {
            if (players.length === 1) {
                const winner = players[0][0];
                io.sockets.emit('Win', winner);
            } else if (players.length === 0) {
                io.sockets.emit('Draw');
            }
        }, 500);
    });
}

function getPlayerStartData(num, id) {
    switch (num) {
        case 1:
            return { x: 45, y: 90, dir: 'RIGHT', c: [180, 95, 95], id };
        case 2:
            return { x: 650 - 235, y: 500 - 40, dir: 'LEFT', c: [30, 95, 95], id };
    }
}

function Heartbeat() {
    io.sockets.emit('Update', players);
}

setInterval(Heartbeat, 30);
