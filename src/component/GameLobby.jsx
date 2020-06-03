import React from 'react';
import { useHistory } from "react-router-dom";
import { Lobby, LobbyPhases, LobbyRoomInstance, LobbyCreateRoomForm } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';
import {
  Col, Container, Row
} from 'react-bootstrap';
import { PLAYER_NAMES } from '../Constants';

const LobbyRoom = (props) => {
  const { gameID, gameName, players } = props;
}

const LobbyRenderer = (props) => {
  const {
    erroMsg,
    gameComponents,
    rooms,
    phase,
    playerName,
    runningGame,
    handleEnterLobby,
    handleExitLobby,
    handleCreateRoom,
    handleJoinRoom,
    handleLeaveRoom,
    handleExitRoom,
    handleRefreshRooms,
    handleStartGame
  } = props;
  const roomRows = rooms.map((room) => {
    return (
      <LobbyRoom room={room}/>
    )
  });
  handleEnterLobby(null);
  return (
    <Container className="lobby-view">
      <Row>
        <Col>
          <LobbyCreateRoomForm
            games={gameComponents}
            createGame={handleCreateRoom}
          />
        </Col>
      </Row>
      {roomRows}
  );
};

export default () => {
  const importedGames = [{
    game: Game,
    board: Board,
  }];
  return (
    <Lobby
      gameServer={`http://${window.location.hostname}:8000`}
      lobbyServer={`http://${window.location.hostname}:8000`}
      gameComponents={importedGames}
      renderer={LobbyRenderer}
    />
  );
};
