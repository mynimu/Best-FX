// Speicher-Management
const STORAGE_KEY = 'creditcard_comparison_data';

// Daten initialisieren (hartkodierte Default-Karten)
let cards = [
    {
        id: 1001,
        name: 'Easybank (EUR/USD) - Hardcoded',
        fee: 1.5,
        rateUrl: 'https://www.easybank.at/markets/waehrungen-zinsen',
        // extrahiert den Wert im <span data-streaming-last> für EUR-USD
        rateRegex: '<tr[^>]*EUR-USD[^>]*>[\\s\\S]*?<span[^>]*data-streaming-last[^>]*>([0-9\\.,]+)<\\/span>',
        lastFetchedRate: null,
        fixedRate: null,
        rateMarkup: 0
    },
    {
        id: 1002,
        name: 'CardComplete (USD) - Hardcoded',
        fee: 1.75,
        rateUrl: 'https://www.cardcomplete.com/service/umsatznachricht/fremdwaehrungen/USD/',
        // einfache Zelle mit class="text-end" enthält Verkaufskurs (Komma Dezimaltrennzeichen)
        rateRegex: '<td\\s+class=["\\']text-end["\\'][^>]*>\\s*([0-9\\.,]+)\\s*<\\/td>',
        lastFetchedRate: null,
        fixedRate: null,
        rateMarkup: 0
    }
];

// Beim Laden der Seite
document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
    updateCurrencyLabels();
    renderCards();
    // Beim Laden automatisch die konfigurierten Raten abrufen und danach UI aktualisieren
    (async () => {
        try {
            await autoFetchAllRates();
        } catch (e) {
            console.warn('Auto-Fetch fehlgeschlagen:', e);
        }
        renderCards();
        updateComparison();
    })();
    
    // Event Listener für Live-Updates
    document.getElementById('transaction-amount').addEventListener('input', updateComparison);
    document.getElementById('source-currency').addEventListener('change', () => {
        updateCurrencyLabels();
        updateComparison();
    });
    document.getElementById('target-currency').addEventListener('change', () => {
        updateCurrencyLabels();
        updateComparison();
    });
    document.getElementById('exchange-rate').addEventListener('input', updateComparison);
});

// ========== Karten Management ==========
function addCard() {
    try {
        const nameInput = document.getElementById('card-name');
        const feeInput = document.getElementById('card-fee');
        
        if (!nameInput || !feeInput) {
            console.error('Input-Felder nicht gefunden');
            alert('Fehler: Input-Felder nicht gefunden. Seite neu laden.');
            return;
        }

        const name = nameInput.value.trim();
        const fee = parseFloat(feeInput.value) || 0;

        if (!name) {
            alert('Bitte einen Namen für die Karte eingeben');
            return;
        }

        if (fee < 0) {
            alert('Die Gebühr kann nicht negativ sein');
            return;
        }

        cards.push({
            id: Date.now(),
            name: name,
            fee: fee,
            // optional fields for per-card rate sourcing
            rateUrl: null,
            rateRegex: null,
            lastFetchedRate: null,
            fixedRate: null,
            rateMarkup: 0
        });

        saveToStorage();
        nameInput.value = '';
        feeInput.value = '0';
        
        renderCards();
        updateComparison();
        console.log('✓ Karte hinzugefügt:', name);
    } catch (error) {
        console.error('Fehler beim Hinzufügen der Karte:', error);
        alert('Fehler beim Hinzufügen der Karte: ' + error.message);
    }
}

