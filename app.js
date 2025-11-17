// Speicher-Management
const STORAGE_KEY = 'creditcard_comparison_data';

// Daten initialisieren
let cards = [];

// Beim Laden der Seite
document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
    updateCurrencyLabels();
    renderCards();
    updateComparison();
    
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
            fee: fee
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

    card.name = newName.trim();
    card.fee = parseFloat(newFee) || 0;

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
    
    if (cards.length === 0) {
        cardsList.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">Keine Karten hinzugefügt</p>';
        return;
    }

    cardsList.innerHTML = cards.map(card => `
        <div class="card-item">
            <h3>${escapeHtml(card.name)}</h3>
            <span class="card-fee-badge">${card.fee}%</span>
            <p style="font-size: 0.9rem; color: #666;">Fremdwährungsgebühr</p>
            <div class="card-actions">
                <button class="btn-edit" onclick="editCard(${card.id})">✏️ Bearbeiten</button>
                <button class="btn-delete" onclick="deleteCard(${card.id})">🗑️ Löschen</button>
            </div>
        </div>
    `).join('');
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
    const data = localStorage.getItem(STORAGE_KEY);
    cards = data ? JSON.parse(data) : [];
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

// =================== PWA: Registriere Service Worker ===================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker registriert:', reg))
            .catch(err => console.warn('Service Worker Registrierung fehlgeschlagen:', err));
    });
}
