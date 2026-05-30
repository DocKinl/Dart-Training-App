// ==========================================
// 1. GLOBALE STATE-VARIABLEN (NUR X01)
// ==========================================
let initialPoints = 501;
let isTwoPlayers = false;
let isBotMatch = false;
let botLevel = 'medium';      // 'easy', 'medium', 'strong', 'insane'
let inputMode = 'segment';    // 'segment' (Darts einzeln) oder 'set' (Aufnahme)
let outMode = 'double';       // 'double' (Double Out) oder 'single' (Single Out)

// Match-Struktur Variablen
let scores = { 1: 501, 2: 501 };
let legs = { 1: 0, 2: 0 };
let sets = { 1: 0, 2: 0 };

let histories = { 1: [], 2: [] };
let activePlayer = 1;
let isLockingInput = false;

// Tracker für Statistiken
let matchStats = {
    1: { totalPoints: 0, totalDarts: 0, first9Points: 0, first9Darts: 0, turns: 0, c100: 0, c140: 0, c180: 0, highestTurn: 0, highestFinish: 0, shortestLeg: 999 },
    2: { totalPoints: 0, totalDarts: 0, first9Points: 0, first9Darts: 0, turns: 0, c100: 0, c140: 0, c180: 0, highestTurn: 0, highestFinish: 0, shortestLeg: 999 }
};
let legDartsCount = { 1: 0, 2: 0 };

// Virtuelles Keyboard State System
let currentVirtualSelectedMultiplier = 1; 
let currentActiveDartSlot = 1; 
let virtualDartData = {
    1: { val: 0, label: "-", rawField: "", m: 1, key: "" },
    2: { val: 0, label: "-", rawField: "", m: 1, key: "" },
    3: { val: 0, label: "-", rawField: "", m: 1, key: "" }
};
let virtualSumValue = 0;

// System-Optionen (Standardwerte)
let isSpeechOutputActive = true;
let isCheckoutHelperActive = true;
let currentTheme = 'dark';
let selectedVoice = null;
let currentLanguageCode = 'de-DE';

// Konstanten für Checkouts
const invalidFinishes = [169, 168, 166, 165, 163, 162, 159];
const impossibleScores = [179, 178, 176, 175, 173, 172, 169, 166, 163, 162, 159];

// ==========================================
// 2. INITIALISIERUNG & SETUP
// ==========================================
function safeInit() {
    const startBtn = document.getElementById('btn-start-game');
    if (!startBtn) {
        setTimeout(safeInit, 50);
        return;
    }
    initEventListeners();
    initVoices();
    initSliderLabels();
    
    // Erzwinge korrekte Startansicht für X01-Einstellungen
    const botOptions = document.getElementById('options-bot');
    if (botOptions) botOptions.classList.add('hidden');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', safeInit);
} else {
    safeInit();
}

if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = initVoices;
}

function initVoices() {
    if (typeof speechSynthesis === 'undefined') return;
    let voices = speechSynthesis.getVoices();
    let voiceSelect = document.getElementById('voice-select');
    let langSelect = document.getElementById('voice-lang-select');
    if (!voiceSelect || !langSelect) return;
    
    let selectedLangPref = langSelect.value;
    currentLanguageCode = selectedLangPref === 'de' ? 'de-DE' : 'en-US';
    let filteredVoices = voices.filter(voice => voice.lang.startsWith(selectedLangPref));
    voiceSelect.innerHTML = '';
    
    if (filteredVoices.length === 0) {
        let option = document.createElement('option');
        option.textContent = "Hardware-Stimme fehlt";
        option.value = "";
        voiceSelect.appendChild(option);
        selectedVoice = null;
        return;
    }

    let autoSelectedVoice = filteredVoices.find(v => 
        v.name.toLowerCase().includes('male') || 
        v.name.toLowerCase().includes('mark') || 
        v.name.toLowerCase().includes('stefan') ||
        v.name.toLowerCase().includes('david')
    ) || filteredVoices[0];

    filteredVoices.forEach((voice) => {
        let option = document.createElement('option');
        option.textContent = `${voice.name}`;
        option.value = voice.name;
        if (voice.name === autoSelectedVoice.name) {
            option.selected = true;
            selectedVoice = voice;
        }
        voiceSelect.appendChild(option);
    });
}

