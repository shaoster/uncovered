import React, { useMemo, useState } from 'react';
import {
  Button, Card, Col, Container, ListGroup, ListGroupItem, Modal, Row
} from 'react-bootstrap';
import { DragDropContext } from 'react-beautiful-dnd';

import GameOver from './GameOver';
import PlayerHand from './PlayerHand';

import {
  DEMO_MODE,
  PLAYER_NAMES,
  UNIQUE_CARD_COUNT,
} from '../Constants';   

const Board = (props) => {
  const { G, ctx, moves, playerID } = props;
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

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (destination === null) {
      return;
    }
    // HACKHACKHACK: This is a bogus way to encode the position data...
    const sourceIndex = parseInt(source.index);
    const playerOneIndex = Math.floor(sourceIndex / UNIQUE_CARD_COUNT);
    const playerOneHandIndex = sourceIndex % UNIQUE_CARD_COUNT;
    const destIndex = parseInt(destination.index);
    const playerTwoIndex = Math.floor(destIndex / UNIQUE_CARD_COUNT);
    const playerTwoHandIndex = destIndex % UNIQUE_CARD_COUNT;

    if (playerOneIndex === playerTwoIndex) {
      // Swaps must be between different players.
      if (playerOneHandIndex !== playerTwoHandIndex) {
        setPlayerMessage({
          title: "Invalid Move!",
          body: "Players may not swap cards with themselves!"
        })
      }
      return;
    }

    if (ctx.playOrderPos === playerOneIndex) {
      moves.swapCards(playerOneHandIndex, playerTwoIndex, playerTwoHandIndex);
      return;
    }

    if (ctx.playOrderPos === playerTwoIndex) {
      moves.swapCards(playerTwoHandIndex, playerOneIndex, playerOneHandIndex);
      return;
    }
    // Swaps must be between different players.
    setPlayerMessage({
      title: "Invalid Move!",
      body: "None of the cards you want to swap are yours!"
    })

  };

  // TBD: Support multiple player-number layouts.
  const playerHands = ctx.playOrder.map((player, playerIndex) => {
    const isPlayerTurn = ctx.playOrderPos === playerIndex;
    return <PlayerHand
      hand={G.hands[playerIndex]}
      playerIndex={playerIndex}
      isPlayerTurn={isPlayerTurn}
    />
  });

  return (
    <Container>
      <GameOver score={ctx.gameover}/>
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
          <DragDropContext onDragEnd={onDragEnd}>
            <Container className="board">
              {playerHands.map((hand, i) => <Row key={"player-" + i.toString()}><Col>{hand}</Col></Row>)}
            </Container>
          </DragDropContext>
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
