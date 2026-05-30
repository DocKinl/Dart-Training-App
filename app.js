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
let matchType = 'legs'; // 'legs' oder 'sets'
let matchTarget = 1; // Best of target
let scores = { 1: 501, 2: 501 };
let legs = { 1: 0, 2: 0 };
let sets = { 1: 0, 2: 0 };

let histories = { 1: [], 2: [] };
let activePlayer = 1;
let isLockingInput = false;

// Tracker für erweiterte Spielzusammenfassungen (Laufendes Leg & Match-Akkumulatoren)
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

// System-Optionen (Standardwerte)
let isSpeechOutputActive = true;
let currentTheme = 'dark';

const invalidFinishes = [169, 168, 166, 165, 163, 162, 159];
const impossibleScores = [179, 178, 176, 175, 173, 172, 169, 166, 163, 162, 159];

// Checkout-Wege Wörterbuch für den Sprach-Helper
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

function initEventListeners() {
    document.querySelectorAll('.btn-settings-open').forEach(btn => {
        btn.onclick = () => { document.getElementById('settings-modal').classList.remove('hidden'); };
    });
    const settingsClose = document.getElementById('btn-settings-close');
    if (settingsClose) {
        settingsClose.onclick = () => { document.getElementById('settings-modal').classList.add('hidden'); };
    }

    // Alltime Stats Trigger
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
    
    setupGroupListeners('group-match-type', (val, btn) => {
        selectOption('group-match-type', btn);
        matchType = val;
        document.getElementById('match-target-label').innerText = val === 'sets' ? 'Sets zum Sieg (Best of)' : 'Legs zum Sieg (Best of)';
    });

    setupGroupListeners('group-match-target', (val, btn) => selectOption('group-match-target', btn));
    setupGroupListeners('group-bot-level', (val, btn) => selectOption('group-bot-level', btn));
    setupGroupListeners('group-input-mode', (val, btn) => selectOption('group-input-mode', btn));
    setupGroupListeners('group-points', (val, btn) => selectOption('group-points', btn));
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
    if (wrapper) {
        wrapper.style.display = (val === 'strict') ? 'none' : 'block';
    }
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

    if (!wasBust && currentActiveDartSlot < 3) {
        setActiveDartSlot(currentActiveDartSlot + 1);
    }
    setVirtualMultiplier(1); 
}