function editCard(id) {
    const card = cards.find(c => c.id === id);
    if (!card) return;

    const newName = prompt('Kartenname:', card.name);
    if (newName === null) return;

    const newFee = prompt('Gebühr (%):', card.fee);
    if (newFee === null) return;

    // Optional: allow setting a rate source URL and a regex for extraction
    const newRateUrl = prompt('Optionale Seite mit Wechselkurs (URL) (leer lassen, falls nicht genutzt):', card.rateUrl || '');
    if (newRateUrl === null) return;

    const newRateRegex = prompt('Regex zum Extrahieren des Wechselkurses aus der Seite (z.B. ([0-9]+\\.?[0-9]+)) :', card.rateRegex || '');
    if (newRateRegex === null) return;

    const newRateMarkup = prompt('Optionaler Aufschlag auf gefundene Rate in % (z.B. 0.5 für 0.5%):', card.rateMarkup || 0);
    if (newRateMarkup === null) return;

    card.name = newName.trim();
    card.fee = parseFloat(newFee) || 0;
    card.rateUrl = newRateUrl.trim() || null;
    card.rateRegex = newRateRegex.trim() || null;
    card.rateMarkup = parseFloat(newRateMarkup) || 0;

    saveToStorage();
    renderCards();
    updateComparison();
}

function deleteCard(id) {
    if (confirm('Möchtest du diese Karte wirklich löschen?')) {
        cards = cards.filter(c => c.id !== id);
        saveToStorage();
        renderCards();
        updateComparison();
    }
}

function renderCards() {
    const cardsList = document.getElementById('cards-list');
    
    // Show predefined cards in read-only mode with a Test/Configure button
    cardsList.innerHTML = cards.map(card => `
        <div class="card-item">
            <h3>${escapeHtml(card.name)}</h3>
            <span class="card-fee-badge">${card.fee}%</span>
            <p style="font-size: 0.9rem; color: #666;">Fremdwährungsgebühr</p>
            <p style="font-size:0.9rem; color:#444; margin-top:8px;">${card.lastFetchedRate ? 'Letzter Kurs: ' + card.lastFetchedRate + (card.lastFetchedAt ? ' (aktualisiert: ' + formatDateTime(card.lastFetchedAt) + ')' : '') : (card.fixedRate ? 'Fixe Rate: ' + card.fixedRate : '')}</p>
            <p style="font-size:0.85rem; color:#666;">${card.rateUrl ? 'Rate-Quelle: ' + card.rateUrl : 'Keine Rate-Quelle'}</p>
            <div style="margin-top:10px;"><button class="btn-secondary" onclick="openTestModal(${card.id})">🔎 Teste/konfiguriere Rate</button></div>
        </div>
    `).join('');
}

// Fetch the configured rate for a single card and save result
async function fetchRateForCard(card, silent = false) {
    if (!card || !card.rateUrl || !card.rateRegex) throw new Error('Keine Rate-Quelle oder Regex konfiguriert');
    try {
        const proxy = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(card.rateUrl);
        const res = await fetch(proxy);
        if (!res.ok) throw new Error('Fehler beim Laden der Seite: ' + res.status);
        const text = await res.text();

        let regex;
        try { regex = new RegExp(card.rateRegex, 'i'); } catch (e) { throw new Error('Ungültiger Regex: ' + e.message); }
        const match = text.match(regex);
        if (!match) throw new Error('Kein Treffer mit dem Regex gefunden');

        // Find first numeric group
        let num = null;
        for (let i = 1; i < match.length; i++) {
            const cleaned = match[i].replace(/[^0-9,\.\-]/g, '').replace(',', '.');
            if (cleaned && !isNaN(Number(cleaned))) { num = Number(cleaned); break; }
        }
        if (num == null) {
            const cleaned = match[0].replace(/[^0-9,\.\-]/g, '').replace(',', '.');
            if (cleaned && !isNaN(Number(cleaned))) num = Number(cleaned);
        }
        if (num == null) throw new Error('Keine Zahl extrahiert');

        const finalRate = num * (1 + ((card.rateMarkup || 0) / 100));
        card.lastFetchedRate = finalRate;
        card.lastFetchedAt = new Date().toISOString();
        saveToStorage();
        return finalRate;
    } catch (err) {
        if (!silent) alert('Fehler beim Abrufen der Karte-Rate: ' + err.message);
        throw err;
    }
}

// Auto-fetch all configured card rates (used on load)
async function autoFetchAllRates() {
    for (const card of cards) {
        if (card.rateUrl && card.rateRegex) {
            try {
                await fetchRateForCard(card, true);
            } catch (e) {
                console.warn('Auto-Fetch für Karte fehlgeschlagen:', card.name, e.message);
            }
            // kleine Pause, um Server nicht zu überlasten
            await new Promise(r => setTimeout(r, 250));
        }
    }
}

