// ==========================================
// Globale State-Variablen & Konfiguration
// ==========================================
let activeGlobalMode = 'x01';
let initialPoints = 501;
let isTwoPlayers = false;
let isBotMatch = false;
let botLevel = 'medium';
let inputMode = 'segment';
let outMode = 'double';
let isCheckoutHelperActive = true;

// Match-Struktur Variablen
let scores = { 1: 501, 2: 501 };
let legs = { 1: 0, 2: 0 };
let sets = { 1: 0, 2: 0 };

let histories = { 1: [], 2: [] };
let activePlayer = 1;
let isLockingInput = false;

// Tracker für Statistiken (Echte Gesamtwerte basierend auf geworfenen Darts)
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

// Finishing Variablen
let finAttempts = 0;
let finTargetScore = 0;
let finTypeSetting = 'realistic';

// System-Optionen
let isSpeechOutputActive = true;
let currentTheme = 'dark';

const invalidFinishes = [169, 168, 166, 165, 163, 162, 159];
const impossibleScores = [179, 178, 176, 175, 173, 172, 169, 166, 163, 162, 159];

const checkoutRoutes = {
    170: ["T20", "T20", "D50"], 167: ["T20", "T19", "D50"], 164: ["T20", "T18", "D50"], 161: ["T20", "T17", "D50"],
    160: ["T20", "T20", "D20"], 158: ["T20", "T20", "D19"], 157: ["T20", "T19", "D20"], 156: ["T20", "T20", "D18"],
    155: ["T20", "T19", "D19"], 154: ["T20", "T18", "D20"], 153: ["T20", "T19", "D18"], 152: ["T20", "T17", "D20"],
    151: ["T20", "T17", "D19"], 150: ["T20", "T18", "D18"], 149: ["T20", "T19", "D16"], 148: ["T20", "S16", "D20"],
    147: ["T20", "T17", "D18"], 146: ["T20", "T18", "D16"], 145: ["T20", "S15", "D20"], 144: ["T20", "T20", "D12"],
    143: ["T20", "T17", "D16"], 142: ["T20", "S14", "D20"], 141: ["T20", "T15", "D18"], 140: ["T20", "T16", "D16"],
    139: ["T19", "S14", "D20"], 138: ["T20", "S14", "D18"], 137: ["T19", "T16", "D16"], 136: ["T20", "T20", "D8"],
    135: ["T20", "T15", "D15"], 134: ["T20", "T14", "D16"], 133: ["T20", "T17", "D11"], 132: ["T20", "T16", "D12"],
    131: ["T20", "T13", "D16"], 130: ["T20", "T18", "D8"],  129: ["T19", "T16", "D12"], 128: ["T18", "T14", "D16"],
    127: ["T20", "T17", "D8"],  126: ["T19", "T19", "D6"],  125: ["T20", "T15", "D10"], 124: ["T20", "D16", "D16"],
    123: ["T19", "T16", "D9"],  122: ["T18", "T16", "D10"], 121: ["T20", "T11", "D14"], 120: ["T20", "S20", "D20"],
    119: ["T19", "S10", "D26"], 118: ["T20", "S18", "D20"], 117: ["T20", "S17", "D20"], 116: ["T20", "S16", "D20"],
    115: ["T20", "S15", "D20"], 114: ["T20", "S14", "D20"], 113: ["T19", "S16", "D20"], 112: ["T20", "S12", "D20"],
    111: ["T20", "S19", "D16"], 110: ["T20", "S10", "D20"], 109: ["T19", "S12", "D20"], 108: ["T19", "S19", "D16"],
    107: ["T19", "S10", "D20"], 106: ["T20", "S10", "D18"], 105: ["T19", "S16", "D16"], 104: ["T20", "S12", "D16"],
    103: ["T19", "S10", "D18"], 102: ["T20", "S10", "D14"], 101: ["T20", "S13", "D11"], 100: ["T20", "D20"],
    90: ["T18", "D18"], 80: ["T20", "D10"], 70: ["T10", "D20"], 60: ["S20", "D20"], 50: ["S10", "D20"], 40: ["D20"]
};

let selectedVoice = null;
let currentLanguageCode = 'de-DE';

// ==========================================
// App-Initialisierung & Lifecycle
// ==========================================
function safeInit() {
    const startBtn = document.getElementById('btn-start-game');
    if (!startBtn) {
        setTimeout(safeInit, 50);
        return;
    }
    populateSodTargets();
    initEventListeners();
    initVoices();
    initSliderLabels();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', safeInit);
} else {
    safeInit();
}

if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = initVoices;
}

