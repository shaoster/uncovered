import React, { useEffect, useReducer, useState } from 'react';
import { Button, Col, Container, FormControl, InputGroup, ListGroup, Row } from 'react-bootstrap';
import { useHistory, useParams } from "react-router-dom";

import Header from './Header';
import {
  PLAYER_NAMES
} from '../Constants';

const GameLobby = (props) => {
  const { players, roomID } = props;
  const history = useHistory();
  const [playButtonEnabled, setPlayButtonEnabled] = useState(false);
  const [roomData, setRoomData] = useState(JSON.parse(localStorage.getItem(roomID)) || {});
  const isCurrentPlayer = (seatId) => roomData.playerSeat === seatId;
  const currentSeatState = () => players.reduce((acc, p) => {
    acc[p.id] = !p.name ? 'open':
      isCurrentPlayer(p.id) ? 'player':'taken';
    return acc;
  }, {});
  // Used to track transient states. Props are the server-side source of truth.
  const attemptAction = (state, action) => {
    if (action.type === 'refresh') {
      // TODO: Don't overwrite transitional states.
      let transientState = Object.assign({}, state);
      const serverSeatState = currentSeatState();
      for (let seatId in serverSeatState) {
        if (!(transientState[seatId] in ['waiting', 'player'])) {
          transientState[seatId] = serverSeatState[seatId];
        }
      }
      return transientState; 
    }
    return Object.assign({}, state, { [action.seatId]: action.targetState}); 
  };
  const [seatStates, transitionSeats] = useReducer(attemptAction, currentSeatState());
  // We have to fire transitionSeats whenever we pick up props changes too.
  useEffect(
    () => {
      transitionSeats({type: 'refresh'}); 
    },
    [players]
  );
  useEffect(
    () => {
      if (players.every(p => 'name' in p) && 'playerSeat' in roomData) {
        setPlayButtonEnabled(true);
      }
    },
    [players, roomData]
  );

  const stand = (seatId, _secret) => {
    const secret = _secret || roomData.secret;
    transitionSeats({
      targetState: 'waiting',
      seatId: seatId 
    });
    return fetch('/games/uncovered/' + roomID + '/leave', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        playerID: seatId,
        credentials: secret
      })
    })
    .then(() => {
      transitionSeats({
        targetState: 'open',
        seatId: seatId 
      });
    });
  };
  const sit = (seatId) => {
    transitionSeats({
      targetState: 'waiting',
      seatId: seatId 
    });
    // Stand up from previous seat if necessary.
    const previousSecret = 'secret' in roomData ? roomData.secret : null;
    const previousSeat = 'playerSeat' in roomData ? roomData.playerSeat : null;
    const maybeStand = previousSeat !== null && previousSeat !== seatId ? 
      () => stand(previousSeat, previousSecret) :
      Promise.resolve();
    return fetch('/games/uncovered/' + roomID + '/join', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        playerID: seatId,
        playerName: PLAYER_NAMES[seatId]
      })
    })
    .then(res => res.json())
    .then(data => {
      transitionSeats({
        targetState: 'player',
        seatId: seatId 
      });
      // We can't just immediately use roomData after setRoomData because
      // we're in an asynchronous context and the change is propagated
      // asynchronously too.
      // Thus we explicitly pass the same object to both the state and
      // localStorage.
      const roomDataSync = {
        playerSeat: seatId,
        secret: data.playerCredentials
      };
      setRoomData(roomDataSync);
      localStorage.setItem(
        roomID,
        JSON.stringify(roomDataSync) 
      );
    })
    .catch((err) => {
      transitionSeats({
        targetState: 'open',
        seatId: seatId 
      });
      localStorage.removeItem(roomID);
      setRoomData({});
    })
    .then(maybeStand);
  }
  const renderSeat = (seatId) => {
    const seatState = seatStates[seatId];
    const playerName = PLAYER_NAMES[seatId];
    const renderListItem = (props, text) => <ListGroup.Item key={seatId} {...props}>{text}</ListGroup.Item>
    switch(seatState) {
      case 'taken':
        return renderListItem({
          variant: 'secondary',
        }, playerName);
      case 'player':
        return renderListItem({
          variant: 'primary',
          onClick: () => stand(seatId),
        }, playerName + ' <- This is you!');
      case 'open':
        return renderListItem({
          onClick: () => sit(seatId),
        }, 'Open (Click to sit!)');
      case 'waiting':
        return renderListItem({
          variant: 'warning'
        }, 'Waiting...');
      default:
        throw new Error('Unrecognized seatState [' + seatState + '].');
    }
  };
  return (
    <>
      <ListGroup className="seats">
        {players.map((p) => renderSeat(p.id))}
      </ListGroup>
      <Button
        onClick={() => history.push('/game/' + roomID)}
        className='play-button'
        disabled={!playButtonEnabled}>
        Play!
      </Button>
      <InputGroup>
        <InputGroup.Prepend>
          <InputGroup.Text>Lobby Link:</InputGroup.Text>
        </InputGroup.Prepend>
        <FormControl
          aria-label="textarea"
          value={window.location.href}
          onFocus={
            (event) => {
              const link = event.target;
              link.select();
            }
          }
          readOnly
        />
      </InputGroup>
    </>
  );
};


export default () => {  
  const { roomID } = useParams();
  const [roomState, setRoomState] = useState(null);
  const history = useHistory();
  const refreshRoomState = () => {
    fetch('/games/uncovered/' + roomID)
      .then((res) => res.json())
      .then((data) => {
        setRoomState(data)
      }).catch(error => {
        history.push('/');
      });
  }
  useEffect(() => {
    if (roomState === null) {
      refreshRoomState();
    }
    const interval = setInterval(refreshRoomState, 1000);
    return () => clearInterval(interval);
  });
  return (
    <Container>
      <Header/>
      <Row>
        <Col>
        {
          roomState === null ?
            (<p>Loading...</p>) :
            (<GameLobby setRoomState={setRoomState} {...roomState}/>)
        }
        </Col>
      </Row>
    </Container>
  );
}