// ========== Modal: Test / Edit Rate Source ==========
let __modalCardId = null;
function openTestModal(cardId) {
    const card = cards.find(c => c.id === cardId);
    if (!card) return alert('Karte nicht gefunden');
    __modalCardId = cardId;
    const title = document.getElementById('modal-title');
    if (title) title.textContent = `Test / Konfiguration: ${card.name}`;
    const urlElem = document.getElementById('modal-rate-url');
    const regexElem = document.getElementById('modal-rate-regex');
    const markupElem = document.getElementById('modal-rate-markup');
    const resultElem = document.getElementById('modal-result');
    if (urlElem) urlElem.value = card.rateUrl || '';
    if (regexElem) regexElem.value = card.rateRegex || '';
    if (markupElem) markupElem.value = card.rateMarkup || 0;
    if (resultElem) resultElem.textContent = '';
    const modal = document.getElementById('test-modal');
    if (modal) modal.style.display = 'flex';
}

function closeTestModal() {
    __modalCardId = null;
    const modal = document.getElementById('test-modal');
    if (modal) modal.style.display = 'none';
}

async function testModalFetch() {
    const url = document.getElementById('modal-rate-url').value.trim();
    const regexStr = document.getElementById('modal-rate-regex').value.trim();
    const markup = parseFloat(document.getElementById('modal-rate-markup').value) || 0;
    const out = document.getElementById('modal-result');
    if (!url || !regexStr) { if (out) out.textContent = 'Bitte URL und Regex angeben.'; return; }

    if (out) out.textContent = 'Lade Seite...';
    try {
        const proxy = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url);
        const res = await fetch(proxy);
        if (!res.ok) throw new Error('Fehler beim Laden der Seite: ' + res.status);
        const text = await res.text();

        let regex;
        try { regex = new RegExp(regexStr, 'i'); } catch (e) { if (out) out.textContent = 'Ungültiger Regex: ' + e.message; return; }
        const match = text.match(regex);
        if (!match) { if (out) out.textContent = 'Kein Treffer mit dem Regex gefunden.'; return; }

        // Extract numeric from groups
        let num = null; let raw = null;
        for (let i = 1; i < match.length; i++) {
            const cleaned = match[i].replace(/[^0-9,\.\-]/g, '').replace(',', '.');
            if (cleaned && !isNaN(Number(cleaned))) { num = Number(cleaned); raw = match[i]; break; }
        }
        if (num == null) {
            const cleaned = match[0].replace(/[^0-9,\.\-]/g, '').replace(',', '.');
            if (cleaned && !isNaN(Number(cleaned))) { num = Number(cleaned); raw = match[0]; }
        }
        if (num == null) { if (out) out.textContent = 'Keine Zahl extrahiert aus dem Treffer.'; return; }

        const finalRate = num * (1 + (markup / 100));
        if (out) out.innerHTML = `<strong>Treffer:</strong> ${escapeHtml(String(raw))}<br><strong>Extrahiert:</strong> ${num}<br><strong>Nach Aufschlag:</strong> ${finalRate}`;
    } catch (err) {
        if (out) out.textContent = 'Fehler beim Testen: ' + err.message;
    }
}

function saveModalToCard() {
    if (!__modalCardId) return alert('Keine Karte ausgewählt');
    const card = cards.find(c => c.id === __modalCardId);
    if (!card) return alert('Karte nicht gefunden');
    card.rateUrl = document.getElementById('modal-rate-url').value.trim() || null;
    card.rateRegex = document.getElementById('modal-rate-regex').value.trim() || null;
    card.rateMarkup = parseFloat(document.getElementById('modal-rate-markup').value) || 0;
    saveToStorage();
    renderCards();
    closeTestModal();
    alert('Einstellungen auf Karte übernommen');
}