function populateSodTargets() {
    const select = document.getElementById('sod-target-select');
    if (!select) return;
    select.innerHTML = "";
    for(let i = 20; i >= 1; i--) {
        let opt = document.createElement('option');
        opt.value = i.toString();
        opt.textContent = `Segment ${i}`;
        select.appendChild(opt);
    }
    let optBull = document.createElement('option');
    optBull.value = "bull";
    optBull.textContent = "Bullseye";
    select.appendChild(optBull);
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

function initSliderLabels() {
    const pSlider = document.getElementById('input-points-slider');
    if (pSlider) {
        const lbl = document.getElementById('points-slider-label');
        if (lbl) lbl.innerText = `Startpunkte: ${pSlider.value}`;
    }
    const lSlider = document.getElementById('input-legs-slider');
    if (lSlider) {
        let val = parseInt(lSlider.value);
        const lbl = document.getElementById('legs-slider-label');
        if (lbl) lbl.innerText = `Legs pro Set: Best of ${val} (First to ${Math.ceil(val / 2)})`;
    }
    const sSlider = document.getElementById('input-sets-slider');
    if (sSlider) {
        let val = parseInt(sSlider.value);
        const lbl = document.getElementById('sets-slider-label');
        if (lbl) lbl.innerText = `Sets zum Matchgewinn: Best of ${val} (First to ${Math.ceil(val / 2)})`;
    }
}

// ==========================================
// Event-Listener & UI-Interaktionen
// ==========================================
function initEventListeners() {
    document.querySelectorAll('.btn-settings-open').forEach(btn => {
        btn.onclick = () => { 
            const el = document.getElementById('settings-modal');
            if (el) el.classList.remove('hidden'); 
        };
    });
    
    const settingsClose = document.getElementById('btn-settings-close');
    if (settingsClose) {
        settingsClose.onclick = () => { document.getElementById('settings-modal').classList.add('hidden'); };
    }

    const openStats = document.getElementById('btn-open-stats');
    if (openStats) openStats.onclick = openStatsModal;

    const closeStats = document.getElementById('btn-stats-close');
    if (closeStats) closeStats.onclick = () => document.getElementById('stats-modal').classList.add('hidden');

    const clearStats = document.getElementById('btn-clear-stats');
    if (clearStats) {
        clearStats.onclick = () => {
            if(confirm("Alle gespeicherten Daten unwiderruflich löschen?")) {
                localStorage.removeItem('docKinl_dart_stats');
                openStatsModal();
            }
        };
    }

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
        if (subMenu) subMenu.style.display = isSpeechOutputActive ? 'block' : 'none';
    });

    setupGroupListeners('group-toggle-helper', (val, btn) => {
        selectOption('group-toggle-helper', btn);
        isCheckoutHelperActive = (val === 'true');
    });

    setupGroupListeners('group-game-mode', (val, btn) => changeGameMode(val, btn));
    setupGroupListeners('group-players', (val, btn) => {
        selectOption('group-players', btn);
        const botOptions = document.getElementById('options-bot');
        if (botOptions) {
            if(val === 'bot') botOptions.classList.remove('hidden');
            else botOptions.classList.add('hidden');
        }
    });

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

    setupGroupListeners('group-bot-level', (val, btn) => selectOption('group-bot-level', btn));
    setupGroupListeners('group-input-mode', (val, btn) => selectOption('group-input-mode', btn));
    setupGroupListeners('group-out', (val, btn) => selectOption('group-out', btn));
    setupGroupListeners('group-fin-type', (val, btn) => changeFinishingType(val, btn));
    setupGroupListeners('group-fin-range', (val, btn) => selectOption('group-fin-range', btn));
    setupGroupListeners('group-atc-bonus', (val, btn) => selectOption('group-atc-bonus', btn));
    setupGroupListeners('group-sod-darts', (val, btn) => selectOption('group-sod-darts', btn));
    setupGroupListeners('group-sod-ring', (val, btn) => selectOption('group-sod-ring', btn));

    const vm1 = document.getElementById('vmult-1'); if (vm1) vm1.onclick = () => setVirtualMultiplier(1);
    const vm2 = document.getElementById('vmult-2'); if (vm2) vm2.onclick = () => setVirtualMultiplier(2);
    const vm3 = document.getElementById('vmult-3'); if (vm3) vm3.onclick = () => setVirtualMultiplier(3);

    document.querySelectorAll('.keyboard-grid .numkey, [data-val="bull"], [data-val="0"]').forEach(btn => {
        btn.onclick = function() {
            let value = this.getAttribute('data-val');
            inputVirtualDart(value);
        };
    });

    const clearSegments = document.getElementById('vkey-clear-segments');
    if (clearSegments) clearSegments.onclick = clearLastVirtualDart;

    const boxD1 = document.getElementById('box-d1'); if (boxD1) boxD1.onclick = () => setActiveDartSlot(1);
    const boxD2 = document.getElementById('box-d2'); if (boxD2) boxD2.onclick = () => setActiveDartSlot(2);
    const boxD3 = document.getElementById('box-d3'); if (boxD3) boxD3.onclick = () => setActiveDartSlot(3);

    document.querySelectorAll('.keyboard-grid-sum .sumkey').forEach(btn => {
        btn.onclick = function() {
            let num = this.getAttribute('data-num');
            appendVirtualSum(num);
        };
    });

    document.querySelectorAll('.keyboard-grid-shortcuts .shortcut').forEach(btn => {
        btn.onclick = function() {
            let exactSum = parseInt(this.getAttribute('data-sum'));
            setVirtualSum(exactSum);
        };
    });

    const clearSum = document.getElementById('vkey-clear-sum');
    if (clearSum) clearSum.onclick = () => { setVirtualSum(0); };

    const submitSum = document.getElementById('vkey-submit-sum');
    if (submitSum) submitSum.onclick = submitScore;

    const startGameBtn = document.getElementById('btn-start-game');
    if (startGameBtn) startGameBtn.onclick = startGame;

    const abortGameBtn = document.getElementById('btn-abort-game');
    if (abortGameBtn) abortGameBtn.onclick = abortGame;

    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) submitBtn.onclick = submitScore;

    const resetGameBtn = document.getElementById('btn-reset-game');
    if (resetGameBtn) resetGameBtn.onclick = resetGame;
}

function setupGroupListeners(groupId, callback) {
    const container = document.getElementById(groupId);
    if (!container) return;
    container.querySelectorAll('.btn-option').forEach(btn => {
        btn.onclick = function() { callback(this.getAttribute('data-value'), this); };
    });
}

function changeFinishingType(val, btn) {
    selectOption('group-fin-type', btn);
    const wrapper = document.getElementById('wrapper-fin-range');
    if (wrapper) wrapper.style.display = (val === 'strict') ? 'none' : 'block';
}

function selectOption(groupId, element) {
    document.querySelectorAll(`#${groupId} .btn-option`).forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
}

function getSelectedValue(groupId) {
    const activeBtn = document.querySelector(`#${groupId} .btn-option.active`);
    return activeBtn ? activeBtn.getAttribute('data-value') : null;
}

function changeGameMode(mode, element) {
    selectOption('group-game-mode', element);
    activeGlobalMode = mode;
    
    const elementsToHide = ['options-x01', 'options-fin', 'options-atc', 'options-sod', 'options-bot'];
    elementsToHide.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });

    const wrapperPlayers = document.getElementById('wrapper-players');
    if (wrapperPlayers) wrapperPlayers.classList.remove('hidden');

    if (mode === 'x01') {
        const optX01 = document.getElementById('options-x01');
        if (optX01) optX01.classList.remove('hidden');
        if(getSelectedValue('group-players') === 'bot') {
            const optBot = document.getElementById('options-bot');
            if (optBot) optBot.classList.remove('hidden');
        }
    }
    else if (mode === 'fin') {
        const optFin = document.getElementById('options-fin');
        if (optFin) optFin.classList.remove('hidden');
        if (wrapperPlayers) wrapperPlayers.classList.add('hidden');
    }
    else if (mode === 'atc') {
        const optAtc = document.getElementById('options-atc');
        if (optAtc) optAtc.classList.remove('hidden');
    }
    else if (mode === 'sod') {
        const optSod = document.getElementById('options-sod');
        if (optSod) optSod.classList.remove('hidden');
        if (wrapperPlayers) wrapperPlayers.classList.add('hidden');
    }
}

// ==========================================
// Virtuelles Keyboard Steuerung & Live-Bust
// ==========================================
function setVirtualMultiplier(mValue) {
    currentVirtualSelectedMultiplier = mValue;
    document.querySelectorAll('[id^="vmult-"]').forEach(btn => btn.classList.remove('active'));
    const targetBtn = document.getElementById(`vmult-${mValue}`);
    if (targetBtn) targetBtn.classList.add('active');
}

function setActiveDartSlot(slotNum) {
    currentActiveDartSlot = slotNum;
    document.querySelectorAll('.preview-box').forEach(box => box.classList.remove('active-slot'));
    const activeBox = document.getElementById(`box-d${slotNum}`);
    if (activeBox) activeBox.classList.add('active-slot');
}

function inputVirtualDart(field) {
    if (isLockingInput) return;
    const errMsg = document.getElementById('error-message');
    if (errMsg) errMsg.innerText = "";

    let m = currentVirtualSelectedMultiplier;
    if (field === "bull" && m === 3) m = 2; 
    if (field === "0") m = 1;

    let parsed = parseSegmentData(field, m);
    if (!parsed) return;

    virtualDartData[currentActiveDartSlot] = {
        val: parsed.val,
        label: parsed.label,
        rawField: field,
        m: m,
        key: parsed.key
    };

    updateDartPreviewDOM();
    let wasBust = checkLiveBustSegment(currentActiveDartSlot);

    if (!wasBust) {
        if (activeGlobalMode === 'x01' && inputMode === 'segment') {
            calculateLiveTurnCheckout();
        }
        
        if (currentActiveDartSlot < 3) {
            setActiveDartSlot(currentActiveDartSlot + 1);
        }
    }
    setVirtualMultiplier(1); 
}

