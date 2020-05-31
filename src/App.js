import { Client } from 'boardgame.io/react';

import Game from './Game.js';
import Board from './component/Board.jsx';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const App = Client({
  game: Game,
  board: Board,
  numPlayers: 4,
});

export default App;
