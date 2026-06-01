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

// Finishing Variablen
let finAttempts = 0;
let finTargetScore = 0;
let finTypeSetting = 'realistic';

// System-Optionen (Audio)
let isSpeechOutputActive = true;
let isSpeechInputActive = false; // Neuer STT-Schalter
let speechInputMode = 'continuous'; // 'continuous' (Dauermodus) oder 'tap' (Tap-to-Talk)
let isVoiceMuted = false; // Für Dauermodus Mute-Status
let currentTheme = 'dark';

// Spracherkennungs-Instanz (Web Speech API)
let recognition = null;
let isListening = false;

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
    initSpeechRecognition();
    renderMicButton(); // Initialisiert den Mic-Button auf der Spielseite
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

    // Neue STT Event Listener für die Einstellungen
    setupGroupListeners('group-toggle-stt', (val, btn) => {
        selectOption('group-toggle-stt', btn);
        isSpeechInputActive = (val === 'true');
        const subMenu = document.getElementById('sub-stt-settings');
        if (subMenu) subMenu.style.display = isSpeechInputActive ? 'block' : 'none';
        renderMicButton();
        if(!isSpeechInputActive) stopListening();
    });

    setupGroupListeners('group-stt-mode', (val, btn) => {
        selectOption('group-stt-mode', btn);
        speechInputMode = val;
        isVoiceMuted = false;
        renderMicButton();
        stopListening();
    });

    setupGroupListeners('group-toggle-helper', (val, btn) => {
        selectOption('group-toggle-helper', btn);
        isCheckoutHelperActive = (val === 'true');
    });

    document.getElementById('voice-lang-select').onchange = initVoices;
    document.getElementById('voice-select').onchange = function() {
        let voices = speechSynthesis.getVoices();
        selectedVoice = voices.find(v => v.name === this.value) || null;
    };

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
    setupGroupListeners('group-input-mode', (val, btn) => {
        selectOption('group-input-mode', btn);
        // Setzt Mute zurück, um Verwirrung beim Moduswechsel zu vermeiden
        isVoiceMuted = false;
        renderMicButton();
    });
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

function speak(text, onEndCallback) {
    if (!isSpeechOutputActive) {
        if (onEndCallback) onEndCallback();
        return;
    }
    // Verhindert, dass das STT-System seine eigene Sprachausgabe hört
    stopListening();

    let utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentLanguageCode;
    if (selectedVoice) utterance.voice = selectedVoice;
    
    utterance.onend = () => {
        if (onEndCallback) onEndCallback();
        // Aktiviert STT wieder vollautomatisch nach der Ansage, falls Dauermodus aktiv und nicht stummgeschaltet
        if (isSpeechInputActive && speechInputMode === 'continuous' && !isVoiceMuted && !isLockingInput) {
            startListening();
        }
    };
    window.speechSynthesis.speak(utterance);
}

