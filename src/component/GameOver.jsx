import React from 'react';

import { Button, Modal } from 'react-bootstrap';

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

export default GameOver;
