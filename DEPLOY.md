# 🚀 Deployment till GitHub Pages

## Steg-för-steg guide

### 1. Skapa GitHub Repository

```bash
git init
git add .
git commit -m "Initial commit: Min Odlingskalender"
```

### 2. Koppla till GitHub

Ditt repository finns redan på: https://github.com/Stohl/odla

```bash
git remote add origin https://github.com/Stohl/odla.git
git branch -M main
git push -u origin main
```

### 3. Aktivera GitHub Pages

1. Gå till ditt repository på GitHub
2. Klicka på **Settings** > **Pages**
3. Under **Source**, välj **GitHub Actions**

### 4. Automatisk Deployment

När du pushar till `main`-branchen kommer GitHub Actions automatiskt att:
- Bygga projektet
- Deploya till GitHub Pages

Din app kommer att vara tillgänglig på:
```
https://stohl.github.io/odla/
```

### 5. Manuell Deployment (alternativ)

Om du föredrar manuell deployment:

```bash
npm run deploy
```

Detta kör `gh-pages`-paketet som bygger och pushar till `gh-pages`-branchen.

## ⚙️ Konfigurera base path

Base path är redan konfigurerad för ditt repository i `vite.config.js`:

```js
export default defineConfig({
  plugins: [react()],
  base: '/odla/',
})
```

## 🔧 Felsökning

### Problem: Tomma sidor eller 404-fel
- Kontrollera att `base` i `vite.config.js` matchar ditt repository-namn
- Verifiera att GitHub Pages är aktiverat i repository-inställningar

### Problem: CSS eller bilder laddas inte
- Se till att alla paths är relativa eller använder korrekt base path
- Kontrollera att filer ligger i `public/`-mappen

### Problem: GitHub Actions misslyckas
- Kontrollera att `package.json` har rätt scripts
- Se till att alla dependencies är listade
- Kolla workflow-loggen på GitHub Actions-fliken

## 📝 Checklist

- [ ] Repository skapat på GitHub
- [ ] Kod pushad till `main`
- [ ] GitHub Pages aktiverat (Source: GitHub Actions)
- [ ] Workflow körde framgångsrikt
- [ ] Sidan tillgänglig på GitHub Pages URL

---

**Lycka till med din odling! 🌱**