function speakTurnResult(score, rest, onEndCallback) {
    if (!isSpeechOutputActive) {
        if (onEndCallback) onEndCallback();
        return;
    }
    stopListening();
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
            
            restUtterance.onend = () => {
                if (onEndCallback) onEndCallback();
                if (isSpeechInputActive && speechInputMode === 'continuous' && !isVoiceMuted && !isLockingInput) {
                    startListening();
                }
            };
            window.speechSynthesis.speak(restUtterance);
        } else {
            if (onEndCallback) onEndCallback();
            if (isSpeechInputActive && speechInputMode === 'continuous' && !isVoiceMuted && !isLockingInput) {
                startListening();
            }
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
        stopListening();
        let text = currentLanguageCode.startsWith('en') ? `Target ${score}. Try ` : `${score} Rest. Versuche `;
        let elements = route.map(r => r.replace('T', 'Triple ').replace('D', 'Doppel ').replace('S', 'Single '));
        text += elements.join(', ');
        let utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = currentLanguageCode;
        if(selectedVoice) utterance.voice = selectedVoice;
        
        utterance.onend = () => {
            if (isSpeechInputActive && speechInputMode === 'continuous' && !isVoiceMuted && !isLockingInput) {
                startListening();
            }
        };
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
    if (dartsRemaining === 0) return;
    if (currentScore > 170 && currentRemainingScore > 170) return; 

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
// NEW: SPEECH RECOGNITION (STT) SCHALTZENTRALE
// ==========================================
function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        console.log("Web Speech API wird von diesem Browser nicht unterstützt.");
        return;
    }
    recognition = new SpeechRecognition();
    recognition.continuous = false; // Wir handhaben den Loop pro Aufnahme selbst
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
        isListening = true;
        updateMicButtonUI(true);
    };

    recognition.onend = () => {
        isListening = false;
        updateMicButtonUI(false);
    };

    recognition.onerror = (event) => {
        console.log("STT Error: ", event.error);
        isListening = false;
        updateMicButtonUI(false);
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        console.log("Erkannte Sprache: ", transcript);
        parseSpeechInput(transcript);
    };
}

function startListening() {
    if (!recognition || isListening || isLockingInput) return;
    recognition.lang = currentLanguageCode;
    try {
        recognition.start();
    } catch(e) { console.log(e); }
}

function stopListening() {
    if (!recognition || !isListening) return;
    try {
        recognition.stop();
    } catch(e) { console.log(e); }
}

// Das "Wörterbuch" und Sprach-Parsing System
function parseSpeechInput(text) {
    document.getElementById('error-message').innerText = "";
    
    // 1. Variante: Exakte Restscore-Ansage (Nur sinnvoll im Summen-Modus 'set')
    if (inputMode === 'set' && (text.includes("rest") || text.startsWith("rest"))) {
        let cleanText = text.replace("rest", "").trim();
        let parsedRest = parseInt(cleanText);
        if (!isNaN(parsedRest) && parsedRest >= 0 && parsedRest <= initialPoints) {
            let actualScoredSum = scores[activePlayer] - parsedRest;
            if (actualScoredSum >= 0 && actualScoredSum <= 180) {
                setVirtualSum(actualScoredSum);
                submitScore();
                return;
            }
        }
        document.getElementById('error-message').innerText = "Restscore nicht plausibel!";
        return;
    }

    // 2. Variante: Summen-Modus (Reine Zahl oder Zahlwörter)
    if (inputMode === 'set') {
        let parsedNum = textToNumber(text);
        if (parsedNum !== null && parsedNum <= 180) {
            setVirtualSum(parsedNum);
            submitScore();
            return;
        }
        document.getElementById('error-message').innerText = "Kombination nicht verstanden.";
        return;
    }

    // 3. Variante: Einzelpfeile (Segment-Modus)
    // Erlaubt Trennungen durch "und", Komma oder Leerzeichen
    let tokens = text.split(/[\s,und]+/).filter(t => t.length > 0);
    let currentDartSlotToFill = 1;
    resetVirtualState();

    for (let i = 0; i < tokens.length; i++) {
        if (currentDartSlotToFill > 3) break;
        let token = tokens[i];
        let multiplier = 1;

        if (token === "triple" || token === "tripel" || token === "treble") {
            multiplier = 3; i++; token = tokens[i];
        } else if (token === "doppel" || token === "double") {
            multiplier = 2; i++; token = tokens[i];
        } else if (token === "single") {
            multiplier = 1; i++; token = tokens[i];
        }

        if (!token) break;

        let val = 0; let field = "";
        if (token === "bullseye" || token === "bull" || token === "bull's") {
            field = "bull";
            // Bei Bullseye automatisch Doppel-Multiplikator setzen falls angesagt
            if(token === "bullseye") multiplier = 2; 
        } else if (token === "0" || token === "null" || token === "miss" || token === "vorbei") {
            field = "0"; multiplier = 1;
        } else {
            let num = parseInt(token);
            if (isNaN(num)) num = wordToNumberClean(token);
            if (num >= 1 && num <= 20) {
                field = num.toString();
            } else {
                continue; // Unbekanntes Token überspringen
            }
        }

        let parsed = parseSegmentData(field, multiplier);
        if (parsed) {
            virtualDartData[currentDartSlotToFill] = {
                val: parsed.val, label: parsed.label, rawField: field, m: multiplier, key: parsed.key
            };
            currentDartSlotToFill++;
        }
    }

    updateDartPreviewDOM();
    
    // Nach erfolgreichem Parsing der Segmente prüfen wir direkt auf Busts oder verarbeiten den Turn
    if (virtualDartData[1].label !== "-") {
        // Simuliert die Eingaben sequentiell für den Bust-Check
        if (checkLiveBustSegment(1)) return;
        if (virtualDartData[2].label !== "-" && checkLiveBustSegment(2)) return;
        if (virtualDartData[3].label !== "-" && checkLiveBustSegment(3)) return;
        
        submitScore();
    } else {
        document.getElementById('error-message').innerText = "Darts nicht sauber erkannt.";
    }
}

