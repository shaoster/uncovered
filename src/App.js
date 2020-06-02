import React from 'react';
import { BrowserRouter, Route, Switch } from "react-router-dom";
//import { Lobby } from 'boardgame.io/react';
//import { SocketIO } from 'boardgame.io/multiplayer';

import { Game } from './game.js';
import Board from './component/Board.jsx';
import GameLobby from './component/GameLobby.jsx';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
/*
const GameClient = Client({
  game: Game,
  board: Board,
  numPlayers: 4,
  multiplayer: SocketIO({ server: 'localhost:8000' }),
});

export default () => <GameClient playerID="0" />;
*/


export default () => {
  <BrowserRouter>
    <Switch>
      <Route path="/">
        <GameLobby/>
      </Route>
      <Route path="/:gameId">
        <GameWindow/>
      </Route>
    </Switch>
  </BrowserRouter>
}



//   const importedGames = [{
//     game: Game,
//     board: Board,
//   }];
//   return (
//     <Lobby
//       gameServer={`http://${window.location.hostname}:8000`}
//       lobbyServer={`http://${window.location.hostname}:8000`}
//       gameComponents={importedGames}
//     />
//   );
// }
