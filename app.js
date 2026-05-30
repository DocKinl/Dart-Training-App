// Globale State-Variablen
let activeGlobalMode = 'x01';
let initialPoints = 501;
let isTwoPlayers = false;
let inputMode = 'segment';
let outMode = 'double';
let scores = { 1: 501, 2: 501 };
let histories = { 1: [], 2: [] };
let activePlayer = 1;
let isLockingInput = false;
let currentMultipliers = { 1: 1, 2: 1, 3: 1 };

// Finishing Variablen
let finAttempts = 0;
let finTargetScore = 0;
let finTypeSetting = 'realistic';

// System-Optionen (Standardwerte)
let isSpeechOutputActive = true;
let isSpeechInputActive = false;
let currentTheme = 'dark';

// Dartboard-Konstanten
const sectors = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
const invalidFinishes = [169, 168, 166, 165, 163, 162, 159];

// Voice API Variablen
let recognition = null;
let selectedVoice = null;
let currentLanguageCode = 'de-DE';

// App-Initialisierung
document.addEventListener("DOMContentLoaded", () => {
    initEventListeners();
    drawLiveBoard();
    initVoices();
});

// Fallback für späte Event-Zuweisung
setTimeout(() => {
    initEventListeners();
    drawLiveBoard();
    initVoices();
}, 500);

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
        option.textContent = "Keine passende Hardware-Stimme gefunden";
        option.value = "";
        voiceSelect.appendChild(option);
        selectedVoice = null;
        return;
    }

    let autoSelectedVoice = filteredVoices.find(v => 
        v.name.toLowerCase().includes('male') || 
        v.name.toLowerCase().includes('mark') || 
        v.name.toLowerCase().includes('stefan') ||
        v.name.toLowerCase().includes('david') ||
        (selectedLangPref === 'de' && !v.name.toLowerCase().includes('hedda'))
    ) || filteredVoices[0];

    filteredVoices.forEach((voice) => {
        let option = document.createElement('option');
        option.textContent = `${voice.name} (${voice.lang})`;
        option.value = voice.name;
        
        if (voice.name === autoSelectedVoice.name) {
            option.selected = true;
            selectedVoice = voice;
        }
        voiceSelect.appendChild(option);
    });
}

