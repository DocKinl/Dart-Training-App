// ==========================================
// Globaler Fehler-Logger und Debugger
// ==========================================
window.onerror = function (message, source, lineno, colno, error) {
    const errorOverlay = document.getElementById('debug-error-overlay');
    const errorText = document.getElementById('debug-error-text');
    
    let filename = source ? source.split('/').pop() : 'Unbekannte Datei';
    let detailedMessage = `Fehler: ${message}\nDatei: ${filename}\nZeile: ${lineno} | Spalte: ${colno}`;
    
    if (error && error.stack) {
        detailedMessage += `\n\nStacktrace:\n${error.stack.split('\n').slice(0, 3).join('\n')}`;
    }
    
    console.error("DocKinl Debugger abgefangen:", detailedMessage);
    
    if (errorOverlay && errorText) {
        errorText.innerText = detailedMessage;
        errorOverlay.classList.remove('hidden');
    } else {
        alert("Kritischer Fehler abgefangen:\n" + detailedMessage);
    }
    return false;
};

// ==========================================
// Globale State-Variablen
// ==========================================
let activeGlobalMode = 'x01';
let initialPoints = 501;
let isTwoPlayers = false;
let isBotMatch = false;
let botLevel = 'medium';
let inputMode = 'segment';
let outMode = 'double';
let isCheckoutHelperActive = true;

let scores = { 1: 501, 2: 501 };
let legs = { 1: 0, 2: 0 };
let sets = { 1: 0, 2: 0 };

let histories = { 1: [], 2: [] };
let activePlayer = 1;
let isLockingInput = false;

let matchStats = {
    1: { totalPoints: 0, totalDarts: 0, first9Points: 0, first9Darts: 0, turns: 0, c100: 0, c140: 0, c180: 0, highestTurn: 0, highestFinish: 0, shortestLeg: 999 },
    2: { totalPoints: 0, totalDarts: 0, first9Points: 0, first9Darts: 0, turns: 0, c100: 0, c140: 0, c180: 0, highestTurn: 0, highestFinish: 0, shortestLeg: 999 }
};
let legDartsCount = { 1: 0, 2: 0 };

let currentVirtualSelectedMultiplier = 1; 
let currentActiveDartSlot = 1; 
let virtualDartData = {
    1: { val: 0, label: "-", rawField: "", m: 1, key: "" },
    2: { val: 0, label: "-", rawField: "", m: 1, key: "" },
    3: { val: 0, label: "-", rawField: "", m: 1, key: "" }
};
let virtualSumValue = 0;

let finAttempts = 0;
let finTargetScore = 0;
let finTypeSetting = 'realistic';

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
    143: ["T20", "T17", "D16"], 142: ["T20", "S14", "D20"], 141: ["T20", "S15", "D18"], 140: ["T20", "T16", "D16"],
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

// ==========================================
// Initialisierung und UI-Events
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    initVoiceSystem();
    initSettingsListeners();
    initMenuSelectionListeners();
    initKeyboardListeners();

    document.getElementById('btn-start-game').addEventListener('click', startMatchRoutine);
    document.getElementById('btn-abort-game').addEventListener('click', abortMatchRoutine);
    document.getElementById('btn-open-stats').addEventListener('click', openStatsModal);
    document.getElementById('btn-clear-stats').addEventListener('click', clearStatsRoutine);

    document.querySelectorAll('.btn-settings-open').forEach(b => {
        b.addEventListener('click', () => document.getElementById('settings-modal').classList.remove('hidden'));
    });
    document.getElementById('btn-settings-close').addEventListener('click', () => {
        document.getElementById('settings-modal').classList.add('hidden');
    });
    document.getElementById('btn-stats-close').addEventListener('click', () => {
        document.getElementById('stats-modal').classList.add('hidden');
    });

    // Slider Listeners
    document.getElementById('input-points-slider').addEventListener('input', (e) => {
        initialPoints = parseInt(e.target.value);
        document.getElementById('points-slider-label').innerText = `Startpunkte: ${initialPoints}`;
    });
    document.getElementById('input-legs-slider').addEventListener('input', (e) => {
        let val = parseInt(e.target.value);
        let needed = Math.ceil(val / 2);
        document.getElementById('legs-slider-label').innerText = `Legs pro Set: Best of ${val} (First to ${needed})`;
    });
    document.getElementById('input-sets-slider').addEventListener('input', (e) => {
        let val = parseInt(e.target.value);
        let needed = Math.ceil(val / 2);
        document.getElementById('sets-slider-label').innerText = `Sets zum Matchgewinn: Best of ${val} (First to ${needed})`;
    });

    document.querySelectorAll('.preview-box').forEach(box => {
        box.addEventListener('click', (e) => {
            currentActiveDartSlot = parseInt(e.target.getAttribute('data-slot'));
            updateDartSlotHighlighting();
        });
    });
});

