import {
    UNIQUE_CARD_COUNT,
    INITIAL_VISIBILITY,
    DEMO_MODE,
} from './Constants';

function MakeVisible(G, ctx, playerIndex, handIndex) {
  for (let viewingPlayer = 0; viewingPlayer < ctx.numPlayers; viewingPlayer++) {
    G.visibility[viewingPlayer][playerIndex][handIndex] = true;
  }
}

function IsVictory(hands) {
  return hands.every(cards => cards.every((v, i) => v === hands[0][i]));
}

const Game = {
  setup: (ctx, setupData) => {
    // Create the deck.
    const deck = new Array(ctx.numPlayers)
      .fill([...Array(UNIQUE_CARD_COUNT).keys()].map(i => i + 1))
      .flat();

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

    // To model imperfect information, we create a visibility filter for each player.
    // This is a 3d array of numPlayers * numPlayers * numDistinctCards.
    // To apply the filter, just check visibility[viewingPlayerIndex][viewedPlayerIndex][handIndex]
    // The visibility information is itself public information, which can be used to see which other
    // players know the identity of a given card.
    const visibility = new Array(ctx.numPlayers);
    for (let viewingPlayer = 0; viewingPlayer < ctx.numPlayers; viewingPlayer++) {
      const playerView = new Array(ctx.numPlayers);
      for (let viewedPlayer = 0; viewedPlayer < ctx.numPlayers; viewedPlayer++) {
        playerView[viewedPlayer] = new Array(UNIQUE_CARD_COUNT);
        // The default "advanced" game mode will initialize visibility to only the player's own cards.
        switch (INITIAL_VISIBILITY) {
          case "SEE_OWN":
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
    return {
      hands: hands,
      hasUncovered: false,
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
      //
      // Next, deal with visibility...
      //
      // There's two ways a swap can occur:
      //  - FU/OT (Face Up/Over Table)
      //    Everybody knows the identity of both cards exchanged
      MakeVisible(G, ctx, currentPlayer, currentHandIndex);
      MakeVisible(G, ctx, otherPlayer, theirHandIndex);

      //  - FD/UT (Face Down/Under Table)
      //    Only the 2 players involved in the exchange of the cards know their identity.
      //
      //    This is a little bit tricky because the visibility is really a property of a card
      //    rather than a property of a slot, but it's more convenient for us to treat cards
      //    as merely integers, so we have to pass the visibility around.

      // TODO: Implement...
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
    // In demo mode, we just show the player whose turn it is so we don't have to set up
    // multiple clients for multiple players...
    // In a real multiplayer setup, we should use the visibility of the actual player
    // so they don't see things they shouldn't when it's not their turn.
    const viewingPlayer = DEMO_MODE ? ctx.playOrderPos: playerID;
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
  ai: {
    enumerate: (G, ctx) => {
      const moves = [];
      for (let myHandIndex = 0; myHandIndex < UNIQUE_CARD_COUNT; myHandIndex++) {
        for (let playerId = 0; playerId < ctx.numPlayers; playerId++) {
          for (let otherHandIndex = 0; otherHandIndex < UNIQUE_CARD_COUNT; otherHandIndex++) {
            moves.push({ move: 'swapCards', args: [myHandIndex, playerId, otherHandIndex]});
          }
        }
      }
      moves.push({ move: 'uncover' });
      return moves;
    },
  }
};

export default Game;
