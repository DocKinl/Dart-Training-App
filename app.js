// Globale State-Variablen
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

// Tracker für Statistiken (Echte Gesamtwerte)
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

// Training Variablen (Finishing, ATC, SoD)
let finAttempts = 0;
let finTargetScore = 0;
let finTypeSetting = 'realistic';
let atcCurrentTarget = 1;
let sodDartsLeft = 30;
let sodHits = 0;
let sodScore = 0;

// System-Optionen
let isSpeechOutputActive = true;
let currentTheme = 'dark';

const invalidFinishes = [169, 168, 166, 165, 163, 162, 159];
const impossibleScores = [179, 178, 176, 175, 173, 172, 169, 166, 163, 162, 159];

const checkoutRoutes = {
    170: ["T20", "T20", "D50"], 167: ["T20", "T19", "D50"], 164: ["T20", "T18", "D50"], 161: ["T20", "T17", "D50"],
    160: ["T20", "T20", "D20"], 158: ["T20", "T20", "D19"], 157: ["T20", "T19", "D20"], 156: ["T20", "T20", "D18"],
    155: ["T20", "T19", "D19"], 154: ["T20", "T18", "D20"], 153: ["T20", "T19", "D18"], 152: ["T20", "T17", "D20"],
    151: ["T20", "T17", "D19"], 150: ["T20", "T18", "D18"], 149: ["T20", "T19", "D16"], 148: ["T20", "T16", "D20"],
    147: ["T20", "T17", "D18"], 146: ["T20", "T18", "D16"], 145: ["T20", "T15", "D20"], 144: ["T20", "T20", "D12"],
    143: ["T20", "T17", "D16"], 142: ["T20", "T14", "D20"], 141: ["T20", "T15", "D18"], 140: ["T20", "T16", "D16"],
    139: ["T19", "T14", "D20"], 138: ["T20", "T14", "D18"], 137: ["T19", "T16", "D16"], 136: ["T20", "T20", "D8"],
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
    for(let i=20; i>=1; i--) {
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
        document.getElementById('points-slider-label').innerText = `Startpunkte: ${pSlider.value}`;
    }
    const lSlider = document.getElementById('input-legs-slider');
    if (lSlider) {
        let val = parseInt(lSlider.value);
        document.getElementById('legs-slider-label').innerText = `Legs pro Set: Best of ${val} (First to ${Math.ceil(val / 2)})`;
    }
    const sSlider = document.getElementById('input-sets-slider');
    if (sSlider) {
        let val = parseInt(sSlider.value);
        document.getElementById('sets-slider-label').innerText = `Sets zum Matchgewinn: Best of ${val} (First to ${Math.ceil(val / 2)})`;
    }
}

