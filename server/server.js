const express = require('express');
const http = require('http');
const readline = require('readline');
const axios = require('axios');
const { connect } = require('http2');
const cors = require ('cors');

const app = express();
app.use(cors());
app.get('/', (req, res) => {
  res.sendFile('index.html');
});


app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

const server = http.createServer(app);
const io = require('socket.io')(server, {cors : {origin:'*'}});

const connectedClients = new Map();
const games = new Map();
const gameCountdown = 10;


io.on('connection', (socket) => {

  io.emit('connected', 'userconnected');

    console.log('A user connected');

    socket.on('set username', (username) => {
        if (connectedClients.has(username)) {
            socket.dupuser = username;
            socket.emit('username taken', `Username ${username} is already in use. Please choose a different username.`);
        } else {
            if (socket.dupuser !== undefined)
              delete socket.dupuser;
            if (socket.username) {
              connectedClients.delete(socket.username);
            }
            socket.username = username;
            connectedClients.set(username, socket.id);
            socket.emit('username set', username);
            console.log(`Username set for SocketID ${socket.id}: ${username}`);
        }
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
        for (let [username, id] of connectedClients) {
            if (id === socket.id) {
              connectedClients.delete(username);
              break;
            }
        }
    });

    socket.on('chat message', (message) => {
        console.log('Received message:', message);
        io.emit('chat message', message);
    });

    function generateGameID(length) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let gameId = '';
        for (let i = 0; i < length; i++) {
          const randomIndex = Math.floor(Math.random() * characters.length);
          gameId += characters.charAt(randomIndex);
        }
        return gameId;
    }

    function createGame(gameId) {
        const players = new Array(1);
        players[0] = socket.username;
        games.set(gameId, players);
        console.log(`New game created with GameID ${gameId} and players ${players.join(', ')}`);
    }

    socket.on('create game', () => {
        let gameId = generateGameID(5);
        while (games.has(gameId)) {
          gameId = generateGameID(5);
        }
        createGame(gameId);
        socket.emit('game created', gameId);
    });

    socket.on('join game', (gameId) => {
        if (games.has(gameId)) {
          const players = games.get(gameId);
          if (players.length < 2) {
            players.push(socket.username);
            games.set(gameId, players);
            socket.emit('game joined', gameId);
            console.log('=> Starting game for gameId ' + gameId);
            startGameLoop(gameId);
          } else if (players.length == 2){
            socket.emit('game full', `Game ${gameId} is already full.`);
          }
        } else {
          socket.emit('game not found', `Game ${gameId} does not exist.`);
        }
      });

    async function startGameLoop(gameId) {
        var currentRound = 0;
        var p1_score = 0;
        var p2_score = 0;

        const players = games.get(gameId);
        const scores = new Map(); 
        for (const player of players) {
          scores.set(player, 0);
        }
        const cars = await getRandomCarBrands();
        console.log(cars);

        console.log(connectedClients.get(players[0]));
        console.log(connectedClients.get(players[1]));
        
        const socket1 = io.sockets.sockets.get(connectedClients.get(players[0]));
        const socket2 = io.sockets.sockets.get(connectedClients.get(players[1]));

        socket1.emit('game start');
        socket2.emit('game start');

        socket1.emit('cars', cars[0]);
        socket2.emit('cars', cars[0]);
        
        socket1.on('answer', (username, answer) => {
          if (currentRound === 5) {
            const keyValueArray = Array.from(scores.entries());
            const keyValueString = keyValueArray.map(([key, value]) => `${key}: ${value}`).join(', ');
            socket1.emit('game end', keyValueString);
            socket2.emit('game end', keyValueString);
            currentRound = 0;
            p1_score = 0;
            p2_score = 0;
          } else {
            socket1.emit('round over', currentRound);
            socket2.emit('round over', currentRound);
          }
          
          if (cars[currentRound]['brand_name'].toUpperCase() == answer.toUpperCase()) {
            if (username == players[0]) {
              socket1.emit('correct', 'Username ' + players[0] + ' scored a point');
              socket2.emit('correct', 'Username ' + players[0] + ' scored a point');
              scores.set(players[0], ++p1_score);
              ++currentRound;
              socket1.emit('cars', cars[currentRound]);
              socket2.emit('cars', cars[currentRound]);
            } else {
              socket1.emit('correct', 'Username ' + players[1] + ' scored a point');
              socket2.emit('correct', 'Username ' + players[1] + ' scored a point');
              scores.set(players[1], ++p2_score);
              ++currentRound;
              socket1.emit('cars', cars[currentRound]);
              socket2.emit('cars', cars[currentRound]);
            }
          } else {
            if (username == players[0]) {
              socket1.emit('incorrect', 'Username ' + players[0] + ' gussed incorrectly');
              socket2.emit('incorrect', 'Username ' + players[0] + ' gussed incorrectly');
            } else {
              socket1.emit('incorrect', 'Username ' + players[1] + ' gussed incorrectly');
              socket2.emit('incorrect', 'Username ' + players[1] + ' gussed incorrectly');
            }
          }

        });

        socket2.on('answer', (username, answer) => {
          if (currentRound === 5) {
            const keyValueArray = Array.from(scores.entries());
            const keyValueString = keyValueArray.map(([key, value]) => `${key}: ${value}`).join(', ');
            socket1.emit('game end', keyValueString);
            socket2.emit('game end', keyValueString);
          } else {
            socket1.emit('round over', currentRound);
            socket2.emit('round over', currentRound);
          }
        if (cars[currentRound]['brand_name'].toUpperCase() == answer.toUpperCase()) {
          if (username == players[0]) {
            socket1.emit('correct', 'Username ' + players[0] + ' scored a point');
            socket2.emit('correct', 'Username ' + players[0] + ' scored a point');
            scores.set(players[0], ++p1_score);
            ++currentRound;
            socket1.emit('cars', cars[currentRound]);
            socket2.emit('cars', cars[currentRound]);
          } else {
            socket1.emit('correct', 'Username ' + players[1] + ' scored a point');
            socket2.emit('correct', 'Username ' + players[1] + ' scored a point');
            scores.set(players[1], ++p2_score);
            ++currentRound;
            socket1.emit('cars', cars[currentRound]);
            socket2.emit('cars', cars[currentRound]);
          }
        } else {
          if (username == players[0]) {
            socket1.emit('incorrect', 'Username ' + players[0] + ' gussed incorrectly');
            socket2.emit('incorrect', 'Username ' + players[0] + ' gussed incorrectly');
          } else {
            socket1.emit('incorrect', 'Username ' + players[1] + ' gussed incorrectly');
            socket2.emit('incorrect', 'Username ' + players[1] + ' gussed incorrectly');
          }
        }
        });
          
      }

    async function getRandomCarBrands() {
        try {
          const response = await axios.post('http://localhost/HA/php_api/CarBrandApi.php', {
            type: 'GetRandomBrands',
          });
          return response.data;
        } catch (error) {
          console.error('Error fetching car brands:', error);
          return [];
        }
    }
});

