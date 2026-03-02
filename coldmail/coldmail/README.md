# ColdMail Generator

Aplikacja do generowania spersonalizowanych cold maili dla firm z pomocą AI (OpenAI GPT-4o).

## Funkcje

- 🔐 Rejestracja i logowanie (dane w localStorage)
- ✉️ Generator cold maili (firma z/bez strony)
- 📎 Upload zrzutów ekranu do analizy przez AI
- 📂 Historia wygenerowanych maili
- ⚙️ Ustawienia konta i klucz API
- 📱 Responsywny design (mobile + desktop)

## Uruchomienie lokalne

```bash
npm install
npm run dev
```

Otwórz http://localhost:3000

## Deploy na Vercel

1. Wrzuć projekt na GitHub
2. Wejdź na vercel.com → New Project → importuj repo
3. Kliknij Deploy

**Nie potrzebujesz żadnych zmiennych środowiskowych** – klucz API wpisujesz bezpośrednio na stronie w zakładce Ustawienia.

## Klucz API

Pobierz klucz na: https://platform.openai.com/api-keys

Wklej go w aplikacji: Ustawienia → Klucz OpenAI API → Zapisz

## Stack

- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- OpenAI SDK
