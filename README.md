# Uncovered!

_Uncovered!_ is an original 2-to-6 player cooperative game of imperfect information, heavily inspired by [Hanabi](https://en.wikipedia.org/wiki/Hanabi_(card_game)) and the [Rubik's Cube](https://en.wikipedia.org/wiki/Rubik%27s_Cube).

_Uncovered!_ is meant to evoke the experience of a group of friends solving a Rubik's cube together by taking turns... Only each player may see only a part of the cube and make only a single move at a time.

This repository is a [boardgame.io](https://boardgame.io/) implementation of this game that, in addition to the rules described below, implements an automatic scoring mechanism based on the game's initial state.

The game was conceived during COVID-19 lockdown by friends looking to play board games together while respecting social distancing.

Thus, while still staying true to being a traditional table-top board game, certain features of _Uncovered!_ (e.g. scoring and information tracking) are specifically designed with computer assistance in mind.

# Game Setup

While this game is designed to be played via the web-app, but for the sake of clarity and respect to the genre, the rule specifications that follow assume an in-person tabletop setting.

The game is played with a deck of 8-16 numbered cards:
 - `1` (1 copy per player)
 - `2` (1 copy per player)
 - `3` (1 copy per player)
 - `4` (1 copy per player)

The game board consists of a hand of 4 cards for each player seated around the table.

Cards are shuffled and distributed equally among the player hands.

*Beginner*: Players place their cards face up on the table in front of them. The card to the player's left (or viewer's right) is the card in the 1st position, the adjacent card is in the 2nd position, and so forth. During the course of the game, players may look at all cards on the table.

*Intermediate*: Players, without looking, fan their hands facing away from themselves. The card to the player's right (or viewer's left) is the card in the 1st position, the adjacent card is in the 2nd position, and so forth. During the course of the game, players may not look at cards in their own hand facing away from themselves.

Additionally for intermediate play, if players would like to keep score, each player writes down the sequence of cards in the hand of the player to their right (in other words, the player with the previous turn, counterclockwise).

*Advanced*: The *Advanced* variant of _Uncovered!_ requires 3 or more players. Players fan their hands toward themselves. The card to the player's left (or viewer's right) is the card in the 1st position, the adjacent card is in the 2nd position, and so forth. During the course of the game, players may only look at their own cards. The webapp version of this game will help each player keep track of the location of any cards previously in the player's hand, but in person, players are encouraged to take private notes or just have a really good memory.

Additionally for advanced play, if players would like to keep score, each player writes down the initial sequence of cards in their hand on a slip of paper and then places it face down.

# Playing the game

The game begins with the youngest player and turns proceeds counterclockwise around the table. (Obviously, any alternative convention is also acceptable). The first player (for scoring purposes), is called  `Player 0`, the next player counter-clockwise is `Player 1`, and so on.

At the beginning of each player's turn, the player says aloud the current turn number (beginning at 0) and *must* take one of 2 actions:

 1. *Declare*: The player may lay their hand face up on the table. At this point, the game ends. Proceed to the [Winning the Game](#winning-the-game) section for scoring.
 
 2. *Swap Cards*: The player may swap any card from their own hand with any card in any other player's hand.
    - Each card entering a player's hand assumes the position of the card that just left it.
    - The cards are swapped face up over the table, so the identity of the swapped cards are known to all.
    - *Intermediate*: When a card enters a player's hand and the card's value matches the position in the hand (for example, card `3` is placed in position 3), that player may turn the card to face themselves. This indicates that this card has reached its intended position and should be avoided where possible in future swaps.
 
 # Winning the Game
 
 The game ends when a player *Declares* by laying their hand face up on the table during their turn, prompting all other players to do the same.
 
 The game is considered won if the number on every card in every player's hand matches its position. The game is lost otherwise.
 
 In other words, to win a game, every player's hand should contain the cards `1`, `2`, `3,` and `4`, in that order.
 
 *Intermediate/Advanced*: To score a winning game, enter the following piece of information into the webapp's scoring screen in the appropriate boxes:
 
  - The last turn number said aloud.
  - The player's initial hands (written on the face down slips of paper).
  
  The score determined by the webapp will be non-negative integer (e.g. 0, 1, 2, etc...).
  
  The lower the score, the better, while a score of '0' should be considered a great achievement and represents a perfect victory. 
 
 # Manually Scoring a Game
 
TBD. (I don't yet know an algorithm that's plausible by hand).
