import React, { useState } from 'react';

import { Button, Modal } from 'react-bootstrap';

const GameOver = (props) => {
  const { gameover, reset } = props;
  const score = typeof gameover === 'undefined' ? null : gameover.score;
  const [hide, setHide] = useState(false);
  // TBD: Play again button for multiplayer.
  return (
    <Modal
      show={!hide && score !== null}
      onHide={() => setHide(true)}>
      <Modal.Header closeButton>
        <Modal.Title>{score >= 0 ? "You win!" : "Game Over"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{score >= 0 ? "You won together in " + score + " turns!" : "Oh No! You missed a spot!"}</Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={reset}>
          Try Again?
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default GameOver;
