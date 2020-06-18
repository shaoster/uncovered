import React from 'react';
import { BrowserRouter, Route, Switch } from "react-router-dom";

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