function clearLastVirtualDart() {
    virtualDartData[currentActiveDartSlot] = { val: 0, label: "-", rawField: "", m: 1, key: "" };
    updateDartPreviewDOM();
    document.getElementById('error-message').innerText = "";
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
    if (newSum <= 180) {
        setVirtualSum(newSum);
    }
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

// Trigger des Checkout Sprach-Helpers
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
    matchType = getSelectedValue('group-match-type');
    matchTarget = parseInt(getSelectedValue('group-match-target'));

    document.getElementById('set-input-container').classList.add('hidden');
    document.getElementById('segment-input-container').classList.add('hidden');
    document.getElementById('p1-sub').classList.add('hidden');
    document.getElementById('p1-title').innerText = "Spieler 1";
    document.getElementById('p2-title').innerText = isBotMatch ? `Computer (${botLevel.toUpperCase()})` : "Spieler 2";
    document.getElementById('h1-header').innerText = "Verlauf S1";
    document.getElementById('h2-header').innerText = isBotMatch ? "Verlauf Bot" : "Verlauf S2";
    document.getElementById('submit-btn').classList.remove('hidden');

    // Stats resetten
    matchStats = {
        1: { totalPoints: 0, totalDarts: 0, first9Points: 0, first9Darts: 0, turns: 0, c100: 0, c140: 0, c180: 0, highestTurn: 0, highestFinish: 0, shortestLeg: 999 },
        2: { totalPoints: 0, totalDarts: 0, first9Points: 0, first9Darts: 0, turns: 0, c100: 0, c140: 0, c180: 0, highestTurn: 0, highestFinish: 0, shortestLeg: 999 }
    };
    legs = { 1: 0, 2: 0 }; sets = { 1: 0, 2: 0 };
    legDartsCount = { 1: 0, 2: 0 };

    if (activeGlobalMode === 'x01') {
        initialPoints = parseInt(getSelectedValue('group-points'));
        scores[1] = initialPoints; scores[2] = initialPoints;
        document.getElementById('game-title').innerText = `${initialPoints}er X01 Match (Best of ${matchTarget} ${matchType})`;
        if (inputMode === 'set') {
            document.getElementById('set-input-container').classList.remove('hidden');
            document.getElementById('submit-btn').classList.add('hidden');
        } else {
            document.getElementById('segment-input-container').classList.remove('hidden');
        }
        document.getElementById('p1-legs-sets').classList.remove('hidden');
        document.getElementById('p2-legs-sets').classList.remove('hidden');
    } else {
        document.getElementById('p1-legs-sets').classList.add('hidden');
        document.getElementById('p2-legs-sets').classList.add('hidden');
        if (activeGlobalMode === 'fin') {
            finAttempts = 0;
            finTypeSetting = getSelectedValue('group-fin-type');
            finTargetScore = generateRandomFinish();
            scores[1] = finTargetScore;
            let typeLabel = finTypeSetting === 'strict' ? 'Exakt' : 'Realistisch';
            document.getElementById('game-title').innerText = `Finishing (${typeLabel})`;
            document.getElementById('p1-title').innerText = "Target Finish";
            document.getElementById('h1-header').innerText = "Würfe-Log";
            document.getElementById('p1-sub').classList.remove('hidden');
            document.getElementById('p1-sub').innerText = `Versuch: 1`;
            document.getElementById('segment-input-container').classList.remove('hidden');
        } else if (activeGlobalMode === 'atc') {
            scores[1] = 1; scores[2] = 1;
            document.getElementById('game-title').innerText = `Around the Clock (ATC)`;
            document.getElementById('segment-input-container').classList.remove('hidden');
        } else if (activeGlobalMode === 'sod') {
            scores[1] = parseInt(getSelectedValue('group-sod-darts'));
            let targetSegment = document.getElementById('sod-target-select').value;
            let targetRing = getSelectedValue('group-sod-ring').toUpperCase();
            document.getElementById('game-title').innerText = `Set of Darts (${targetRing} ${targetSegment.toUpperCase()})`;
            document.getElementById('segment-input-container').classList.remove('hidden');
        }
    }

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
    
    if(activeGlobalMode === 'fin') {
        let isEn = currentLanguageCode.startsWith('en');
        speak(isEn ? "Your target is " + finTargetScore : "Dein Ziel ist " + finTargetScore);
    } else if (activeGlobalMode === 'x01') {
        triggerCheckoutHelperVoice(scores[1]);
    }
}

function updateScoreboardDisplays() {
    document.getElementById('p1-score').innerText = (activeGlobalMode === 'atc' && scores[1] === 21) ? "BULL" : scores[1];
    document.getElementById('p2-score').innerText = (activeGlobalMode === 'atc' && scores[2] === 21) ? "BULL" : scores[2];
    document.getElementById('p1-legs-sets').innerText = `Legs: ${legs[1]} | Sets: ${sets[1]}`;
    document.getElementById('p2-legs-sets').innerText = `Legs: ${legs[2]} | Sets: ${sets[2]}`;
}