function initEventListeners() {
    document.querySelectorAll('.btn-settings-open').forEach(btn => {
        btn.onclick = () => { document.getElementById('settings-modal').classList.remove('hidden'); };
    });
    const settingsClose = document.getElementById('btn-settings-close');
    if (settingsClose) {
        settingsClose.onclick = () => { document.getElementById('settings-modal').classList.add('hidden'); };
    }

    document.getElementById('btn-open-stats').onclick = openStatsModal;
    document.getElementById('btn-stats-close').onclick = () => document.getElementById('stats-modal').classList.add('hidden');
    document.getElementById('btn-clear-stats').onclick = () => {
        if(confirm("Alle gespeicherten Daten unwiderruflich löschen?")) {
            localStorage.removeItem('docKinl_dart_stats');
            openStatsModal();
        }
    };

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
        if(val === 'bot') document.getElementById('options-bot').classList.remove('hidden');
        else document.getElementById('options-bot').classList.add('hidden');
    });

    const pointsSlider = document.getElementById('input-points-slider');
    if (pointsSlider) {
        pointsSlider.oninput = function() {
            document.getElementById('points-slider-label').innerText = `Startpunkte: ${this.value}`;
        };
    }

    const legsSlider = document.getElementById('input-legs-slider');
    if (legsSlider) {
        legsSlider.oninput = function() {
            let val = parseInt(this.value);
            let firstTo = Math.ceil(val / 2);
            document.getElementById('legs-slider-label').innerText = `Legs pro Set: Best of ${val} (First to ${firstTo})`;
        };
    }

    const setsSlider = document.getElementById('input-sets-slider');
    if (setsSlider) {
        setsSlider.oninput = function() {
            let val = parseInt(this.value);
            let firstTo = Math.ceil(val / 2);
            document.getElementById('sets-slider-label').innerText = `Sets zum Matchgewinn: Best of ${val} (First to ${firstTo})`;
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

    document.getElementById('vmult-1').onclick = () => setVirtualMultiplier(1);
    document.getElementById('vmult-2').onclick = () => setVirtualMultiplier(2);
    document.getElementById('vmult-3').onclick = () => setVirtualMultiplier(3);

    document.querySelectorAll('.keyboard-grid .numkey, [data-val="bull"], [data-val="0"]').forEach(btn => {
        btn.onclick = function() {
            let value = this.getAttribute('data-val');
            inputVirtualDart(value);
        };
    });

    document.getElementById('vkey-clear-segments').onclick = clearLastVirtualDart;

    document.getElementById('box-d1').onclick = () => setActiveDartSlot(1);
    document.getElementById('box-d2').onclick = () => setActiveDartSlot(2);
    document.getElementById('box-d3').onclick = () => setActiveDartSlot(3);

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

    document.getElementById('vkey-clear-sum').onclick = () => { setVirtualSum(0); };
    document.getElementById('vkey-submit-sum').onclick = submitScore;

    document.getElementById('btn-start-game').onclick = startGame;
    document.getElementById('btn-abort-game').onclick = abortGame;
    document.getElementById('submit-btn').onclick = submitScore;
    document.getElementById('btn-reset-game').onclick = resetGame;
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
    document.getElementById('options-x01').classList.add('hidden');
    document.getElementById('options-fin').classList.add('hidden');
    document.getElementById('options-atc').classList.add('hidden');
    document.getElementById('options-sod').classList.add('hidden');
    document.getElementById('wrapper-players').classList.remove('hidden');
    document.getElementById('options-bot').classList.add('hidden');

    if (mode === 'x01') {
        document.getElementById('options-x01').classList.remove('hidden');
        if(getSelectedValue('group-players') === 'bot') document.getElementById('options-bot').classList.remove('hidden');
    }
    else if (mode === 'fin') {
        document.getElementById('options-fin').classList.remove('hidden');
        document.getElementById('wrapper-players').classList.add('hidden');
    }
    else if (mode === 'atc') document.getElementById('options-atc').classList.remove('hidden');
    else if (mode === 'sod') {
        document.getElementById('options-sod').classList.remove('hidden');
        document.getElementById('wrapper-players').classList.add('hidden');
    }
}

function setVirtualMultiplier(mValue) {
    currentVirtualSelectedMultiplier = mValue;
    document.querySelectorAll('[id^="vmult-"]').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`vmult-${mValue}`).classList.add('active');
}

function setActiveDartSlot(slotNum) {
    currentActiveDartSlot = slotNum;
    document.querySelectorAll('.preview-box').forEach(box => box.classList.remove('active-slot'));
    const activeBox = document.getElementById(`box-d${slotNum}`);
    if (activeBox) activeBox.classList.add('active-slot');
}

function parseSegmentData(field, m) {
    if (field === "0") return { val: 0, label: "Miss", key: "S0" };
    if (field === "bull") {
        if (m === 2) return { val: 50, label: "Bullseye", key: "D25" };
        return { val: 25, label: "Single Bull", key: "S25" };
    }
    let val = parseInt(field);
    let label = (m === 3 ? "T" : m === 2 ? "D" : "S") + val;
    return { val: val * m, label: label, key: label };
}

function inputVirtualDart(field) {
    if (isLockingInput) return;
    document.getElementById('error-message').innerText = "";

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
    document.getElementById('error-message').innerText = "";
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

function speak(text) {
    if (!isSpeechOutputActive) return;
    let utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentLanguageCode;
    if (selectedVoice) utterance.voice = selectedVoice;
    window.speechSynthesis.speak(utterance);
}

function speakTurnResult(score, rest) {
    if (!isSpeechOutputActive) return;
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
    if(!isSpeechOutputActive || !isCheckoutHelperActive || score > 170 || invalidFinishes.includes(score)) return;
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
        setTimeout(() => window.speechSynthesis.speak(utterance), 1200);
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

function generateRandomFinish() {
    if
