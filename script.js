on
{
  "html": "<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>XROGA Sliding Puzzle</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { 
    font-family: 'Segoe UI', sans-serif; 
    background: #1a1a2e; 
    display: flex; 
    justify-content: center; 
    align-items: center; 
    min-height: 100vh;
    color: #eee;
  }
  .game-container {
    background: #16213e;
    padding: 2rem;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    text-align: center;
  }
  h1 { 
    font-size: 2rem; 
    margin-bottom: 0.5rem;
    background: linear-gradient(135deg, #e94560, #0f3460);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .stats {
    display: flex;
    justify-content: space-between;
    margin: 1rem 0;
    font-size: 1.1rem;
  }
  .grid {
    display: grid;
    gap: 4px;
    margin: 1rem auto;
    background: #0f3460;
    padding: 4px;
    border-radius: 8px;
    width: fit-content;
  }
  .tile {
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8rem;
    font-weight: bold;
    background: #e94560;
    color: white;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s ease;
    user-select: none;
  }
  .tile:hover { transform: scale(1.05); }
  .tile.empty {
    background: transparent;
    cursor: default;
  }
  .tile.empty:hover { transform: none; }
  .btn {
    background: #e94560;
    color: white;
    border: none;
    padding: 0.8rem 2rem;
    font-size: 1.1rem;
    border-radius: 8px;
    cursor: pointer;
    margin: 0.5rem;
    transition: background 0.2s;
  }
  .btn:hover { background: #c73650; }
  .screen {
    display: none;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  .screen.active { display: flex; }
  .win-message { font-size: 1.5rem; color: #4ecca3; }
  @media (max-width: 500px) {
    .tile { width: 60px; height: 60px; font-size: 1.3rem; }
    .game-container { padding: 1rem; }
  }
</style>
</head>
<body>

<div class="game-container">
  <h1>🧩 Sliding Puzzle</h1>
  
  <div id="startScreen" class="screen active">
    <p style="margin: 1rem 0;">Arrange tiles in order — empty space at bottom-right</p>
    <button class="btn" onclick="startGame()">Play 3x3</button>
    <button class="btn" onclick="startGame(4)">Play 4x4</button>
  </div>

  <div id="gameScreen" class="screen">
    <div class="stats">
      <span>Moves: <span id="moves">0</span></span>
      <span>Time: <span id="timer">0</span>s</span>
    </div>
    <div id="grid" class="grid"></div>
    <button class="btn" onclick="startGame(currentSize)">🔄 New Game</button>
  </div>

  <div id="winScreen" class="screen">
    <div class="win-message">🎉 You Win!</div>
    <p id="winStats"></p>
    <button class="btn" onclick="startGame(currentSize)">Play Again</button>
    <button class="btn" onclick="showScreen('startScreen')">Menu</button>
  </div>
</div>

<script>
let grid = [];
let size = 3;
let emptyIndex = size * size - 1;
let moves = 0;
let timer = 0;
let timerInterval = null;
let isPlaying = false;
let currentSize = 3;

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function startGame(s = 3) {
  if (timerInterval) clearInterval(timerInterval);
  size = s;
  currentSize = s;
  emptyIndex = size * size - 1;
  moves = 0;
  timer = 0;
  isPlaying = true;
  
  // Create solved grid
  grid = Array.from({ length: size * size }, (_, i) => i + 1);
  grid[grid.length - 1] = 0; // 0 = empty
  
  // Shuffle (perform random valid moves)
  for (let i = 0; i < size * size * 10; i++) {
    const neighbors = getNeighbors(emptyIndex);
    const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
    swap(randomNeighbor, emptyIndex);
  }
  
  document.getElementById('moves').textContent = '0';
  document.getElementById('timer').textContent = '0';
  renderGrid();
  showScreen('gameScreen');
  
  timerInterval = setInterval(() => {
    timer++;
    document.getElementById('timer').textContent = timer;
  }, 1000);
}

function getNeighbors(index) {
  const row = Math.floor(index / size);
  const col = index % size;
  const neighbors = [];
  if (row > 0) neighbors.push(index - size);
  if (row < size - 1) neighbors.push(index + size);
  if (col > 0) neighbors.push(index - 1);
  if (col < size - 1) neighbors.push(index + 1);
  return neighbors;
}

function swap(i, j) {
  [grid[i], grid[j]] = [grid[j], grid[i]];
  if (grid[i] === 0) emptyIndex = i;
  if (grid[j] === 0) emptyIndex = j;
}

function handleTileClick(index) {
  if (!isPlaying) return;
  const neighbors = getNeighbors(emptyIndex);
  if (neighbors.includes(index)) {
    swap(index, emptyIndex);
    moves++;
    document.getElementById('moves').textContent = moves;
    renderGrid();
    checkWin();
  }
}

function checkWin() {
  for (let i = 0; i < grid.length - 1; i++) {
    if (grid[i] !== i + 1) return;
  }
  if (grid[grid.length - 1] !== 0) return;
  
  isPlaying = false;
  clearInterval(timerInterval);
  document.getElementById('winStats').textContent = `Solved in ${moves} moves and ${timer} seconds!`;
  showScreen('winScreen');
}

function renderGrid() {
  const gridEl = document.getElementById('grid');
  gridEl.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  gridEl.innerHTML = '';
  
  grid.forEach((val, index) => {
    const tile = document.createElement('div');
    tile.className = 'tile' + (val === 0 ? ' empty' : '');
    tile.textContent = val || '';
    tile.addEventListener('click', () => handleTileClick(index));
    gridEl.appendChild(tile);
  });
}

// Keyboard support
document.addEventListener('keydown', (e) => {
  if (!isPlaying) return;
  const row = Math.floor(emptyIndex / size);
  const col = emptyIndex % size;
  let target = -1;
  
  switch(e.key) {
    case 'ArrowUp': if (row < size - 1) target = emptyIndex + size; break;
    case 'ArrowDown': if (row > 0) target = emptyIndex - size; break;
    case 'ArrowLeft': if (col < size - 1) target = emptyIndex + 1; break;
    case 'ArrowRight': if (col > 0) target = emptyIndex - 1; break;
  }
  
  if (target >= 0) {
    e.preventDefault();
    handleTileClick(target);
  }
});
</script>
</body>
</html>",
  "css": "",
  "js": ""
}