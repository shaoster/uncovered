import Game, {
  GenerateInitialVisibility,
  IsVictory,
  MakeVisibleToAll,
} from './game';

///////////////////////////////////////////////////////////////////////////////
// Swap tests
//

it('face up reveals to all', () => {
  const G = {
    hands: [
      [1,2,3,4],
      [1,2,3,4],
      [1,2,3,4],
    ],
    hasUncovered: false,
    visibility: GenerateInitialVisibility(3),
    swapVisibilityMode: "FUOT",
  };
  const ctx = {
    currentPlayer: '0',
    numPlayers: 3,
    playOrder: ["0", "1", "2"]
  };


  // Do a private swap between two players.
  Game.moves.swapCards(G, ctx,
    /*currentHandIndex=*/0,
    /*otherPlayer=*/1,
    /*theirHandIndex=*/2
  );

  // Players involved in swap can see both cards.
  expect(G.visibility[0][0][0]).toBeTruthy();
  expect(G.visibility[0][1][2]).toBeTruthy();
  expect(G.visibility[1][0][0]).toBeTruthy();
  expect(G.visibility[1][1][2]).toBeTruthy();

  // Remaining player can see neither card.
  expect(G.visibility[2][0][0]).toBeTruthy();
  expect(G.visibility[2][1][2]).toBeTruthy();
});



it('privacy is preserved', () => {
  const G = {
    hands: [
      [1,2,3,4],
      [1,2,3,4],
      [1,2,3,4],
    ],
    hasUncovered: false,
    visibility: GenerateInitialVisibility(3),
    swapVisibilityMode: "FDUT",
  };
  const ctx = {
    currentPlayer: '0',
    numPlayers: 3,
    playOrder: ["0", "1", "2"]
  };


  // Do a private swap between two players.
  Game.moves.swapCards(G, ctx,
    /*currentHandIndex=*/0,
    /*otherPlayer=*/1,
    /*theirHandIndex=*/2
  );

  // Players involved in swap can see both cards.
  expect(G.visibility[0][0][0]).toBeTruthy();
  expect(G.visibility[0][1][2]).toBeTruthy();
  expect(G.visibility[1][0][0]).toBeTruthy();
  expect(G.visibility[1][1][2]).toBeTruthy();

  // Remaining player can see neither card.
  expect(G.visibility[2][0][0]).toBeFalsy();
  expect(G.visibility[2][1][2]).toBeFalsy();
});

it('visibility transfers with card', () => {
  const G = {
    hands: [
      [1,2,3,4],
      [1,2,3,4],
      [1,2,3,4],
    ],
    hasUncovered: false,
    visibility: GenerateInitialVisibility(3),
    swapVisibilityMode: "FDUT",
  }

  const ctx = {
    currentPlayer: '0',
    numPlayers: 3,
    playOrder: ["0", "1", "2"]
  };

  // Assume a given card is visible to all.
  MakeVisibleToAll(G, 3, 0, 0);

  // Sanity check for MakeVisibleToAll
  expect(G.visibility[2][0][0]).toBeTruthy();
  expect(G.visibility[2][1][2]).toBeFalsy();

  // Do a private swap between two players.
  Game.moves.swapCards(G, ctx,
    /*currentHandIndex=*/0,
    /*otherPlayer=*/1,
    /*theirHandIndex=*/2
  );

  // Players involved in swap can see both cards.
  expect(G.visibility[0][0][0]).toBeTruthy();
  expect(G.visibility[0][1][2]).toBeTruthy();
  expect(G.visibility[1][0][0]).toBeTruthy();
  expect(G.visibility[1][1][2]).toBeTruthy();

  // Remaining player can still see the old card but only
  // at the new position
  expect(G.visibility[2][0][0]).toBeFalsy();
  expect(G.visibility[2][1][2]).toBeTruthy();
});

///////////////////////////////////////////////////////////////////////////////
// Victory Conditions
//

it("all players have same sequence", () => {
  const hands = [
    [4, 2, 3, 1],
    [4, 2, 3, 1]
  ];
  expect(IsVictory(hands)).toBeTruthy();
});

it("all players have single color", () => {
  const hands = [
    [1, 1, 1, 1],
    [2, 2, 2, 2],
    [3, 3, 3, 3],
    [4, 4, 4, 4]
  ];
  expect(IsVictory(hands)).toBeTruthy();
});

it("other cases lose", () => {
  const hands = [
    [1, 2, 1, 1],
    [2, 1, 2, 2],
    [3, 3, 3, 3],
    [4, 4, 4, 4]
  ];
  expect(IsVictory(hands)).toBeFalsy();
});
