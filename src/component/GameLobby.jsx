import React from 'react';
import { useHistory } from "react-router-dom";
import { Lobby, LobbyPhases } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';
import {
  Col, Container, Row
} from 'react-bootstrap';

const LobbyRenderer = (props) => {
  const {
    handleEnterLobby,
    handleExitLobby,
    handleCreateRoom,
    handleJoinRoom,
    handleLeaveRoom,
    handleExitRoom,
    handleRefreshRooms,
    handleStartGame
  } = props;
  handleEnterLobby(null);
  return (
    <Container className="lobby-view">
      <
    <div id="lobby-view" style={{ padding: 50 }}>
       <div className={this._getPhaseVisibility(LobbyPhases.ENTER)}>
         <LobbyLoginForm
           key={playerName}
           playerName={playerName}
           onEnter={this._enterLobby}
         />
       </div>

       <div className={this._getPhaseVisibility(LobbyPhases.LIST)}>
         <p>Welcome, {playerName}</p>

         <div className="phase-title" id="game-creation">
           <span>Create a room:</span>
           <LobbyCreateRoomForm
             games={gameComponents}
             createGame={this._createRoom}
           />
         </div>
         <p className="phase-title">Join a room:</p>
         <div id="instances">
           <table>
             <tbody>
               {this.renderRooms(this.connection.rooms, playerName)}
             </tbody>
           </table>
           <span className="error-msg">
             {errorMsg}
             <br />
           </span>
         </div>
         <p className="phase-title">
           Rooms that become empty are automatically deleted.
         </p>
       </div>

       <div className={this._getPhaseVisibility(LobbyPhases.PLAY)}>
         {runningGame && (
           <runningGame.app
             gameID={runningGame.gameID}
             playerID={runningGame.playerID}
             credentials={runningGame.credentials}
           />
         )}
         <div className="buttons" id="game-exit">
           <button onClick={this._exitRoom}>Exit game</button>
         </div>
       </div>

       <div className="buttons" id="lobby-exit">
         <button onClick={this._exitLobby}>Exit lobby</button>
       </div>
     </div>
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