function abortGame() {
    if (confirm("Spiel wirklich abbrechen?")) {
        document.getElementById('spielseite').classList.add('hidden');
        document.getElementById('startseite').classList.remove('hidden');
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

function handleBustProcess(currentScore, scoredPoints, originalDetails) {
    let isEn = currentLanguageCode.startsWith('en');
    let text = isEn ? "Bust!" : "Überworfen!";
    document.getElementById('error-message').innerText = text;
    speak(text);
    
    // Tracke Darts auch bei Überwerfen
    if (activeGlobalMode === 'x01') {
        matchStats[activePlayer].totalDarts += 3;
        legDartsCount[activePlayer] += 3;
        matchStats[activePlayer].turns += 1;
        if (legDartsCount[activePlayer] <= 9) {
            matchStats[activePlayer].first9Darts += 3;
        }
    }

    if (activeGlobalMode === 'fin') {
        finAttempts++;
        addHistoryEntry(1, scoredPoints, finTargetScore, originalDetails, true);
        scores[1] = finTargetScore;
        updateScoreboardDisplays();
        document.getElementById('p1-sub').innerText = `Versuch: ${finAttempts + 1}`;
    } else {
        addHistoryEntry(activePlayer, scoredPoints, currentScore, originalDetails, true);
    }

    isLockingInput = true;
    setTimeout(() => {
        document.getElementById('error-message').innerText = "";
        isLockingInput = false;
        if (activeGlobalMode !== 'fin') nextPlayer();
        resetVirtualState();
    }, 1800);
}

function checkLiveBustSegment(currentDartIndex) {
    if (activeGlobalMode !== 'x01' && activeGlobalMode !== 'fin') return false;

    let d1 = virtualDartData[1].val || 0;
    let d2 = virtualDartData[2].val || 0;
    let d3 = virtualDartData[3].val || 0;

    let runningSum = d1 + d2 + d3;
    let currentScore = (activeGlobalMode === 'fin') ? finTargetScore : scores[activePlayer];
    let remaining = currentScore - runningSum;
    
    let modeOut = (activeGlobalMode === 'fin') ? 'double' : outMode;

    if (remaining < 0) {
        handleBustProcess(currentScore, runningSum, `${virtualDartData[1].label}/${virtualDartData[2].label}/${virtualDartData[3].label}`);
        return true;
    }

    if (remaining === 1 && modeOut === 'double') {
        handleBustProcess(currentScore, runningSum, `${virtualDartData[1].label}/${virtualDartData[2].label}/${virtualDartData[3].label}`);
        return true;
    }

    if (remaining === 0) {
        if (modeOut === 'double') {
            let activeData = virtualDartData[currentDartIndex];
            if (!activeData.key || (!activeData.key.startsWith('D') && activeData.key !== 'd-bull')) {
                handleBustProcess(currentScore, runningSum, `${virtualDartData[1].label}/${virtualDartData[2].label}/${virtualDartData[3].label}`);
                return true;
            }
        }
    }
    return false;
}

function submitScore() {
    if (isLockingInput) return;
    document.getElementById('error-message').innerText = "";

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
            document.getElementById('error-message').innerText = "Ungültige Score-Kombination!";
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
            if (!last.key || (!last.key.startsWith('D') && last.key !== 'd-bull')) {
                isBust = true;
            }
        }
        
        if (isBust) { handleBustProcess(currentScore, totalScore, scoreDetails); return; }
        scores[activePlayer] = remaining;
    }

    // Akkumuliere Metriken für die Statistik
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
    nextPlayer(); resetVirtualState();
}

