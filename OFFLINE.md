# Offline Anleitung (Android)

Diese Anleitung beschreibt, wie du die App vollständig offline auf einem Android-Gerät laufen lässt. Ideal, wenn das Repository privat bleiben soll.

## Übersicht — empfohlene Wege

- Schnell & zuverlässig (empfohlen): ZIP herunterladen, entpacken, `index.html` mit **Firefox** öffnen.
- Optional/Advanced: Lokaler HTTP-Server auf Android mit Termux (empfohlen bei Probleme mit `file://`).

> Hinweis: Wenn das Repository privat ist, musst du auf GitHub eingeloggt sein, um die ZIP herunterzuladen. Alle Schritte funktionieren ohne Veröffentlichung des Repos.

---

## 1) ZIP herunterladen & lokal öffnen (einfach)

1. Öffne auf deinem Android-Gerät im Browser (z. B. Chrome oder Firefox) die Repository-Seite:
   `https://github.com/mynimu/Best-FX`
2. Tippe auf **Code** → **Download ZIP**.
3. Öffne den Download-Ordner (meist `/sdcard/Download`) mit einem Dateimanager oder einer App wie **ZArchiver** oder **RAR**.
4. Entpacke `Best-FX-main.zip` nach z. B. `/sdcard/Best-FX/`.
   - Stelle sicher, dass `index.html`, `styles.css` und `app.js` im selben Ordner liegen.
5. Öffne den entpackten Ordner und tippe auf `index.html`.
   - Wenn du gefragt wirst, welche App verwendet werden soll, wähle **Firefox** (bietet die zuverlässigste Unterstützung für lokale Dateien).

### Warum Firefox?
- Viele Browser beschränken lokale Datei-Zugriffe (CSS/JS kann blockiert werden). Firefox lädt lokale CSS/JS normalerweise korrekt.

---

## 2) Troubleshooting (falls CSS/JS fehlt)

- Prüfe, ob `styles.css` und `app.js` im selben Verzeichnis wie `index.html` liegen.
- Probiere einen anderen Browser (Firefox empfohlen).
- Leere ggf. den Browser-Cache oder öffne die Datei erneut.

Wenn es weiterhin nicht funktioniert, benutze die Termux-Methode (siehe unten).

---

## 3) Alternative: Dateien per PC auf das Handy übertragen

1. Lade die ZIP auf einem PC herunter (falls du nicht direkt auf dem Handy bist).
2. Übertrage per USB oder Cloud (Google Drive) die ZIP zum Handy.
3. Entpacke und öffne wie oben beschrieben.

---

## 4) Advanced: Lokaler HTTP-Server auf Android (Termux) — zuverlässig

Vorteile: Keine `file://`-Einschränkungen, die Seite verhält sich wie auf einem Desktop-Webserver.

1. Installiere **Termux** (über F‑Droid oder Play Store).
2. Erlaube Termux Zugriff auf Speicher:
   ```bash
   termux-setup-storage
   ```
3. Kopiere/entpacke den Ordner `Best-FX` nach `/sdcard/Best-FX/`.
4. Öffne Termux und führe aus:
   ```bash
   pkg update
   pkg install python
   cd /sdcard/Best-FX
   python -m http.server 8000
   ```
5. Öffne im Android-Browser:
   - `http://127.0.0.1:8000`  (oder `http://localhost:8000`)
   - Alternativ `http://<deine_android_ip>:8000` falls du von anderen Geräten im WLAN zugreifen willst (dann `python -m http.server 8000 --bind 0.0.0.0`).

Hinweis: Termux verlangt ggf. Berechtigungen für Speicherzugriff und Netzwerk.

---

## 5) Shortcut: Zum Startbildschirm hinzufügen

In Firefox: Menü (⋮) → Seite → `Zum Startbildschirm hinzufügen`.
Dadurch erhältst du ein Icon, das `index.html` wie eine App startet.

---

## 6) Kurze Checkliste vor dem Öffnen

- Dateien im selben Ordner: `index.html`, `styles.css`, `app.js`.
- Repo privat? Dann vor dem Herunterladen bei GitHub einloggen.
- Empfohlener Browser: Firefox.
- Bei Problemen mit `file://`: Termux Webserver verwenden.

---

Wenn du möchtest, push ich diese Datei jetzt ins Repository (ich habe die Datei bereits erstellt). Möchtest du, dass ich noch eine kurze Anleitung hinzufüge, wie du ein Home-Screen Icon automatisch erstellst (Schritt-für-Schritt mit Screenshots)?
