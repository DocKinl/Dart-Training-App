// Spielzustand (State)
let game = {
    startScore: 501,
    currentPlayer: 1, // 1 oder 2
    players: {
        1: { name: "Spieler 1", score: 501, totalPoints: 0, turns: 0 },
        2: { name: "Spieler 2", score: 501, totalPoints: 0, turns: 0 }
    },
    history: [] // Für die Undo-Funktion
};

// DOM-Elemente
const cardP1 = document.getElementById('cardP1');
const cardP2 = document.getElementById('cardP2');
const scoreP1 = document.getElementById('scoreP1');
const scoreP2 = document.getElementById('scoreP2');
const statsP1 = document.getElementById('statsP1');
const statsP2 = document.getElementById('statsP2');
const nameDisplayP1 = document.getElementById('nameDisplayP1');
const nameDisplayP2 = document.getElementById('nameDisplayP2');

const scoreInput = document.getElementById('scoreInput');
const submitScoreBtn = document.getElementById('submitScoreBtn');
const undoBtn = document.getElementById('undoBtn');
const resetBtn = document.getElementById('resetBtn');
const historyList = document.getElementById('historyList');

// Modal-Elemente
const settingsModal = document.getElementById('settingsModal');
const openSettingsBtn = document.getElementById('openSettingsBtn');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const inputP1 = document.getElementById('inputP1');
const inputP2 = document.getElementById('inputP2');
const gameModeSelect = document.getElementById('gameMode');

// Initialisierung bei App-Start
function init() {
    updateUI();
    setupEventListeners();
}

// Event Listener registrieren
function setupEventListeners() {
    submitScoreBtn.addEventListener('click', handleScoreSubmit);
    scoreInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleScoreSubmit();
    });
    
    undoBtn.addEventListener('click', handleUndo);
    resetBtn.addEventListener('click', () => resetMatch());

    // Modal Events
    openSettingsBtn.addEventListener('click', openModal);
    closeSettingsBtn.addEventListener('click', closeModal);
    saveSettingsBtn.addEventListener('click', saveSettings);
    
    // Schließen bei Klick auf den grauen Hintergrund
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) closeModal();
    });
}

// Modal öffnen / schließen
function openModal() {
    inputP1.value = game.players[1].name;
    inputP2.value = game.players[2].name;
    gameModeSelect.value = game.startScore.toString();
    settingsModal.classList.add('open');
}

function closeModal() {
    settingsModal.classList.remove('open');
}

// Einstellungen aus dem Modal speichern
function saveSettings() {
    const name1 = inputP1.value.trim() || "Spieler 1";
    const name2 = inputP2.value.trim() || "Spieler 2";
    const mode = parseInt(gameModeSelect.value, 10);

    game.players[1].name = name1;
    game.players[2].name = name2;
    game.startScore = mode;

    closeModal();
    resetMatch(); // Startet das Spiel mit den neuen Settings komplett frisch
}

// Score einreichen
function handleScoreSubmit() {
    const value = parseInt(scoreInput.value, 10);
    
    // Validierung der Eingabe
    if (isNaN(value) || value < 0 || value > 180) {
        alert("Bitte eine gültige Punktzahl zwischen 0 und 180 eingeben.");
        scoreInput.value = "";
        return;
    }

    const player = game.players[game.currentPlayer];
    
    // Zustand für Undo sichern (Deep Copy des aktuellen Players-Objekts)
    game.history.push({
        currentPlayer: game.currentPlayer,
        playersState: JSON.parse(JSON.stringify(game.players))
    });

    // Berechnung
    if (player.score - value === 0) {
        // Gewonnen!
        player.score = 0;
        player.turns++;
        player.totalPoints += value;
        updateUI();
        setTimeout(() => {
            alert(`🎉 ${player.name} hat das Match gewonnen!`);
            resetMatch();
        }, 50);
        return;
    } else if (player.score - value < 0 || player.score - value === 1) {
        // Überworfen (Bust) - Restscore 1 ist im Steeldart (Double-Out) auch ein Bust
        player.turns++;
        alert(`💥 Überworfen! (Rest: ${player.score})`);
    } else {
        // Gültiger Wurf
        player.score -= value;
        player.turns++;
        player.totalPoints += value;
    }

    // Spieler wechseln
    game.currentPlayer = game.currentPlayer === 1 ? 2 : 1;
    
    scoreInput.value = "";
    updateUI();
    scoreInput.focus();
}

// Letzten Schritt rückgängig machen
function handleUndo() {
    if (game.history.length === 0) {
        alert("Keine Würfe im Verlauf vorhanden.");
        return;
    }

    const previousState = game.history.pop();
    game.currentPlayer = previousState.currentPlayer;
    game.players = previousState.playersState;

    updateUI();
}

// Match zurücksetzen
function resetMatch() {
    game.currentPlayer = 1;
    game.history = [];
    
    game.players[1].score = game.startScore;
    game.players[1].turns = 0;
    game.players[1].totalPoints = 0;
    
    game.players[2].score = game.startScore;
    game.players[2].turns = 0;
    game.players[2].totalPoints = 0;

    updateUI();
    scoreInput.value = "";
}

// UI aktualisieren
function updateUI() {
    // Scores & Namen anzeigen
    nameDisplayP1.textContent = game.players[1].name;
    nameDisplayP2.textContent = game.players[2].name;
    
    scoreP1.textContent = game.players[1].score;
    scoreP2.textContent = game.players[2].score;

    // Averages berechnen
    const avgP1 = game.players[1].turns > 0 ? (game.players[1].totalPoints / game.players[1].turns).toFixed(1) : "0.0";
    const avgP2 = game.players[2].turns > 0 ? (game.players[2].totalPoints / game.players[2].turns).toFixed(1) : "0.0";

    statsP1.textContent = `Aufnahmen: ${game.players[1].turns} (Ø ${avgP1})`;
    statsP2.textContent = `Aufnahmen: ${game.players[2].turns} (Ø ${avgP2})`;

    // Aktiven Spieler visuell hervorheben
    if (game.currentPlayer === 1) {
        cardP1.classList.add('active');
        cardP2.classList.remove('active');
    } else {
        cardP2.classList.add('active');
        cardP1.classList.remove('active');
    }

    // Verlauf-Liste neu rendern
    renderHistory();
}

// Verlauf-Liste anzeigen
function renderHistory() {
    historyList.innerHTML = "";
    
    // Die Historie rückwärts durchlaufen, damit der neueste Wurf oben steht
    for (let i = game.history.length - 1; i >= 0; i--) {
        const item = game.history[i];
        const activePlayerNum = item.currentPlayer;
        const oldState = item.playersState[activePlayerNum];
        const newState = game.history[i+1] ? game.history[i+1].playersState[activePlayerNum] : game.players[activePlayerNum];
        
        // Geworfene Punkte ermitteln
        const thrownPoints = oldState.score - newState.score;

        const li = document.createElement('li');
        li.className = 'history-item';
        li.innerHTML = `
            <span><strong>${oldState.name}</strong></span>
            <span>${thrownPoints > 0 ? thrownPoints : 'Bust'} Pkt. (Rest: ${newState.score})</span>
        `;
        historyList.appendChild(li);
    }
}

// Start der Anwendung
init();

