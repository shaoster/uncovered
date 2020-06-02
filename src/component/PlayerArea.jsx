import React, { useContext, useState } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import {
  Col, Container, Row
} from 'react-bootstrap';


import { CheckVisibilityContext, GameContext } from '../Context.js';
import {
  UNIQUE_CARD_COUNT,
} from '../Constants';
import PlayerHand from './PlayerHand';

const PlayerArea = (props) => {
  const { G, ctx, moves, setPlayerMessage } = useContext(GameContext);
  // Used for toggling which (if any) card to show visibility for.
  const [cardToCheckVisibility, setCardToCheckVisibility] = useState(null);
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
    setPlayerMessage({
      title: "Invalid Move!",
      body: "None of the cards you want to swap are yours!"
    });
  };
  const playerHands = ctx.playOrder.map((player, playerIndex) => {
    const isPlayerTurn = ctx.playOrderPos === playerIndex;
    return <PlayerHand
      hand={G.hands[playerIndex]}
      playerIndex={playerIndex}
      isPlayerTurn={isPlayerTurn}
    />
  });
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Container className="board">
        <CheckVisibilityContext.Provider value={{
          cardToCheckVisibility: cardToCheckVisibility,
          setCardToCheckVisibility: setCardToCheckVisibility
        }}>
          {playerHands.map((hand, i) =>
            <Row key={"player-" + i.toString()}>
                <Col>{hand}</Col>
            </Row>
          )}
        </CheckVisibilityContext.Provider>
      </Container>
    </DragDropContext>
  );
};

export default PlayerArea;