// Hilfsfunktion zur Umwandlung von Textzahlen in Integer
function textToNumber(text) {
    let n = parseInt(text);
    if (!isNaN(n)) return n;
    return wordToNumberClean(text);
}

function wordToNumberClean(word) {
    const dict = {
        "null": 0, "eins": 1, "zwei": 2, "drei": 3, "vier": 4, "fünf": 5, "sechs": 6, "sieben": 7, "acht": 8, "neun": 9, "zehn": 10,
        "elf": 11, "zwölf": 12, "dreizehn": 13, "vierzehn": 14, "fünfzehn": 15, "sechzehn": 16, "siebzehn": 17, "achtzehn": 18, "neunzehn": 19, "zwanzig": 20,
        "einundzwanzig": 21, "26": 26, "dreißig": 30, "vierzig": 40, "fünfzig": 50, "sechzig": 60, "einundsechzig": 61, "zweiundsechzig": 62, "dreiundsechzig": 63,
        "vierundsechzig": 64, "fünfundsechzig": 65, "fünfundachtzig": 85, "einhundert": 100, "hundert": 100, "hunderteins": 101, "hundertvierzig": 140, "hundertachtzig": 180
    };
    return dict[word] !== undefined ? dict[word] : null;
}

// Erstellt oder updatet den Mic-Button dynamisch auf der Spielseite
function renderMicButton() {
    let micWrapper = document.getElementById('mic-button-wrapper');
    if (!micWrapper) return; // Falls DOM-Element noch nicht existiert

    if (!isSpeechInputActive) {
        micWrapper.innerHTML = "";
        return;
    }

    // Erstellt das Element falls leer
    micWrapper.innerHTML = `
        <button id="btn-mic-action" class="btn-action-mic">
            <span id="mic-icon-container"></span>
        </button>
    `;

    document.getElementById('btn-mic-action').onclick = function() {
        if (speechInputMode === 'continuous') {
            // Im Dauermodus toggelt der Klick die Stummschaltung
            isVoiceMuted = !isVoiceMuted;
            if (isVoiceMuted) stopListening();
            else startListening();
            updateMicButtonUI(isListening);
        } else {
            // Im Tap-to-Talk Modus startet ein Klick die Aufnahme manuell
            if (isListening) stopListening();
            else startListening();
        }
    };
    updateMicButtonUI(isListening);
}

