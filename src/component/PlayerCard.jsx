import React, { useContext } from 'react';
import { ListGroupItem } from 'react-bootstrap';
import { Droppable, Draggable } from 'react-beautiful-dnd';

import {
  CheckVisibilityContext,
  GameContext,
} from '../Context';
import {
  UNIQUE_CARD_COUNT,
} from '../Constants';


const PlayerCard = (props) => {
  const { playerIndex, cardValue, cardIndex } = props;
  const { setCardToCheckVisibility } = useContext(CheckVisibilityContext);
  const { ctx, playerID } = useContext(GameContext);
  const cardId = playerIndex * UNIQUE_CARD_COUNT + cardIndex;
  const getDragStyle = (dragStyle, snapshot) => {
    // Hack from https://github.com/atlassian/react-beautiful-dnd/issues/374#issuecomment-569817782
    if (!snapshot.isDragging) return {};
    if (!snapshot.isDropAnimating) {
      return dragStyle;
    }
    return {
      ...dragStyle,
      // cannot be 0, but make it super tiny
      transitionDuration: `0.001s`
    };
  };
  return (
    <Droppable
      droppableId={cardId.toString()}
      isCombineEnabled
    >
      {(provided, snapshot) => (
        <ListGroupItem
          className="card-slot"
          xs={1}
          ref={provided.innerRef}
          onMouseEnter={() => setCardToCheckVisibility({
            playerIndex: playerIndex,
            cardIndex: cardIndex,
          })}
          onMouseLeave={() => setCardToCheckVisibility(null)}
        >
          <Draggable
            draggableId={cardId.toString()}
            index={cardId}
            isDragDisabled={playerID !== ctx.currentPlayer}>
            {({ innerRef, draggableProps, dragHandleProps }, snapshot) => (
              <div
                className={"player-card card-value-" + (cardValue === null ? "unknown" : cardValue)}
                ref={innerRef}
                {...draggableProps}
                {...dragHandleProps}
                style={getDragStyle(draggableProps.style, snapshot)}
              >
                &nbsp;
              </div>
            )}
          </Draggable>
          <span
            style={{
              display: "none"
            }}
          >
            {provided.placeholder}
          </span>
        </ListGroupItem>
      )}
    </Droppable>
  );
};

export default PlayerCard;