function clearLastVirtualDart() {
    virtualDartData[currentActiveDartSlot] = { val: 0, label: "-", rawField: "", m: 1, key: "" };
    updateDartPreviewDOM();
    const errMsg = document.getElementById('error-message');
    if (errMsg) errMsg.innerText = "";
    if (activeGlobalMode === 'x01' && inputMode === 'segment') {
        calculateLiveTurnCheckout();
    }
}

function updateDartPreviewDOM() {
    for (let slot = 1; slot <= 3; slot++) {
        const box = document.getElementById(`box-d${slot}`);
        if(box) box.innerText = `Dart ${slot}: ${virtualDartData[slot].label}`;
    }
}

function appendVirtualSum(digit) {
    let currentStr = virtualSumValue.toString();
    if (currentStr === "0") currentStr = "";
    currentStr += digit;
    let newSum = parseInt(currentStr) || 0;
    if (newSum <= 180) setVirtualSum(newSum);
}

function setVirtualSum(value) {
    virtualSumValue = value;
    const disp = document.getElementById('virtual-sum-display');
    if (disp) disp.innerText = virtualSumValue;
}

// ==========================================
// Text-to-Speech (TTS) & Checkout Logik
// ==========================================
function speak(text) {
    if (!isSpeechOutputActive || typeof speechSynthesis === 'undefined') return;
    let utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentLanguageCode;
    if (selectedVoice) utterance.voice = selectedVoice;
    window.speechSynthesis.speak(utterance);
}

function speakTurnResult(score, rest) {
    if (!isSpeechOutputActive || typeof speechSynthesis === 'undefined') return;
    window.speechSynthesis.cancel();
    let scoreUtterance = new SpeechSynthesisUtterance(score.toString());
    scoreUtterance.lang = currentLanguageCode;
    if (selectedVoice) scoreUtterance.voice = selectedVoice;

    scoreUtterance.onend = () => {
        if (typeof rest === 'number' && rest > 0) {
            let isEn = currentLanguageCode.startsWith('en');
            let restUtterance = new SpeechSynthesisUtterance(isEn ? "Remaining " + rest : "Rest " + rest);
            restUtterance.lang = currentLanguageCode;
            if (selectedVoice) restUtterance.voice = selectedVoice;
            window.speechSynthesis.speak(restUtterance);
        }
    };
    window.speechSynthesis.speak(scoreUtterance);
}

function triggerCheckoutHelperVoice(score) {
    if(!isSpeechOutputActive || !isCheckoutHelperActive || score > 170 || invalidFinishes.includes(score) || typeof speechSynthesis === 'undefined') return;
    let route = null;
    if (checkoutRoutes[score]) route = checkoutRoutes[score];
    else if (score <= 40 && score % 2 === 0) route = ["D" + (score/2)];
    
    if (route) {
        let text = currentLanguageCode.startsWith('en') ? `Target ${score}. Try ` : `${score} Rest. Versuche `;
        let elements = route.map(r => r.replace('T', 'Triple ').replace('D', 'Doppel ').replace('S', 'Single '));
        text += elements.join(', ');
        let utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = currentLanguageCode;
        if(selectedVoice) utterance.voice = selectedVoice;
        setTimeout(() => {
            if (typeof speechSynthesis !== 'undefined') window.speechSynthesis.speak(utterance);
        }, 1200);
    }
}

function calculateLiveTurnCheckout() {
    if (!isCheckoutHelperActive || !isSpeechOutputActive) return;

    let currentScore = scores[activePlayer];
    let d1 = virtualDartData[1].val || 0;
    let d2 = virtualDartData[2].val || 0;
    let d3 = virtualDartData[3].val || 0;

    let dartsThrownInTurn = 0;
    if (virtualDartData[1].label !== "-") dartsThrownInTurn++;
    if (virtualDartData[2].label !== "-") dartsThrownInTurn++;
    if (virtualDartData[3].label !== "-") dartsThrownInTurn++;

    let dartsRemaining = 3 - dartsThrownInTurn;
    let currentRemainingScore = currentScore - (d1 + d2 + d3);

    let isEn = currentLanguageCode.startsWith('en');
    if (currentRemainingScore === 0) return;

    // Wenn die Gesamtpunktzahl vor Beginn ODER die Restpunktzahl JETZT über 170 liegt, schweigen.
    if (currentScore > 170 && currentRemainingScore > 170) {
        return; 
    }

    let maxPossibleScoreWithRemainingDarts = dartsRemaining * 60;
    if (dartsRemaining === 2 && outMode === 'double') maxPossibleScoreWithRemainingDarts = 110; 
    if (dartsRemaining === 1 && outMode === 'double') maxPossibleScoreWithRemainingDarts = 50;  

    let isImpossible = false;

    if (currentRemainingScore < 0) {
        isImpossible = true;
    } else if (outMode === 'double') {
        if (currentRemainingScore === 1) isImpossible = true;
        else if (currentRemainingScore > maxPossibleScoreWithRemainingDarts) isImpossible = true;
        else if (invalidFinishes.includes(currentRemainingScore)) isImpossible = true;
        else if (dartsRemaining === 1 && (currentRemainingScore > 50 || currentRemainingScore % 2 !== 0)) isImpossible = true;
        else if (dartsRemaining === 2 && currentRemainingScore > 110) isImpossible = true;
    } else {
        if (currentRemainingScore > maxPossibleScoreWithRemainingDarts) isImpossible = true;
    }

    if (isImpossible) {
        speak(isEn ? "No checkout possible" : "Kein Checkout mehr möglich");
        return;
    }

    if (dartsRemaining > 0 && currentRemainingScore <= 170 && !invalidFinishes.includes(currentRemainingScore)) {
        let route = null;
        if (checkoutRoutes[currentRemainingScore]) {
            route = checkoutRoutes[currentRemainingScore];
        } else if (currentRemainingScore <= 40 && currentRemainingScore % 2 === 0 && outMode === 'double') {
            route = ["D" + (currentRemainingScore / 2)];
        } else if (outMode === 'single' && currentRemainingScore <= 20) {
            route = ["S" + currentRemainingScore];
        }

        if (route && route.length <= dartsRemaining) {
            let text = isEn ? `Remaining ${currentRemainingScore}. Try ` : `${currentRemainingScore} Rest. Versuche `;
            let elements = route.map(r => r.replace('T', 'Triple ').replace('D', 'Doppel ').replace('S', 'Single '));
            text += elements.join(', ');
            speak(text);
        }
    }
}