// ==========================================
// Logik-Funktionen (Auswahl & Start)
// ==========================================
function initMenuSelectionListeners() {
    setupButtonGroup('group-game-mode', (val) => {
        activeGlobalMode = val;
        document.getElementById('options-x01').classList.toggle('hidden', val !== 'x01');
        document.getElementById('options-bot').classList.toggle('hidden', val !== 'x01' || !isBotMatch);
        document.getElementById('wrapper-players').classList.toggle('hidden', val !== 'x01');
        document.getElementById('options-finishing').classList.toggle('hidden', val !== 'fin');
        document.getElementById('options-atc').classList.toggle('hidden', val !== 'atc');
    });

    setupButtonGroup('group-players', (val) => {
        isTwoPlayers = (val === '2');
        isBotMatch = (val === 'bot');
        if(activeGlobalMode === 'x01') {
            document.getElementById('options-bot').classList.toggle('hidden', !isBotMatch);
        }
    });

    setupButtonGroup('group-bot-level', (val) => { botLevel = val; });
    setupButtonGroup('group-input-mode', (val) => { inputMode = val; });
    setupButtonGroup('group-out', (val) => { outMode = val; });
    setupButtonGroup('group-fin-type', (val) => { finTypeSetting = val; });
}

function setupButtonGroup(id, callback) {
    const wrapper = document.getElementById(id);
    if(!wrapper) return;
    wrapper.querySelectorAll('.btn-option').forEach(btn => {
        btn.addEventListener('click', (e) => {
            wrapper.querySelectorAll('.btn-option').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            callback(e.target.getAttribute('data-value'));
        });
    });
}

function startMatchRoutine() {
    document.getElementById('startseite').classList.add('hidden');
    document.getElementById('spielfeld').classList.remove('hidden');

    // UI-Resets für Spieler-Karten
    document.getElementById('card-p2').classList.toggle('hidden', !isTwoPlayers && !isBotMatch);
    if(isBotMatch) {
        document.getElementById('name-p2').innerText = `Computer (${botLevel.toUpperCase()})`;
    } else if(isTwoPlayers) {
        document.getElementById('name-p2').innerText = "Spieler 2";
    }

    // Match-State aufsetzen
    resetEntireMatchStateStructure();
    applyStateToScoreboards();
    toggleKeyboardWrapperViews();
    triggerCheckoutHelperRouteComputation();
    clearInternalDartPreviews();
}

function abortMatchRoutine() {
    if(confirm("Spiel wirklich abbrechen?")) {
        document.getElementById('spielfeld').classList.add('hidden');
        document.getElementById('startseite').classList.remove('hidden');
    }
}

function resetEntireMatchStateStructure() {
    let startScore = (activeGlobalMode === 'x01') ? initialPoints : (activeGlobalMode === 'fin' ? 0 : 0);
    scores[1] = startScore; scores[2] = startScore;
    legs[1] = 0; legs[2] = 0;
    sets[1] = 0; sets[2] = 0;
    histories[1] = []; histories[2] = [];
    activePlayer = 1;
    isLockingInput = false;

    matchStats[1] = { totalPoints: 0, totalDarts: 0, first9Points: 0, first9Darts: 0, turns: 0, c100: 0, c140: 0, c180: 0, highestTurn: 0, highestFinish: 0, shortestLeg: 999 };
    matchStats[2] = { totalPoints: 0, totalDarts: 0, first9Points: 0, first9Darts: 0, turns: 0, c100: 0, c140: 0, c180: 0, highestTurn: 0, highestFinish: 0, shortestLeg: 999 };
    legDartsCount[1] = 0; legDartsCount[2] = 0;

    if(activeGlobalMode === 'fin') {
        generateNextFinishingTarget();
    } else if(activeGlobalMode === 'atc') {
        scores[1] = 1; scores[2] = 1;
    }
}

