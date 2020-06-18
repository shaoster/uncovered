import React, { useContext, useState } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import {
  Button, Col, Container, Modal, Row
} from 'react-bootstrap';

import { CheckVisibilityContext, GameContext } from '../Context.js';
import {
  UNIQUE_CARD_COUNT,
} from '../Constants';
import PlayerHand from './PlayerHand';

const ConfirmDialog = (props) => {
  const { confirmPromise, setConfirmPromise } = props;
  const { resolve, reject } = confirmPromise;
  const show = resolve !== null;
  const handleCancel = () => {
    setConfirmPromise({
      resolve: null,
      reject: null,
    });
    reject();
  };

  const handleConfirm = () => {
    setConfirmPromise({
      resolve: null,
      reject: null,
    });
    resolve();
  };

  return (
    <Modal show={show} onHide={handleCancel}>
      <Modal.Header closeButton>
       <Modal.Title>Confirm Swap</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to swap the hightlighted cards?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleConfirm}>
          Confirm
        </Button>
        <Button variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

function parseCard(card) {
  // HACKHACKHACK: This is a bogus way to encode the position data...
  const cardIndex = parseInt(card.index);
  const playerIndex = Math.floor(cardIndex / UNIQUE_CARD_COUNT);
  const handIndex = cardIndex % UNIQUE_CARD_COUNT;
  return {
    playerIndex: playerIndex,
    handIndex: handIndex
  }
}

const PlayerArea = (props) => {
  const { G, ctx, moves, setPlayerMessage } = useContext(GameContext);
  // Used for toggling which (if any) card to show visibility for.
  const [cardToCheckVisibility, setCardToCheckVisibility] = useState(null);
  const [confirmPromise, setConfirmPromise] = useState({resolve:null, reject: null});
  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (destination === null) {
      return;
    }
    const {
      playerIndex: playerOneIndex,
      handIndex: playerOneHandIndex
    } = parseCard(source);
    const {
      playerIndex: playerTwoIndex,
      handIndex: playerTwoHandIndex
    } = parseCard(destination);
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
    if (!(ctx.playOrderPos in [playerOneIndex, playerTwoIndex])) {
      setPlayerMessage({
        title: "Invalid Move!",
        body: "None of the cards you want to swap are yours!"
      })
      return;
    }
    try {
      await new Promise((resolve, reject) => setConfirmPromise({
        resolve: resolve,
        reject: reject
      }));
    } catch {
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
    <>
      <ConfirmDialog
        confirmPromise={confirmPromise}
        setConfirmPromise={setConfirmPromise}
      />
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
    </>
  );
};

export default PlayerArea;