// ========== Vergleich & Berechnung ==========
function updateComparison() {
    const amount = parseFloat(document.getElementById('transaction-amount').value) || 0;
    const sourceCurrency = document.getElementById('source-currency').value;
    const targetCurrency = document.getElementById('target-currency').value;
    const exchangeRate = parseFloat(document.getElementById('exchange-rate').value) || 1;

    if (amount <= 0) {
        document.getElementById('table-body').innerHTML = `
            <tr><td colspan="4" class="empty-state">Bitte einen gültigen Betrag eingeben</td></tr>
        `;
        document.getElementById('best-card').classList.remove('show');
        return;
    }

    if (cards.length === 0) {
        document.getElementById('table-body').innerHTML = `
            <tr><td colspan="4" class="empty-state">Keine Karten hinzugefügt</td></tr>
        `;
        document.getElementById('best-card').classList.remove('show');
        return;
    }

    // Berechne für jede Karte die Gesamtkosten
    const comparisons = cards.map(card => {
        const fee = (amount * card.fee) / 100;
        const totalInSourceCurrency = amount + fee;
        const totalInTargetCurrency = totalInSourceCurrency * exchangeRate;
        
        return {
            cardId: card.id,
            name: card.name,
            fee: card.fee,
            feeAmount: fee,
            totalInSourceCurrency: totalInSourceCurrency,
            totalInTargetCurrency: totalInTargetCurrency
        };
    }).sort((a, b) => a.totalInSourceCurrency - b.totalInSourceCurrency);

    // Finde die beste Karte
    const bestCard = comparisons[0];
    const worst = comparisons[comparisons.length - 1];
    const savings = worst.totalInSourceCurrency - bestCard.totalInSourceCurrency;

    // Rendere Tabelle
    const tableBody = document.getElementById('table-body');
    tableBody.innerHTML = comparisons.map((comp, index) => `
        <tr ${index === 0 ? 'class="best-row"' : ''}>
            <td><strong>${escapeHtml(comp.name)}</strong></td>
            <td>${comp.fee}%</td>
            <td>${comp.feeAmount.toFixed(2)} ${sourceCurrency}</td>
            <td>${comp.totalInSourceCurrency.toFixed(2)} ${sourceCurrency}</td>
        </tr>
    `).join('');

    // Zeige beste Karte Info
    const bestCardDiv = document.getElementById('best-card');
    bestCardDiv.innerHTML = `
        🏆 <strong>${escapeHtml(bestCard.name)}</strong> ist die beste Wahl!<br>
        Gebühren: <strong>${bestCard.fee}%</strong> = ${bestCard.feeAmount.toFixed(2)} ${sourceCurrency}<br>
        Ersparnis gegenüber teuerster Karte: <strong>${savings.toFixed(2)} ${sourceCurrency}</strong>
    `;
    bestCardDiv.classList.add('show');
}

function updateCurrencyLabels() {
    const source = document.getElementById('source-currency').value;
    const target = document.getElementById('target-currency').value;
    const label = document.querySelector('label[for="exchange-rate"]');
    label.textContent = `Wechselkurs (1 ${source} = ? ${target}):`;
}

// ========== Speicher Management ==========
function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

function loadFromStorage() {
    // App verwendet fest hartkodierte Karten. Schreibe diese ins Storage zur Persistenz.
    try {
        saveToStorage();
    } catch (err) {
        console.warn('Konnte hartkodierte Karten nicht in Storage schreiben:', err);
    }
}

function clearAllData() {
    if (confirm('Möchtest du wirklich ALLE Daten löschen? Dies kann nicht rückgängig gemacht werden.')) {
        cards = [];
        saveToStorage();
        renderCards();
        updateComparison();
        alert('Alle Daten wurden gelöscht');
    }
}