function toggleKeyboardWrapperViews() {
    document.getElementById('keyboard-segment-wrapper').classList.toggle('hidden', inputMode !== 'segment');
    document.getElementById('keyboard-sum-wrapper').classList.toggle('hidden', inputMode !== 'set');
}

function applyStateToScoreboards() {
    if(activeGlobalMode === 'atc') {
        document.getElementById('score-p1').innerText = getAtcLabel(scores[1]);
        document.getElementById('score-p2').innerText = getAtcLabel(scores[2]);
        document.getElementById('legs-sets-p1').innerText = `Darts: ${matchStats[1].totalDarts}`;
        document.getElementById('legs-sets-p2').innerText = `Darts: ${matchStats[2].totalDarts}`;
    } else if(activeGlobalMode === 'fin') {
        document.getElementById('score-p1').innerText = `Ziel: ${finTargetScore}`;
        document.getElementById('legs-sets-p1').innerText = `Versuch: ${finAttempts}`;
    } else {
        document.getElementById('score-p1').innerText = scores[1];
        document.getElementById('score-p2').innerText = scores[2];
        document.getElementById('legs-sets-p1').innerText = `L: ${legs[1]} | S: ${sets[1]}`;
        document.getElementById('legs-sets-p2').innerText = `L: ${legs[2]} | S: ${sets[2]}`;
    }

    let avg1 = matchStats[1].totalDarts > 0 ? ((matchStats[1].totalPoints / matchStats[1].totalDarts) * 3).toFixed(1) : "0.0";
    let avg2 = matchStats[2].totalDarts > 0 ? ((matchStats[2].totalPoints / matchStats[2].totalDarts) * 3).toFixed(1) : "0.0";
    document.getElementById('avg-p1').innerText = `Ø: ${avg1}`;
    document.getElementById('avg-p2').innerText = `Ø: ${avg2}`;

    document.getElementById('card-p1').classList.toggle('active', activePlayer === 1);
    document.getElementById('card-p2').classList.toggle('active', activePlayer === 2);
    
    renderHistoryTableUI();
}

function getAtcLabel(val) {
    if(val <= 20) return val;
    if(val === 21) return "Bull";
    return "Fertig!";
}

function triggerCheckoutHelperRouteComputation() {
    const field = document.getElementById('checkout-helper-text');
    if(!isCheckoutHelperActive || activeGlobalMode !== 'x01') {
        field.innerText = ""; return;
    }
    let currentScore = scores[activePlayer];
    if(outMode === 'double' && currentScore > 170) { field.innerText = ""; return; }
    if(outMode === 'double' && invalidFinishes.includes(currentScore)) { field.innerText = "Kein Finish möglich"; return; }
    
    if(outMode === 'single' && currentScore <= 60) {
        if(currentScore <= 20) { field.innerText = `S${currentScore}`; return; }
        if(currentScore === 50) { field.innerText = "Bullseye"; return; }
        if(currentScore === 25) { field.innerText = "Outer Bull"; return; }
        for(let i=20; i>=1; i--) {
            if(currentScore % i === 0 && currentScore / i <= 3) {
                let prefix = currentScore / i === 3 ? "T" : "D";
                field.innerText = `${prefix}${i}`; return;
            }
        }
    }

    if(checkoutRoutes[currentScore]) {
        field.innerText = "Weg: " + checkoutRoutes[currentScore].join(" -> ");
    } else {
        field.innerText = "";
    }
}

