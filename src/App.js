import React from 'react';
import { Badge, Container, Row, Col, Card } from 'react-bootstrap';
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
  let lastHandSeen = null;
  for (const player in hands) {
    if (lastHandSeen === null) {
      lastHandSeen = hands[player];
    }
    else if (hands[player] !== lastHandSeen) {
      return false;
    }
  }
  return true;
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
    const hands = {};
    for (let i = 0; i < shuffled.length; i++) {
      const player = i % ctx.numPlayers;
      if (!(player in hands)) {
        hands[player] = []
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
      return IsVictory(G.hands);
    }
  },
  minPlayers: 2,
  maxPlayers: 4,
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
        <Col className="card-slot" xs={1} ref={provided.innerRef}>
          <Draggable
            draggableId={cardId.toString()}
            index={0}>
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
        </Col> 
      )}
    </Droppable>
  );
};

const PlayerHand = (props) => {
  const { player, hand, playerIndex, isPlayerTurn } = props;
  const cards = hand.map((cardValue, cardIndex) => (
    <PlayerCard
      key={cardIndex.toString()}
      playerIndex={playerIndex}
      cardValue={cardValue}
      cardIndex={cardIndex}
    />
  ));
  return (
    <Container className="player-hand" fluid>
      <Row>
        <Col xs={4}>
          <h1 className="player-name">
            <Badge>Player:</Badge> 
            {PLAYER_NAMES[playerIndex]}
          </h1>
        </Col>
      </Row>
      <Row className={"card-row" + playerIndex}>
        {cards}
      </Row>
    </Container>
  );


}

const UncoveredBoard = (props) => {
  const { G, ctx, moves, playerId } = props;
  if (playerId !== null) {
    // This is a multiplayer setup.
    // TBD: ...
  }

  const onDragEnd = (result) => {
    const { source, destination } = result;
    // HACKHACKHACK: This is a bogus way to encode the position data...
    const sourceIndex = parseInt(source);
    const playerOneIndex = Math.floor(sourceIndex / 4);
    const playerOneHandIndex = sourceIndex % 4;
    const destIndex = parseInt(destination);
    const playerTwoIndex = Math.floor(destIndex / 4);
    const playerTwoHandIndex = destIndex % 4;

    if (!destination) {
      return;
    }
    
  };
  // TBD: Support multiple player-number layouts.
  const playerHands = ctx.playOrder.map((player, playerIndex) => (
    <PlayerHand
      key={player}
      player={player}
      hand={G.hands[playerIndex]}
      playerIndex={playerIndex}
      isPlayerTurn={playerIndex === ctx.playOrderPos}
    />
  ));
  
  
  //for (let player in props.ctx.
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Container className="board">
        <Row>
          <Col>
            {playerHands.map((hand, i) => <div style={{padding: '4px'}} key={i.toString()}>{hand}</div>)}
          </Col>
        </Row>
      </Container>
    </DragDropContext>
  );
};

const App = Client({
  game: Uncovered,
  board: UncoveredBoard,
  numPlayers: 2,
});

export default App;