// ==========================================
// 3. SLIDER & LABELS LOGIK (NUR X01)
// ==========================================
function initSliderLabels() {
    const pSlider = document.getElementById('input-points-slider');
    const pLabel = document.getElementById('points-slider-label');
    if (pSlider && pLabel) {
        pLabel.innerText = `Startpunkte: ${pSlider.value}`;
    }
    
    const lSlider = document.getElementById('input-legs-slider');
    const lLabel = document.getElementById('legs-slider-label');
    if (lSlider && lLabel) {
        let val = parseInt(lSlider.value);
        lLabel.innerText = `Legs pro Set: Best of ${val} (First to ${Math.ceil(val / 2)})`;
    }
    
    const sSlider = document.getElementById('input-sets-slider');
    const sLabel = document.getElementById('sets-slider-label');
    if (sSlider && sLabel) {
        let val = parseInt(sSlider.value);
        sLabel.innerText = `Sets zum Matchgewinn: Best of ${val} (First to ${Math.ceil(val / 2)})`;
    }
}

// ==========================================
// 4. EVENT LISTENERS (ABSTURZSICHER)
// ==========================================
function initEventListeners() {
    // Einstellungen Modal
    document.querySelectorAll('.btn-settings-open').forEach(btn => {
        btn.onclick = () => { document.getElementById('settings-modal').classList.remove('hidden'); };
    });
    const settingsClose = document.getElementById('btn-settings-close');
    if (settingsClose) {
        settingsClose.onclick = () => { document.getElementById('settings-modal').classList.add('hidden'); };
    }

    // Statistiken Modal
    const openStatsBtn = document.getElementById('btn-open-stats');
    if (openStatsBtn) openStatsBtn.onclick = openStatsModal;
    
    const closeStatsBtn = document.getElementById('btn-stats-close');
    if (closeStatsBtn) closeStatsBtn.onclick = () => document.getElementById('stats-modal').classList.add('hidden');
    
    const clearStatsBtn = document.getElementById('btn-clear-stats');
    if (clearStatsBtn) {
        clearStatsBtn.onclick = () => {
            if(confirm("Alle gespeicherten Daten unwiderruflich löschen?")) {
                localStorage.removeItem('docKinl_dart_stats');
                openStatsModal();
            }
        };
    }

    // Optionsgruppen (Klick-Handler)
    setupGroupListeners('group-theme-select', (val, btn) => {
        selectOption('group-theme-select', btn);
        currentTheme = val;
        if(val === 'light') document.body.classList.add('light-theme');
        else document.body.classList.remove('light-theme');
    });

    setupGroupListeners('group-toggle-tts', (val, btn) => {
        selectOption('group-toggle-tts', btn);
        isSpeechOutputActive = (val === 'true');
        const subMenu = document.getElementById('sub-voice-settings');
        if (subMenu) subMenu.style.style.display = isSpeechOutputActive ? 'block' : 'none';
    });

    setupGroupListeners('group-toggle-helper', (val, btn) => {
        selectOption('group-toggle-helper', btn);
        isCheckoutHelperActive = (val === 'true');
    });

    // WICHTIG: Gegner-Auswahl (Alleine, Spieler 2, Bot) mit Bot-Menü-Steuerung
    setupGroupListeners('group-players', (val, btn) => {
        selectOption('group-players', btn);
        const botOptions = document.getElementById('options-bot');
        if (botOptions) {
            if (val === 'bot') {
                botOptions.classList.remove('hidden');
            } else {
                botOptions.classList.add('hidden');
            }
        }
    });

    // Slider Event Listener
    const pointsSlider = document.getElementById('input-points-slider');
    if (pointsSlider) {
        pointsSlider.oninput = function() {
            const lbl = document.getElementById('points-slider-label');
            if (lbl) lbl.innerText = `Startpunkte: ${this.value}`;
        };
    }

    const legsSlider = document.getElementById('input-legs-slider');
    if (legsSlider) {
        legsSlider.oninput = function() {
            let val = parseInt(this.value);
            let firstTo = Math.ceil(val / 2);
            const lbl = document.getElementById('legs-slider-label');
            if (lbl) lbl.innerText = `Legs pro Set: Best of ${val} (First to ${firstTo})`;
        };
    }

    const setsSlider = document.getElementById('input-sets-slider');
    if (setsSlider) {
        setsSlider.oninput = function() {
            let val = parseInt(this.value);
            let firstTo = Math.ceil(val / 2);
            const lbl = document.getElementById('sets-slider-label');
            if (lbl) lbl.innerText = `Sets zum Matchgewinn: Best of ${val} (First to ${firstTo})`;
        };
    }

    // Weitere Menüoptionen
    setupGroupListeners('group-bot-level', (val, btn) => selectOption('group-bot-level', btn));
    setupGroupListeners('group-input-mode', (val, btn) => selectOption('group-input-mode', btn));
    setupGroupListeners('group-out', (val, btn) => selectOption('group-out', btn));

    // Spiel-Buttons
    const startBtn = document.getElementById('btn-start-game');
    if (startBtn) startBtn.onclick = startGame;

    const abortBtn = document.getElementById('btn-abort-game');
    if (abortBtn) abortBtn.onclick = abortGame;

    const resetBtn = document.getElementById('btn-reset-game');
    if (resetBtn) resetBtn.onclick = resetGame;
}

