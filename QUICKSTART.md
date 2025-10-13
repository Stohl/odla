# 🚀 Snabbstart - Deploya till GitHub

## Steg 1: Initiera Git och pusha koden

```bash
# Initiera git repository
git init

# Lägg till alla filer
git add .

# Gör första commit
git commit -m "Initial commit: Min Odlingskalender"

# Koppla till ditt GitHub-repo
git remote add origin https://github.com/Stohl/odla.git

# Pusha till GitHub
git branch -M main
git push -u origin main
```

## Steg 2: Aktivera GitHub Pages

1. Gå till https://github.com/Stohl/odla
2. Klicka på **Settings** (inställningar)
3. Klicka på **Pages** i vänstermenyn
4. Under **Source**, välj **GitHub Actions**
5. Klart! 🎉

## Steg 3: Vänta på deployment

GitHub Actions kommer automatiskt att:
- Bygga din app
- Deploya till GitHub Pages

Du kan följa processen under **Actions**-fliken i ditt repo.

## Din app är live! 🌱

Efter några minuter kommer din odlingskalender att vara tillgänglig på:

### 👉 https://stohl.github.io/odla/

## Uppdatera appen

Varje gång du pushar nya ändringar till `main`-branchen kommer appen automatiskt att uppdateras:

```bash
git add .
git commit -m "Uppdatering: [beskriv vad du ändrat]"
git push
```

## Testa lokalt först

Innan du pushar, testa alltid lokalt:

```bash
npm run dev     # Starta utvecklingsserver
npm run build   # Testa produktionsbygge
```

---

**Lycka till med din odlingskalender! 🌿**