// ==========================================
// Keyboard Event-Handler Logik
// ==========================================
function initKeyboardListeners() {
    // Segment Eingabe Modifikatoren
    document.getElementById('btn-mod-double').addEventListener('click', () => toggleModifierStateRule(2, 'btn-mod-double'));
    document.getElementById('btn-mod-triple').addEventListener('click', () => toggleModifierStateRule(3, 'btn-mod-triple'));
    
    document.querySelectorAll('.num-key').forEach(btn => {
        btn.addEventListener('click', (e) => {
            let baseVal = parseInt(e.target.getAttribute('data-val'));
            handleSegmentKeyInputClick(baseVal);
        });
    });

    document.querySelectorAll('.shortcut').forEach(btn => {
        btn.addEventListener('click', (e) => {
            let val = parseInt(e.target.getAttribute('data-val'));
            handleShortcutDirectInject(val);
        });
    });

    document.getElementById('btn-clear-segment').addEventListener('click', clearCurrentSelectedDartPreviewSlot);
    document.getElementById('btn-submit-segment').addEventListener('click', submitSegmentTurnToStatePipeline);

    // Summen-Tastatur
    document.querySelectorAll('.sum-num').forEach(btn => {
        btn.addEventListener('click', (e) => {
            let digit = e.target.getAttribute('data-val');
            let currentStr = virtualSumValue.toString();
            if(currentStr === "0") currentStr = "";
            if((currentStr + digit).length <= 3) {
                virtualSumValue = parseInt(currentStr + digit) || 0;
                document.getElementById('sum-display').innerText = virtualSumValue;
            }
        });
    });

    document.getElementById('btn-clear-sum').addEventListener('click', () => {
        virtualSumValue = 0;
        document.getElementById('sum-display').innerText = 0;
    });

    document.getElementById('btn-submit-sum').addEventListener('click', submitSumTurnToStatePipeline);
}

function toggleModifierStateRule(mult, id) {
    if(currentVirtualSelectedMultiplier === mult) {
        currentVirtualSelectedMultiplier = 1;
        document.getElementById(id).classList.remove('active');
    } else {
        currentVirtualSelectedMultiplier = mult;
        document.getElementById('btn-mod-double').classList.toggle('active', mult === 2);
        document.getElementById('btn-mod-triple').classList.toggle('active', mult === 3);
    }
}

function handleSegmentKeyInputClick(baseVal) {
    if(isLockingInput) return;
    document.getElementById('error-field').innerText = "";

    let m = currentVirtualSelectedMultiplier;
    if(baseVal === 25 && m === 3) {
        document.getElementById('error-field').innerText = "Triple Bull existiert nicht!";
        return;
    }

    let calculatedValue = baseVal * m;
    let label = (m === 2 ? "D" : (m === 3 ? "T" : "S")) + (baseVal === 25 ? "Bull" : baseVal);
    if(baseVal === 25 && m === 2) label = "Bullseye";

    virtualDartData[currentActiveDartSlot] = {
        val: calculatedValue,
        label: label,
        rawField: label,
        m: m,
        key: baseVal
    };

    updateDartPreviewBoxesUI();
    currentVirtualSelectedMultiplier = 1;
    document.getElementById('btn-mod-double').classList.remove('active');
    document.getElementById('btn-mod-triple').classList.remove('active');

    if(currentActiveDartSlot < 3) {
        currentActiveDartSlot++;
    }
    updateDartSlotHighlighting();
}

function handleShortcutDirectInject(val) {
    if(isLockingInput) return;
    document.getElementById('error-field').innerText = "";
    
    if(val === 0) {
        virtualDartData = {
            1: { val: 0, label: "0", rawField: "0", m: 1 },
            2: { val: 0, label: "0", rawField: "0", m: 1 },
            3: { val: 0, label: "0", rawField: "0", m: 1 }
        };
    } else if(val === 26) {
        virtualDartData = {
            1: { val: 5, label: "S5", m: 1 },
            2: { val: 1, label: "S1", m: 1 },
            3: { val: 20, label: "D10", m: 2 }
        };
    } else if(val === 41) {
        virtualDartData = {
            1: { val: 20, label: "S20", m: 1 },
            2: { val: 1, label: "S1", m: 1 },
            3: { val: 20, label: "S20", m: 1 }
        };
    } else if(val === 60) {
        virtualDartData = {
            1: { val: 20, label: "S20", m: 1 },
            2: { val: 20, label: "S20", m: 1 },
            3: { val: 20, label: "S20", m: 1 }
        };
    } else if(val === 100) {
        virtualDartData = {
            1: { val: 60, label: "T20", m: 3 },
            2: { val: 20, label: "S20", m: 1 },
            3: { val: 20, label: "S20", m: 1 }
        };
    }
    updateDartPreviewBoxesUI();
    currentActiveDartSlot = 3;
    updateDartSlotHighlighting();
}

function clearCurrentSelectedDartPreviewSlot() {
    virtualDartData[currentActiveDartSlot] = { val: 0, label: "-", rawField: "", m: 1, key: "" };
    updateDartPreviewBoxesUI();
}