function setupGroupListeners(groupId, callback) {
    const container = document.getElementById(groupId);
    if (!container) return;
    container.querySelectorAll('.btn-option').forEach(btn => {
        btn.onclick = function() { callback(this.getAttribute('data-value'), this); };
    });
}

function selectOption(groupId, element) {
    const container = document.getElementById(groupId);
    if (!container) return;
    container.querySelectorAll('.btn-option').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
}

function getSelectedValue(groupId) {
    const container = document.getElementById(groupId);
    if (!container) return null;
    const activeBtn = container.querySelector('.btn-option.active');
    return activeBtn ? activeBtn.getAttribute('data-value') : null;
}

// ==========================================
// 5. STEUERUNG SPIELSTART (NUR X01)
// ==========================================
function startGame() {
    let opponentType = getSelectedValue('group-players');
    isTwoPlayers = (opponentType === "2");
    isBotMatch = (opponentType === "bot");
    botLevel = getSelectedValue('group-bot-level') || 'medium';
    inputMode = getSelectedValue('group-input-mode') || 'segment';
    outMode = getSelectedValue('group-out') || 'double';

    // Elemente für alternative Modi, falls im HTML vorhanden, unsichtbar machen
    const optFin = document.getElementById('options-fin'); if (optFin) optFin.classList.add('hidden');
    const optAtc = document.getElementById('options-atc'); if (optAtc) optAtc.classList.add('hidden');
    const optSod = document.getElementById('options-sod'); if (optSod) optSod.classList.add('hidden');

    // UI-Elemente für Spielseite vorbereiten
    const setInput = document.getElementById('set-input-container');
    const segmentInput = document.getElementById('segment-input-container');
    const submitBtn = document.getElementById('submit-btn');

    if (setInput) setInput.classList.add('hidden');
    if (segmentInput) segmentInput.classList.add('hidden');

    document.getElementById('p1-title').innerText = "Spieler 1";
    document.getElementById('p2-title').innerText = isBotMatch ? `Computer (${botLevel.toUpperCase()})` : "Spieler 2";
    document.getElementById('h1-header').innerText = "Verlauf S1";
    document.getElementById('h2-header').innerText = isBotMatch ? "Verlauf Bot" : "Verlauf S2";
    
    if (submitBtn) submitBtn.classList.remove('hidden');

    // Stats zurücksetzen
    matchStats = {
        1: { totalPoints: 0, totalDarts: 0, first9Points: 0, first9Darts: 0, turns: 0, c100: 0, c140: 0, c180: 0, highestTurn: 0, highestFinish: 0, shortestLeg: 999 },
        2: { totalPoints: 0, totalDarts: 0, first9Points: 0, first9Darts: 0, turns: 0, c100: 0, c140: 0, c180: 0, highestTurn: 0, highestFinish: 0, shortestLeg: 999 }
    };
    legs = { 1: 0, 2: 0 }; sets = { 1: 0, 2: 0 };
    legDartsCount = { 1: 0, 2: 0 };

    // Punkte aus Slider auslesen
    const sliderVal = document.getElementById('input-points-slider') ? parseInt(document.getElementById('input-points-slider').value) : 501;
    initialPoints = sliderVal;
    scores[1] = initialPoints; 
    scores[2] = initialPoints;

    const legsValue = document.getElementById('input-legs-slider') ? parseInt(document.getElementById('input-legs-slider').value) : 5;
    const setsValue = document.getElementById('input-sets-slider') ? parseInt(document.getElementById('input-sets-slider').value) : 3;
    
    window.legsRequiredForSet = Math.ceil(legsValue / 2);
    window.setsRequiredForMatch = Math.ceil(setsValue / 2);

    document.getElementById('game-title').innerText = `${initialPoints}er Match (Best of ${setsValue} Sets, Legs pro Set: Best of ${legsValue})`;

    // Richtigen Input-Modus einblenden
    if (inputMode === 'set') {
        if (setInput) setInput.classList.remove('hidden');
        if (submitBtn) submitBtn.classList.add('hidden'); // Der Sum-Submit Button übernimmt
    } else {
        if (segmentInput) segmentInput.classList.remove('hidden');
    }

    // Standard-Felder einblenden
    document.getElementById('p1-legs-sets').classList.remove('hidden');
    document.getElementById('p2-legs-sets').classList.remove('hidden');
    document.getElementById('p1-live-avg').classList.remove('hidden');
    document.getElementById('p2-live-avg').classList.remove('hidden');

    histories[1] = []; histories[2] = []; activePlayer = 1; isLockingInput = false;
    updateScoreboardDisplays();

    document.getElementById('p1-history-list').innerHTML = "";
    document.getElementById('p2-history-list').innerHTML = "";
    document.getElementById('p1-card').classList.add('active');
    document.getElementById('p2-card').classList.remove('active');

    if (isTwoPlayers || isBotMatch) {
        document.getElementById('p2-card').classList.remove('hidden');
        document.getElementById('p2-history-box').classList.remove('hidden');
    } else {
        document.getElementById('p2-card').classList.add('hidden');
        document.getElementById('p2-history-box').classList.add('hidden');
    }

    resetVirtualState();
    document.getElementById('startseite').classList.add('hidden');
    document.getElementById('spielseite').classList.remove('hidden');
}

