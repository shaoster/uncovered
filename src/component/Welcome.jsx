import React, { createRef, useState } from 'react';
import { useHistory } from "react-router-dom";
import {
  Button, Col, Container, Form, Row
} from 'react-bootstrap';

import Header from './Header';

export default (props) => {
  const history = useHistory();
  const slider = createRef();
  const [numPlayers, setNumPlayers] = useState(4);
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
    <Container className="create">
      <Header/>
      <Row>
        <Col>
          <Form>
            <Form.Group controlId="numPlayers">
              <Form.Label>Number of Players: <span className="num-players">{numPlayers}</span></Form.Label>
              <Form.Control
                type="range"
                min={2}
                max={4}
                ref={slider}
                defaultValue={numPlayers}
                onChange={() => {
                  setNumPlayers(slider.current.value)
                }}
              />
            </Form.Group>
          </Form>
        </Col>
      </Row>
      <Row>
        <Col>
          <Button onClick={()=>createGame()}>
            Create Game
          </Button>
        </Col>
      </Row>
    </Container>
  )
}
