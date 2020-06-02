import React, { useContext } from 'react';
import { Badge, Card, ListGroup } from 'react-bootstrap';

import PlayerCard from './PlayerCard';

import {
  CheckVisibilityContext,
  GameContext,
} from '../Context';
import {
  PLAYER_NAMES,
} from '../Constants';

const PlayerHand = (props) => {
  const { hand, playerIndex, isPlayerTurn } = props;
  const { G } = useContext(GameContext);
  const { cardToCheckVisibility } = useContext(CheckVisibilityContext); 
  const cards = hand.map((cardValue, cardIndex) => (
    <PlayerCard
      key={cardIndex.toString()}
      playerIndex={playerIndex}
      cardValue={cardValue}
      cardIndex={cardIndex}
    />
  ));
  let canSeeClassName = "";
  if (cardToCheckVisibility !== null &&
   G.visibility[playerIndex][cardToCheckVisibility.playerIndex][cardToCheckVisibility.cardIndex]) {
    canSeeClassName += " player-can-see-";
    // We can see the card.
    if (cardToCheckVisibility.playerIndex > playerIndex) {
        canSeeClassName += "down";
    } else if (cardToCheckVisibility.playerIndex < playerIndex) {
        canSeeClassName += "up";
    } else {
        canSeeClassName += "self";
    }
  }
  return (
    <Card className={"player-block" + (isPlayerTurn ? " highlighted" : "")}>
      <Card.Body>
        <Card.Title className={"player-name" + canSeeClassName}>
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
