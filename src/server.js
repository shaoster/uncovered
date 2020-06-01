const Server = require('boardgame.io/server').Server;
const Uncovered = require('./game').Game;
const server = Server({ games: [Uncovered] });
server.run(8000);
