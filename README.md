# Escape Yondu

Escape Yondu is a fast-paced maze escape game inspired by the Guardians of the Galaxy universe. You play as Star-Lord (Peter Quill), navigating a procedurally generated maze to reach the exit while evading Yondu's deadly Yaka Arrow, which hunts you down using intelligent pathfinding.

The game supports both desktop and mobile devices, with responsive controls and overlays for menus, instructions, pauses, victories, and game overs.

## Features

- **Procedural Maze Generation:** Every game features a unique maze layout based on the selected difficulty (Easy, Normal, Hard), affecting complexity and size

- **Dynamic Enemy AI:** Yondu's arrow uses A\*-like pathfinding to pursue the player, recalculating its path whenever you move to a new grid cell. It starts with a 5-second delay and shows a flashing warning before activating

- **Player Controls:** Smooth movement with collision detection against maze walls. The player is represented by a Star-Lord sprite (fallback to a yellow rectangle if the image fails to load)

- **Game States:** Includes start menu, instructions, playing, paused, victory, and game over states, with corresponding overlays

- **Mobile Support:** Detects mobile devices and adds a virtual D-pad and buttons for touch-based controls. Handles orientation changes and window resizes

- **Visual Effects:** The arrow features rotation animation, an energy trail with glow effects, and a warning message. Mazes have styled walls, entrance ("IN" in green), and exit ("OUT" in red)

- **Difficulty Levels:**

  - **Easy:** Simpler mazes with fewer dead ends
  - **Normal:** Balanced challenge (default)
  - **Hard:** More complex paths and tighter navigation

## How to Play

1. Open the game in your browser
2. From the start screen, select a difficulty (Easy, Normal, or Hard) and click "Start Game" (or press Space/Enter)
3. Navigate the maze as Star-Lord from the entrance ("IN") to the exit ("OUT")
4. After 5 seconds, Yondu's arrow activates with a warning. It will pathfind toward your position
5. If the arrow collides with you, it's game over. Reach the exit to win!
6. Pause the game with Escape (desktop) or the pause button (mobile). Resume with Space/Escape or the button
7. On victory or game over, replay with Space/Enter or return to the menu with Escape (desktop), play again or main menu button (mobile)

## Controls

- **Desktop (Keyboard):**

  - Move: Arrow keys or WASD.
  - Pause/Resume: Escape or Space (when paused)
  - Start/Replay: Space or Enter

- **Mobile:**

  - Move: Virtual D-pad (↑ ↓ ← → buttons)
  - Pause/Resume: Pause button (⏸)
  - Menu/Replay/Back: Overlay buttons on pause/victory/game over screens

The game prevents multi-touch issues and blocks default touch behaviors for precise control.

## Installation and Setup

1. Clone or download the repository
2. Ensure the following file structure:

```bash
├── index.html
├── styles/
│   └── index.css  (for canvas and overlay styling)
├── src/
│   ├── overlays.js      (handles menu overlays)
│   ├── maze-generator.js (maze generation logic)
│   ├── maze.js          (maze rendering and collision)
│   ├── arrow.js         (Yaka arrow AI and rendering)
│   ├── player.js        (player movement and controls)
│   ├── game.js          (main game loop and states)
│   └── main.js          (entry point, instantiates Game)
└── assets/
    └── images/
        └── starlord.png (player sprite)
```

3. Open index.html in a modern web browser (e.g., Chrome, Firefox). No server is required, but for local development, you can use a simple HTTP server like python -m http.server to avoid CORS issues with assets

4. The game auto-adjusts to window size and detects mobile devices for touch controls

## Technologies Used

- **HTML5 Canvas:** For rendering the maze, player, arrow, and effects.
- **JavaScript (ES6+):** Core game logic, including classes for Game, Player, Arrow, and Maze.
- **CSS:** Styling for overlays, mobile controls, and canvas container.
- **No External Libraries:** Pure vanilla JS for performance and simplicity.

## License

This project is open-source under the MIT License. Feel free to modify and distribute!
