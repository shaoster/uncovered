import React from 'react';
import { Badge, Card, ListGroup } from 'react-bootstrap';

import PlayerCard from './PlayerCard';

import {
  PLAYER_NAMES,
} from '../Constants';

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

export default PlayerHand;