// ==========================================
// Game-Flow Steuerung (Start, Reset, Abort)
// ==========================================
function generateRandomFinish() {
    if (finTypeSetting === 'strict') {
        let validTargets = [];
        for (let i = 2; i <= 40; i += 2) validTargets.push(i);
        validTargets.push(50);
        return validTargets[Math.floor(Math.random() * validTargets.length)];
    }
    let range = getSelectedValue('group-fin-range');
    let min = 2, max = 40;
    if (range === 'mid') { min = 2; max = 80; }
    else if (range === 'high') { min = 2; max = 170; }

    let target;
    do {
        target = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (invalidFinishes.includes(target));
    return target;
}

function startGame() {
    let opponentType = getSelectedValue('group-players');
    isTwoPlayers = opponentType === "2";
    isBotMatch = opponentType === "bot";
    botLevel = getSelectedValue('group-bot-level');
    inputMode = (activeGlobalMode === 'x01') ? getSelectedValue('group-input-mode') : 'segment';

    const setInputContainer = document.getElementById('set-input-container');
    const segmentInputContainer = document.getElementById('segment-input-container');
    const p1Sub = document.getElementById('p1-sub');
    const p1Title = document.getElementById('p1-title');
    const p2Title = document.getElementById('p2-title');
    const h1Header = document.getElementById('h1-header');
    const h2Header = document.getElementById('h2-header');
    const submitBtn = document.getElementById('submit-btn');

    if (setInputContainer) setInputContainer.classList.add('hidden');
    if (segmentInputContainer) segmentInputContainer.classList.add('hidden');
    if (p1Sub) p1Sub.classList.add('hidden');
    if (p1Title) p1Title.innerText = "Spieler 1";
    if (p2Title) p2Title.innerText = isBotMatch ? `Computer (${botLevel.toUpperCase()})` : "Spieler 2";
    if (h1Header) h1Header.innerText = "Verlauf S1";
    if (h2Header) h2Header.innerText = isBotMatch ? "Verlauf Bot" : "Verlauf S2";
    if (submitBtn) submitBtn.classList.remove('hidden');

    matchStats = {
        1: { totalPoints: 0, totalDarts: 0, first9Points: 0, first9Darts: 0, turns: 0, c100: 0, c140: 0, c180: 0, highestTurn: 0, highestFinish: 0, shortestLeg: 999 },
        2: { totalPoints: 0, totalDarts: 0, first9Points: 0, first9Darts: 0, turns: 0, c100: 0, c140: 0, c180: 0, highestTurn: 0, highestFinish: 0, shortestLeg: 999 }
    };
    legs = { 1: 0, 2: 0 }; sets = { 1: 0, 2: 0 };
    legDartsCount = { 1: 0, 2: 0 };

    if (activeGlobalMode === 'x01') {
        const pSlider = document.getElementById('input-points-slider');
        initialPoints = pSlider ? parseInt(pSlider.value) : 501;
        scores[1] = initialPoints; scores[2] = initialPoints;

        const lSlider = document.getElementById('input-legs-slider');
        const sSlider = document.getElementById('input-sets-slider');
        let legsValue = lSlider ? parseInt(lSlider.value) : 5;
        let setsValue = sSlider ? parseInt(sSlider.value) : 3;
        
        window.legsRequiredForSet = Math.ceil(legsValue / 2);
        window.setsRequiredForMatch = Math.ceil(setsValue / 2);

        const gTitle = document.getElementById('game-title');
        if (gTitle) gTitle.innerText = `${initialPoints}er Match (Best of ${setsValue} Sets, Legs pro Set: Best of ${legsValue})`;

        if (inputMode === 'set') {
            if (setInputContainer) setInputContainer.classList.remove('hidden');
            if (submitBtn) submitBtn.classList.add('hidden');
        } else {
            if (segmentInputContainer) segmentInputContainer.classList.remove('hidden');
        }
        
        const p1LS = document.getElementById('p1-legs-sets'); if (p1LS) p1LS.classList.remove('hidden');
        const p2LS = document.getElementById('p2-legs-sets'); if (p2LS) p2LS.classList.remove('hidden');
        const p1LA = document.getElementById('p1-live-avg'); if (p1LA) p1LA.classList.remove('hidden');
        const p2LA = document.getElementById('p2-live-avg'); if (p2LA) p2LA.classList.remove('hidden');
    } else {
        const p1LS = document.getElementById('p1-legs-sets'); if (p1LS) p1LS.classList.add('hidden');
        const p2LS = document.getElementById('p2-legs-sets'); if (p2LS) p2LS.classList.add('hidden');
        const p1LA = document.getElementById('p1-live-avg'); if (p1LA) p1LA.classList.add('hidden');
        const p2LA = document.getElementById('p2-live-avg'); if (p2LA) p2LA.classList.add('hidden');
        
        if (activeGlobalMode === 'fin') {
            finAttempts = 0;
            finTypeSetting = getSelectedValue('group-fin-type');
            finTargetScore = generateRandomFinish();
            scores[1] = finTargetScore;
            let typeLabel = finTypeSetting === 'strict' ? 'Exakt' : 'Realistisch';
            const gTitle = document.getElementById('game-title');
            if (gTitle) gTitle.innerText = `Finishing (${typeLabel})`;
            if (p1Title) p1Title.innerText = "Target Finish";
            if (h1Header) h1Header.innerText = "Würfe-Log";
            if (p1Sub) {
                p1Sub.classList.remove('hidden');
                p1Sub.innerText = `Versuch: 1`;
            }
            if (segmentInputContainer) segmentInputContainer.classList.remove('hidden');
        } else if (activeGlobalMode === 'atc') {
            scores[1] = 1; scores[2] = 1;
            const gTitle = document.getElementById('game-title');
            if (gTitle) gTitle.innerText = `Around the Clock (ATC)`;
            if (segmentInputContainer) segmentInputContainer.classList.remove('hidden');
        } else if (activeGlobalMode === 'sod') {
            scores[1] = parseInt(getSelectedValue('group-sod-darts')) || 30;
            let targetSegment = document.getElementById('sod-target-select').value;
            let targetRing = getSelectedValue('group-sod-ring').toUpperCase();
            const gTitle = document.getElementById('game-title');
            if (gTitle) gTitle.innerText = `Set of Darts (${targetRing} ${targetSegment.toUpperCase()})`;
            if (segmentInputContainer) segmentInputContainer.classList.remove('hidden');
        }
    }

    histories[1] = []; histories[2] = []; activePlayer = 1; isLockingInput = false;
    updateScoreboardDisplays();

    const p1Hist = document.getElementById('p1-history-list'); if (p1Hist) p1Hist.innerHTML = "";
    const p2Hist = document.getElementById('p2-history-list'); if (p2Hist) p2Hist.innerHTML = "";
    
    const p1Card = document.getElementById('p1-card'); if (p1Card) p1Card.classList.add('active');
    const p2Card = document.getElementById('p2-card'); if (p2Card) p2Card.classList.remove('active');

    const p2CardBox = document.getElementById('p2-card');
    const p2HistBox = document.getElementById('p2-history-box');
    if (p2CardBox && p2HistBox) {
        if (isTwoPlayers || isBotMatch) {
            p2CardBox.classList.remove('hidden');
            p2HistBox.classList.remove('hidden');
        } else {
            p2CardBox.classList.add('hidden');
            p2HistBox.classList.add('hidden');
        }
    }

    resetVirtualState();
    const startseite = document.getElementById('startseite'); if (startseite) startseite.classList.add('hidden');
    const spielseite = document.getElementById('spielseite'); if (spielseite) spielseite.classList.remove('hidden');
    
    if(activeGlobalMode === 'fin') {
        let isEn = currentLanguageCode.startsWith('en');
        speak(isEn ? "Your target is " + finTargetScore : "Dein Ziel ist " + finTargetScore);
    } else if (activeGlobalMode === 'x01') {
        triggerCheckoutHelperVoice(scores[1]);
    }
}

function updateScoreboardDisplays() {
    const p1ScoreEl = document.getElementById('p1-score'); if (p1ScoreEl) p1ScoreEl.innerText = (activeGlobalMode === 'atc' && scores[1] === 21) ? "BULL" : scores[1];
    const p2ScoreEl = document.getElementById('p2-score'); if (p2ScoreEl) p2ScoreEl.innerText = (activeGlobalMode === 'atc' && scores[2] === 21) ? "BULL" : scores[2];
    
    const p1LS = document.getElementById('p1-legs-sets'); if (p1LS) p1LS.innerText = `Legs: ${legs[1]} | Sets: ${sets[1]}`;
    const p2LS = document.getElementById('p2-legs-sets'); if (p2LS) p2LS.innerText = `Legs: ${legs[2]} | Sets: ${sets[2]}`;

    // Live-Anzeige berechnet den echten 3-Dart-Average
    let p1TripleAvg = matchStats[1].totalDarts > 0 ? ((matchStats[1].totalPoints / matchStats[1].totalDarts) * 3).toFixed(1) : "0.0";
    let p2TripleAvg = matchStats[2].totalDarts > 0 ? ((matchStats[2].totalPoints / matchStats[2].totalDarts) * 3).toFixed(1) : "0.0";
    
    const p1LiveAvgEl = document.getElementById('p1-live-avg'); if (p1LiveAvgEl) p1LiveAvgEl.innerText = `Ø ${p1TripleAvg} (${matchStats[1].totalDarts} Darts)`;
    const p2LiveAvgEl = document.getElementById('p2-live-avg'); if (p2LiveAvgEl) p2LiveAvgEl.innerText = `Ø ${p2TripleAvg} (${matchStats[2].totalDarts} Darts)`;
}

function abortGame() {
    if (confirm("Spiel wirklich abbrechen?")) {
        const spielseite = document.getElementById('spielseite'); if (spielseite) spielseite.classList.add('hidden');
        const startseite = document.getElementById('startseite'); if (startseite) startseite.classList.remove('hidden');
    }
}

function resetVirtualState() {
    virtualDartData = {
        1: { val: 0, label: "-", rawField: "", m: 1, key: "" },
        2: { val: 0, label: "-", rawField: "", m: 1, key: "" },
        3: { val: 0, label: "-", rawField: "", m: 1, key: "" }
    };
    updateDartPreviewDOM();
    setActiveDartSlot(1);
    setVirtualMultiplier(1);
    setVirtualSum(0);
}

function parseSegmentData(fieldRaw, mult) {
    if (!fieldRaw || fieldRaw === "") return { val: 0, label: "0", key: "" };
    let clean = fieldRaw.trim().toLowerCase();
    if (clean === "0") return { val: 0, label: "0", key: "0" };
    if (clean === "bull") {
        if (mult === 2) return { val: 50, label: "D-Bull", key: "d-bull" };
        return { val: 25, label: "Bull", key: "bull" };
    }
    let num = parseInt(clean);
    if (isNaN(num) || num < 1 || num > 20) return null;
    if (mult === 3) return { val: num * 3, label: `T${num}`, key: `T${num}` };
    if (mult === 2) return { val: num * 2, label: `D${num}`, key: `D${num}` };
    return { val: num, label: `S${num}`, key: `S${num}` };
}

// ==========================================
// Turn Execution & Scoring Logic
// ==========================================
function handleBustProcess(currentScore, scoredPoints, originalDetails) {
    let isEn = currentLanguageCode.startsWith('en');
    let text = isEn ? "Bust!" : "Überworfen!";
    const errMsg = document.getElementById('error-message');
    if (errMsg) errMsg.innerText = text;
    speak(text);
    
    if (activeGlobalMode === 'x01') {
        matchStats[activePlayer].totalDarts += 3;
        legDartsCount[activePlayer] += 3;
        matchStats[activePlayer].turns += 1;
        if (legDartsCount[activePlayer] <= 9) matchStats[activePlayer].first9Darts += 3;
    }

    if (activeGlobalMode === 'fin') {
        finAttempts++;
        addHistoryEntry(1, scoredPoints, finTargetScore, originalDetails, true);
        scores[1] = finTargetScore;
        updateScoreboardDisplays();
        const p1Sub = document.getElementById('p1-sub');
        if (p1Sub) p1Sub.innerText = `Versuch: ${finAttempts + 1}`;
    } else {
        addHistoryEntry(activePlayer, scoredPoints, currentScore, originalDetails, true);
    }

    isLockingInput = true;
    setTimeout(() => {
        const errClean = document.getElementById('error-message');
        if (errClean) errClean.innerText = "";
        isLockingInput = false;
        if (activeGlobalMode !== 'fin') nextPlayer();
        resetVirtualState();
    }, 3000);
}

function checkLiveBustSegment(currentDartIndex) {
    if (activeGlobalMode !== 'x01' && activeGlobalMode !== 'fin') return false;

    let d1 = virtualDartData[1].val || 0;
    let d2 = virtualDartData[2].val || 0;
    let d3 = virtualDartData[3].val || 0;

    let runningSum = d1 + d2 + d3;
    let currentScore = (activeGlobalMode === 'fin') ? finTargetScore : scores[activePlayer];
    let runningRemaining = currentScore - runningSum;
    let modeOut = (activeGlobalMode === 'fin') ? 'double' : outMode;

    if (runningRemaining < 0 || (runningRemaining === 1 && modeOut === 'double')) {
        handleBustProcess(currentScore, runningSum, `${virtualDartData[1].label}/${virtualDartData[2].label}/${virtualDartData[3].label}`);
        return true;
    }

    if (runningRemaining === 0 && modeOut === 'double') {
        let activeData = virtualDartData[currentDartIndex];
        if (!activeData.key || (!activeData.key.startsWith('D') && activeData.key !== 'd-bull')) {
            handleBustProcess(currentScore, runningSum, `${virtualDartData[1].label}/${virtualDartData[2].label}/${virtualDartData[3].label}`);
            return true;
        }
    }
    return false;
}

function submitScore() {
    if (isLockingInput) return;
    const errMsg = document.getElementById('error-message');
    if (errMsg) errMsg.innerText = "";

    if (activeGlobalMode === 'x01') executeX01Turn();
    else if (activeGlobalMode === 'fin') executeFinishingTurn();
    else if (activeGlobalMode === 'atc') executeATCTurn();
    else if (activeGlobalMode === 'sod') executeSODTurn();
}

function executeX01Turn() {
    let totalScore = 0; let scoreDetails = "";
    let currentScore = scores[activePlayer];
    let dartsCountThisTurn = 3;

    if (inputMode === 'set') {
        totalScore = virtualSumValue;
        if (impossibleScores.includes(totalScore)) {
            const errMsg = document.getElementById('error-message');
            if (errMsg) errMsg.innerText = "Ungültige Score-Kombination!";
            return;
        }
        let remaining = currentScore - totalScore;
        if (remaining < 0 || (remaining === 1 && outMode === 'double') || (remaining === 0 && outMode === 'double' && totalScore < 2)) {
            handleBustProcess(currentScore, totalScore, "Summe"); return;
        }
        scores[activePlayer] = remaining; scoreDetails = "Aufnahme";
    } else {
        let d1 = virtualDartData[1].val || 0;
        let d2 = virtualDartData[2].val || 0;
        let d3 = virtualDartData[3].val || 0;
        totalScore = d1 + d2 + d3;
        scoreDetails = `${virtualDartData[1].label}/${virtualDartData[2].label}/${virtualDartData[3].label}`;
        
        if (virtualDartData[1].label !== "-") dartsCountThisTurn = 1;
        if (virtualDartData[2].label !== "-") dartsCountThisTurn = 2;
        if (virtualDartData[3].label !== "-") dartsCountThisTurn = 3;

        let remaining = currentScore - totalScore;
        let isBust = remaining < 0 || (remaining === 1 && outMode === 'double');
        
        if (remaining === 0 && outMode === 'double') {
            let last = (virtualDartData[3].label !== "-") ? virtualDartData[3] : 
                       ((virtualDartData[2].label !== "-") ? virtualDartData[2] : virtualDartData[1]);
            if (!last.key || (!last.key.startsWith('D') && last.key !== 'd-bull')) isBust = true;
        }
        
        if (isBust) { handleBustProcess(currentScore, totalScore, scoreDetails); return; }
        scores[activePlayer] = remaining;
    }

    matchStats[activePlayer].totalPoints += totalScore;
    matchStats[activePlayer].totalDarts += dartsCountThisTurn;
    legDartsCount[activePlayer] += dartsCountThisTurn;
    matchStats[activePlayer].turns += 1;

    if(legDartsCount[activePlayer] <= 9) {
        matchStats[activePlayer].first9Points += totalScore;
        matchStats[activePlayer].first9Darts += dartsCountThisTurn;
    }
    if(totalScore >= 100 && totalScore < 140) matchStats[activePlayer].c100++;
    if(totalScore >= 140 && totalScore < 180) matchStats[activePlayer].c140++;
    if(totalScore === 180) matchStats[activePlayer].c180++;
    if(totalScore > matchStats[activePlayer].highestTurn) matchStats[activePlayer].highestTurn = totalScore;

    updateScoreboardDisplays();
    addHistoryEntry(activePlayer, totalScore, scores[activePlayer], scoreDetails, false);
    speakTurnResult(totalScore, scores[activePlayer]);

    if (scores[activePlayer] === 0) {
        if(totalScore > matchStats[activePlayer].highestFinish) matchStats[activePlayer].highestFinish = totalScore;
        if(legDartsCount[activePlayer] < matchStats[activePlayer].shortestLeg) matchStats[activePlayer].shortestLeg = legDartsCount[activePlayer];
        handleLegOrSetWin();
        return;
    }
    
    // Verzögerung für die vollständige TTS-Sprachausgabe vor dem Spielerwechsel
    isLockingInput = true; 
    setTimeout(() => {
        isLockingInput = false;
        nextPlayer(); 
        resetVirtualState();
    }, 3000); 
}

function handleLegOrSetWin() {
    let winner = activePlayer;
    let isEn = currentLanguageCode.startsWith('en');
    
    legs[winner]++;
    let requiredLegsToWinSet = window.legsRequiredForSet || 3;
    
    if (legs[winner] >= requiredLegsToWinSet) {
        legs[1] = 0; legs[2] = 0; 
        sets[winner]++;
        
        let requiredSetsToWinMatch = window.setsRequiredForMatch || 1;
        if (sets[winner] >= requiredSetsToWinMatch) {
            showVictory(winner); return;
        } else {
            speak(isEn ? "Set won!" : "Set gewonnen!");
            alert(isEn ? `Player ${winner} won the set!` : `Spieler ${winner} gewinnt den Satz!`);
        }
    } else {
        speak(isEn ? "Leg finished!" : "Leg beendet!");
    }
    
    // Korrektes, vollständiges Zurücksetzen für das nächste Leg
    scores[1] = initialPoints; 
    scores[2] = initialPoints;
    legDartsCount[1] = 0; 
    legDartsCount[2] = 0;
    histories[1] = []; 
    histories[2] = [];
    
    const p1Hist = document.getElementById('p1-history-list'); if (p1Hist) p1Hist.innerHTML = "";
    const p2Hist = document.getElementById('p2-history-list'); if (p2Hist) p2Hist.innerHTML = "";
    updateScoreboardDisplays();
    
    activePlayer = (winner === 1) ? 2 : 1; 
    resetVirtualState();
    triggerCheckoutHelperVoice(scores[activePlayer]);

    if(isBotMatch && activePlayer === 2) {
        setTimeout(executeBotTurn, 1000);
    }
}

// ==========================================
// Bot Engine & Match Modus KI
// ==========================================
function executeBotTurn() {
    if(!isBotMatch || activePlayer !== 2 || isLockingInput) return;
    
    let tripleChance = 0.02; let doubleChance = 0.05;
    if (botLevel === 'medium') { tripleChance = 0.08; doubleChance = 0.12; }
    else if (botLevel === 'strong') { tripleChance = 0.22; doubleChance = 0.30; }
    else if (botLevel === 'insane') { tripleChance = 0.45; doubleChance = 0.60; }

    let botRest = scores[2];
    let darts = [];
    let currentBotScore = 0;

    for (let slot = 1; slot <= 3; slot++) {
        let remainingNow = botRest - currentBotScore;
        if (remainingNow <= 1) break; 
        
        let dartVal = 0; let label = "0"; let key = "0"; let m = 1;

        if (remainingNow <= 40 && remainingNow % 2 === 0 && outMode === 'double') {
            let targetDouble = remainingNow / 2;
            if (Math.random() < doubleChance) {
                dartVal = remainingNow; m = 2; label = `D${targetDouble}`; key = `D${targetDouble}`;
            } else if (Math.random() < 0.4) {
                dartVal = targetDouble; m = 1; label = `S${targetDouble}`; key = `S${targetDouble}`;
            } else { dartVal = 0; label = "Miss"; }
        } else if (remainingNow === 50 && outMode === 'double') {
            if (Math.random() < doubleChance) {
                dartVal = 50; m = 2; label = "D-Bull"; key = "d-bull";
            } else { dartVal = 25; label = "Bull"; }
        } else {
            let rand = Math.random();
            if (rand < tripleChance) {
                dartVal = 60; m = 3; label = "T20"; key = "T20";
            } else if (rand < tripleChance + 0.15) {
                dartVal = 20; m = 1; label = "S20"; key = "S20";
            } else if (rand < 0.75) {
                let options = [1, 5, 20, 9, 11, 19];
                let chosen = options[Math.floor(Math.random() * options.length)];
                dartVal = chosen; m = 1; label = `S${chosen}`; key = `S${chosen}`;
            } else { dartVal = 0; label = "0"; }
        }

        currentBotScore += dartVal;
        darts.push({val: dartVal, label: label, key: key, m: m});
        if (botRest - currentBotScore === 0 && (outMode === 'single' || (outMode === 'double' && m === 2))) break;
    }

    while(darts.length < 3) darts.push({val: 0, label: "-", key: "", m: 1});

    virtualDartData[1] = darts[0]; virtualDartData[2] = darts[1]; virtualDartData[3] = darts[2];
    executeX01Turn();
}

function nextPlayer() {
    if (!isTwoPlayers && !isBotMatch) return;
    
    const currCard = document.getElementById(`p${activePlayer}-card`);
    if (currCard) currCard.classList.remove('active');
    
    activePlayer = activePlayer === 1 ? 2 : 1;
    
    const nextCard = document.getElementById(`p${activePlayer}-card`);
    if (nextCard) nextCard.classList.add('active');

    if (activeGlobalMode === 'x01') triggerCheckoutHelperVoice(scores[activePlayer]);

    if (isBotMatch && activePlayer === 2) {
        isLockingInput = true;
        setTimeout(() => {
            isLockingInput = false;
            executeBotTurn();
        }, 3000);
    }
}

// ==========================================
// Zusätzliche Trainingsmodi (Finishing, ATC, SOD)
// ==========================================
function executeFinishingTurn() {
    let d1 = virtualDartData[1]; let d2 = virtualDartData[2]; let d3 = virtualDartData[3];
    let darts = [d1, d2, d3];
    let originalTarget = finTargetScore;
    let isEn = currentLanguageCode.startsWith('en');

    if (finTypeSetting === 'strict') {
        let isCheckout = false;
        for (let i = 0; i < darts.length; i++) {
            if (darts[i].val === originalTarget && darts[i].key && (darts[i].key.startsWith('D') || darts[i].key === 'd-bull')) {
                isCheckout = true; break;
            }
        }
        let scoreDetails = `${d1.label}/${d2.label}/${d3.label}`;
        if (isCheckout) {
            finAttempts++; histories[1] = [];
            if (typeof speechSynthesis !== 'undefined') window.speechSynthesis.cancel();
            speak(isEn ? `Leg finished!` : `Leg beendet!`);
            alert(isEn ? `Checked ${originalTarget} in ${finAttempts} throws.` : `Sauber! Du hast das Finish ${originalTarget} in ${finAttempts} Aufnahmen gecheckt.`);
            finAttempts = 0; finTargetScore = generateRandomFinish(); scores[1] = finTargetScore;
            updateScoreboardDisplays();
            const p1Sub = document.getElementById('p1-sub'); if (p1Sub) p1Sub.innerText = `Versuch: 1`;
            const p1Hist = document.getElementById('p1-history-list'); if (p1Hist) p1Hist.innerHTML = "";
            speak(isEn ? "Next target is " + finTargetScore : "Nächstes Ziel ist " + finTargetScore);
        } else {
            finAttempts++;
            addHistoryEntry(1, isEn ? "No Check" : "Kein Check", finTargetScore, scoreDetails, false);
            const p1Sub = document.getElementById('p1-sub'); if (p1Sub) p1Sub.innerText = `Versuch: ${finAttempts + 1}`;
            speak(isEn ? "No checkout" : "Kein Checkout");
        }
        resetVirtualState(); return;
    }

    let runningScore = finTargetScore;
    let isCheckout = false; let totalScoredThisTurn = 0; let displayLabels = [];

    for (let i = 0; i < darts.length; i++) {
        let d = darts[i];
        displayLabels.push(d.label);
        runningScore -= d.val;
        totalScoredThisTurn += d.val;

        if (runningScore === 0) {
            if (d.key && (d.key.startsWith('D') || d.key === 'd-bull')) {
                isCheckout = true; break;
            }
        }
        if (runningScore < 0 || runningScore === 1 || (runningScore === 0 && !isCheckout)) {
            handleBustProcess(originalTarget, totalScoredThisTurn, displayLabels.join('/')); return;
        }
    }

    let scoreDetails = displayLabels.join('/');
    if (isCheckout) {
        finAttempts++; histories[1] = [];
        if (typeof speechSynthesis !== 'undefined') window.speechSynthesis.cancel();
        speak(isEn ? `Leg finished!` : `Leg beendet!`);
        alert(isEn ? `Nice! Checked ${originalTarget} in ${finAttempts} throws.` : `Sauber! Du hast das Finish ${originalTarget} in ${finAttempts} Aufnahmen gecheckt.`);
        finAttempts = 0; finTargetScore = generateRandomFinish(); scores[1] = finTargetScore;
        updateScoreboardDisplays();
        const p1Sub = document.getElementById('p1-sub'); if (p1Sub) p1Sub.innerText = `Versuch: 1`;
        const p1Hist = document.getElementById('p1-history-list'); if (p1Hist) p1Hist.innerHTML = "";
        speak(isEn ? "Next target is " + finTargetScore : "Nächstes Ziel ist " + finTargetScore);
    } else {
        finAttempts++; scores[1] = runningScore;
        updateScoreboardDisplays();
        const p1Sub = document.getElementById('p1-sub'); if (p1Sub) p1Sub.innerText = `Versuch: ${finAttempts + 1}`;
        addHistoryEntry(1, totalScoredThisTurn, scores[1], scoreDetails, false);
        speakTurnResult(totalScoredThisTurn, scores[1]);
    }
    resetVirtualState();
}

function executeATCTurn() {
    let bonusMode = getSelectedValue('group-atc-bonus') === 'bonus';
    let darts = [virtualDartData[1], virtualDartData[2], virtualDartData[3]];
    let hits = 0;

    darts.forEach(d => {
        let targetString = scores[activePlayer] === 21 ? "bull" : scores[activePlayer].toString();
        let currentDartBase = d.rawField === "bull" ? "bull" : d.rawField;
        if (currentDartBase === targetString && d.val > 0) {
            let steps = bonusMode ? d.m : 1;
            scores[activePlayer] += steps; hits += steps;
            if (scores[activePlayer] > 21) scores[activePlayer] = 21;
        }
    });

    updateScoreboardDisplays();
    let isEn = currentLanguageCode.startsWith('en');
    let hitLabel = isEn ? `${hits} Hits` : `${hits} Treffer`;
    addHistoryEntry(activePlayer, hitLabel, scores[activePlayer], `${virtualDartData[1].label}/${virtualDartData[2].label}/${virtualDartData[3].label}`, false);
    
    let targetText = scores[activePlayer] === 21 ? "Bullseye" : scores[activePlayer].toString();
    speakTurnResult(hitLabel, isEn ? "Target is now " + targetText : "Ziel ist jetzt " + targetText);

    if (scores[activePlayer] === 21) { showVictory(activePlayer); return; }
    nextPlayer(); resetVirtualState();
}

function executeSODTurn() {
    let targetField = document.getElementById('sod-target-select').value;
    let targetRing = getSelectedValue('group-sod-ring');
    let darts = [virtualDartData[1], virtualDartData[2], virtualDartData[3]];
    let hitCount = 0;

    darts.forEach(d => {
        let isField = d.rawField === targetField;
        let isRing = (targetRing === 'single' && d.m === 1) || (targetRing === 'double' && d.m === 2) || (targetRing === 'treble' && d.m === 3);
        if (isField && isRing) hitCount++;
    });

    scores[1] -= 3; if (scores[1] < 0) scores[1] = 0;
    updateScoreboardDisplays();
    
    let isEn = currentLanguageCode.startsWith('en');
    let hitLabel = isEn ? `${hitCount} Hits` : `${hitCount} Treffer`;
    addHistoryEntry(1, hitCount, scores[1], `${virtualDartData[1].label}/${virtualDartData[2].label}/${virtualDartData[3].label}`, false);
    speakTurnResult(hitLabel, isEn ? scores[1] + " darts remaining" : scores[1] + " Pfeile verbleibend");

    if (scores[1] <= 0) { showVictory(1); return; }
    resetVirtualState();
}

// ==========================================
// Verlauf-Log & All-Time Statistikverwaltung
// ==========================================
function addHistoryEntry(player, score, rest, details, isBust) {
    histories[player].unshift({ score, rest, details, isBust });
    const tbody = document.getElementById(`p${player}-history-list`);
    if(!tbody) return;
    tbody.innerHTML = "";

    histories[player].forEach((item, index) => {
        let dartsThrown = (histories[player].length - index) * 3;
        let displayScore = item.isBust ? `Bust` : item.score;
        tbody.innerHTML += `<tr><td>${dartsThrown}</td><td>${displayScore}</td><td>${item.rest}</td><td>${item.details}</td></tr>`;
    });
}

function showVictory(winnerId) {
    const spielseite = document.getElementById('spielseite'); if (spielseite) spielseite.classList.add('hidden');
    const abschlussseite = document.getElementById('abschlussseite'); if (abschlussseite) abschlussseite.classList.remove('hidden');
    
    let p1Name = "Spieler 1";
    let p2Name = isBotMatch ? `Computer (${botLevel.toUpperCase()})` : "Spieler 2";
    
    const winnerAnnounce = document.getElementById('winner-announcement'); if (winnerAnnounce) winnerAnnounce.innerText = winnerId === 1 ? `${p1Name} gewinnt das Match!` : `${p2Name} gewinnt das Match!`;
    const thP1 = document.getElementById('th-p1-name'); if (thP1) thP1.innerText = p1Name;
    const thP2 = document.getElementById('th-p2-name'); if (thP2) thP2.innerText = p2Name;

    // Umstellung auf echten 3-Dart-Average in der Spielzusammenfassung
    let p1Avg = matchStats[1].totalDarts > 0 ? ((matchStats[1].totalPoints / matchStats[1].totalDarts) * 3).toFixed(1) : "0.0";
    let p2Avg = matchStats[2].totalDarts > 0 ? ((matchStats[2].totalPoints / matchStats[2].totalDarts) * 3).toFixed(1) : "0.0";
    
    let p1F9 = matchStats[1].first9Darts > 0 ? ((matchStats[1].first9Points / matchStats[1].first9Darts) * 3).toFixed(1) : "0.0";
    let p2F9 = matchStats[2].first9Darts > 0 ? ((matchStats[2].first9Points / matchStats[2].first9Darts) * 3).toFixed(1) : "0.0";

    let p1Shortest = matchStats[1].shortestLeg === 999 ? "-" : `${matchStats[1].shortestLeg} Darts`;
    let p2Shortest = matchStats[2].shortestLeg === 999 ? "-" : `${matchStats[2].shortestLeg} Darts`;

    const summaryBody = document.getElementById('summary-stats-body');
    if (summaryBody) {
        summaryBody.innerHTML = `
            <tr><td>3-Dart-Average (Ø3)</td><td><b>${p1Avg}</b></td><td><b>${p2Avg}</b></td></tr>
            <tr><td>First 9 Average (Ø3)</td><td>${p1F9}</td><td>${p2F9}</td></tr>
            <tr><td>Höchste Aufnahme</td><td>${matchStats[1].highestTurn}</td><td>${matchStats[2].highestTurn}</td></tr>
            <tr><td>Höchstes Checkout</td><td>${matchStats[1].highestFinish}</td><td>${matchStats[2].highestFinish}</td></tr>
            <tr><td>Shortest Leg</td><td>${p1Shortest}</td><td>${p2Shortest}</td></tr>
            <tr><td>100+ / 140+ / 180er</td><td>${matchStats[1].c100} / ${matchStats[1].c140} / ${matchStats[1].c180}</td><td>${matchStats[2].c100} / ${matchStats[2].c140} / ${matchStats[2].c180}</td></tr>
        `;
    }

    if (activeGlobalMode === 'x01') {
        saveMatchToLocalStorage(parseFloat(p1Avg), matchStats[1].highestTurn, matchStats[1].highestFinish, matchStats[1].c180);
    }

    speak(currentLanguageCode.startsWith('en') ? "Game shot and match!" : "Spiel und Match!");
}

function saveMatchToLocalStorage(avg, highTurn, highFinish, count180s) {
    let raw = localStorage.getItem('docKinl_dart_stats');
    let stats = raw ? JSON.parse(raw) : { totalGames: 0, sumAvg: 0, highestTurn: 0, highestFinish: 0, total180s: 0 };
    
    stats.totalGames += 1;
    stats.sumAvg += avg;
    if(highTurn > stats.highestTurn) stats.highestTurn = highTurn;
    if(highFinish > stats.highestFinish) stats.highestFinish = highFinish;
    stats.total180s += count180s;

    localStorage.setItem('docKinl_dart_stats', JSON.stringify(stats));
}

function openStatsModal() {
    let raw = localStorage.getItem('docKinl_dart_stats');
    let stats = raw ? JSON.parse(raw) : { totalGames: 0, sumAvg: 0, highestTurn: 0, highestFinish: 0, total180s: 0 };
    
    const totalGamesEl = document.getElementById('stat-total-games'); if (totalGamesEl) totalGamesEl.innerText = stats.totalGames;
    const alltimeAvgEl = document.getElementById('stat-alltime-avg'); if (alltimeAvgEl) alltimeAvgEl.innerText = stats.totalGames > 0 ? (stats.sumAvg / stats.totalGames).toFixed(1) : "0.0";
    const highTurnEl = document.getElementById('stat-highest-turn'); if (highTurnEl) highTurnEl.innerText = stats.highestTurn;
    const highCoEl = document.getElementById('stat-highest-co'); if (highCoEl) highCoEl.innerText = stats.highestFinish;
    const total180sEl = document.getElementById('stat-total-180s'); if (total180sEl) total180sEl.innerText = stats.total180s;

    const statsModal = document.getElementById('stats-modal'); if (statsModal) statsModal.classList.remove('hidden');
}

function resetGame() {
    const abschlussseite = document.getElementById('abschlussseite'); if (abschlussseite) abschlussseite.classList.add('hidden');
    const startseite = document.getElementById('startseite'); if (startseite) startseite.classList.remove('hidden');
}
