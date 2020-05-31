import React, { useMemo, useState } from 'react';
import { Badge, Button, Card, Col, Container, ListGroup, ListGroupItem, Modal, Row} from 'react-bootstrap';
import { Client } from 'boardgame.io/react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// TBD: Use the playerID
const PLAYER_NAMES = [
  'Apple',
  'Banana',
  'Cranberry',
  'Raven',
]

// TODO: Make this setupData
const UNIQUE_CARD_COUNT = 4;
const INITIAL_VISIBILITY = "SEE_OWN";
const DEMO_MODE = true;

function MakeVisible(G, ctx, playerIndex, handIndex) { 
  for (let viewingPlayer = 0; viewingPlayer < ctx.numPlayers; viewingPlayer++) {
    G.visibility[viewingPlayer][playerIndex][handIndex] = true;
  }
}

function IsVictory(hands) {
  return hands.every(cards => cards.every((v, i) => v === hands[0][i]));
}

const Uncovered = {

  setup: (ctx, setupData) => {
    // Create the deck.
    const deck = new Array(ctx.numPlayers)
      .fill([...Array(UNIQUE_CARD_COUNT).keys()].map(i => i + 1))
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

    // To model imperfect information, we create a visibility filter for each player.
    // This is a 3d array of numPlayers * numPlayers * numDistinctCards.
    // To apply the filter, just check visibility[viewingPlayerIndex][viewedPlayerIndex][handIndex]
    // The visibility information is itself public information, which can be used to see which other
    // players know the identity of a given card.  
    const visibility = new Array(ctx.numPlayers); 
    for (let viewingPlayer = 0; viewingPlayer < ctx.numPlayers; viewingPlayer++) {
      const playerView = new Array(ctx.numPlayers);
      for (let viewedPlayer = 0; viewedPlayer < ctx.numPlayers; viewedPlayer++) {
        playerView[viewedPlayer] = new Array(UNIQUE_CARD_COUNT);
        // The default "advanced" game mode will initialize visibility to only the player's own cards.
        switch (INITIAL_VISIBILITY) {
          case "SEE_OWN":
            playerView[viewedPlayer].fill(viewingPlayer === viewedPlayer);
            break;
          case "SEE_OTHER":
            playerView[viewedPlayer].fill(viewingPlayer !== viewedPlayer);
            break;
          case "SEE_ALL": // Is this a meaningful play mode?
            playerView[viewedPlayer].fill(true);
            break;
          case "SEE_NONE": // Is this a meaningful play mode?
            playerView[viewedPlayer].fill(false);
            break;
          default:
            throw Error("Unrecognized visibility option: " + INITIAL_VISIBILITY);
        }
      }
      visibility[viewingPlayer] = playerView;
    } 
   
    return {
      hands: hands,
      hasUncovered: false,
      visibility: visibility,
    };
  },
  moves: {
    swapCards: (G, ctx, currentHandIndex, otherPlayer, theirHandIndex) => {
      // Do the actual swap.
      const currentPlayer = ctx.playOrder.indexOf(ctx.currentPlayer);
      const tmpCard = G.hands[currentPlayer][currentHandIndex];
      G.hands[currentPlayer][currentHandIndex] = G.hands[otherPlayer][theirHandIndex];
      G.hands[otherPlayer][theirHandIndex] = tmpCard;
      //
      // Next, deal with visibility...
      // 
      // There's two ways a swap can occur:
      //  - FU/OT (Face Up/Over Table)
      //    Everybody knows the identity of both cards exchanged
      MakeVisible(G, ctx, currentPlayer, currentHandIndex);
      MakeVisible(G, ctx, otherPlayer, theirHandIndex);

      //  - FD/UT (Face Down/Under Table)
      //    Only the 2 players involved in the exchange of the cards know their identity.
      //  
      //    This is a little bit tricky because the visibility is really a property of a card
      //    rather than a property of a slot, but it's more convenient for us to treat cards
      //    as merely integers, so we have to pass the visibility around.

      // TBD: In case we need to implement FD/UT
      // To give an example of this, imagine an initial state with players 0, 1, 2, and 3:
      // If player 0 swaps a card with player 1, player 2 and player 3 still know none of
      // the cards in player 0's or player 1's hands.
      // Presuming player 1 makes another swap with player 0, player 2 and player 3 are still
      // totally in the dark about the hands of player 0 and player 1:
      //
      // For example at this point, we might have: 
      //
      //  - Player 0 sees:
      //      1, 2, 3, 4
      //      1, ?, ?, 4
      //      ?, ?, ?, ?
      //      ?, ?, ?, ?
      //
      //  - Player 1 sees:
      //      1, ?, ?, 4
      //      1, 3, 2, 4
      //      ?, ?, ?, ?
      //      ?, ?, ?, ?
      //
      //  - Player 2 sees:
      //      ?, ?, ?, ?
      //      ?, ?, ?, ?
      //      4, 3, 2, 1
      //      ?, ?, ?, ?
      //
      //  - Player 3 sees:
      //      ?, ?, ?, ?
      //      ?, ?, ?, ?
      //      4, 3, 2, 1
      //      ?, ?, ?, ?

      //
      // TODO: Implement...
       
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
  playerView: (G, ctx, playerID) => {
    const strippedHands = new Array(ctx.numPlayers);
    const visibility = G.visibility;
    // In demo mode, we just show the player whose turn it is so we don't have to set up
    // multiple clients for multiple players...
    // In a real multiplayer setup, we should use the visibility of the actual player
    // so they don't see things they shouldn't when it's not their turn.
    const viewingPlayer = DEMO_MODE ? ctx.playOrderPos: playerID;
    for (let viewedPlayer = 0; viewedPlayer < ctx.numPlayers; viewedPlayer++) {
      const viewedHand = new Array(UNIQUE_CARD_COUNT);
      for (let handIndex = 0; handIndex < UNIQUE_CARD_COUNT; handIndex++) {
        viewedHand[handIndex] = visibility[viewingPlayer][viewedPlayer][handIndex] ?
          G.hands[viewedPlayer][handIndex] : null;
      }
      strippedHands[viewedPlayer] = viewedHand;
    }
    return {
      hands: strippedHands,
      hasUncovered: G.hasUncovered,
      visibility: visibility,
    }
  },
  minPlayers: 2,
  maxPlayers: 4,
  ai: {
    enumerate: (G, ctx) => {
      const moves = [];
      for (let myHandIndex = 0; myHandIndex < UNIQUE_CARD_COUNT; myHandIndex++) {
        for (let playerId = 0; playerId < ctx.numPlayers; playerId++) {
          for (let otherHandIndex = 0; otherHandIndex < UNIQUE_CARD_COUNT; otherHandIndex++) {
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
  const cardId = playerIndex * UNIQUE_CARD_COUNT + cardIndex;
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
