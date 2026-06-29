const colors = ['Red', 'Blue', 'Green', 'Yellow', 'White', 'Pink'];

const faceRotations = {
    'Red':    { x: 0,   y: 0 },
    'Blue':   { x: 0,   y: -90 },
    'Green':  { x: 0,   y: -180 },
    'Yellow': { x: 0,   y: 90 },
    'White':  { x: -90, y: 0 },
    'Pink':   { x: 90,  y: 0 }
};

let riggedColors = [];
let isRolling = false;
let animationDuration = 3200; // ms

const cubes = [
    document.getElementById('cube1'),
    document.getElementById('cube2'),
    document.getElementById('cube3')
];
const rollButton = document.getElementById('roll-button');
const colorBlocks = document.querySelectorAll('.color-block');

// Keyboard shortcuts for desktop (still works)
document.addEventListener('keydown', (e) => {
    const keyMap = { '1':'Red', '2':'Blue', '3':'Green', '4':'Yellow', '5':'White', '6':'Pink', '0':null };
    if (keyMap[e.key] !== undefined) {
        toggleRiggedColor(keyMap[e.key]);
    }
});

// Board visual selection
colorBlocks.forEach(block => {
    block.addEventListener('click', () => {
        block.classList.toggle('selected');
    });
});

// Dice Roll Logic
rollButton.addEventListener('click', () => {
    if (isRolling) return;
    isRolling = true;
    rollButton.disabled = true;

    const results = [];
    const validColors = colors.filter(c => !riggedColors.includes(c));
    const pool = validColors.length > 0 ? validColors : colors; // fallback if all 6 are rigged
    
    for (let i = 0; i < 3; i++) {
        results.push(pool[Math.floor(Math.random() * pool.length)]);
    }

    cubes.forEach((cube, index) => {
        const resultColor = results[index];
        const baseRotation = faceRotations[resultColor];
        
        const extraX = (Math.floor(Math.random() * 4) + 4) * 360; 
        const extraY = (Math.floor(Math.random() * 4) + 4) * 360; 
        
        const finalX = baseRotation.x + extraX;
        const finalY = baseRotation.y + extraY;

        cube.style.transform = `translateZ(calc(var(--cube-size) / -2)) rotateX(${finalX}deg) rotateY(${finalY}deg)`;
    });

    setTimeout(() => {
        isRolling = false;
        rollButton.disabled = false;
    }, animationDuration);
});

// Modal Logic
const rulesLink = document.getElementById('rules-link');
const settingsLink = document.getElementById('settings-link');
const rulesModal = document.getElementById('rules-modal');
const settingsModal = document.getElementById('settings-modal');
const secretModal = document.getElementById('secret-modal');

const closeRules = document.getElementById('close-rules');
const closeSettings = document.getElementById('close-settings');
const closeSecret = document.getElementById('close-secret');

// Open Modals
rulesLink.addEventListener('click', (e) => { e.preventDefault(); rulesModal.classList.add('show'); });
settingsLink.addEventListener('click', (e) => { e.preventDefault(); settingsModal.classList.add('show'); });

// Close Modals
closeRules.addEventListener('click', () => rulesModal.classList.remove('show'));
closeSettings.addEventListener('click', () => settingsModal.classList.remove('show'));
closeSecret.addEventListener('click', () => secretModal.classList.remove('show'));

// Close on outside click
window.addEventListener('click', (e) => {
    if (e.target === rulesModal) rulesModal.classList.remove('show');
    if (e.target === settingsModal) settingsModal.classList.remove('show');
    if (e.target === secretModal) secretModal.classList.remove('show');
});

// Settings: Fast Animations toggle
const fastAnimToggle = document.getElementById('fast-anim');
fastAnimToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
        cubes.forEach(c => c.classList.add('fast-anim'));
        animationDuration = 1500;
    } else {
        cubes.forEach(c => c.classList.remove('fast-anim'));
        animationDuration = 3200;
    }
});

// Secret Mobile Trigger Logic
const logoTrigger = document.getElementById('logo-trigger');
let logoClickCount = 0;
let logoClickTimeout;

logoTrigger.addEventListener('click', () => {
    logoClickCount++;
    clearTimeout(logoClickTimeout);
    
    if (logoClickCount >= 5) {
        // Trigger secret menu!
        secretModal.classList.add('show');
        logoClickCount = 0;
    } else {
        logoClickTimeout = setTimeout(() => {
            logoClickCount = 0; // Reset if they don't tap fast enough
        }, 1000); // 1 second window to tap 5 times
    }
});

// Secret Menu Buttons
const rigButtons = document.querySelectorAll('.rig-btn');
const rigDisplay = document.getElementById('current-rig-display');

function toggleRiggedColor(color) {
    if (color === null) {
        riggedColors = [];
        rigButtons.forEach(b => b.classList.remove('active-rig'));
    } else {
        if (riggedColors.includes(color)) {
            riggedColors = riggedColors.filter(c => c !== color);
            const btn = document.querySelector(`.rig-btn[data-color="${color}"]`);
            if (btn) btn.classList.remove('active-rig');
        } else {
            riggedColors.push(color);
            const btn = document.querySelector(`.rig-btn[data-color="${color}"]`);
            if (btn) btn.classList.add('active-rig');
        }
    }

    if (riggedColors.length > 0) {
        rigDisplay.innerText = `Currently rigged: ${riggedColors.join(', ').toUpperCase()} (Will NOT win)`;
        rigDisplay.style.color = '#fff';
    } else {
        rigDisplay.innerText = `Currently rigged: NONE (Fair Mode)`;
        rigDisplay.style.color = `var(--yellow)`;
    }
    console.log(`[Secret] Rigged set to: ${riggedColors.length > 0 ? riggedColors.join(', ') : 'Fair Mode'}`);
}

rigButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const color = btn.getAttribute('data-color');
        toggleRiggedColor(color === 'null' ? null : color);
        // Menu doesn't auto-close now, allowing multiple selections
    });
});