function updateDartPreviewBoxesUI() {
    for(let i=1; i<=3; i++) {
        document.getElementById(`dart-preview-${i}`).innerText = virtualDartData[i].label;
    }
}

function updateDartSlotHighlighting() {
    for(let i=1; i<=3; i++) {
        document.getElementById(`dart-preview-${i}`).classList.toggle('active-slot', currentActiveDartSlot === i);
    }
}

function clearInternalDartPreviews() {
    virtualDartData = {
        1: { val: 0, label: "-", rawField: "", m: 1 },
        2: { val: 0, label: "-", rawField: "", m: 1 },
        3: { val: 0, label: "-", rawField: "", m: 1 }
    };
    currentActiveDartSlot = 1;
    updateDartPreviewBoxesUI();
    updateDartSlotHighlighting();
}

// ==========================================
// Logik-Kernkomponenten (Datenübermittlung)
// ==========================================
function submitSegmentTurnToStatePipeline() {
    if(isLockingInput) return;
    
    let sum = virtualDartData[1].val + virtualDartData[2].val + virtualDartData[3].val;
    let validDartsThrownCount = 0;
    if(virtualDartData[1].label !== "-") validDartsThrownCount++;
    if(virtualDartData[2].label !== "-") validDartsThrownCount++;
    if(virtualDartData[3].label !== "-") validDartsThrownCount++;

    if(validDartsThrownCount === 0) {
        document.getElementById('error-field').innerText = "Trage mindestens einen Dart ein!";
        return;
    }

    if(activeGlobalMode === 'atc') {
        processAtcSegmentTurn(validDartsThrownCount);
        return;
    } else if(activeGlobalMode === 'fin') {
        processFinishingSegmentTurn(sum, validDartsThrownCount);
        return;
    }

    // Standard X01 Regelprüfung
    let currentScore = scores[activePlayer];
    let remaining = currentScore - sum;
    let isBust = false;
    let usedDartsThisTurn = validDartsThrownCount;

    // Spezifische Prüfung für Checkout-Busts
    let runningScore = currentScore;
    for(let i=1; i<=3; i++) {
        let dart = virtualDartData[i];
        if(dart.label === "-") continue;
        runningScore -= dart.val;
        
        if(runningScore < 0 || runningScore === 1 || (outMode === 'double' && runningScore === 0 && dart.m !== 2)) {
            isBust = true;
            usedDartsThisTurn = i;
            break;
        }
        if(runningScore === 0) {
            usedDartsThisTurn = i;
            break;
        }
    }

    if(isBust) {
        speakPhraseSystem(currentTheme === 'dark' ? "Busted!" : "Überworfen!");
        histories[activePlayer].push({ turnScore: 0, label: "Bust", darts: usedDartsThisTurn });
        matchStats[activePlayer].totalDarts += usedDartsThisTurn;
        legDartsCount[activePlayer] += usedDartsThisTurn;
        matchStats[activePlayer].turns++;
        switchActivePlayerSequence();
        return;
    }

    // Valider Wurf verarbeiten
    scores[activePlayer] = remaining;
    histories[activePlayer].push({ turnScore: sum, label: sum.toString(), darts: usedDartsThisTurn });
    
    // Stats füttern
    matchStats[activePlayer].totalPoints += sum;
    matchStats[activePlayer].totalDarts += usedDartsThisTurn;
    legDartsCount[activePlayer] += usedDartsThisTurn;
    if(matchStats[activePlayer].turns < 3) {
        matchStats[activePlayer].first9Points += sum;
        matchStats[activePlayer].first9Darts += usedDartsThisTurn;
    }
    matchStats[activePlayer].turns++;
    
    if(sum >= 100 && sum < 140) matchStats[activePlayer].c100++;
    if(sum >= 140 && sum < 180) matchStats[activePlayer].c140++;
    if(sum === 180) matchStats[activePlayer].c180++;
    if(sum > matchStats[activePlayer].highestTurn) matchStats[activePlayer].highestTurn = sum;

    speakPhraseSystem(sum.toString());

    if(scores[activePlayer] === 0) {
        handleLegWinSequence();
    } else {
        switchActivePlayerSequence();
    }
}