function handleLegOrSetWin() {
    let winner = activePlayer;
    let isEn = currentLanguageCode.startsWith('en');
    
    if (matchType === 'legs') {
        legs[winner]++;
        if (legs[winner] >= Math.ceil(matchTarget / 2) && matchTarget > 1) {
            showVictory(winner); return;
        } else if (matchTarget === 1) {
            showVictory(winner); return;
        }
    } else {
        legs[winner]++;
        if (legs[winner] >= 3) { // 3 Legs für ein Set
            legs[1] = 0; legs[2] = 0;
            sets[winner]++;
            speak(isEn ? "Set won!" : "Set gewonnen!");
            if (sets[winner] >= Math.ceil(matchTarget / 2)) {
                showVictory(winner); return;
            }
        }
    }

    speak(isEn ? "Leg finished!" : "Leg beendet!");
    alert(isEn ? `Player ${winner} won the leg!` : `Spieler ${winner} gewinnt das Leg!`);
    
    // Reset Scores & Leg-Darts für neues Leg
    scores[1] = initialPoints; scores[2] = initialPoints;
    legDartsCount[1] = 0; legDartsCount[2] = 0;
    histories[1] = []; histories[2] = [];
    document.getElementById('p1-history-list').innerHTML = "";
    document.getElementById('p2-history-list').innerHTML = "";
    updateScoreboardDisplays();
    activePlayer = (winner === 1) ? 2 : 1; // Verlierer fängt nächstes Leg an
    resetVirtualState();
    triggerCheckoutHelperVoice(scores[activePlayer]);

    if(isBotMatch && activePlayer === 2) {
        setTimeout(executeBotTurn, 1000);
    }
}

// BOT LOGIK IMPLEMENTIERUNG
function executeBotTurn() {
    if(!isBotMatch || activePlayer !== 2 || isLockingInput) return;
    
    // Ermittle Bot Skill-Parameter
    let targetAvg = 35;
    let tripleChance = 0.02;
    let doubleChance = 0.05;
    if (botLevel === 'medium') { targetAvg = 52; tripleChance = 0.08; doubleChance = 0.12; }
    else if (botLevel === 'strong') { targetAvg = 78; tripleChance = 0.22; doubleChance = 0.30; }
    else if (botLevel === 'insane') { targetAvg = 102; tripleChance = 0.45; doubleChance = 0.60; }

    let botRest = scores[2];
    let darts = [];
    let currentDartScore = 0;

    // Einfacher Checkout/Anwurf Simulator
    for (let slot = 1; slot <= 3; slot++) {
        let remainingNow = botRest - currentDartScore;
        if (remainingNow <= 1) break; // Kann nicht mehr regulär werfen oder überworfen
        
        let dartVal = 0; let label = "0"; let key = "0"; let m = 1;

        // Finish-Logik des Bots
        if (remainingNow <= 40 && remainingNow % 2 === 0 && outMode === 'double') {
            let targetDouble = remainingNow / 2;
            if (Math.random() < doubleChance) {
                dartVal = remainingNow; m = 2; label = `D${targetDouble}`; key = `D${targetDouble}`;
            } else if (Math.random() < 0.4) {
                dartVal = targetDouble; m = 1; label = `S${targetDouble}`; key = `S${targetDouble}`;
            } else {
                dartVal = 0; label = "Miss";
            }
        } else if (remainingNow === 50 && outMode === 'double') {
            if (Math.random() < doubleChance) {
                dartVal = 50; m = 2; label = "D-Bull"; key = "d-bull";
            } else { dartVal = 25; label = "Bull"; }
        } else {
            // Scoring-Wurf
            let rand = Math.random();
            if (rand < tripleChance) {
                dartVal = 60; m = 3; label = "T20"; key = "T20";
            } else if (rand < tripleChance + 0.15) {
                dartVal = 20; m = 1; label = "S20"; key = "S20";
            } else if (rand < 0.75) {
                // Getroffen, aber gestreut in Nachbarfelder
                let options = [1, 5, 20, 9, 11, 19];
                let chosen = options[Math.floor(Math.random() * options.length)];
                dartVal = chosen; m = 1; label = `S${chosen}`; key = `S${chosen}`;
            } else {
                dartVal = 0; label = "0";
            }
        }

        currentDartScore += dartVal;
        darts.push({val: dartVal, label: label, key: key, m: m});
        if (botRest - currentDartScore === 0 && (outMode === 'single' || (outMode === 'double' && m === 2))) {
            break; // Check!
        }
    }

    // Fülle ungenutzte Slots für Display-String auf
    while(darts.length < 3) darts.push({val: 0, label: "-", key: "", m: 1});

    // Übersetze Bot-Ergebnis in reguläre Match-Variablen
    virtualDartData[1] = darts[0]; virtualDartData[2] = darts[1]; virtualDartData[3] = darts[2];
    executeX01Turn();
}

