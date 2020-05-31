import React, { useMemo, useState } from 'react';
import { Badge, Button, Card, Col, Container, ListGroup, ListGroupItem, Modal, Row} from 'react-bootstrap';
import { Client } from 'boardgame.io/react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const PLAYER_NAMES = [
  'Apple',
  'Banana',
  'Cranberry',
  'Raven',
]

function IsVictory(hands) {
  return hands.every(cards => cards === hands[0]);
}

const Uncovered = {
  setup: (ctx, setupData) => {
    // Create the deck.
    const deck = new Array(ctx.numPlayers)
      .fill([1, 2, 3, 4])
      .flat();

    // Shuffle the deck.
    const shuffled = ctx.random.Shuffle(deck);

    // Deal the cards.
    const hands = [];
    for (let i = 0; i < shuffled.length; i++) {
      const player = i % ctx.numPlayers;
      if (hands.length <= player) {
        hands.push([]);
      }
      hands[player].push(shuffled[i]);
    }
    return {
      hands: hands,
      hasUncovered: false,
    };
  },
  moves: {
    swapCards: (G, ctx, currentHandIndex, otherPlayer, theirHandIndex) => {
      const tmpCard = G.hands[ctx.currentPlayer][currentHandIndex];
      G.hands[ctx.currentPlayer][currentHandIndex] = G.hands[otherPlayer][theirHandIndex];
      G.hands[otherPlayer][theirHandIndex] = tmpCard;
    },
    uncover: (G, ctx) => {
      G.hasUncovered = true;
    }
  },
  turn: {
    moveLimit: 1,
  }, 
  endIf: (G, ctx) => {
    if (G.hasUncovered) {
      if (IsVictory(G.hands)) {
        return { score: ctx.turn - 1 };
      } else {
        return { score: -1 };
      }
    }
  },
  minPlayers: 2,
  maxPlayers: 4,
  ai: {
    enumerate: (G, ctx) => {
      const moves = [];
      for (let myHandIndex = 0; myHandIndex < 4; myHandIndex++) {
        for (let playerId = 0; playerId < ctx.numPlayers; playerId++) {
          for (let otherHandIndex = 0; otherHandIndex < 4; otherHandIndex++) {
            moves.push({ move: 'swapCards', args: [myHandIndex, playerId, otherHandIndex]});
          }
        }
      }
      moves.push({ move: 'uncover' });
      return moves;
    },
  }
};

const PlayerCard = (props) => {
  const { playerIndex, cardValue, cardIndex} = props;
  const cardId = playerIndex * 4 + cardIndex;
  const getDragStyle = (dragStyle, snapshot) => {
    // Hack from https://github.com/atlassian/react-beautiful-dnd/issues/374#issuecomment-569817782
    if (!snapshot.isDragging) return {};
    if (!snapshot.isDropAnimating) {
      return dragStyle;
    }

    return {
      ...dragStyle,
      // cannot be 0, but make it super tiny
      transitionDuration: `0.001s`
    };
  };
  return (
    <Droppable
      droppableId={cardId.toString()}
      isCombineEnabled
    >
      {(provided, snapshot) => (
        <ListGroupItem className="card-slot" xs={1} ref={provided.innerRef}>
          <Draggable
            draggableId={cardId.toString()}
            index={cardId}>
            {({ innerRef, draggableProps, dragHandleProps }, snapshot) => (
              <div
                className={"player-card card-value-" + (cardValue === null ? "unknown" : cardValue)}
                ref={innerRef}
                {...draggableProps}
                {...dragHandleProps}
                style={getDragStyle(draggableProps.style, snapshot)}
              >
                &nbsp;
              </div>
            )}
          </Draggable>
          <span
            style={{
              display: "none"
            }}
          >
            {provided.placeholder}
          </span>
        </ListGroupItem> 
      )}
    </Droppable>
  );
};

const PlayerHand = (props) => {
  const { hand, playerIndex, isPlayerTurn } = props;
  const cards = hand.map((cardValue, cardIndex) => (
    <PlayerCard
      key={cardIndex.toString()}
      playerIndex={playerIndex}
      cardValue={cardValue}
      cardIndex={cardIndex}
    />
  ));
  return (
    <Card className={"player-block" + (isPlayerTurn ? " highlighted" : "")}>
      <Card.Body>
        <Card.Title className="player-name">
          <Badge>Player:</Badge> 
          {PLAYER_NAMES[playerIndex]}
        </Card.Title>
      </Card.Body> 
      <ListGroup className="player-hand" horizontal>
        {cards}
      </ListGroup>
    </Card>
  );


}

const GameOver = (props) => {
  const { score } = props;
  // TBD: Play again button for multiplayer.
  return (
    <Modal show={typeof score !== 'undefined'}>
      <Modal.Header>
        <Modal.Title>{score >= 0 ? "You win!" : "Game Over"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{score >= 0 ? "You won together in " + score + " turns!" : "Oh No! You missed a spot!"}</Modal.Body>
      <Modal.Footer>
        <Button variant="primary">
          Play Again?
        </Button>
      </Modal.Footer>
    </Modal> 
  );
}

const UncoveredBoard = (props) => {
  const { G, ctx, moves, playerID } = props;
  const [playerMessage, setPlayerMessage] = useState(null);
  const hasPlayerMessage = useMemo(
    () => playerMessage !== null,
    [playerMessage]
  );
  const playerName = playerID !== null ? PLAYER_NAMES[playerID] : "Nemo";
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
    const playerOneIndex = Math.floor(sourceIndex / 4);
    const playerOneHandIndex = sourceIndex % 4;
    const destIndex = parseInt(destination.index);
    const playerTwoIndex = Math.floor(destIndex / 4);
    const playerTwoHandIndex = destIndex % 4;

    if (playerOneIndex === playerTwoIndex) {
      // Swaps must be between different players.
      setPlayerMessage("Players may not swap cards with themselves!")
      return;
    }

    if (ctx.playOrderPos === playerOneIndex) {
      moves.swapCards(playerOneHandIndex, playerTwoIndex, playerTwoHandIndex);
    }

    if (ctx.playOrderPos === playerTwoIndex) {
      moves.swapCards(playerTwoHandIndex, playerOneIndex, playerOneHandIndex);
    }

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
  
  
  //for (let player in props.ctx.
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

const App = Client({
  game: Uncovered,
  board: UncoveredBoard,
  numPlayers: 4,
});

export default App;
