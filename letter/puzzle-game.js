// Puzzle Game - Letter Puzzle

// Note: The following shared resources are provided by mode-switcher.js:
// - letterDistribution
// - generateYearCalendar()
// - shuffleWithSeed()
// - getDayOfYear()
// - getTodaysLetter()
// - getActiveLetter()

// Game state
let todaysLetter = '';
let pieces = [];
let draggedPiece = null;
let offsetX = 0;
let offsetY = 0;
let targetSize = 400;

// DOM elements
const piecesContainer = document.getElementById('pieces-container');
const targetOutline = document.getElementById('target-outline');
const celebrationScreen = document.getElementById('celebration');
const playAgainBtn = document.getElementById('play-again-btn');
const hiddenCanvas = document.getElementById('hidden-canvas');
const hiddenCtx = hiddenCanvas.getContext('2d');

// Draw letter on canvas and split into pieces
function createPuzzlePieces() {
    // Set up hidden canvas
    hiddenCanvas.width = targetSize;
    hiddenCanvas.height = targetSize;

    // Draw letter
    hiddenCtx.clearRect(0, 0, targetSize, targetSize);
    hiddenCtx.font = `900 ${targetSize * 0.8}px Arial`;
    hiddenCtx.textAlign = 'center';
    hiddenCtx.textBaseline = 'middle';
    hiddenCtx.fillStyle = '#FF6B9D';
    hiddenCtx.fillText(todaysLetter, targetSize / 2, targetSize / 2);

    // Split into 4 pieces (2x2 grid)
    const pieceWidth = targetSize / 2;
    const pieceHeight = targetSize / 2;

    // Get target position (center of screen)
    const targetRect = targetOutline.getBoundingClientRect();
    const targetX = targetRect.left;
    const targetY = targetRect.top;

    const pieceData = [
        { row: 0, col: 0, name: 'top-left' },
        { row: 0, col: 1, name: 'top-right' },
        { row: 1, col: 0, name: 'bottom-left' },
        { row: 1, col: 1, name: 'bottom-right' }
    ];

    pieces = [];
    piecesContainer.innerHTML = '';

    pieceData.forEach((data, index) => {
        // Extract image data for this piece
        const sx = data.col * pieceWidth;
        const sy = data.row * pieceHeight;
        const imageData = hiddenCtx.getImageData(sx, sy, pieceWidth, pieceHeight);

        // Create a canvas for this piece
        const pieceCanvas = document.createElement('canvas');
        pieceCanvas.width = pieceWidth;
        pieceCanvas.height = pieceHeight;
        const pieceCtx = pieceCanvas.getContext('2d');
        pieceCtx.putImageData(imageData, 0, 0);

        // Create piece element
        const pieceElement = document.createElement('div');
        pieceElement.className = 'puzzle-piece';
        pieceElement.style.width = pieceWidth + 'px';
        pieceElement.style.height = pieceHeight + 'px';
        pieceElement.style.backgroundImage = `url(${pieceCanvas.toDataURL()})`;
        pieceElement.style.backgroundSize = 'cover';

        // Random initial position (spread around screen)
        const randomX = Math.random() * (window.innerWidth - pieceWidth - 100) + 50;
        const randomY = Math.random() * (window.innerHeight - pieceHeight - 200) + 150;

        pieceElement.style.left = randomX + 'px';
        pieceElement.style.top = randomY + 'px';

        // Store piece data
        const piece = {
            element: pieceElement,
            row: data.row,
            col: data.col,
            targetX: targetX + (data.col * pieceWidth),
            targetY: targetY + (data.row * pieceHeight),
            snapped: false,
            currentX: randomX,
            currentY: randomY
        };

        pieces.push(piece);

        // Add event listeners
        pieceElement.addEventListener('mousedown', (e) => startDrag(e, piece));
        pieceElement.addEventListener('touchstart', (e) => startDrag(e, piece));

        piecesContainer.appendChild(pieceElement);
    });
}

// Start dragging
function startDrag(e, piece) {
    e.preventDefault();
    draggedPiece = piece;

    // If piece was snapped, unsnap it
    if (piece.snapped) {
        piece.snapped = false;
        piece.element.classList.remove('snapped');
        piece.element.classList.remove('complete');
    }

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    offsetX = clientX - piece.currentX;
    offsetY = clientY - piece.currentY;

    piece.element.classList.add('dragging');

    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchmove', onDrag);
    document.addEventListener('touchend', stopDrag);
}

// Dragging
function onDrag(e) {
    if (!draggedPiece) return;

    e.preventDefault();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    draggedPiece.currentX = clientX - offsetX;
    draggedPiece.currentY = clientY - offsetY;

    draggedPiece.element.style.left = draggedPiece.currentX + 'px';
    draggedPiece.element.style.top = draggedPiece.currentY + 'px';
}

// Stop dragging
function stopDrag() {
    if (!draggedPiece) return;

    draggedPiece.element.classList.remove('dragging');

    // Check if close to target position
    checkSnap(draggedPiece);

    draggedPiece = null;

    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('touchmove', onDrag);
    document.removeEventListener('touchend', stopDrag);
}

// Check if piece should snap to target
function checkSnap(piece) {
    const snapThreshold = 50;

    const distanceX = Math.abs(piece.currentX - piece.targetX);
    const distanceY = Math.abs(piece.currentY - piece.targetY);

    if (distanceX < snapThreshold && distanceY < snapThreshold) {
        // Snap to position
        piece.currentX = piece.targetX;
        piece.currentY = piece.targetY;
        piece.element.style.left = piece.targetX + 'px';
        piece.element.style.top = piece.targetY + 'px';
        piece.snapped = true;
        piece.element.classList.add('snapped');

        // Check if all pieces are snapped
        checkCompletion();
    }
}

// Check if puzzle is complete
function checkCompletion() {
    const allSnapped = pieces.every(p => p.snapped);

    if (allSnapped) {
        // Add complete animation to all pieces
        pieces.forEach(p => {
            p.element.classList.add('complete');
        });

        // Show celebration after a delay
        setTimeout(() => {
            celebrationScreen.classList.remove('hidden');
        }, 1000);
    }
}

// Initialize game
function initGame() {
    todaysLetter = getActiveLetter();

    // Adjust target size for mobile
    if (window.innerWidth < 768) {
        targetSize = 300;
        targetOutline.style.width = targetSize + 'px';
        targetOutline.style.height = targetSize + 'px';
    } else if (window.innerWidth < 480) {
        targetSize = 250;
        targetOutline.style.width = targetSize + 'px';
        targetOutline.style.height = targetSize + 'px';
    }

    createPuzzlePieces();

    celebrationScreen.classList.add('hidden');

    // Play again button
    playAgainBtn.addEventListener('click', initGame);
}

// Start game
initGame();