function updateScoreboardDisplays() {
    document.getElementById('p1-score').innerText = scores[1];
    document.getElementById('p2-score').innerText = scores[2];
    document.getElementById('p1-legs-sets').innerText = `Legs: ${legs[1]} | Sets: ${sets[1]}`;
    document.getElementById('p2-legs-sets').innerText = `Legs: ${legs[2]} | Sets: ${sets[2]}`;

    let p1TripleAvg = matchStats[1].totalDarts > 0 ? ((matchStats[1].totalPoints / matchStats[1].totalDarts) * 3).toFixed(1) : "0.0";
    let p2TripleAvg = matchStats[2].totalDarts > 0 ? ((matchStats[2].totalPoints / matchStats[2].totalDarts) * 3).toFixed(1) : "0.0";
    
    document.getElementById('p1-live-avg').innerText = `Ø ${p1TripleAvg} (${matchStats[1].totalDarts} Darts)`;
    document.getElementById('p2-live-avg').innerText = `Ø ${p2TripleAvg} (${matchStats[2].totalDarts} Darts)`;
}

function abortGame() {
    if (confirm("Spiel wirklich abbrechen?")) {
        document.getElementById('spielseite').classList.add('hidden');
        document.getElementById('startseite').classList.remove('hidden');
    }
}

function resetGame() {
    document.getElementById('abschlussseite').classList.add('hidden');
    document.getElementById('startseite').classList.remove('hidden');
}

function openStatsModal() {
    let raw = localStorage.getItem('docKinl_dart_stats');
    let stats = raw ? JSON.parse(raw) : { totalGames: 0, sumAvg: 0, highestTurn: 0, highestFinish: 0, total180s: 0 };
    
    document.getElementById('stat-total-games').innerText = stats.totalGames;
    document.getElementById('stat-alltime-avg').innerText = stats.totalGames > 0 ? (stats.sumAvg / stats.totalGames).toFixed(1) : "0.0";
    document.getElementById('stat-highest-turn').innerText = stats.highestTurn;
    document.getElementById('stat-highest-co').innerText = stats.highestFinish;
    document.getElementById('stat-total-180s').innerText = stats.total180s;

    document.getElementById('stats-modal').classList.remove('hidden');
}

function resetVirtualState() {
    virtualDartData = {
        1: { val: 0, label: "-", rawField: "", m: 1, key: "" },
        2: { val: 0, label: "-", rawField: "", m: 1, key: "" },
        3: { val: 0, label: "-", rawField: "", m: 1, key: "" }
    };
    const b1 = document.getElementById('box-d1'); if(b1) b1.innerText = "Dart 1: -";
    const b2 = document.getElementById('box-d2'); if(b2) b2.innerText = "Dart 2: -";
    const b3 = document.getElementById('box-d3'); if(b3) b3.innerText = "Dart 3: -";
    currentActiveDartSlot = 1;
    currentVirtualSelectedMultiplier = 1;
    virtualSumValue = 0;
    const disp = document.getElementById('virtual-sum-display'); if (disp) disp.innerText = 0;
}