function submitSumTurnToStatePipeline() {
    if(isLockingInput) return;
    document.getElementById('error-field').innerText = "";

    if(impossibleScores.includes(virtualSumValue) || virtualSumValue > 180) {
        document.getElementById('error-field').innerText = "Ungültige Darts-Summe!";
        return;
    }

    let currentScore = scores[activePlayer];
    let remaining = currentScore - virtualSumValue;

    if(remaining < 0 || remaining === 1 || (outMode === 'double' && remaining === 0)) {
        speakPhraseSystem("Busted");
        histories[activePlayer].push({ turnScore: 0, label: "Bust", darts: 3 });
        matchStats[activePlayer].totalDarts += 3;
        legDartsCount[activePlayer] += 3;
        matchStats[activePlayer].turns++;
        virtualSumValue = 0;
        document.getElementById('sum-display').innerText = 0;
        switchActivePlayerSequence();
        return;
    }

    scores[activePlayer] = remaining;
    histories[activePlayer].push({ turnScore: virtualSumValue, label: virtualSumValue.toString(), darts: 3 });
    
    matchStats[activePlayer].totalPoints += virtualSumValue;
    matchStats[activePlayer].totalDarts += 3;
    legDartsCount[activePlayer] += 3;
    matchStats[activePlayer].turns++;

    if(virtualSumValue >= 100 && virtualSumValue < 140) matchStats[activePlayer].c100++;
    if(virtualSumValue >= 140 && virtualSumValue < 180) matchStats[activePlayer].c140++;
    if(virtualSumValue === 180) matchStats[activePlayer].c180++;
    if(virtualSumValue > matchStats[activePlayer].highestTurn) matchStats[activePlayer].highestTurn = virtualSumValue;

    speakPhraseSystem(virtualSumValue.toString());

    virtualSumValue = 0;
    document.getElementById('sum-display').innerText = 0;

    if(scores[activePlayer] === 0) {
        handleLegWinSequence();
    } else {
        switchActivePlayerSequence();
    }
}

// ==========================================
// ATC- & Finishing-Modus Extralogik
// ==========================================
function processAtcSegmentTurn(thrownCount) {
    let target = scores[1]; 
    let advanced = false;

    for(let i=1; i<=3; i++) {
        let dart = virtualDartData[i];
        if(dart.label === "-") continue;
        
        let isHit = false;
        if(target <= 20) {
            isHit = (dart.key === target);
        } else if(target === 21) {
            isHit = (dart.key === 25);
        }

        if(isHit) {
            target++;
            advanced = true;
            if(target > 21) break;
        }
    }

    scores[1] = target;
    matchStats[1].totalDarts += thrownCount;
    histories[1].push({ turnScore: target, label: advanced ? `-> ${getAtcLabel(target)}` : "No Hit", darts: thrownCount });

    if(scores[1] > 21) {
        speakPhraseSystem("Match gefinisht");
        alert(`Glückwunsch! ATC beendet in ${matchStats[1].totalDarts} Darts.`);
        document.getElementById('spielfeld').classList.add('hidden');
        document.getElementById('startseite').classList.remove('hidden');
    } else {
        clearInternalDartPreviews();
        applyStateToScoreboards();
    }
}

function processFinishingSegmentTurn(sum, thrownCount) {
    let dart3 = virtualDartData[3];
    let dart2 = virtualDartData[2];
    let dart1 = virtualDartData[1];
    
    let lastValidDart = dart3.label !== "-" ? dart3 : (dart2.label !== "-" ? dart2 : dart1);
    let checkoutSuccess = (sum === finTargetScore && lastValidDart.m === 2);

    matchStats[1].totalDarts += thrownCount;
    
    if(checkoutSuccess) {
        speakPhraseSystem("Checkout");
        histories[1].push({ turnScore: sum, label: `Co ${finTargetScore}`, darts: thrownCount });
        alert(`Target ${finTargetScore} gecheckt mit ${thrownCount} Darts!`);
        generateNextFinishingTarget();
    } else {
        speakPhraseSystem("No Finish");
        histories[1].push({ turnScore: sum, label: `X (${finTargetScore})`, darts: thrownCount });
        finAttempts++;
        if(finAttempts >= 3) {
            alert(`Target fehlgeschlagen. Das richtige Finish wäre gewesen: ${checkoutRoutes[finTargetScore] ? checkoutRoutes[finTargetScore].join(" ") : "Individuell"}`);
            generateNextFinishingTarget();
        }
    }
    clearInternalDartPreviews();
    applyStateToScoreboards();
}