function nextPlayer() {
    if (!isTwoPlayers && !isBotMatch) return;
    document.getElementById(`p${activePlayer}-card`).classList.remove('active');
    activePlayer = activePlayer === 1 ? 2 : 1;
    document.getElementById(`p${activePlayer}-card`).classList.add('active');

    if (activeGlobalMode === 'x01') {
        triggerCheckoutHelperVoice(scores[activePlayer]);
    }

    if (isBotMatch && activePlayer === 2) {
        isLockingInput = true;
        setTimeout(() => {
            isLockingInput = false;
            executeBotTurn();
        }, 1500);
    }
}

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
            window.speechSynthesis.cancel();
            speak(isEn ? `Leg finished!` : `Leg beendet!`);
            alert(isEn ? `Checked ${originalTarget} in ${finAttempts} throws.` : `Sauber! Du hast das Finish ${originalTarget} in ${finAttempts} Aufnahmen gecheckt.`);
            finAttempts = 0; finTargetScore = generateRandomFinish(); scores[1] = finTargetScore;
            updateScoreboardDisplays();
            document.getElementById('p1-sub').innerText = `Versuch: 1`;
            document.getElementById('p1-history-list').innerHTML = "";
            speak(isEn ? "Next target is " + finTargetScore : "Nächstes Ziel ist " + finTargetScore);
        } else {
            finAttempts++;
            addHistoryEntry(1, isEn ? "No Check" : "Kein Check", finTargetScore, scoreDetails, false);
            document.getElementById('p1-sub').innerText = `Versuch: ${finAttempts + 1}`;
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
        window.speechSynthesis.cancel();
        speak(isEn ? `Leg finished!` : `Leg beendet!`);
        alert(isEn ? `Nice! Checked ${originalTarget} in ${finAttempts} throws.` : `Sauber! Du hast das Finish ${originalTarget} in ${finAttempts} Aufnahmen gecheckt.`);
        finAttempts = 0; finTargetScore = generateRandomFinish(); scores[1] = finTargetScore;
        updateScoreboardDisplays();
        document.getElementById('p1-sub').innerText = `Versuch: 1`;
        document.getElementById('p1-history-list').innerHTML = "";
        speak(isEn ? "Next target is " + finTargetScore : "Nächstes Ziel ist " + finTargetScore);
    } else {
        finAttempts++; scores[1] = runningScore;
        updateScoreboardDisplays();
        document.getElementById('p1-sub').innerText = `Versuch: ${finAttempts + 1}`;
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

function addHistoryEntry(player, score, rest, details, isBust) {
    histories[player].unshift({ score, rest, details, isBust });
    const tbody = document.getElementById(`p${player}-history-list`);
    if(!tbody) return;
    tbody.innerHTML = "";
    
    let totalValidPoints = 0; let validLegsCount = 0;

    histories[player].forEach((item, index) => {
        let dartsThrown = (histories[player].length - index) * 3;
        let numericalScore = 0;
        if (!item.isBust && typeof item.score === 'number') numericalScore = item.score;
        
        if (activeGlobalMode === 'x01' || activeGlobalMode === 'fin') {
            totalValidPoints += numericalScore; validLegsCount++;
        }

        let currentAvg = "-";
        if (validLegsCount > 0 && (activeGlobalMode === 'x01' || activeGlobalMode === 'fin')) {
            currentAvg = (totalValidPoints / validLegsCount).toFixed(1);
        } else if (activeGlobalMode === 'sod' || activeGlobalMode === 'atc') {
            let cumulatedHits = 0;
            for(let j = histories[player].length - 1; j >= index; j--) {
                let parsedHit = parseInt(histories[player][j].score);
                if (!isNaN(parsedHit)) cumulatedHits += parsedHit;
            }
            currentAvg = cumulatedHits.toString();
        }

        let displayScore = item.isBust ? `Bust` : item.score;
        tbody.innerHTML += `<tr><td>${dartsThrown}</td><td>${displayScore}</td><td>${currentAvg}</td><td>${item.rest}</td><td>${item.details}</td></tr>`;
    });
}

// SPIELZUSAMMENFASSUNG & LOCALSTORAGE METRIKEN LOGIK
function showVictory(winnerId) {
    document.getElementById('spielseite').classList.add('hidden');
    document.getElementById('abschlussseite').classList.remove('hidden');
    
    let p1Name = "Spieler 1";
    let p2Name = isBotMatch ? `Computer (${botLevel.toUpperCase()})` : "Spieler 2";
    
    document.getElementById('winner-announcement').innerText = winnerId === 1 ? `${p1Name} gewinnt das Match!` : `${p2Name} gewinnt das Match!`;
    document.getElementById('th-p1-name').innerText = p1Name;
    document.getElementById('th-p2-name').innerText = p2Name;

    // Berechne aggregierte Match-Metriken
    let p1Avg = matchStats[1].totalDarts > 0 ? ((matchStats[1].totalPoints / matchStats[1].totalDarts) * 3).toFixed(1) : "0.0";
    let p2Avg = matchStats[2].totalDarts > 0 ? ((matchStats[2].totalPoints / matchStats[2].totalDarts) * 3).toFixed(1) : "0.0";
    
    let p1F9 = matchStats[1].first9Darts > 0 ? ((matchStats[1].first9Points / matchStats[1].first9Darts) * 3).toFixed(1) : "0.0";
    let p2F9 = matchStats[2].first9Darts > 0 ? ((matchStats[2].first9Points / matchStats[2].first9Darts) * 3).toFixed(1) : "0.0";

    let p1Shortest = matchStats[1].shortestLeg === 999 ? "-" : `${matchStats[1].shortestLeg} Darts`;
    let p2Shortest = matchStats[2].shortestLeg === 999 ? "-" : `${matchStats[2].shortestLeg} Darts`;

    const summaryBody = document.getElementById('summary-stats-body');
    summaryBody.innerHTML = `
        <tr><td>3-Dart-Average</td><td><b>${p1Avg}</b></td><td><b>${p2Avg}</b></td></tr>
        <tr><td>First 9 Average</td><td>${p1F9}</td><td>${p2F9}</td></tr>
        <tr><td>Höchste Aufnahme</td><td>${matchStats[1].highestTurn}</td><td>${matchStats[2].highestTurn}</td></tr>
        <tr><td>Höchstes Checkout</td><td>${matchStats[1].highestFinish}</td><td>${matchStats[2].highestFinish}</td></tr>
        <tr><td>Shortest Leg</td><td>${p1Shortest}</td><td>${p2Shortest}</td></tr>
        <tr><td>100+ / 140+ / 180er</td><td>${matchStats[1].c100} / ${matchStats[1].c140} / ${matchStats[1].c180}</td><td>${matchStats[2].c100} / ${matchStats[2].c140} / ${matchStats[2].c180}</td></tr>
    `;

    // Speicher Daten für Alltime Stats im LocalStorage (Nur Spieler 1 tracken)
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
    
    document.getElementById('stat-total-games').innerText = stats.totalGames;
    document.getElementById('stat-alltime-avg').innerText = stats.totalGames > 0 ? (stats.sumAvg / stats.totalGames).toFixed(1) : "0.0";
    document.getElementById('stat-highest-turn').innerText = stats.highestTurn;
    document.getElementById('stat-highest-co').innerText = stats.highestFinish;
    document.getElementById('stat-total-180s').innerText = stats.total180s;

    document.getElementById('stats-modal').classList.remove('hidden');
}

function resetGame() {
    document.getElementById('abschlussseite').classList.add('hidden');
    document.getElementById('startseite').classList.remove('hidden');
}