function promptForValidPort() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    const prompt = () => {
      rl.question('Enter a valid port number (1024-49151): ', (port) => {
        if (port >= 1024 && port <= 49151) {
          rl.close();
          resolve(port);
        } else {
          console.log('Invalid port number. Please choose a port between 1024 and 49151.');
          prompt();
        }
      });
    };
    prompt();
  });
}

function getCommand() {
  const r1 = readline.createInterface({
    input: process.stdin, 
    output: process.stdout
  });

  return new Promise((resolve) => {
    const command = () => {
      r1.question('=>', (usercommand) => {
        switch (usercommand) {
          case 'QUIT':
            io.emit('broadcast');
            for (let [username, socketId] of connectedClients) {
              io.sockets.sockets.get(socketId).disconnect(true);
            }
            connectedClients.clear();
            console.log('Server is going offline. Goodbye!');
            process.exit();

          case 'LIST':
            if (connectedClients.size != 0) {
              console.log('Players:');
              for (let [username, socketId] of connectedClients) {
                console.log('Username: ' + username + ' SocketID: ' + socketId);
              }
            } else {
              console.log('No players');
            }
            break;

          case 'GAMES':
            if (games.size != 0) {
              console.log('Games:');
              for (let[gameId, players] of games) {
                console.log('GameID: ' + gameId + ' Players: ' + players.join(', '));
              }
            } else {
              console.log('No game(s) created');
            }
            break;

          default:
            if (usercommand.includes('KILL')) {
              if (connectedClients.size != 0) {
                const username = usercommand.slice(5,usercommand.length);
                const socketId = connectedClients.get(username);
                if (socketId) {
                    io.sockets.sockets.get(socketId).disconnect(true);
                    connectedClients.delete(username);
                    for (let [gameId, players] of games) {
                      if (players.includes(username)) {
                        players.splice(players.indexOf(username),1);
                        games.set(gameId, players);
                        break;
                      }
                    }
                    console.log(`Connection closed for user ${username}`);
                } else {
                  console.log(`User ${username} not found`);
                }
              } else {
                console.log('No players found');
              }
            } else {
              console.log('No connection(s) made');
            }
            break;
        } 
          command();
      });
    };
    command();
  });
}

async function startServer() {
  let port;

  while (true) {
    port = await promptForValidPort();

    try {
      await new Promise((resolve, reject) => {
        server.listen(port, (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
      console.log(`Server running on port ${port}`);
      break;
    } catch (error) {
      console.log(`Error: Port ${port} is already in use. Try a different port.`);
    }
  }
  getCommand();
}
startServer();