// ========== Import/Export ==========
function exportData() {
    const dataToExport = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        cards: cards
    };

    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `creditcards-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

function importData() {
    const fileInput = document.getElementById('import-file');
    const file = fileInput.files[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            
            if (!data.cards || !Array.isArray(data.cards)) {
                alert('Ungültiges Dateiformat');
                return;
            }

            cards = data.cards;
            saveToStorage();
            renderCards();
            updateComparison();
            alert('Daten wurden erfolgreich importiert');
        } catch (error) {
            alert('Fehler beim Importieren: ' + error.message);
        }
    };
    reader.readAsText(file);
    fileInput.value = '';
}

// ========== Utility Funktionen ==========
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDateTime(iso) {
    if (!iso) return '';
    try {
        const d = new Date(iso);
        return d.toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) { return iso; }
}

// ========== Wechselkurs Abrufen (on-demand) ==========
async function fetchRate(from, to) {
    try {
        const url = `https://api.exchangerate.host/convert?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&amount=1`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Netzwerkantwort: ' + res.status);
        const data = await res.json();
        // data.info.rate enthält die Rate (1 from = rate to)
        if (data && data.info && typeof data.info.rate === 'number') return data.info.rate;
        if (data && data.result) return data.result; // fallback
        throw new Error('Ungültiges API-Format');
    } catch (err) {
        console.warn('Fehler beim Abrufen des Wechselkurses:', err);
        throw err;
    }
}

async function fetchAndSetRate() {
    const source = document.getElementById('source-currency').value;
    const target = document.getElementById('target-currency').value;
    const info = document.getElementById('rate-info');
    info.textContent = 'Kurs wird abgerufen...';
    try {
        const rate = await fetchRate(source, target);
        document.getElementById('exchange-rate').value = rate.toFixed(6);
        info.textContent = `1 ${source} = ${rate.toFixed(6)} ${target}`;
        updateComparison();
    } catch (err) {
        info.textContent = 'Fehler beim Abrufen des Kurses. Überprüfe die Internetverbindung.';
    }
    setTimeout(() => { if (info.textContent.startsWith('Kurs wird')) info.textContent = ''; }, 3000);
}

    // ========== Per-Card Seiten-Abfrage (Scraping via CORS-Proxy) ==========
    async function fetchRateFromCard(cardId) {
        const card = cards.find(c => c.id === cardId);
        if (!card) return alert('Karte nicht gefunden');
        if (!card.rateUrl || !card.rateRegex) return alert('Keine Rate-Quelle oder Regex für diese Karte konfiguriert. Bitte Bearbeiten und URL/Regex hinzufügen.');

        const infoMessage = `Lade Rate für ${card.name}...`;
        console.log(infoMessage);

        try {
            // Use a simple CORS proxy (allorigins) to fetch arbitrary pages
            const proxy = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(card.rateUrl);
            const res = await fetch(proxy);
            if (!res.ok) throw new Error('Fehler beim Laden der Seite: ' + res.status);
            const text = await res.text();

            // Apply regex
            let regex;
            try { regex = new RegExp(card.rateRegex, 'i'); } catch (e) { throw new Error('Ungültiger Regex: ' + e.message); }
            const match = text.match(regex);
            if (!match) throw new Error('Kein Treffer mit dem Regex gefunden');

            // Find first numeric group in match
            let num;
            for (let i = 1; i < match.length; i++) {
                const cleaned = match[i].replace(/[^0-9,\.\-]/g, '').replace(',', '.');
                if (cleaned && !isNaN(Number(cleaned))) { num = Number(cleaned); break; }
            }
            if (num == null) {
                // try the full match
                const cleaned = match[0].replace(/[^0-9,\.\-]/g, '').replace(',', '.');
                if (cleaned && !isNaN(Number(cleaned))) num = Number(cleaned);
            }
            if (num == null) throw new Error('Keine Zahl extrahiert');

            // Apply optional markup (percent)
            const finalRate = num * (1 + ((card.rateMarkup || 0) / 100));
            card.lastFetchedRate = finalRate;
            saveToStorage();
            renderCards();
            updateComparison();
            alert(`Erfolgreich: Gefundener Kurs = ${num}, nach Aufschlag = ${finalRate}`);
        } catch (err) {
            console.error('Fehler beim Abrufen der Karte-Rate:', err);
            alert('Fehler beim Abrufen der Rate: ' + err.message + '\nHinweis: Viele Bankseiten sind geschützt; nutze ggf. eine öffentliche Informationsseite oder gib die Rate manuell ein.');
        }
    }

// =================== PWA: Registriere Service Worker ===================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker registriert:', reg))
            .catch(err => console.warn('Service Worker Registrierung fehlgeschlagen:', err));
    });
}
