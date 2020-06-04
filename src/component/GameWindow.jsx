import React from 'react';
import { useParams } from "react-router-dom";
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';

import Game from '../game';
import Board from './Board';
const server = process.env.NODE_ENV === 'development' ? 
  `http://localhost:8000`:
  `https://${window.location.hostname}`;

export default (props) => {
  const { roomID } = useParams();
  const roomData = localStorage.getItem(roomID);
  if (!roomData) {
    return <>
      <h1>
        Observer Mode Currently Not Supported
      </h1>
      <p>
        If you've reached this page in error, your browser probably doesn't support local storage.
      </p>
    </>
  }
  const GameClient = Client({
    game: Game,
    board: Board,
    multiplayer: SocketIO({ server: server }),
  });
  const { playerSeat, secret } = JSON.parse(roomData);
  return <GameClient gameID={roomID} playerID={playerSeat.toString()} credentials={secret}/>;
}
