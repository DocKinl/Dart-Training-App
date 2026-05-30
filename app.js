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

// Neues virtuelles Keyboard State System
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
let isSpeechInputActive = false;
let currentTheme = 'dark';

const invalidFinishes = [169, 168, 166, 165, 163, 162, 159];
const impossibleScores = [179, 178, 176, 175, 173, 172, 169, 166, 163, 162, 159];

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

    if (mode === 'x01') document.getElementById('options-x01').classList.remove('hidden');
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
        } else if (typeof rest === 'string') {
            let textUtterance = new SpeechSynthesisUtterance(rest);
            textUtterance.lang = currentLanguageCode;
            if (selectedVoice) textUtterance.voice = selectedVoice;
            window.speechSynthesis.speak(textUtterance);
        }
    };
    window.speechSynthesis.speak(scoreUtterance);
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
    isTwoPlayers = getSelectedValue('group-players') === "2" && activeGlobalMode !== 'sod' && activeGlobalMode !== 'fin';
    inputMode = (activeGlobalMode === 'x01') ? getSelectedValue('group-input-mode') : 'segment';

    document.getElementById('set-input-container').classList.add('hidden');
    document.getElementById('segment-input-container').classList.add('hidden');
    document.getElementById('p1-sub').classList.add('hidden');
    document.getElementById('p1-title').innerText = "Spieler 1";
    document.getElementById('h1-header').innerText = "Verlauf S1";
    document.getElementById('submit-btn').classList.remove('hidden');

    if (activeGlobalMode === 'x01') {
        initialPoints = parseInt(getSelectedValue('group-points'));
        scores[1] = initialPoints; scores[2] = initialPoints;
        document.getElementById('game-title').innerText = `${initialPoints}er X01 Match`;
        if (inputMode === 'set') {
            document.getElementById('set-input-container').classList.remove('hidden');
            document.getElementById('submit-btn').classList.add('hidden');
        } else {
            document.getElementById('segment-input-container').classList.remove('hidden');
        }
    } else if (activeGlobalMode === 'fin') {
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

    resetVirtualState();
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

    document.getElementById(`p${activePlayer}-score`).innerText = scores[activePlayer];
    addHistoryEntry(activePlayer, totalScore, scores[activePlayer], scoreDetails, false);
    speakTurnResult(totalScore, scores[activePlayer]);

    if (scores[activePlayer] === 0) { showVictory(); return; }
    nextPlayer(); resetVirtualState();
}

function executeFinishingTurn() {
    let d1 = virtualDartData[1];
    let d2 = virtualDartData[2];
    let d3 = virtualDartData[3];
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
            document.getElementById('p1-score').innerText = scores[1];
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
        document.getElementById('p1-score').innerText = scores[1];
        document.getElementById('p1-sub').innerText = `Versuch: 1`;
        document.getElementById('p1-history-list').innerHTML = "";
        speak(isEn ? "Next target is " + finTargetScore : "Nächstes Ziel ist " + finTargetScore);
    } else {
        finAttempts++; scores[1] = runningScore;
        document.getElementById('p1-score').innerText = scores[1];
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

    document.getElementById(`p${activePlayer}-score`).innerText = scores[activePlayer] === 21 ? "BULL" : scores[activePlayer];
    let isEn = currentLanguageCode.startsWith('en');
    let hitLabel = isEn ? `${hits} Hits` : `${hits} Treffer`;
    addHistoryEntry(activePlayer, hitLabel, scores[activePlayer], `${virtualDartData[1].label}/${virtualDartData[2].label}/${virtualDartData[3].label}`, false);
    
    let targetText = scores[activePlayer] === 21 ? "Bullseye" : scores[activePlayer].toString();
    speakTurnResult(hitLabel, isEn ? "Target is now " + targetText : "Ziel ist jetzt " + targetText);

    if (scores[activePlayer] === 21) { showVictory(); return; }
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
    document.getElementById('p1-score').innerText = scores[1];
    
    let isEn = currentLanguageCode.startsWith('en');
    let hitLabel = isEn ? `${hitCount} Hits` : `${hitCount} Treffer`;
    addHistoryEntry(1, hitCount, scores[1], `${virtualDartData[1].label}/${virtualDartData[2].label}/${virtualDartData[3].label}`, false);
    speakTurnResult(hitLabel, isEn ? scores[1] + " darts remaining" : scores[1] + " Pfeile verbleibend");

    if (scores[1] <= 0) { showVictory(); return; }
    resetVirtualState();
}

function addHistoryEntry(player, score, rest, details, isBust) {
    histories[player].unshift({ score, rest, details, isBust });
    const tbody = document.getElementById(`p${player}-history-list`);
    if(!tbody) return;
    tbody.innerHTML = "";
    
    // Berechne laufenden 3-Dart-Average
    let totalValidPoints = 0;
    let validLegsCount = 0;

    histories[player].forEach((item, index) => {
        let dartsThrown = (histories[player].length - index) * 3;
        
        let numericalScore = 0;
        if (!item.isBust && typeof item.score === 'number') {
            numericalScore = item.score;
        }
        
        if (activeGlobalMode === 'x01' || activeGlobalMode === 'fin') {
            totalValidPoints += numericalScore;
            validLegsCount++;
        }

        let currentAvg = "-";
        if (validLegsCount > 0 && (activeGlobalMode === 'x01' || activeGlobalMode === 'fin')) {
            currentAvg = (totalValidPoints / validLegsCount).toFixed(1);
        } else if (activeGlobalMode === 'sod' || activeGlobalMode === 'atc') {
            // Zeige kumulierte Treffer-Quote für Trainingsspiele
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

function nextPlayer() {
    if (!isTwoPlayers) return;
    document.getElementById(`p${activePlayer}-card`).classList.remove('active');
    activePlayer = activePlayer === 1 ? 2 : 1;
    document.getElementById(`p${activePlayer}-card`).classList.add('active');
}

function showVictory() {
    document.getElementById('spielseite').classList.add('hidden');
    document.getElementById('abschlussseite').classList.remove('hidden');
    speak(currentLanguageCode.startsWith('en') ? "Game shot and match!" : "Spiel und Match!");
}

function resetGame() {
    document.getElementById('abschlussseite').classList.add('hidden');
    document.getElementById('startseite').classList.remove('hidden');
}
