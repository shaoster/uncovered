import React from 'react';
import { useParams } from "react-router-dom";
import { useCookies } from 'react-cookie';
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';

import Game from '../game';
import Board from './Board';

const server = `http://${window.location.hostname}:8000`;

export default (props) => {
  const { roomID } = useParams();
  const [cookies] = useCookies([roomID]);

  const GameClient = Client({
    game: Game,
    board: Board,
    multiplayer: SocketIO({ server: server }),
  });
  const { playerSeat, secret } = cookies[roomID];
  return <GameClient gameID={roomID} playerID={playerSeat.toString()} credentials={secret}/>;
}
