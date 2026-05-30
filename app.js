// ==========================================
// NEU: Globaler Fehler-Logger und Debugger
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
    return false; // Erlaubt dem Browser, den Fehler weiterhin im normalen Konsolen-Log anzuzeigen
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

// ... Rest des ursprünglichen app.js Codes bleibt unberührt
