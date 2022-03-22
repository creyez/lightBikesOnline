/* globals
  // Socket.IO CDN
  io
*/

class Socket {
    get id() {
        return this.socket.id;
    }

    constructor() {
        this.socket = io.connect(location.href);
        this.local = undefined;
        this.others = new Map();
        this.status = 'Ongoing';
        this.gameIsOver = false;
        this.winner = undefined;
    }

    gameOver() {
        this.socket.emit('Lost');
        this.gameIsOver = true;
    }

    sendUpdate(data) {
        this.local = data;
        this.socket.emit('LocalUpdate', data);
    }

    getData(id) {
        if (id === this.socket.id) {
            return this.local;
        }
        return this.others.get(id);
    }

    getAll() {
        return [this.local, ...this.others.values()];
    }

    init() {
        return new Promise((resolve, reject) => {
            this.socket.on('Draw', () => {
                this.status = 'Draw';
            });

            this.socket.on('Win', winner => {
                this.status = 'Win';
                this.winner = winner;
            });

            this.socket.on('Update', players => {
                this.others = new Map(players.filter(([id]) => id !== this.socket.id));
            });

            this.socket.on('Init:Response', players => {
                this.local = players.find(([id]) => id === this.socket.id)[1];
                this.others = new Map(players.filter(([id]) => id !== this.socket.id));
                resolve([this.local, [...this.others.values()]]);
            });
            this.socket.emit('Init:Request');
        });
    }
}