function initEventListeners() {
    // Modal-Steuerung (Zahnrad)
    document.querySelectorAll('.btn-settings-open').forEach(btn => {
        btn.onclick = () => { document.getElementById('settings-modal').classList.remove('hidden'); };
    });
    document.getElementById('btn-settings-close').onclick = () => {
        document.getElementById('settings-modal').classList.add('hidden');
    };

    // Theme-Umschaltung
    setupGroupListeners('group-theme-select', (val, btn) => {
        selectOption('group-theme-select', btn);
        currentTheme = val;
        if(val === 'light') document.body.classList.add('light-theme');
        else document.body.classList.remove('light-theme');
    });

    // Sprachausgabe Toggle (Ja/Nein)
    setupGroupListeners('group-toggle-tts', (val, btn) => {
        selectOption('group-toggle-tts', btn);
        isSpeechOutputActive = (val === 'true');
        const subMenu = document.getElementById('sub-voice-settings');
        if(isSpeechOutputActive) subMenu.classList.remove('hidden');
        else subMenu.classList.add('hidden');
    });

    // Spracheingabe Toggle (Ja/Nein)
    setupGroupListeners('group-toggle-stt', (val, btn) => {
        selectOption('group-toggle-stt', btn);
        setSpeechInputState(val === 'true');
    });

    const langSelect = document.getElementById('voice-lang-select');
    if (langSelect) {
        langSelect.onchange = () => {
            initVoices();
            if (recognition) recognition.lang = langSelect.value === 'de' ? 'de-DE' : 'en-US';
        };
    }

    const voiceSelect = document.getElementById('voice-select');
    if (voiceSelect) {
        voiceSelect.onchange = function() {
            let voices = speechSynthesis.getVoices();
            selectedVoice = voices.find(v => v.name === this.value);
            speak(langSelect.value === 'de' ? "Stimme gewechselt" : "Voice changed");
        };
    }

    // Setup der Core-Game Buttons
    setupGroupListeners('group-game-mode', (val, btn) => changeGameMode(val, btn));
    setupGroupListeners('group-players', (val, btn) => selectOption('group-players', btn));
    setupGroupListeners('group-input-mode', (val, btn) => selectOption('group-input-mode', btn));
    setupGroupListeners('group-points', (val, btn) => selectOption('group-points', btn));
    setupGroupListeners('group-out', (val, btn) => selectOption('group-out', btn));
    setupGroupListeners('group-fin-type', (val, btn) => changeFinishingType(val, btn));
    setupGroupListeners('group-fin-range', (val, btn) => selectOption('group-fin-range', btn));
    setupGroupListeners('group-atc-bonus', (val, btn) => selectOption('group-atc-bonus', btn));
    setupGroupListeners('group-sod-darts', (val, btn) => selectOption('group-sod-darts', btn));
    setupGroupListeners('group-sod-ring', (val, btn) => selectOption('group-sod-ring', btn));

    for (let slot = 1; slot <= 3; slot++) {
        for (let mult = 1; mult <= 3; mult++) {
            let el = document.getElementById(`m${slot}-${mult}`);
            if(el) el.onclick = () => setMultiplier(slot, mult);
        }
    }

    document.getElementById('btn-start-game').onclick = startGame;
    document.getElementById('btn-abort-game').onclick = abortGame;
    document.getElementById('submit-btn').onclick = submitScore;
    document.getElementById('btn-reset-game').onclick = resetGame;

    document.getElementById('seg-1').oninput = function() { handleSegmentAutoJump(this, 'seg-2', 1); };
    document.getElementById('seg-2').oninput = function() { handleSegmentAutoJump(this, 'seg-3', 2); };
    document.getElementById('seg-3').oninput = function() { handleSegmentAutoJump(this, null, 3); };
}

function setupGroupListeners(groupId, callback) {
    const container = document.getElementById(groupId);
    if (!container) return;
    const buttons = container.querySelectorAll('.btn-option');
    buttons.forEach(btn => {
        btn.onclick = function() {
            let val = this.getAttribute('data-value');
            callback(val, this);
        };
    });
}

function changeFinishingType(val, btn) {
    selectOption('group-fin-type', btn);
    const rangeWrapper = document.getElementById('group-fin-range').closest('.form-group');
    if (val === 'strict') rangeWrapper.classList.add('hidden'); 
    else rangeWrapper.classList.remove('hidden');
}

function selectOption(groupId, element) {
    const buttons = document.querySelectorAll(`#${groupId} .btn-option`);
    buttons.forEach(btn => btn.classList.remove('active'));
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

    if (mode === 'x01') document.getElementById('options-x01').classList.remove('hidden');
    else if (mode === 'fin') {
        document.getElementById('options-fin').classList.remove('hidden');
        document.getElementById('wrapper-players').classList.add('hidden'); 
        changeFinishingType(getSelectedValue('group-fin-type'), document.querySelector('#group-fin-type .btn-option.active'));
    }
    else if (mode === 'atc') document.getElementById('options-atc').classList.remove('hidden');
    else if (mode === 'sod') {
        document.getElementById('options-sod').classList.remove('hidden');
        document.getElementById('wrapper-players').classList.add('hidden');
    }
}

// SPRACHAUSGABE (TTS)
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
            let text = isEn ? "Remaining " + rest : "Rest " + rest;
            let restUtterance = new SpeechSynthesisUtterance(text);
            restUtterance.lang = currentLanguageCode;
            if (selectedVoice) restUtterance.voice = selectedVoice;
            window.speechSynthesis.speak(restUtterance);
        } else if (typeof rest === 'string') {
            let textUtterance = new SpeechSynthesisUtterance(rest);
            textUtterance.lang = currentLanguageCode;
            if (selectedVoice) textUtterance.voice = selectedVoice;
            window.speechSynthesis.speak(textUtterance);
        }
    };
    window.speechSynthesis.speak(scoreUtterance);
}