function generateNextFinishingTarget() {
    finAttempts = 0;
    if(finTypeSetting === 'random') {
        finTargetScore = Math.floor(Math.random() * 169) + 2;
        while(invalidFinishes.includes(finTargetScore)) {
            finTargetScore = Math.floor(Math.random() * 169) + 2;
        }
    } else {
        let keys = Object.keys(checkoutRoutes).map(Number);
        finTargetScore = keys[Math.floor(Math.random() * keys.length)];
    }
}

// ==========================================
// Spielflusssteuerung (Spielerwechsel, Bot, Leg-Gewinn)
// ==========================================
function switchActivePlayerSequence() {
    clearInternalDartPreviews();
    
    if(isBotMatch && activePlayer === 1) {
        activePlayer = 2;
        applyStateToScoreboards();
        executeBotTurnCalculationAutomation();
    } else if(isTwoPlayers) {
        activePlayer = activePlayer === 1 ? 2 : 1;
        applyStateToScoreboards();
        triggerCheckoutHelperRouteComputation();
    } else {
        applyStateToScoreboards();
        triggerCheckoutHelperRouteComputation();
    }
}

function executeBotTurnCalculationAutomation() {
    isLockingInput = true;
    setTimeout(() => {
        let botScore = scores[2];
        let botDartAvg = 45; 
        if(botLevel === 'easy') botDartAvg = 35;
        if(botLevel === 'strong') botDartAvg = 65;
        if(botLevel === 'insane') botDartAvg = 85;

        let turnSum = 0;
        let dartsThrown = 3;

        if(botScore <= 170 && !invalidFinishes.includes(botScore)) {
            let checkoutChance = 0.1;
            if(botLevel === 'medium') checkoutChance = 0.25;
            if(botLevel === 'strong') checkoutChance = 0.45;
            if(botLevel === 'insane') checkoutChance = 0.75;

            if(Math.random() < checkoutChance) {
                turnSum = botScore;
                dartsThrown = Math.floor(Math.random() * 3) + 1;
            } else {
                turnSum = Math.min(botScore - 2, Math.floor(generateRandomNormalDistributionValue(botDartAvg, 15)));
            }
        } else {
            turnSum = Math.floor(generateRandomNormalDistributionValue(botDartAvg, 12));
        }

        if(turnSum > 180 || impossibleScores.includes(turnSum)) turnSum = 60;
        if(turnSum < 0) turnSum = 0;

        let remaining = botScore - turnSum;
        if(remaining < 0 || remaining === 1 || (outMode === 'double' && remaining === 0 && turnSum !== botScore)) {
            histories[2].push({ turnScore: 0, label: "Bust", darts: 3 });
            matchStats[2].totalDarts += 3;
            legDartsCount[2] += 3;
            matchStats[2].turns++;
            speakPhraseSystem("Busted");
        } else {
            scores[2] = remaining;
            histories[2].push({ turnScore: turnSum, label: turnSum.toString(), darts: dartsThrown });
            matchStats[2].totalPoints += turnSum;
            matchStats[2].totalDarts += dartsThrown;
            legDartsCount[2] += dartsThrown;
            matchStats[2].turns++;
            speakPhraseSystem(turnSum.toString());
        }

        isLockingInput = false;
        activePlayer = 1;

        if(scores[2] === 0) {
            handleLegWinSequence();
        } else {
            applyStateToScoreboards();
            triggerCheckoutHelperRouteComputation();
        }
    }, 1200);
}

function generateRandomNormalDistributionValue(mean, stdDev) {
    let u1 = Math.random(); let u2 = Math.random();
    let randStdNormal = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
    return mean + stdDev * randStdNormal;
}

