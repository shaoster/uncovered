import React from 'react';
import { BrowserRouter, Route, Switch } from "react-router-dom";
//import { Lobby } from 'boardgame.io/react';
//import { SocketIO } from 'boardgame.io/multiplayer';

import GameLobby from './component/GameLobby';
import GameWindow from './component/GameWindow';
import Welcome from './component/Welcome';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

export default () => (
  <BrowserRouter>
    <Switch>
      <Route path="/game/:roomID">
        <GameWindow/>
      </Route>
      <Route path="/lobby/:roomID">
        <GameLobby/>
      </Route>
      <Route path="/">
        <Welcome/>
      </Route>
    </Switch>
  </BrowserRouter>
);



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
