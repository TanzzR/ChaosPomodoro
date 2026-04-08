// DOM Elements
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const resetBtn = document.getElementById("reset-btn");
const messageBox = document.getElementById("message-box");
const chaosLevelSelect = document.getElementById("chaos-level");
const mainPanel = document.getElementById("main-panel");
const achievementsList = document.getElementById("achievements-list");
const popupsContainer = document.getElementById("popups-container");
const timerDisplay = document.getElementById("timer-display") || minutesEl.parentNode;

// Create Time Input dynamically
const timeInputContainer = document.createElement("div");
timeInputContainer.style.textAlign = "center";
timeInputContainer.style.marginBottom = "10px";
timeInputContainer.innerHTML = `
    <label for="time-input" style="color: rgba(255,255,255,0.8); margin-right: 10px; font-weight: 600;">Minutes:</label>
    <input type="number" id="time-input" value="25" min="1" style="width: 70px; padding: 5px; border-radius: 5px; border: 1px solid rgba(255,255,255,0.3); background: rgba(0,0,0,0.2); color: white; font-family: inherit; font-size: 1rem; outline: none; text-align: center;">
`;
timerDisplay.parentNode.insertBefore(timeInputContainer, timerDisplay);
const timeInput = document.getElementById("time-input");

timeInput.addEventListener("input", () => {
    if (!isRunning) {
        let val = parseInt(timeInput.value);
        if (isNaN(val) || val <= 0) val = 1;
        initialTime = val * 60;
        time = initialTime;
        updateDisplay();
    }
});

// State
let initialTime = 1500; // 25 minutes
let time = initialTime;
let interval = null;
let chaosInterval = null;
let isRunning = false;
let timeStaredAtTimer = 0; // seconds

// Audio context for annoying UI sounds
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

function playAnnoyingSound() {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    // Annoying high-pitched beep
    oscillator.type = 'sawtooth';
    oscillator.frequency.value = 800 + Math.random() * 400; // Random pitch
    
    // Quick, sharp envelope
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.5);
}

// Chaos Messages
const messages = [
    "Bro open your book.",
    "You're not even trying 💀",
    "Wow 2 minutes done, proud of you.",
    "Phone looking real interesting huh?",
    "This is why deadlines exist.",
    "You've been productive for 3 years 😍",
    "Maybe just one TikTok?",
    "Why are you staring at the timer?!",
    "Go on, just open Instagram.",
    "Blinking is a waste of time.",
    "Is this your 4th break in 10 minutes?",
    "You're doing great... at procrastinating."
];

function updateDisplay() {
    let m = Math.floor(time / 60);
    let s = time % 60;
    minutesEl.innerText = m.toString().padStart(2, "0");
    secondsEl.innerText = s.toString().padStart(2, "0");
}

function startTimer() {
    if (isRunning) return;
    isRunning = true;
    timeInput.disabled = true;
    timeInput.style.opacity = "0.5";
    
    // Resume audio context if it requires user interaction
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    interval = setInterval(() => {
        time--;
        timeStaredAtTimer++;
        updateDisplay();
        
        // Timer ending
        if (time <= 0) {
            clearInterval(interval);
            isRunning = false;
            triggerFakeAchievement("Started actually studying", "Just kidding, time's up!");
            document.body.style.filter = "invert(1)";
        }
        
        // Progress achievements
        if (timeStaredAtTimer === 300) {
            unlockAchievement(0, "🏆 Stared at Timer (5/5 min)");
        }
    }, 1000);

    triggerChaos();
}

function pauseTimer() {
    if (!isRunning) return;
    clearInterval(interval);
    clearInterval(chaosInterval);
    isRunning = false;
    timeInput.disabled = false;
    timeInput.style.opacity = "1";
    messageBox.innerText = "Wow, giving up already? Typical.";
    playAnnoyingSound();
}

