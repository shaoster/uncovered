import React, { useMemo, useState } from 'react';
import {
  Button, Card, Col, Container, ListGroup, ListGroupItem, Modal, Row
} from 'react-bootstrap';


import { GameContext } from '../Context';
import {
  DEMO_MODE,
  PLAYER_NAMES,
} from '../Constants';   

import PlayerArea from './PlayerArea';
import GameOver from './GameOver';

const Board = (props) => {
  const { ctx, moves, playerID, reset } = props;
  const [playerMessage, setPlayerMessage] = useState(null);
  const hasPlayerMessage = useMemo(
    () => playerMessage !== null,
    [playerMessage]
  );
  const playerName = DEMO_MODE ?
    PLAYER_NAMES[ctx.playOrder.indexOf(ctx.currentPlayer)] : PLAYER_NAMES[playerID];
  if (playerID !== null) {
    // TBD: ...
  }
  return (
    <Container>
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
      <Row key="header">
        <Col className="game-name">
          <h1>Uncovered!</h1>
        </Col>
      </Row>
      <Row key="help">
        <Col className="instructions"><a href="https://github.com/shaoster/uncovered">How do I play?</a></Col>
      </Row>
      <Row>
        <Col xs={4}>
          <Card className="controls">
            <Card.Body>
              <Card.Title>Hello {playerName}!</Card.Title>
              <Card.Text className="player-message">
                Think you've won? &nbsp;
                <Button onClick={()=>moves.uncover()} className="uncover-button">Uncover!</Button>
              </Card.Text>
            </Card.Body>
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
