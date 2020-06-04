import React from 'react';
import { useHistory, useParams } from "react-router-dom";
import { useCookies } from 'react-cookie';
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';

import Game from '../game';
import Board from './Board';

export default (props) => {
  const { roomID } = useParams();
  const [cookies] = useCookies([roomID]);
  const history = useHistory();

  const GameClient = Client({
    game: Game,
    board: Board,
    multiplayer: SocketIO({ server: 'localhost:8000' }),
  });
  const { playerSeat, secret } = cookies[roomID];
  return <GameClient gameID={roomID} playerID={playerSeat.toString()} credentials={secret}/>;
}
