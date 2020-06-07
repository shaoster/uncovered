import {
    UNIQUE_CARD_COUNT,
    INITIAL_VISIBILITY,
    SWAP_VISIBILITY
} from './Constants';

function GenerateInitialHands(ctx, numPlayers) {
  // Create the deck.
  const deck = new Array(UNIQUE_CARD_COUNT * ctx.numPlayers)
    .fill(null)
    .map((_, i) => (i % UNIQUE_CARD_COUNT) + 1); 

  // Shuffle the deck.
  const shuffled = ctx.random.Shuffle(deck);

  // Deal the cards.
  const hands = [];
  for (let i = 0; i < shuffled.length; i++) {
    const player = i % ctx.numPlayers;
    if (hands.length <= player) {
      hands.push([]);
    }
    hands[player].push(shuffled[i]);
  }
}

/**
 * To model imperfect information, we create a visibility filter for each player.
 * This is a 3d array of numPlayers * numPlayers * numDistinctCards.
 * To apply the filter, just check visibility[viewingPlayerIndex][viewedPlayerIndex][handIndex]
 * The visibility information is itself public information, which can be used to see which other
 * players know the identity of a given card.
 */
export function GenerateInitialVisibility(numPlayers) {
  const visibility = new Array(numPlayers);
  for (let viewingPlayer = 0; viewingPlayer < numPlayers; viewingPlayer++) {
    const playerView = new Array(numPlayers);
    for (let viewedPlayer = 0; viewedPlayer < numPlayers; viewedPlayer++) {
      playerView[viewedPlayer] = new Array(UNIQUE_CARD_COUNT);
      // The default "advanced" game mode will initialize visibility to only the player's own cards.
      switch (INITIAL_VISIBILITY) {
        case "SEE_OWN":
          // This is the canonical game mode.
          playerView[viewedPlayer].fill(viewingPlayer === viewedPlayer);
          break;
        case "SEE_OTHER":
          playerView[viewedPlayer].fill(viewingPlayer !== viewedPlayer);
          break;
        case "SEE_ALL":
          playerView[viewedPlayer].fill(true);
          break;
        case "SEE_NONE": // Is this a meaningful play mode?
          playerView[viewedPlayer].fill(false);
          break;
        default:
          throw Error("Unrecognized visibility option: " + INITIAL_VISIBILITY);
      }
    }
    visibility[viewingPlayer] = playerView;
  }
  return visibility;
}

/**
 * Makes a given card visible to all players.
 */
export function MakeVisibleToAll(G, numPlayers, playerIndex, handIndex) {
  for (let viewingPlayer = 0; viewingPlayer < numPlayers; viewingPlayer++) {
    G.visibility[viewingPlayer][playerIndex][handIndex] = true;
  }
}

export function IsVictory(hands) {
  const allHandsEqual = hands.every(cards => 
    cards.every((v, i) => v === hands[0][i])
  );
  const everyHandSingleColor = hands.every(cards => 
    cards.every(v => v === cards[0])
  ); 
  return allHandsEqual || everyHandSingleColor;
}

export const Game = {
  name: "uncovered",
  setup: (ctx, setupData) => {
    if (typeof setupData === 'undefined') {
      setupData = {};
    }
    const hands = 'hands' in setupData ?
      setupData.hands : GenerateInitialHands(ctx, ctx.numPlayers);
    const visibility = 'visibility' in setupData ?
      setupData.visibility : GenerateInitialVisibility(ctx.numPlayers);
    const hasUncovered = 'hasUncovered' in setupData ? 
      setupData.hasUncovered : false;
    const swapVisibilityMode = 'swapVisibilityMode' in setupData ?
      setupData.swapVisibilityMode : SWAP_VISIBILITY;
    return {
      hands: hands,
      hasUncovered: hasUncovered,
      swapVisibilityMode: swapVisibilityMode,
      visibility: visibility,
    };
  },
  moves: {
    swapCards: (G, ctx, currentHandIndex, otherPlayer, theirHandIndex) => {
      // Do the actual swap.
      const currentPlayer = ctx.playOrder.indexOf(ctx.currentPlayer);
      const tmpCard = G.hands[currentPlayer][currentHandIndex];
      G.hands[currentPlayer][currentHandIndex] = G.hands[otherPlayer][theirHandIndex];
      G.hands[otherPlayer][theirHandIndex] = tmpCard;
      switch (G.swapVisibilityMode) {
        // There's two ways a swap can occur:
        case "FUOT":
          // - FU/OT (Face Up/Over Table)
          //   Everybody knows the identity of both cards exchanged
          MakeVisibleToAll(G, ctx.numPlayers, currentPlayer, currentHandIndex);
          MakeVisibleToAll(G, ctx.numPlayers, otherPlayer, theirHandIndex);
          break;
        case "FDUT":
          // - FD/UT (Face Down/Under Table)
          //   Only the 2 players involved in the exchange of the cards know their identity.
          //
          //   This is a little bit tricky because the visibility is really a property of a card
          //   rather than a property of a slot, but it's more convenient for us to treat cards
          //   as merely integers, so we have to pass the visibility around.
          //
          //   Parties to the swap see both cards, but for everyone else, the visibility of the
          //   two card positions should be swapped so that visibility follows the card.
          for (let viewingPlayer = 0; viewingPlayer < ctx.numPlayers; viewingPlayer++) {
            if (viewingPlayer in [currentPlayer, otherPlayer]) {
              G.visibility[viewingPlayer][currentPlayer][currentHandIndex] = true;
              G.visibility[viewingPlayer][otherPlayer][theirHandIndex] = true;
            } else {
              const tempVisibility = G.visibility[viewingPlayer][currentPlayer][currentHandIndex];
              G.visibility[viewingPlayer][currentPlayer][currentHandIndex] =
                G.visibility[viewingPlayer][otherPlayer][theirHandIndex];
              G.visibility[viewingPlayer][otherPlayer][theirHandIndex] = tempVisibility;
            }
          }
          break;
        default:
          throw Error("Unrecognized visibility option: " + G.swapVisibilityMode);
      }
  },
  uncover: (G, ctx) => {
      G.hasUncovered = true;
    }
  },
  turn: {
    moveLimit: 1,
  },
  endIf: (G, ctx) => {
    if (G.hasUncovered) {
      if (IsVictory(G.hands)) {
        return { score: ctx.turn - 1, winner: ctx.currentPlayer, draw: true };
      } else {
        return { score: -1 };
      }
    }
  },
  playerView: (G, ctx, playerID) => {
    const strippedHands = new Array(ctx.numPlayers);
    const visibility = G.visibility;
    const viewingPlayer = playerID;
    for (let viewedPlayer = 0; viewedPlayer < ctx.numPlayers; viewedPlayer++) {
      const viewedHand = new Array(UNIQUE_CARD_COUNT);
      for (let handIndex = 0; handIndex < UNIQUE_CARD_COUNT; handIndex++) {
        viewedHand[handIndex] = visibility[viewingPlayer][viewedPlayer][handIndex] ?
          G.hands[viewedPlayer][handIndex] : null;
      }
      strippedHands[viewedPlayer] = viewedHand;
    }
    return {
      hands: strippedHands,
      hasUncovered: G.hasUncovered,
      visibility: visibility,
    }
  },
  minPlayers: 2,
  maxPlayers: 4,
};

export default Game;
