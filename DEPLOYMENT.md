# GitHub Pages Deployment Guide

## Automatische Bereitstellung

Diese App ist bereits auf GitHub Pages bereitgestellt und kann unter folgender URL verwendet werden:

**👉 https://mynimu.github.io/Best-FX/**

## Manueller Setup für dein Fork

Wenn du dein eigenes Fork erstellt hast, befolge diese Schritte:

### 1. GitHub Settings aktualisieren

1. Gehe zu deinem Repository auf GitHub
2. Klicke auf **Settings** → **Pages**
3. Unter "Build and deployment":
   - **Source**: Wähle "Deploy from a branch"
   - **Branch**: Wähle `main`
   - **Folder**: Wähle `/ (root)`
4. Klicke **Save**

### 2. Warte auf den Deploy

GitHub braucht etwa 1-2 Minuten um die App zu deployen. Du siehst den Status unter Settings → Pages → "Your site is published at..."

### 3. Deine App ist live!

Deine Kreditkarten-Vergleichs-App ist jetzt verfügbar unter:
```
https://DEIN_USERNAME.github.io/Best-FX/
```

## Lokale Entwicklung

### Mit Python Server
```bash
cd Best-FX
python -m http.server 8000
# Öffne http://localhost:8000
```

### Mit Node.js http-server
```bash
npx http-server
# Öffne http://localhost:8080
```

### Mit PHP
```bash
php -S localhost:8000
# Öffne http://localhost:8000
```

## Troubleshooting

**Problem:** Seite zeigt 404
- Stelle sicher, dass `index.html` im Root des Repositories ist
- Überprüfe, dass die Branch-Einstellungen korrekt sind (main branch, / folder)
- Warte 5 Minuten und versuche dann mit F5 neu zu laden

**Problem:** Styles/JavaScript laden nicht
- Überprüfe die Browser-Konsole (F12) auf CORS Fehler
- Stelle sicher, dass alle Dateien gepusht wurden (git push)
- Versuche den Cache zu leeren (Ctrl+Shift+Delete)

**Problem:** Daten verschwinden nach Neuladen
- Das ist normal - Daten werden lokal gespeichert
- Nutze die "Daten exportieren" Funktion als Backup
- Exportierte Daten kannst du später wieder importieren

## Benutzerdefinierte Domain (optional)

Falls du eine benutzerdefinierte Domain verwenden möchtest:

1. Settings → Pages
2. Unter "Custom domain" trage deine Domain ein
3. DNS-Einträge konfigurieren (folge den GitHub Anweisungen)

## Weitere Ressourcen

- [GitHub Pages Dokumentation](https://docs.github.com/en/pages)
- [Jekylls GitHub Pages Guide](https://jekyllrb.com/docs/github-pages/)
- [Deployment Troubleshooting](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages)

---

Viel Erfolg! 🚀