// SPEECH INPUT LOGIK (STEUERUNG)
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'de-DE';
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onstart = () => { document.getElementById('icon-listening-modal').classList.add('listening'); };
    recognition.onend = () => {
        if (isSpeechInputActive) recognition.start(); 
        else document.getElementById('icon-listening-modal').classList.remove('listening');
    };
    recognition.onresult = (event) => {
        let resultText = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
        verarbeiteSprachBefehl(resultText);
    };
}

function setSpeechInputState(activate) {
    if (!recognition) {
        alert("Spracherkennung wird auf diesem Browser nicht unterstützt.");
        return;
    }
    isSpeechInputActive = activate;
    if (isSpeechInputActive) {
        try { recognition.start(); } catch(e){}
    } else {
        recognition.stop();
        document.getElementById('icon-listening-modal').classList.remove('listening');
    }
}

function verarbeiteSprachBefehl(phrase) {
    if (document.getElementById('spielseite').classList.contains('hidden') || isLockingInput) return;
    phrase = phrase.replace("dreifach", "triple").replace("doppel", "double").replace("drei", "3");

    let targetSlot = 1;
    if (document.getElementById('seg-1').value !== "") targetSlot = 2;
    if (document.getElementById('seg-2').value !== "") targetSlot = 3;
    if (document.getElementById('seg-3').value !== "") return; 

    let mult = 1; let field = "";
    if (phrase.includes("triple") || phrase.includes("treble")) mult = 3;
    else if (phrase.includes("double")) mult = 2;

    let matchZahl = phrase.match(/\d+/);
    if (matchZahl) field = matchZahl[0];
    else if (phrase.includes("double bull")) { mult = 2; field = "bull"; }
    else if (phrase.includes("bull")) { mult = 1; field = "bull"; }
    else if (phrase.includes("kein treffer") || phrase.includes("null") || phrase.includes("miss")) { field = "0"; mult = 1; }

    if (field !== "") {
        setMultiplier(targetSlot, mult);
        let inputField = document.getElementById(`seg-${targetSlot}`);
        inputField.value = field;
        handleSegmentAutoJump(inputField, targetSlot < 3 ? `seg-${targetSlot+1}` : null, targetSlot);
    }
}