function handleLegWinSequence() {
    speakPhraseSystem("Game Shot");
    legs[activePlayer]++;
    
    if(legDartsCount[activePlayer] < matchStats[activePlayer].shortestLeg) {
        matchStats[activePlayer].shortestLeg = legDartsCount[activePlayer];
    }

    let targetLegs = parseInt(document.getElementById('input-legs-slider').value);
    let neededLegs = Math.ceil(targetLegs / 2);

    if(legs[activePlayer] >= neededLegs) {
        legs[1] = 0; legs[2] = 0;
        sets[activePlayer]++;
        
        let targetSets = parseInt(document.getElementById('input-sets-slider').value);
        let neededSets = Math.ceil(targetSets / 2);

        if(sets[activePlayer] >= neededSets) {
            executeMatchEndVictorySequence();
            return;
        }
    }

    alert(`Game Shot und Leg für Spieler ${activePlayer}!`);
    scores[1] = initialPoints; scores[2] = initialPoints;
    legDartsCount[1] = 0; legDartsCount[2] = 0;
    
    // Wer fängt an? Abwechselnd
    let totalLegsPlayed = sets[1] + sets[2] + legs[1] + legs[2];
    activePlayer = (totalLegsPlayed % 2 === 0) ? 1 : (isTwoPlayers || isBotMatch ? 2 : 1);

    clearInternalDartPreviews();
    applyStateToScoreboards();
    triggerCheckoutHelperRouteComputation();
    
    if(isBotMatch && activePlayer === 2) {
        executeBotTurnCalculationAutomation();
    }
}

function executeMatchEndVictorySequence() {
    let finalAvg = matchStats[1].totalDarts > 0 ? ((matchStats[1].totalPoints / matchStats[1].totalDarts) * 3) : 0;
    saveMatchToLocalStorage(finalAvg, matchStats[1].highestTurn, matchStats[1].highestFinish, matchStats[1].c180);
    
    alert(`Spiel vorbei! Spieler ${activePlayer} gewinnt das Match!`);
    document.getElementById('spielfeld').classList.add('hidden');
    document.getElementById('startseite').classList.remove('hidden');
}

// ==========================================
// UI Rendering Komponenten (Tabellen, Stats)
// ==========================================
function renderHistoryTableUI() {
    const tbody = document.getElementById('history-tbody');
    tbody.innerHTML = "";
    
    let len = Math.max(histories[1].length, histories[2].length);
    for(let i = len - 1; i >= 0; i--) {
        let tr = document.createElement('tr');
        let td1 = document.createElement('td');
        let td2 = document.createElement('td');
        
        td1.innerText = histories[1][i] ? histories[1][i].label : "-";
        td2.innerText = histories[2][i] ? histories[2][i].label : "-";
        
        tr.appendChild(td1);
        tr.appendChild(td2);
        tbody.appendChild(tr);
    }
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

function clearStatsRoutine() {
    if(confirm("Alle Allzeit-Statistiken unwiderruflich löschen?")) {
        localStorage.removeItem('docKinl_dart_stats');
        openStatsModal();
    }
}

// ==========================================
// Sound-, Theme- & Sprachausgabesystem
// ==========================================
let synth = window.speechSynthesis;
let voices = [];
let selectedVoice = null;

function initVoiceSystem() {
    if(!synth) return;
    setupVoiceOptionsList();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = setupVoiceOptionsList;
    }

    document.getElementById('lang-select').addEventListener('change', setupVoiceOptionsList);
    document.getElementById('voice-select').addEventListener('change', (e) => {
        let uri = e.target.value;
        selectedVoice = voices.find(v => v.voiceURI === uri);
    });
}

function setupVoiceOptionsList() {
    if(!synth) return;
    voices = synth.getVoices();
    let select = document.getElementById('voice-select');
    let lang = document.getElementById('lang-select').value;
    
    select.innerHTML = "";
    let filtered = voices.filter(v => v.lang.startsWith(lang.split('-')[0]));
    
    filtered.forEach(v => {
        let opt = document.createElement('option');
        opt.value = v.voiceURI;
        opt.innerText = `${v.name} (${v.lang})`;
        select.appendChild(opt);
    });

    if(filtered.length > 0) {
        selectedVoice = filtered[0];
    }
}

function speakPhraseSystem(text) {
    if(!isSpeechOutputActive || !synth) return;
    synth.cancel();
    let utterance = new SpeechSynthesisUtterance(text);
    if(selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = 1.1;
    synth.speak(utterance);
}

function initSettingsListeners() {
    setupButtonGroup('group-theme', (val) => {
        currentTheme = val;
        document.body.classList.toggle('light-theme', val === 'light');
    });

    setupButtonGroup('group-speech', (val) => {
        isSpeechOutputActive = (val === 'on');
        document.getElementById('wrapper-voice-settings').classList.toggle('hidden', val === 'off');
    });

    setupButtonGroup('group-checkout-helper', (val) => {
        isCheckoutHelperActive = (val === 'on');
    });
}
