import React, { useMemo, useState } from 'react';
import {
  Button, Card, Col, Container, ListGroup, ListGroupItem, Modal, Row
} from 'react-bootstrap';


import { GameContext } from '../Context';
import {
  PLAYER_NAMES,
} from '../Constants';

import GameOver from './GameOver';
import Header from './Header';
import PlayerArea from './PlayerArea';

const DEMO_MODE = false;

const Board = (props) => {
  const { G, ctx, moves, playerID, reset } = props;
  const [playerMessage, setPlayerMessage] = useState(null);
  const hasPlayerMessage = useMemo(
    () => playerMessage !== null,
    [playerMessage]
  );
  const playerName = DEMO_MODE ?
    PLAYER_NAMES[ctx.playOrder.indexOf(ctx.currentPlayer)] : PLAYER_NAMES[playerID];
  return (
    <Container className="board" fluid>
      <GameOver gameover={ctx.gameover} reset={reset}/>
      <Modal show={hasPlayerMessage} onHide={() => setPlayerMessage(null)}>
        <Modal.Header closeButton>
          <Modal.Title>{playerMessage && playerMessage.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{playerMessage && playerMessage.body}</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setPlayerMessage(null)}>
            Got it!
          </Button>
        </Modal.Footer>
      </Modal>
      <Header/>
      <Row>
        <Col xs={4}>
          <Card className="controls">
            <Card.Body>
              <Card.Title>Hello {playerName}!</Card.Title>
              <Card.Text className="player-message">
                Think you've won?
              </Card.Text>
            </Card.Body>
            <Button
              onClick={() => moves.uncover()}
              className="uncover-button"
              disabled={playerID !== ctx.currentPlayer || G.hasUncovered}>
              Uncover!
            </Button>
            <ListGroup>
              <ListGroupItem>Turns Taken: {ctx.turn - 1}</ListGroupItem>
            </ListGroup>
          </Card>
        </Col>
        <Col xs={8} className="player-area">
          <GameContext.Provider value={{
            setPlayerMessage: setPlayerMessage,    
            ...props}}
          >
            <PlayerArea/>
          </GameContext.Provider>
        </Col>
      </Row>
      <Row key="copyright">
        <Col className="copyright">Some Copyright Notice 2020.</Col>
      </Row>
      <Row key="whitespace">
        <Col>&nbsp;</Col>
      </Row>
    </Container>
  );
};

export default Board;