function setMultiplier(dartNum, multValue) {
    if (isLockingInput) return;
    currentMultipliers[dartNum] = multValue;
    for (let i = 1; i <= 3; i++) document.getElementById(`m${dartNum}-${i}`).classList.remove('active');
    document.getElementById(`m${dartNum}-${multValue}`).classList.add('active');
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
    if (range === 'mid') { min = 41; max = 100; }
    else if (range === 'high') { min = 101; max = 170; }
    else if (range === 'all') { min = 2; max = 170; }

    let target;
    do {
        target = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (invalidFinishes.includes(target));
    return target;
}

function startGame() {
    isTwoPlayers = getSelectedValue('group-players') === "2" && activeGlobalMode !== 'sod' && activeGlobalMode !== 'fin';
    inputMode = (activeGlobalMode === 'x01') ? getSelectedValue('group-input-mode') : 'segment';

    document.getElementById('set-input-container').classList.add('hidden');
    document.getElementById('segment-input-container').classList.add('hidden');
    document.getElementById('p1-sub').classList.add('hidden');
    document.getElementById('p1-title').innerText = "Spieler 1";
    document.getElementById('h1-header').innerText = "Verlauf S1";

    if (activeGlobalMode === 'x01') {
        initialPoints = parseInt(getSelectedValue('group-points'));
        scores[1] = initialPoints; scores[2] = initialPoints;
        document.getElementById('game-title').innerText = `${initialPoints}er X01 Match`;
        if (inputMode === 'set') document.getElementById('set-input-container').classList.remove('hidden');
        else document.getElementById('segment-input-container').classList.remove('hidden');
    } else if (activeGlobalMode === 'fin') {
        finAttempts = 0;
        finTypeSetting = getSelectedValue('group-fin-type'); 
        finTargetScore = generateRandomFinish();
        scores[1] = finTargetScore;
        
        let typeLabel = finTypeSetting === 'strict' ? 'Exakt (Best of 3)' : 'Realistisch';
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
        document.getElementById('game-title').innerText = `Set of Darts (SOD)`;
        document.getElementById('segment-input-container').classList.remove('hidden');
    }

    histories[1] = []; histories[2] = []; activePlayer = 1; isLockingInput = false;
    document.getElementById('p1-score').innerText = scores[1];
    document.getElementById('p2-score').innerText = scores[2];
    document.getElementById('p1-history-list').innerHTML = "";
    document.getElementById('p2-history-list').innerHTML = "";
    document.getElementById('p1-card').classList.add('active');
    document.getElementById('p2-card').classList.remove('active');

    if (isTwoPlayers) {
        document.getElementById('p2-card').classList.remove('hidden');
        document.getElementById('p2-history-box').classList.remove('hidden');
    } else {
        document.getElementById('p2-card').classList.add('hidden');
        document.getElementById('p2-history-box').classList.add('hidden');
    }

    clearInputFields();
    document.getElementById('startseite').classList.add('hidden');
    document.getElementById('spielseite').classList.remove('hidden');
    
    if(activeGlobalMode === 'fin') {
        let isEn = currentLanguageCode.startsWith('en');
        speak(isEn ? "Your target is " + finTargetScore : "Dein Ziel ist " + finTargetScore);
    }
}

function abortGame() {
    if (confirm("Spiel wirklich abbrechen?")) {
        document.getElementById('spielseite').classList.add('hidden');
        document.getElementById('startseite').classList.remove('hidden');
    }
}

function clearInputFields() {
    document.getElementById('darts-input-set').value = "";
    document.getElementById('seg-1').value = ""; document.getElementById('seg-2').value = ""; document.getElementById('seg-3').value = "";
    setMultiplier(1, 1); setMultiplier(2, 1); setMultiplier(3, 1);
    drawLiveBoard();
}

function parseSegmentData(fieldRaw, mult) {
    let clean = fieldRaw.trim().toLowerCase();
    if (clean === "" || clean === "0") return { val: 0, label: "0" };
    if (clean === "bull" || clean === "25" || clean === "b") {
        if (mult === 2) return { val: 50, label: "D-Bull", key: "d-bull", base: "bull", m: 2 };
        return { val: 25, label: "Bull", key: "bull", base: "bull", m: 1 };
    }
    let num = parseInt(clean);
    if (isNaN(num) || num < 1 || num > 20) return null;
    if (mult === 3) return { val: num * 3, label: `T${num}`, key: `T${num}`, base: num.toString(), m: 3 };
    if (mult === 2) return { val: num * 2, label: `D${num}`, key: `D${num}`, base: num.toString(), m: 2 };
    return { val: num, label: `S${num}`, key: `S${num}`, base: num.toString(), m: 1 };
}

function handleBustProcess(currentScore, scoredPoints, originalDetails) {
    let isEn = currentLanguageCode.startsWith('en');
    let text = isEn ? "Bust!" : "Überworfen!";
    
    document.getElementById('error-message').innerText = text;
    speak(text);
    
    if (activeGlobalMode === 'fin') {
        finAttempts++;
        addHistoryEntry(1, scoredPoints, finTargetScore, originalDetails, true);
        scores[1] = finTargetScore; 
        document.getElementById('p1-score').innerText = scores[1];
        document.getElementById('p1-sub').innerText = `Versuch: ${finAttempts + 1}`;
    } else {
        addHistoryEntry(activePlayer, scoredPoints, currentScore, originalDetails, true);
    }

    isLockingInput = true;
    setTimeout(() => {
        document.getElementById('error-message').innerText = "";
        isLockingInput = false;
        if (activeGlobalMode !== 'fin') nextPlayer(); 
        clearInputFields();
    }, 2000);
}

function checkLiveBustSegment(currentDartIndex) {
    if (activeGlobalMode !== 'x01' && activeGlobalMode !== 'fin') return false;
    if (activeGlobalMode === 'fin' && finTypeSetting === 'strict') return false; 

    let d1Data = parseSegmentData(document.getElementById('seg-1').value, currentMultipliers[1]) || { val: 0, label: "0" };
    let d2Data = parseSegmentData(document.getElementById('seg-2').value, currentMultipliers[2]) || { val: 0, label: "0" };
    let d3Data = parseSegmentData(document.getElementById('seg-3').value, currentMultipliers[3]) || { val: 0, label: "0" };

    let runningSum = d1Data.val + d2Data.val + d3Data.val;
    let currentScore = scores[activePlayer];
    let remaining = currentScore - runningSum;
    
    let modeOut = (activeGlobalMode === 'fin') ? 'double' : outMode;
    let isBust = remaining < 0 || (remaining === 1 && modeOut === 'double');

    if (remaining === 0 && modeOut === 'double') {
        let activeData = (currentDartIndex === 3) ? d3Data : ((currentDartIndex === 2) ? d2Data : d1Data);
        if (activeData.key && !activeData.key.startsWith('D') && activeData.key !== 'd-bull') isBust = true;
    }

    if (isBust) {
        handleBustProcess(currentScore, runningSum, `${d1Data.label}/${d2Data.label}/${d3Data.label}`);
        return true;
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

    if (inputMode === 'set') {
        totalScore = parseInt(document.getElementById('darts-input-set').value) || 0;
        let remaining = currentScore - totalScore;
        if (remaining < 0 || (remaining === 1 && outMode === 'double') || (remaining === 0 && outMode === 'double' && totalScore < 2)) {
            handleBustProcess(currentScore, totalScore, "Set"); return;
        }
        scores[activePlayer] = remaining; scoreDetails = "3 Darts";
    } else {
        let d1Data = parseSegmentData(document.getElementById('seg-1').value, currentMultipliers[1]) || {val:0, label:"0"};
        let d2Data = parseSegmentData(document.getElementById('seg-2').value, currentMultipliers[2]) || {val:0, label:"0"};
        let d3Data = parseSegmentData(document.getElementById('seg-3').value, currentMultipliers[3]) || {val:0, label:"0"};

        totalScore = d1Data.val + d2Data.val + d3Data.val;
        scoreDetails = `${d1Data.label}/${d2Data.label}/${d3Data.label}`;
        let remaining = currentScore - totalScore;
        let isBust = remaining < 0 || (remaining === 1 && outMode === 'double');
        if (remaining === 0 && outMode === 'double') {
            let last = d3Data.label !== "0" ? d3Data : (d2Data.label !== "0" ? d2Data : d1Data);
            if (!last.key || (!last.key.startsWith('D') && last.key !== 'd-bull')) isBust = true;
        }
        if (isBust) { handleBustProcess(currentScore, totalScore, scoreDetails); return; }
        scores[activePlayer] = remaining;
    }

    document.getElementById(`p${activePlayer}-score`).innerText = scores[activePlayer];
    addHistoryEntry(activePlayer, totalScore, scores[activePlayer], scoreDetails, false);
    
    speakTurnResult(totalScore, scores[activePlayer]);

    if (scores[activePlayer] === 0) { showVictory(); return; }
    nextPlayer(); clearInputFields();
}

function executeFinishingTurn() {
    let d1Data = parseSegmentData(document.getElementById('seg-1').value, currentMultipliers[1]) || {val:0, label:"0"};
    let d2Data = parseSegmentData(document.getElementById('seg-2').value, currentMultipliers[2]) || {val:0, label:"0"};
    let d3Data = parseSegmentData(document.getElementById('seg-3').value, currentMultipliers[3]) || {val:0, label:"0"};

    let darts = [d1Data, d2Data, d3Data];
    let originalTarget = finTargetScore;
    let isEn = currentLanguageCode.startsWith('en');

    if (finTypeSetting === 'strict') {
        let isCheckout = false;

        for (let i = 0; i < darts.length; i++) {
            let d = darts[i];
            if (d.val === originalTarget && d.key && (d.key.startsWith('D') || d.key === 'd-bull')) {
                isCheckout = true;
                break;
            }
        }

        let scoreDetails = `${d1Data.label}/${d2Data.label}/${d3Data.label}`;

        if (isCheckout) {
            finAttempts++;
            scores[1] = 0;
            addHistoryEntry(1, originalTarget, 0, scoreDetails, false);
            
            window.speechSynthesis.cancel();
            speak(isEn ? `Leg finished!` : `Leg beendet!`);
            alert(isEn ? `Nice! Checked ${originalTarget} in ${finAttempts} throws.` : `Sauber! Du hast das Finish ${originalTarget} in ${finAttempts} Aufnahmen gecheckt.`);
            
            finAttempts = 0;
            finTargetScore = generateRandomFinish();
            scores[1] = finTargetScore;
            document.getElementById('p1-score').innerText = scores[1];
            document.getElementById('p1-sub').innerText = `Versuch: 1`;
            document.getElementById('p1-history-list').innerHTML = "";
            histories[1] = [];
            
            speak(isEn ? "Next target is " + finTargetScore : "Nächstes Ziel ist " + finTargetScore);
            clearInputFields();
            return;
        } else {
            finAttempts++;
            addHistoryEntry(1, isEn ? "No Check" : "Kein Check", finTargetScore, scoreDetails, false);
            document.getElementById('p1-sub').innerText = `Versuch: ${finAttempts + 1}`;
            speak(isEn ? "No checkout" : "Kein Checkout");
            clearInputFields();
            return;
        }
    }

    let runningScore = finTargetScore;
    let isCheckout = false;
    let totalScoredThisTurn = 0;
    let displayLabels = [];

    for (let i = 0; i < darts.length; i++) {
        let d = darts[i];
        displayLabels.push(d.label);
        
        if (d.label === "0" && i > 0 && darts[i-1].label === "0" && (i === 2 || darts[2].label === "0")) {
            continue; 
        }

        runningScore -= d.val;
        totalScoredThisTurn += d.val;

        if (runningScore === 0) {
            if (d.key && (d.key.startsWith('D') || d.key === 'd-bull')) {
                isCheckout = true;
                break; 
            }
        }

        if (runningScore < 0 || runningScore === 1 || (runningScore === 0 && !isCheckout)) {
            handleBustProcess(originalTarget, totalScoredThisTurn, displayLabels.join('/'));
            return;
        }
    }

    let scoreDetails = displayLabels.join('/');

    if (isCheckout) {
        finAttempts++;
        scores[1] = 0;
        addHistoryEntry(1, originalTarget, 0, scoreDetails, false);
        
        window.speechSynthesis.cancel();
        speak(isEn ? `Leg finished!` : `Leg beendet!`);
        alert(isEn ? `Nice! Checked ${originalTarget} in ${finAttempts} throws.` : `Sauber! Du hast das Finish ${originalTarget} in ${finAttempts} Aufnahmen gecheckt.`);
        
        finAttempts = 0;
        finTargetScore = generateRandomFinish();
        scores[1] = finTargetScore;
        document.getElementById('p1-score').innerText = scores[1];
        document.getElementById('p1-sub').innerText = `Versuch: 1`;
        document.getElementById('p1-history-list').innerHTML = "";
        histories[1] = [];
        speak(isEn ? "Next target is " + finTargetScore : "Nächstes Ziel ist " + finTargetScore);
    } else {
        finAttempts++;
        scores[1] = runningScore;
        document.getElementById('p1-score').innerText = scores[1];
        document.getElementById('p1-sub').innerText = `Versuch: ${finAttempts + 1}`;
        addHistoryEntry(1, totalScoredThisTurn, scores[1], scoreDetails, false);
        speakTurnResult(totalScoredThisTurn, scores[1]);
    }
    
    clearInputFields();
}

function executeATCTurn() {
    let d1Data = parseSegmentData(document.getElementById('seg-1').value, currentMultipliers[1]) || {val:0, base:"", label:"0"};
    let d2Data = parseSegmentData(document.getElementById('seg-2').value, currentMultipliers[2]) || {val:0, base:"", label:"0"};
    let d3Data = parseSegmentData(document.getElementById('seg-3').value, currentMultipliers[3]) || {val:0, base:"", label:"0"};

    let bonusMode = getSelectedValue('group-atc-bonus') === 'bonus';
    let darts = [d1Data, d2Data, d3Data]; let hits = 0;

    darts.forEach(d => {
        let targetString = scores[activePlayer] === 21 ? "bull" : scores[activePlayer].toString();
        if (d.base === targetString) {
            let steps = bonusMode ? d.m : 1;
            scores[activePlayer] += steps; hits += steps;
            if (scores[activePlayer] > 21) scores[activePlayer] = 21;
        }
    });

    document.getElementById(`p${activePlayer}-score`).innerText = scores[activePlayer] === 21 ? "BULL" : scores[activePlayer];
    
    let isEn = currentLanguageCode.startsWith('en');
    let hitLabel = isEn ? `${hits} Hits` : `${hits} Treffer`;
    addHistoryEntry(activePlayer, hitLabel, scores[activePlayer], `${d1Data.label}/${d2Data.label}/${d3Data.label}`, false);
    
    let targetText = scores[activePlayer] === 21 ? "Bullseye" : scores[activePlayer].toString();
    let speechNextText = isEn ? "Target is now " + targetText : "Ziel ist jetzt " + targetText;
    speakTurnResult(hitLabel, speechNextText);

    if (scores[activePlayer] === 21) { showVictory(); return; }
    nextPlayer(); clearInputFields();
}

function executeSODTurn() {
    let d1Data = parseSegmentData(document.getElementById('seg-1').value, currentMultipliers[1]) || {val:0, base:"", m:1, label:"0"};
    let d2Data = parseSegmentData(document.getElementById('seg-2').value, currentMultipliers[2]) || {val:0, base:"", m:1, label:"0"};
    let d3Data = parseSegmentData(document.getElementById('seg-3').value, currentMultipliers[3]) || {val:0, base:"", m:1, label:"0"};

    let targetField = document.getElementById('sod-target-field').value;
    let targetRing = getSelectedValue('group-sod-ring');
    let darts = [d1Data, d2Data, d3Data]; let hitCount = 0;

    darts.forEach(d => {
        let isField = d.base === targetField;
        let isRing = (targetRing === 'single' && d.m === 1) || (targetRing === 'double' && d.m === 2) || (targetRing === 'treble' && d.m === 3);
        if (isField && isRing) hitCount++;
    });

    scores[1] -= 3; if (scores[1] < 0) scores[1] = 0;
    document.getElementById('p1-score').innerText = scores[1];
    
    let isEn = currentLanguageCode.startsWith('en');
    let hitLabel = isEn ? `${hitCount} Hits` : `${hitCount} Treffer`;
    addHistoryEntry(1, hitLabel, scores[1], `${d1Data.label}/${d2Data.label}/${d3Data.label}`, false);
    
    let speechDartsLeft = isEn ? scores[1] + " darts remaining" : scores[1] + " Pfeile verbleibend";
    speakTurnResult(hitLabel, speechDartsLeft);

    if (scores[1] <= 0) { showVictory(); return; }
    clearInputFields();
}

function addHistoryEntry(player, score, rest, details, isBust) {
    histories[player].unshift({ score, rest, details, isBust });
    const tbody = document.getElementById(`p${player}-history-list`); tbody.innerHTML = "";
    histories[player].forEach((item, index) => {
        let dartsThrown = (histories[player].length - index) * 3;
        let displayScore = item.isBust ? `Bust` : item.score;
        tbody.innerHTML += `<tr><td>${dartsThrown}</td><td>${displayScore}</td><td>${item.rest}</td><td>${item.details}</td></tr>`;
    });
}

function nextPlayer() {
    if (!isTwoPlayers) return;
    document.getElementById(`p${activePlayer}-card`).classList.remove('active');
    activePlayer = activePlayer === 1 ? 2 : 1;
    document.getElementById(`p${activePlayer}-card`).classList.add('active');
}

function showVictory() {
    document.getElementById('spielseite').classList.add('hidden');
    document.getElementById('abschlussseite').classList.remove('hidden');
    let isEn = currentLanguageCode.startsWith('en');
    speak(isEn ? "Game shot and match!" : "Spiel und Match!");
}

function resetGame() {
    document.getElementById('abschlussseite').classList.add('hidden');
    document.getElementById('startseite').classList.remove('hidden');
}

function handleSegmentAutoJump(currentInput, nextInputId, dartNum) {
    let raw = currentInput.value.toLowerCase();
    if (raw.endsWith('d')) { setMultiplier(dartNum, 2); currentInput.value = raw.slice(0, -1); return; }
    if (raw.endsWith('t')) { setMultiplier(dartNum, 3); currentInput.value = raw.slice(0, -1); return; }
    
    let data = parseSegmentData(currentInput.value, currentMultipliers[dartNum]);
    if (data && (currentInput.value.length >= 2 || parseInt(currentInput.value) > 2 || raw === 'b')) {
        let wasBust = checkLiveBustSegment(dartNum);
        if (!wasBust && nextInputId) document.getElementById(nextInputId).focus();
    }
}

function drawLiveBoard() {
    const container = document.getElementById('live-board-layout');
    if(!container) return;
    let svg = `<svg class="dartboard-svg" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg"><circle cx="150" cy="150" r="145" fill="#0f0f0f"/>`;
    const angleStep = 360 / 20; const startAngleOffset = -90 - (angleStep / 2);

    sectors.forEach((num, index) => {
        let currentAngle = startAngleOffset + (index * angleStep);
        let radStart = (currentAngle * Math.PI) / 180; let radEnd = ((currentAngle + angleStep) * Math.PI) / 180;
        let baseColor = (index % 2 === 0) ? '#0d2b1d' : '#f3e5ab';
        svg += createSvgPath(107, 115, radStart, radEnd, '#e50914');
        svg += createSvgPath(73, 107, radStart, radEnd, baseColor);
        svg += createSvgPath(65, 73, radStart, radEnd, '#e50914');
        svg += createSvgPath(14, 65, radStart, radEnd, baseColor);
        let textRad = ((currentAngle + (angleStep / 2)) * Math.PI) / 180;
        svg += `<text x="${150 + 130 * Math.cos(textRad)}" y="${150 + 130 * Math.sin(textRad)}" class="board-text">${num}</text>`;
    });
    svg += `<circle cx="150" cy="150" r="14" fill="#0d2b1d"/><circle cx="150" cy="150" r="6" fill="#e50914"/></svg>`;
    container.innerHTML = svg;
}

function createSvgPath(rIn, rOut, aStart, aEnd, color) {
    let pOStart = { x: 150 + rOut * Math.cos(aStart), y: 150 + rOut * Math.sin(aStart) };
    let pOEnd = { x: 150 + rOut * Math.cos(aEnd), y: 150 + rOut * Math.sin(aEnd) };
    let pIStart = { x: 150 + rIn * Math.cos(aStart), y: 150 + rIn * Math.sin(aStart) };
    let pIEnd = { x: 150 + rIn * Math.cos(aEnd), y: 150 + rIn * Math.sin(aEnd) };
    return `<path d="M ${pOStart.x} ${pOStart.y} A ${rOut} ${rOut} 0 0 1 ${pOEnd.x} ${pOEnd.y} L ${pIEnd.x} ${pIEnd.y} A ${rIn} ${rIn} 0 0 0 ${pIStart.x} ${pIStart.y} Z" fill="${color}" stroke="#111" stroke-width="0.5"/>`;
}
