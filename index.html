<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DocKinl Darts Tracker</title>
    <style>
        /* Grundlegendes Styling für ein sauberes, scannbares Dashboard */
        :root {
            --bg-color: #121212;
            --card-bg: #1e1e1e;
            --text-color: #ffffff;
            --accent-color: #00adb5;
            --active-color: #393e46;
            --border-color: #333333;
        }

        .light-theme {
            --bg-color: #f4f6f9;
            --card-bg: #ffffff;
            --text-color: #222831;
            --accent-color: #007cc7;
            --active-color: #eeeeee;
            --border-color: #cccccc;
        }

        body {
            margin: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            transition: background 0.3s, color 0.3s;
        }

        header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 25px;
            background-color: var(--card-bg);
            border-bottom: 1px solid var(--border-color);
        }

        .container {
            max-width: 800px;
            margin: 30px auto;
            padding: 0 20px;
        }

        .card {
            background-color: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 25px;
            margin-bottom: 25px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        h2 {
            margin-top: 0;
            border-bottom: 2px solid var(--accent-color);
            padding-bottom: 8px;
        }

        .option-group {
            margin-bottom: 20px;
        }

        .option-label {
            font-weight: bold;
            display: block;
            margin-bottom: 8px;
        }

        .btn-row {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }

        .btn-option {
            flex: 1;
            min-width: 100px;
            background-color: var(--card-bg);
            color: var(--text-color);
            border: 1px solid var(--border-color);
            padding: 12px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            text-align: center;
            transition: all 0.2s;
        }

        .btn-option:hover {
            border-color: var(--accent-color);
        }

        .btn-option.active {
            background-color: var(--accent-color);
            color: #ffffff;
            border-color: var(--accent-color);
        }

        .slider-box {
            margin-top: 15px;
        }

        .slider {
            width: 100%;
            margin: 10px 0;
        }

        .btn-primary {
            background-color: var(--accent-color);
            color: white;
            border: none;
            padding: 15px 30px;
            font-size: 1.1em;
            font-weight: bold;
            border-radius: 6px;
            cursor: pointer;
            width: 100%;
            box-shadow: 0 4px 10px rgba(0, 173, 181, 0.3);
        }

        .btn-primary:hover {
            opacity: 0.9;
        }

        .hidden {
            display: none !important;
        }

        /* Modal-Styling */
        .modal {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background-color: rgba(0,0,0,0.7);
            display: flex; justify-content: center; align-items: center;
            z-index: 1000;
        }

        .modal-content {
            background-color: var(--card-bg);
            padding: 30px;
            border-radius: 8px;
            max-width: 500px;
            width: 90%;
            border: 1px solid var(--border-color);
        }

        .modal-close {
            background-color: #ff4d4d;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            float: right;
        }
    </style>
</head>
<body>

    <header>
        <div style="font-size: 1.4em; font-weight: bold;">DocKinl Darts</div>
        <div>
            <button class="btn-option btn-settings-open" style="padding: 8px 15px;">⚙ Einstellungen</button>
            <button id="btn-open-stats" class="btn-option" style="padding: 8px 15px;">📊 Alltime Stats</button>
        </div>
    </header>

    <div class="container">
        
        <div id="startseite">
            <div class="card">
                <h2>X01 Match Konfiguration</h2>
                
                <div class="option-group">
                    <span class="option-label">Spielmodus</span>
                    <div class="btn-row" id="group-players">
                        <button class="btn-option active" data-value="1">Alleine spielen</button>
                        <button class="btn-option" data-value="bot">Gegen Bot spielen</button>
                        <button class="btn-option" data-value="2">2 Spieler (Lokal)</button>
                    </div>
                </div>

                <div class="option-group hidden" id="options-bot">
                    <span class="option-label">Bot Schwierigkeitsgrad</span>
                    <div class="btn-row" id="group-bot-level">
                        <button class="btn-option" data-value="easy">Leicht</button>
                        <button class="btn-option active" data-value="medium">Mittel</button>
                        <button class="btn-option" data-value="strong">Schwer</button>
                        <button class="btn-option" data-value="insane">Legendär</button>
                    </div>
                </div>

                <div class="option-group" id="options-x01">
                    <div class="slider-box">
                        <span class="option-label" id="points-slider-label">Startpunkte: 501</span>
                        <input type="range" min="101" max="501" step="100" value="501" class="slider" id="input-points-slider">
                    </div>

                    <div class="slider-box">
                        <span class="option-label" id="legs-slider-label">Legs pro Set: Best of 5</span>
                        <input type="range" min="1" max="11" step="2" value="5" class="slider" id="input-legs-slider">
                    </div>

                    <div class="slider-box">
                        <span class="option-label" id="sets-slider-label">Sets zum Matchgewinn: Best of 3</span>
                        <input type="range" min="1" max="9" step="2" value="3" class="slider" id="input-sets-slider">
                    </div>
                </div>

                <div class="option-group">
                    <span class="option-label">Eingabe-Methode</span>
                    <div class="btn-row" id="group-input-mode">
                        <button class="btn-option active" data-value="segment">Darts einzeln</button>
                        <button class="btn-option" data-value="set">Aufnahme (Gesamtsumme)</button>
                    </div>
                </div>

                <div class="option-group">
                    <span class="option-label">Out-Modus</span>
                    <div class="btn-row" id="group-out">
                        <button class="btn-option active" data-value="double">Double Out</button>
                        <button class="btn-option" data-value="single">Single Out</button>
                    </div>
                </div>

                <button id="btn-start-game" class="btn-primary" style="margin-top: 15px;">Spiel starten 🎯</button>
            </div>
        </div>

        <div id="spielseite" class="hidden">
            <div class="card">
                <h2 id="game-title">X01 Match</h2>
                <p>Spielseite geladen. Anpassungen für die Wurf-Eingabe folgen im nächsten Schritt.</p>
                <button id="btn-abort-game" class="btn-option" style="border-color: #ff4d4d; color: #ff4d4d;">Spiel abbrechen</button>
            </div>
        </div>

        <div id="abschlussseite" class="hidden">
            <div class="card" style="text-align: center;">
                <h2 id="winner-announcement">Spieler 1 gewinnt!</h2>
                <table style="width:100%; margin: 20px 0; text-align: left; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 2px solid var(--border-color);">
                            <th>Statistik</th>
                            <th id="th-p1-name">Spieler 1</th>
                            <th id="th-p2-name">Spieler 2</th>
                        </tr>
                    </thead>
                    <tbody id="summary-stats-body"></tbody>
                </table>
                <button id="btn-reset-game" class="btn-primary">Zurück zum Hauptmenü</button>
            </div>
        </div>

    </div>

    <div id="settings-modal" class="modal hidden">
        <div class="modal-content">
            <button id="btn-settings-close" class="modal-close">X</button>
            <h3>Optionen & Barrierefreiheit</h3>
            
            <div class="option-group">
                <span class="option-label">Design</span>
                <div class="btn-row" id="group-theme-select">
                    <button class="btn-option active" data-value="dark">Dark Theme</button>
                    <button class="btn-option" data-value="light">Light Theme</button>
                </div>
            </div>

            <div class="option-group">
                <span class="option-label">Anrufer / Sprachausgabe (TTS)</span>
                <div class="btn-row" id="group-toggle-tts">
                    <button class="btn-option active" data-value="true">An</button>
                    <button class="btn-option" data-value="false">Aus</button>
                </div>
            </div>

            <div class="option-group" id="sub-voice-settings">
                <span class="option-label">Sprache</span>
                <select id="voice-lang-select" style="width: 100%; padding: 10px; margin-bottom: 10px; background: var(--card-bg); color: var(--text-color); border: 1px solid var(--border-color);">
                    <option value="de" selected>Deutsch</option>
                    <option value="en">English</option>
                </select>
                <span class="option-label">Stimme wählen</span>
                <select id="voice-select" style="width: 100%; padding: 10px; background: var(--card-bg); color: var(--text-color); border: 1px solid var(--border-color);"></select>
            </div>

            <div class="option-group">
                <span class="option-label">Checkout-Hilfe (Ansage)</span>
                <div class="btn-row" id="group-toggle-helper">
                    <button class="btn-option active" data-value="true">An</button>
                    <button class="btn-option" data-value="false">Aus</button>
                </div>
            </div>
        </div>
    </div>

    <div id="stats-modal" class="modal hidden">
        <div class="modal-content">
            <button id="btn-stats-close" class="modal-close">X</button>
            <h3>Deine Alltime Statistiken (X01)</h3>
            <p>Gespielte Matches: <span id="stat-total-games" style="font-weight:bold;">0</span></p>
            <p>Gesamt-Durchschnitt (Ø3): <span id="stat-alltime-avg" style="font-weight:bold;">0.0</span></p>
            <p>Höchste Aufnahme: <span id="stat-highest-turn" style="font-weight:bold;">0</span></p>
            <p>Höchstes Finish: <span id="stat-highest-co" style="font-weight:bold;">0</span></p>
            <p>Gesamtanzahl 180er: <span id="stat-total-180s" style="font-weight:bold;">0</span></p>
            <button id="btn-clear-stats" style="background: #ff4d4d; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; width: 100%; margin-top: 15px;">Statistiken zurücksetzen</button>
        </div>
    </div>

    <script src="app.js"></script>
</body>
</html>
