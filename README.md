# Sorted!

_Sorted!_ is an original 4-player cooperative game of imperfect information, heavily inspired by [Hanabi](https://en.wikipedia.org/wiki/Hanabi_(card_game)).

This repository is a [boardgame.io](https://boardgame.io/) implementation of this game that, in addition to the rules described below, implements an automatic scoring mechanism based on the game's initial state.

# Game Setup

This game is designed to be played via this web-app, but for clarity, the rule specifications that follow use the language of an in-person tabletop setting.

The game is played with a deck of 16 numbered cards:
 - `1` (4 copies)
 - `2` (4 copies)
 - `3` (4 copies)
 - `4` (4 copies)

The game board consists of 4 player hand with 4 cards each arranged around the table.

All remaining cards are shuffled and distributed equally among the player hands.

Players, without looking, fan their hands facing away from themselves. The card to the player's right (or viewer's left) is the card in the 1st position, the adjacent card is in the 2nd position, and so forth.

During the course of the game, players may not look at cards in their own hand facing away from themselves.

*Advanced*: For manual scoring (if not playing the game via this webapp), each player writes down the sequence of cards in the opposite player's hand on a slip of paper and then places it face down.

# Playing the game

The game begins with the youngest player and turns proceeds counterclockwise around the table. (Obviously, any alternative convention is also acceptable). The first player (for scoring purposes), is called  `Player 0`, the next player counter-clockwise is `Player 1`, and so on.

At the beginning of each player's turn, the player says aloud the current turn number (beginning at 0) and takes one of 3 actions:

 1. *Declare*: The player may lay their hand face up on the table. At this point, the game ends. Proceed to the [Winning the Game](#winning-the-game) section for scoring.
 
 2. *Swap with another player*: The player may swap any card from their own hand with any card in any other player's hand.
    - Each card enterring a player's hand assumes the position of the card that just left it.
    - (Beginner Tip) When a card enters a player's hand and the card's value matches the position in the hand (for example, card `3` is placed in position 3), that player may turn the card to face themselves. This indicates that this card has reached its intended position and should not be the target of future swaps.
 
 # Winning the Game
 
 The game ends when a player chooses to lay their hand face up on the table during their turn.
 
 The game is considered won if the number on every card in every player's hand matches its position. The game is lost otherwise.
 
 In other words, to win a game, every player's hand should contain the cards `1`, `2`, `3,` and `4`, in that order.
 
 To score a winning game, enter the following piece of information into the webapp's scoring screen in the appropriate boxes:
 
  - The last turn number said aloud.
  - The player's initial hands (written on the face down slips of paper).
  
  The score determined by the webapp will be non-negative integer (e.g. 0, 1, 2, etc...).
  
  The lower the score, the better, while a score of '0' should be considered a great achievement and represents a perfect victory. 
 
 # Manually Scoring a Game
 
TBD. (I don't yet know an algorithm that's plausible by hand).
