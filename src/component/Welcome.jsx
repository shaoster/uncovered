import React, {useState} from 'react';
import { useHistory } from "react-router-dom";
import {
  Button, Col, Container, Row
} from 'react-bootstrap';

export default (props) => {
  const history = useHistory();
  const [numPlayers, setNumPlayers] = useState(2);
  const createGame = () => {
    fetch('/games/uncovered/create', {
      method: 'POST',
      body: JSON.stringify({ numPlayers: numPlayers }),
      headers: {
        'Content-Type': 'application/json'
      },
    })
    .then(res => res.json())
    .then(data => {
      history.push("/lobby/" + data.gameID)
    })
  };
  return (
    <Container className="Create">
      <Row>
        <Col className="game-name">
            <h1>Uncovered</h1>
        </Col>
      </Row>
      <Row>
        <Col>
          Number of Players:
        </Col>
        <Col>
          <select
            value={numPlayers}
            onChange={(evt) => setNumPlayers(parseInt(evt.target.value))}
          >
            {[2,3,4,5,6].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </Col>
        <Col>
          <Button onClick={()=>createGame()}>
            Create Game
          </Button>
        </Col>
      </Row>
    </Container>
  )
}
