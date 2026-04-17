# Rock Paper Scissors: Hexagonal Strategy

Turn-based strategy game on a 10x10 hexagonal grid. Place rock, scissors, or paper — capture enemies by beating adjacent pieces without a counter nearby.

## Play Online

https://dilp79.github.io/RockPaperScissors/

## How to Play

1. Computer places pieces, then it's your turn
2. Pick a weapon (rock / scissors / paper) and place it on an empty hex
3. Your piece captures adjacent losers — but only if no counter is nearby
4. Score 1 point per captured piece. Difficulty scales with your score
5. Game ends when the board is full

## Features

- 4 switchable visual themes (Neon Arcade, Elegant, Modern Gaming, Dark Fantasy)
- Bilingual: English / Russian
- Animated title screen, 3-step tutorial, game over with stats
- Canvas particle effects, chain lightning, combo text
- Web Audio API synthesized sounds
- Mobile responsive with bottom bar layout

## Run

Open `index.html` in a browser. No build tools needed.

## Tech

Vanilla HTML5 + CSS3 + ES6 JavaScript. No frameworks.