function updateMicButtonUI(activeListening) {
    const iconContainer = document.getElementById('mic-icon-container');
    const btn = document.getElementById('btn-mic-action');
    if (!iconContainer || !btn) return;

    // SVG Icons
    const normalMicSVG = `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><path d="M12 1v11M19 10v1a7 7 0 0 1-14 0v-1M12 23v-4"></path><rect x="9" y="5" width="6" height="10" rx="3"></rect></svg>`;
    const mutedMicSVG = `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V5a3 3 0 0 0-5.94-.6"></path><path d="M19 10v1a6.93 6.93 0 0 1-1 3.58M5 10v1a7 7 0 0 0 10.74 5.82"></path><line x1="12" y1="19" x2="12" y2="23"></line></svg>`;

    if (speechInputMode === 'continuous') {
        if (isVoiceMuted) {
            iconContainer.innerHTML = mutedMicSVG;
            btn.className = "btn-action-mic mic-muted";
        } else {
            iconContainer.innerHTML = normalMicSVG;
            btn.className = activeListening ? "btn-action-mic mic-listening" : "btn-action-mic mic-active-continuous";
        }
    } else {
        // Tap to Talk Modus
        iconContainer.innerHTML = normalMicSVG;
        btn.className = activeListening ? "btn-action-mic mic-listening" : "btn-action-mic";
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

    document.getElementById('set-input-container').classList.add('hidden');
    document.getElementById('segment-input-container').classList.add('hidden');
    document.getElementById('p1-sub').classList.add('hidden');
    document.getElementById('p1-title').innerText = "Spieler 1";
    document.getElementById('p2-title').innerText = isBotMatch ? `Computer (${botLevel.toUpperCase()})` : "Spieler 2";
    document.getElementById('h1-header').innerText = "Verlauf S1";
    document.getElementById('h2-header').innerText = isBotMatch ? "Verlauf Bot" : "Verlauf S2";
    document.getElementById('submit-btn').classList.remove('hidden');

    matchStats = {
        1: { totalPoints: 0, totalDarts: 0, first9Points: 0, first9Darts: 0, turns: 0, c100: 0, c140: 0, c180: 0, highestTurn: 0, highestFinish: 0, shortestLeg: 999 },
        2: { totalPoints: 0, totalDarts: 0, first9Points: 0, first9Darts: 0, turns: 0, c100: 0, c140: 0, c180: 0, highestTurn: 0, highestFinish: 0, shortestLeg: 999 }
    };
    legs = { 1: 0, 2: 0 }; sets = { 1: 0, 2: 0 };
    legDartsCount = { 1: 0, 2: 0 };

    if (activeGlobalMode === 'x01') {
        initialPoints = parseInt(document.getElementById('input-points-slider').value);
        scores[1] = initialPoints; scores[2] = initialPoints;

        let legsValue = parseInt(document.getElementById('input-legs-slider').value);
        let setsValue = parseInt(document.getElementById('input-sets-slider').value);
        
        window.legsRequiredForSet = Math.ceil(legsValue / 2);
        window.setsRequiredForMatch = Math.ceil(setsValue / 2);

        document.getElementById('game-title').innerText = `${initialPoints}er Match (Best of ${setsValue} Sets, Legs pro Set: Best of ${legsValue})`;

        if (inputMode === 'set') {
            document.getElementById('set-input-container').classList.remove('hidden');
            document.getElementById('submit-btn').classList.add('hidden');
        } else {
            document.getElementById('segment-input-container').classList.remove('hidden');
        }
        document.getElementById('p1-legs-sets').classList.remove('hidden');
        document.getElementById('p2-legs-sets').classList.remove('hidden');
        document.getElementById('p1-live-avg').classList.remove('hidden');
        document.getElementById('p2-live-avg').classList.remove('hidden');
    } else {
        document.getElementById('p1-legs-sets').classList.add('hidden');
        document.getElementById('p2-legs-sets').classList.add('hidden');
        document.getElementById('p1-live-avg').classList.add('hidden');
        document.getElementById('p2-live-avg').classList.add('hidden');
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
    isVoiceMuted = false; // Setzt Mute bei Spielstart standardmäßig zurück
    updateScoreboardDisplays();
    renderMicButton(); // Mic-Button laden

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

    let p1TripleAvg = matchStats[1].totalDarts > 0 ? ((matchStats[1].totalPoints / matchStats[1].totalDarts) * 3).toFixed(1) : "0.0";
    let p2TripleAvg = matchStats[2].totalDarts > 0 ? ((matchStats[2].totalPoints / matchStats[2].totalDarts) * 3).toFixed(1) : "0.0";
    
    document.getElementById('p1-live-avg').innerText = `Ø ${p1TripleAvg} (${matchStats[1].totalDarts} Darts)`;
    document.getElementById('p2-live-avg').innerText = `Ø ${p2TripleAvg} (${matchStats[2].totalDarts} Darts)`;
}

function abortGame() {
    if (confirm("Spiel wirklich abbrechen?")) {
        stopListening();
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

function handleBustProcess(currentScore, scoredPoints, originalDetails, actualDartsCount) {
    let isEn = currentLanguageCode.startsWith('en');
    let text = isEn ? "Bust!" : "Überworfen!";
    document.getElementById('error-message').innerText = text;
    
    let dartsThrown = actualDartsCount || 3;

    if (activeGlobalMode === 'x01') {
        matchStats[activePlayer].totalDarts += dartsThrown;
        legDartsCount[activePlayer] += dartsThrown;
        matchStats[activePlayer].turns += 1;
        if (legDartsCount[activePlayer] <= 9) matchStats[activePlayer].first9Darts += dartsThrown;
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
    speak(text, () => {
        document.getElementById('error-message').innerText = "";
        isLockingInput = false;
        if (activeGlobalMode !== 'fin') nextPlayer();
        resetVirtualState();
    });
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
        handleBustProcess(currentScore, runningSum, `${virtualDartData[1].label}/${virtualDartData[2].label}/${virtualDartData[3].label}`, currentDartIndex);
        return true;
    }

    if (runningRemaining === 0 && modeOut === 'double') {
        let activeData = virtualDartData[currentDartIndex];
        if (!activeData.key || (!activeData.key.startsWith('D') && activeData.key !== 'd-bull')) {
            handleBustProcess(currentScore, runningSum, `${virtualDartData[1].label}/${virtualDartData[2].label}/${virtualDartData[3].label}`, currentDartIndex);
            return true;
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
            let inputDarts = "3";
            // Nur fragen, wenn nicht gerade über Spracheingabe ein sauberer Prozess läuft
            if (!isListening) {
                inputDarts = prompt("Überworfen! Wie viele Darts wurden in dieser Aufnahme geworfen? (1, 2 oder 3)", "3");
            }
            let parsedDarts = parseInt(inputDarts);
            if (parsedDarts !== 1 && parsedDarts !== 2 && parsedDarts !== 3) parsedDarts = 3;
            
            handleBustProcess(currentScore, totalScore, "Summe", parsedDarts); 
            return;
        }
        
        if (remaining === 0) {
            let inputDarts = "3";
            if (!isListening) {
                inputDarts = prompt("Match/Leg beendet! Wie viele Darts wurden für das Finish benötigt? (1, 2 oder 3)", "3");
            }
            let parsedDarts = parseInt(inputDarts);
            if (parsedDarts !== 1 && parsedDarts !== 2 && parsedDarts !== 3) parsedDarts = 3;
            dartsCountThisTurn = parsedDarts;
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
        
        if (isBust) { 
            handleBustProcess(currentScore, totalScore, scoreDetails, dartsCountThisTurn); 
            return; 
        }
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

    if (scores[activePlayer] === 0) {
        if(totalScore > matchStats[activePlayer].highestFinish) matchStats[activePlayer].highestFinish = totalScore;
        if(legDartsCount[activePlayer] < matchStats[activePlayer].shortestLeg) matchStats[activePlayer].shortestLeg = legDartsCount[activePlayer];
        
        isLockingInput = true;
        speakTurnResult(totalScore, scores[activePlayer], () => {
            isLockingInput = false;
            handleLegOrSetWin();
        });
        return;
    }

    isLockingInput = true;
    speakTurnResult(totalScore, scores[activePlayer], () => {
        isLockingInput = false;
        nextPlayer(); 
        resetVirtualState();
    });
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
            speak(isEn ? "Set won!" : "Set gewonnen!", () => {
                alert(isEn ? `Player ${winner} won the set!` : `Spieler ${winner} gewinnt den Satz!`);
                proceedToNextLeg(winner);
            });
            return;
        }
    } else {
        speak(isEn ? "Leg finished!" : "Leg beendet!", () => {
            proceedToNextLeg(winner);
        });
    }
}

function proceedToNextLeg(winner) {
    scores[1] = initialPoints; 
    scores[2] = initialPoints;
    legDartsCount[1] = 0; 
    legDartsCount[2] = 0;
    histories[1] = []; 
    histories[2] = [];
    
    document.getElementById('p1-history-list').innerHTML = "";
    document.getElementById('p2-history-list').innerHTML = "";
    updateScoreboardDisplays();
    
    activePlayer = (winner === 1) ? 2 : 1; 
    resetVirtualState();
    triggerCheckoutHelperVoice(scores[activePlayer]);

    if(isBotMatch && activePlayer === 2) {
        executeBotTurn();
    }
}

function executeBotTurn() {
    if(!isBotMatch || activePlayer !== 2 || isLockingInput) return;
    
    let tripleChance = 0.02; let doubleChance = 0.05;
    if (botLevel === 'medium') { tripleChance = 0.08; doubleChance = 0.12; }
    else if (botLevel === 'strong') { tripleChance = 0.22; doubleChance = 0.30; }
    else if (botLevel === 'insane') { tripleChance = 0.45; doubleChance = 0.60; }

    let botRest = scores[2];
    let darts = [];
    let currentDartScore = 0;

    for (let slot = 1; slot <= 3; slot++) {
        let remainingNow = botRest - currentDartScore;
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

        currentDartScore += dartVal;
        darts.push({val: dartVal, label: label, key: key, m: m});
        if (botRest - currentDartScore === 0 && (outMode === 'single' || (outMode === 'double' && m === 2))) break;
    }

    while(darts.length < 3) darts.push({val: 0, label: "-", key: "", m: 1});

    virtualDartData[1] = darts[0]; virtualDartData[2] = darts[1]; virtualDartData[3] = darts[2];
    executeX01Turn();
}

function nextPlayer() {
    if (!isTwoPlayers && !isBotMatch) return;
    document.getElementById(`p${activePlayer}-card`).classList.remove('active');
    activePlayer = activePlayer === 1 ? 2 : 1;
    document.getElementById(`p${activePlayer}-card`).classList.add('active');

    if (activeGlobalMode === 'x01') triggerCheckoutHelperVoice(scores[activePlayer]);

    if (isBotMatch && activePlayer === 2) {
        executeBotTurn();
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
            speak(isEn ? `Leg finished!` : `Leg beendet!`, () => {
                alert(isEn ? `Checked ${originalTarget} in ${finAttempts} throws.` : `Sauber! Du hast das Finish ${originalTarget} in ${finAttempts} Aufnahmen gecheckt.`);
                finAttempts = 0; finTargetScore = generateRandomFinish(); scores[1] = finTargetScore;
                updateScoreboardDisplays();
                document.getElementById('p1-sub').innerText = `Versuch: 1`;
                document.getElementById('p1-history-list').innerHTML = "";
                speak(isEn ? "Next target is " + finTargetScore : "Nächstes Ziel ist " + finTargetScore);
            });
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
            handleBustProcess(originalTarget, totalScoredThisTurn, displayLabels.join('/'), i + 1); return;
        }
    }

    let scoreDetails = displayLabels.join('/');
    if (isCheckout) {
        finAttempts++; histories[1] = [];
        window.speechSynthesis.cancel();
        speak(isEn ? `Leg finished!` : `Leg beendet!`, () => {
            alert(isEn ? `Nice! Checked ${originalTarget} in ${finAttempts} throws.` : `Sauber! Du hast das Finish ${originalTarget} in ${finAttempts} Aufnahmen gecheckt.`);
            finAttempts = 0; finTargetScore = generateRandomFinish(); scores[1] = finTargetScore;
            updateScoreboardDisplays();
            document.getElementById('p1-sub').innerText = `Versuch: 1`;
            document.getElementById('p1-history-list').innerHTML = "";
            speak(isEn ? "Next target is " + finTargetScore : "Nächstes Ziel ist " + finTargetScore);
        });
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
    
    isLockingInput = true;
    speakTurnResult(hitLabel, isEn ? "Target is now " + targetText : "Ziel ist jetzt " + targetText, () => {
        isLockingInput = false;
        if (scores[activePlayer] === 21) { showVictory(activePlayer); return; }
        nextPlayer(); 
        resetVirtualState();
    });
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
    
    isLockingInput = true;
    speakTurnResult(hitLabel, isEn ? scores[1] + " darts remaining" : scores[1] + " Pfeile verbleibend", () => {
        isLockingInput = false;
        if (scores[1] <= 0) { showVictory(1); return; }
        resetVirtualState();
    });
}

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
    stopListening();
    document.getElementById('spielseite').classList.add('hidden');
    document.getElementById('abschlussseite').classList.remove('hidden');
    
    let p1Name = "Spieler 1";
    let p2Name = isBotMatch ? `Computer (${botLevel.toUpperCase()})` : "Spieler 2";
    
    document.getElementById('winner-announcement').innerText = winnerId === 1 ? `${p1Name} gewinnt das Match!` : `${p2Name} gewinnt das Match!`;
    document.getElementById('th-p1-name').innerText = p1Name;
    document.getElementById('th-p2-name').innerText = p2Name;

    let p1Avg = matchStats[1].totalDarts > 0 ? ((matchStats[1].totalPoints / matchStats[1].totalDarts) * 3).toFixed(1) : "0.0";
    let p2Avg = matchStats[2].totalDarts > 0 ? ((matchStats[2].totalPoints / matchStats[2].totalDarts) * 3).toFixed(1) : "0.0";
    
    let p1F9 = matchStats[1].first9Darts > 0 ? ((matchStats[1].first9Points / matchStats[1].first9Darts) * 3).toFixed(1) : "0.0";
    let p2F9 = matchStats[2].first9Darts > 0 ? ((matchStats[2].first9Points / matchStats[2].first9Darts) * 3).toFixed(1) : "0.0";

    let p1Shortest = matchStats[1].shortestLeg === 999 ? "-" : `${matchStats[1].shortestLeg} Darts`;
    let p2Shortest = matchStats[2].shortestLeg === 999 ? "-" : `${matchStats[2].shortestLeg} Darts`;

    const summaryBody = document.getElementById('summary-stats-body');
    summaryBody.innerHTML = `
        <tr><td>3-Dart-Average (Ø3)</td><td><b>${p1Avg}</b></td><td><b>${p2Avg}</b></td></tr>
        <tr><td>First 9 Average (Ø3)</td><td>${p1F9}</td><td>${p2F9}</td></tr>
        <tr><td>Höchste Aufnahme</td><td>${matchStats[1].highestTurn}</td><td>${matchStats[2].highestTurn}</td></tr>
        <tr><td>Höchstes Checkout</td><td>${matchStats[1].highestFinish}</td><td>${matchStats[2].highestFinish}</td></tr>
        <tr><td>Shortest Leg</td><td>${p1Shortest}</td><td>${p2Shortest}</td></tr>
        <tr><td>100+ / 140+ / 180er</td><td>${matchStats[1].c100} / ${matchStats[1].c140} / ${matchStats[1].c180}</td><td>${matchStats[2].c100} / ${matchStats[2].c140} / ${matchStats[2].c180}</td></tr>
    `;

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
