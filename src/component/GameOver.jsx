import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { useHistory, useParams } from 'react-router-dom';

const GameOver = (props) => {
  const { gameover } = props;
  const { roomID } = useParams();
  const history = useHistory();
  const [cookies, setCookie, removeCookie] = useCookies([roomID]);

  const score = typeof gameover === 'undefined' ? null : gameover.score;
  const [hide, setHide] = useState(false);

  const playAgain = () => {
    fetch('/games/uncovered/' + roomID + '/playAgain', {
      method: 'POST',
      body: JSON.stringify({
        playerID: cookies[roomID].playerSeat,
        credentials: cookies[roomID].secret,
      }),
      headers: {
        'Content-Type': 'application/json'
      },
    })
    .then(res => res.json())
    .then(data => {
      const { nextRoomID } = data;
      history.push("/lobby/" + nextRoomID);
    });
  }

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
        <Button onClick={() => playAgain()}>Play Again?</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default GameOver;
