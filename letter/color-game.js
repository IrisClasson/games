// Color Game - Paint the Letter

// Note: The following shared resources are provided by mode-switcher.js:
// - letterDistribution
// - generateYearCalendar()
// - shuffleWithSeed()
// - getDayOfYear()
// - getTodaysLetter()
// - getActiveLetter()

// Game state
let canvas, ctx;
let todaysLetter = '';
let currentColor = '#FF6B9D';
let isPainting = false;
let hasTriggeredCelebration = false;
let coloredPixels = new Set();
let totalLetterPixels = 0;
let letterMask = null; // Store letter boundaries

// DOM elements
const colorButtons = document.querySelectorAll('.color-btn');
const progressBarInner = document.getElementById('progress-bar-inner');
const progressText = document.getElementById('progress-text');
const sparklesContainer = document.getElementById('sparkles-container');
const celebrationScreen = document.getElementById('celebration');
const playAgainBtn = document.getElementById('play-again-btn');

// Setup canvas
function setupCanvas() {
    canvas = document.getElementById('letter-canvas');
    ctx = canvas.getContext('2d', { willReadFrequently: true });

    // Set canvas size
    const size = Math.min(window.innerWidth * 0.8, 600);
    canvas.width = size;
    canvas.height = size;

    // Draw the letter
    drawLetter();

    // Calculate total letter pixels
    calculateLetterPixels();
}

// Draw letter outline
function drawLetter() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw large letter (15% larger: 0.8 * 1.15 = 0.92)
    ctx.font = `900 ${canvas.width * 0.92}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Fill with almost transparent white (10% opacity)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillText(todaysLetter, canvas.width / 2, canvas.height / 2);

    // Thin semi-transparent outline for guidance
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeText(todaysLetter, canvas.width / 2, canvas.height / 2);
}

// Calculate total pixels in the letter and store mask
function calculateLetterPixels() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Store the letter mask
    letterMask = new Uint8Array(canvas.width * canvas.height);

    totalLetterPixels = 0;

    for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3];
        const pixelIndex = i / 4;

        if (alpha > 0) {
            letterMask[pixelIndex] = 1;
            totalLetterPixels++;
        } else {
            letterMask[pixelIndex] = 0;
        }
    }
}

// Check if pixel is inside letter
function isInsideLetter(x, y) {
    if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
        return false;
    }
    const index = Math.floor(y) * canvas.width + Math.floor(x);
    return letterMask[index] === 1;
}

// Paint on canvas
function paint(x, y) {
    if (!isPainting) return;

    const brushSize = 15;

    ctx.fillStyle = currentColor;

    // Paint only pixels inside the letter
    for (let dx = -brushSize; dx <= brushSize; dx++) {
        for (let dy = -brushSize; dy <= brushSize; dy++) {
            if (dx * dx + dy * dy <= brushSize * brushSize) {
                const px = Math.floor(x + dx);
                const py = Math.floor(y + dy);

                // Only paint if inside letter bounds
                if (isInsideLetter(px, py)) {
                    ctx.fillRect(px, py, 1, 1);
                    coloredPixels.add(`${px},${py}`);
                }
            }
        }
    }

    updateProgress();
}

// Update progress
function updateProgress() {
    const progress = Math.min(100, Math.floor((coloredPixels.size / totalLetterPixels) * 100));

    progressBarInner.style.width = progress + '%';
    progressText.textContent = progress + '%';

    // Trigger celebration at 90%
    if (progress >= 90 && !hasTriggeredCelebration) {
        hasTriggeredCelebration = true;
        triggerCelebration();
    }
}

// Trigger celebration animation
function triggerCelebration() {
    // Add shake and grow animation to canvas
    canvas.classList.add('celebrate');

    // Create sparkles
    createSparkles();

    // Show celebration screen after animation
    setTimeout(() => {
        celebrationScreen.classList.remove('hidden');
        createSparkles(); // More sparkles!
    }, 1500);
}

// Create sparkles
function createSparkles() {
    const sparkleColors = ['#FF6B9D', '#9D4EDD', '#FFD700', '#00CED1', '#FF6347'];
    const sparkleCount = 50;

    const rect = canvas.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < sparkleCount; i++) {
        setTimeout(() => {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';

            const color = sparkleColors[Math.floor(Math.random() * sparkleColors.length)];
            sparkle.style.color = color;
            sparkle.style.background = color;

            sparkle.style.left = centerX + 'px';
            sparkle.style.top = centerY + 'px';

            const angle = (Math.PI * 2 * i) / sparkleCount + Math.random() * 0.5;
            const distance = 100 + Math.random() * 150;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;

            sparkle.style.setProperty('--tx', tx + 'px');
            sparkle.style.setProperty('--ty', ty + 'px');

            sparklesContainer.appendChild(sparkle);

            setTimeout(() => {
                sparkle.remove();
            }, 1000);
        }, i * 10);
    }
}

// Get mouse/touch position
function getPosition(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
}

// Mouse/touch event handlers
function startPainting(e) {
    e.preventDefault();
    isPainting = true;
    canvas.classList.add('painting');

    const pos = getPosition(e);
    paint(pos.x, pos.y);
}

function stopPainting() {
    isPainting = false;
    canvas.classList.remove('painting');
}

function onPaintMove(e) {
    if (!isPainting) return;
    e.preventDefault();

    const pos = getPosition(e);
    paint(pos.x, pos.y);
}

// Color selection
function selectColor(color) {
    currentColor = color;

    colorButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.color === color) {
            btn.classList.add('active');
        }
    });
}

// Initialize game
function initGame() {
    todaysLetter = getActiveLetter();

    setupCanvas();

    coloredPixels.clear();
    hasTriggeredCelebration = false;
    celebrationScreen.classList.add('hidden');
    canvas.classList.remove('celebrate');

    progressBarInner.style.width = '0%';
    progressText.textContent = '0%';

    // Color buttons
    colorButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            selectColor(btn.dataset.color);
        });
    });

    // Mouse events
    canvas.addEventListener('mousedown', startPainting);
    canvas.addEventListener('mouseup', stopPainting);
    canvas.addEventListener('mouseleave', stopPainting);
    canvas.addEventListener('mousemove', onPaintMove);

    // Touch events
    canvas.addEventListener('touchstart', startPainting);
    canvas.addEventListener('touchend', stopPainting);
    canvas.addEventListener('touchcancel', stopPainting);
    canvas.addEventListener('touchmove', onPaintMove);

    // Play again button
    playAgainBtn.addEventListener('click', initGame);
}

// Start game
initGame();