function resetTimer() {
    clearInterval(interval);
    clearInterval(chaosInterval);
    isRunning = false;
    timeInput.disabled = false;
    timeInput.style.opacity = "1";
    time = initialTime;
    updateDisplay();
    messageBox.innerText = "Restarting? Make up your mind.";
    document.body.className = '';
    document.body.style.filter = "none";
    mainPanel.classList.remove('spin-slow', 'jitter');
}

// --- Chaos Engine ---

function triggerFakeAchievement(title, desc) {
    const popup = document.createElement("div");
    popup.className = "fake-popup";
    popup.innerHTML = `<strong>Achievement Unlocked!</strong><br>${title}<br><small>${desc}</small>`;
    
    // Random position
    const top = Math.max(10, Math.random() * (window.innerHeight - 100));
    const left = Math.max(10, Math.random() * (window.innerWidth - 200));
    popup.style.top = `${top}px`;
    popup.style.left = `${left}px`;
    
    popupsContainer.appendChild(popup);
    playAnnoyingSound();
    
    setTimeout(() => {
        popup.remove();
    }, 3000);
}

function unlockAchievement(index, newText) {
    const listItems = achievementsList.querySelectorAll("li");
    if (listItems[index] && listItems[index].classList.contains("locked")) {
        listItems[index].classList.remove("locked");
        listItems[index].classList.add("unlocked");
        listItems[index].innerText = newText;
        playAnnoyingSound();
    }
}

function generateChaos() {
    const chaosLevel = chaosLevelSelect.value;
    
    // 1. Change Message
    const msg = messages[Math.floor(Math.random() * messages.length)];
    messageBox.innerText = msg;

    // Determine actions based on chaos level
    const rand = Math.random();
    
    if (chaosLevel === "mild") {
        if (rand > 0.8) document.body.className = "chaos-mode-" + Math.ceil(Math.random() * 3);
    } 
    else if (chaosLevel === "normal") {
        if (rand > 0.5) {
            document.body.className = "chaos-mode-" + Math.ceil(Math.random() * 4);
        }
        if (rand > 0.8) {
            mainPanel.classList.add('jitter');
            setTimeout(() => mainPanel.classList.remove('jitter'), 1000);
        }
        if (rand > 0.9) triggerFakeAchievement("Master of Distraction", "Looking around again?");
    } 
    else if (chaosLevel === "extreme") {
        document.body.className = "chaos-mode-" + Math.ceil(Math.random() * 4);
        // Sometimes epileptic mode
        if (rand > 0.8) document.body.classList.add('chaos-mode-extreme');
        
        mainPanel.classList.add('jitter');
        setTimeout(() => mainPanel.classList.remove('jitter'), 2000);
        
        if (rand > 0.7) {
            startBtn.classList.add("run-away");
            startBtn.style.top = `${Math.random() * 80}%`;
            startBtn.style.left = `${Math.random() * 80}%`;
            playAnnoyingSound();
        }
        
        if (rand > 0.9) {
            mainPanel.classList.add('spin-slow');
            unlockAchievement(2, "😭 Mental Breakdown (1/1)");
        }
    }
}

function triggerChaos() {
    clearInterval(chaosInterval);
    
    let frequency = 5000;
    if (chaosLevelSelect.value === "mild") frequency = 8000;
    if (chaosLevelSelect.value === "extreme") frequency = 3000;

    chaosInterval = setInterval(generateChaos, frequency);
}

chaosLevelSelect.addEventListener("change", () => {
    if (isRunning) triggerChaos();
});

// Event Listeners
startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);

// Track visibility to fake out the user
document.addEventListener("visibilitychange", () => {
    if (document.hidden && isRunning) {
        unlockAchievement(1, "📱 Phone Touched (1/1 times)");
        triggerFakeAchievement("Busted!", "I saw you leave this tab.");
        playAnnoyingSound();
    }
});

// Initialize Display
updateDisplay();
