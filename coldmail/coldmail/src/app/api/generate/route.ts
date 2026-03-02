import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { apiKey, model, companyName, websiteUrl, industry, city, hasWebsite, screenshots } = body;

    // Walidacja
    if (!apiKey) {
      return NextResponse.json({ error: "Brak klucza API – dodaj go w zakładce Ustawienia" }, { status: 400 });
    }
    if (!companyName || !industry || !city) {
      return NextResponse.json({ error: "Brakuje wymaganych pól: nazwa firmy, branża, miasto" }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey });
    const selectedModel = model || "gpt-4o";

    // ── PROMPT – FIRMA MA STRONĘ ──────────────────────────────────
    const promptWithWebsite = `Jesteś ekspertem od web designu, UX i marketingu cyfrowego. Twoim zadaniem jest napisanie skutecznego cold maila do firmy, zachęcającego do stworzenia NOWEJ, profesjonalnej strony internetowej.

Dane firmy:
- Nazwa: ${companyName}
- Branża: ${industry}
- Miasto: ${city}
- Obecna strona: ${websiteUrl || "nie podano URL"}
${screenshots?.length ? "- Dołączono zrzuty ekranu strony – przeanalizuj je pod kątem UI, UX, konwersji i SEO lokalnego" : ""}

Napisz mail dokładnie według tej struktury:

Temat: [chwytliwy tytuł – max 60 znaków, nawiązujący do firmy i branży]

Dzień dobry,

[Jedno zdanie wprowadzające – że odwiedziłeś/przeglądałeś stronę ${companyName}]

Przeprowadziłem analizę strony i zauważyłem kilka kwestii, które warto poprawić:
- [Konkretna wada 1 – np. brak responsywności mobilnej]
- [Konkretna wada 2 – np. wolne ładowanie, wynik PageSpeed poniżej 50]
- [Konkretna wada 3 – np. brak wyraźnego przycisku kontaktowego / CTA]
- [Konkretna wada 4 – np. słabe pozycjonowanie lokalne dla frazy "${industry} ${city}"]
- [Opcjonalna wada 5 jeśli widoczna na zrzutach]

Nowa strona, którą mógłbym przygotować dla ${companyName}, zapewniałaby:
- [Korzyść 1 – np. szybkie ładowanie – wynik PageSpeed 90+]
- [Korzyść 2 – np. pełna responsywność na telefonach i tabletach]
- [Korzyść 3 – np. zoptymalizowane SEO lokalne dla "${industry} ${city}"]
- [Korzyść 4 – np. czytelny formularz kontaktowy zwiększający liczbę zapytań]
- [Korzyść 5 – np. nowoczesny design budujący zaufanie klientów]

[Jedno zdanie o Twojej specjalizacji w branży ${industry} i znajomości lokalnego rynku w ${city}]

Czy byliby Państwo zainteresowani krótką rozmową lub przesłaniem przykładowych realizacji dla firm z branży ${industry}?

Z poważaniem,
[Twoje imię i nazwisko]

ZASADY OBOWIĄZKOWE:
- Używaj dokładnie nazwy "${companyName}", branży "${industry}" i miasta "${city}"
- Minimum 4 konkretne wady, minimum 4 konkretne korzyści
- BEZ żadnych cen ani kwot
- Naturalny język, nie spamowy
- Sugeruj stworzenie nowej strony od podstaw
- Pisz po polsku, zwracaj się per "Państwo"
- Bądź konkretny, nie ogólnikowy`;

    // ── PROMPT – FIRMA BEZ STRONY ─────────────────────────────────
    const promptWithoutWebsite = `Jesteś ekspertem od web designu i marketingu cyfrowego. Napisz skuteczny cold mail do firmy, która NIE POSIADA strony internetowej, zachęcający do jej stworzenia.

Dane firmy:
- Nazwa: ${companyName}
- Branża: ${industry}
- Miasto: ${city}

Napisz mail dokładnie według tej struktury:

Temat: [chwytliwy tytuł – nawiązujący do widoczności w Google i branży]

Dzień dobry,

[Jedno zdanie – kontekst, że podczas przeglądania firm z branży ${industry} w ${city} zauważyłeś brak strony]

Brak strony internetowej w dzisiejszych czasach oznacza przede wszystkim:
- [Konsekwencja 1 – niewidoczność w Google dla fraz "${industry} ${city}"]
- [Konsekwencja 2 – klienci wybierają konkurencję która ma stronę]
- [Konsekwencja 3 – brak możliwości zbierania opinii i ocen Google]
- [Konsekwencja 4 – utrata wiarygodności w oczach nowych klientów]

Profesjonalna strona internetowa dla ${companyName} to natomiast:
- [Korzyść 1 – widoczność 24/7 dla klientów szukających "${industry} ${city}" w Google]
- [Korzyść 2 – formularz kontaktowy generujący zapytania bez Twojego udziału]
- [Korzyść 3 – przewaga nad konkurencją która nadal nie ma strony]
- [Korzyść 4 – lokalne SEO i Wizytówka Google z oceną 5 gwiazdek]
- [Korzyść 5 – profesjonalny wizerunek firmy budujący zaufanie]
- [Korzyść 6 – dotarcie do klientów spoza bezpośredniego otoczenia]

Specjalizuję się w tworzeniu stron dla firm z branży ${industry} i znam specyfikę lokalnego rynku w ${city}.

Chętnie pokażę Państwu przykładowy projekt strony dedykowany dla ${industry} – czy byliby Państwo zainteresowani krótką rozmową?

Z poważaniem,
[Twoje imię i nazwisko]

ZASADY OBOWIĄZKOWE:
- Używaj dokładnie nazwy "${companyName}", branży "${industry}" i miasta "${city}"
- 4-6 konkretnych korzyści posiadania strony
- Mocno podkreśl SEO lokalne i Google
- BEZ żadnych cen ani kwot
- Naturalny język, nie spamowy
- Pisz po polsku, zwracaj się per "Państwo"`;

    const prompt = hasWebsite ? promptWithWebsite : promptWithoutWebsite;

    // ── WYWOŁANIE OPENAI API ──────────────────────────────────────
    let email: string;

    // Wersja z obrazkami (vision) – tylko gdy firma ma stronę i dołączono screenshoty
    const imageMessages = (screenshots || [])
      .filter((s: string) => s.startsWith("data:image"))
      .slice(0, 3)
      .map((base64: string) => ({
        type: "image_url" as const,
        image_url: { url: base64, detail: "auto" as const },
      }));

    if (hasWebsite && imageMessages.length > 0) {
      const response = await openai.chat.completions.create({
        model: selectedModel,
        max_tokens: 1500,
        messages: [{
          role: "user",
          content: [{ type: "text", text: prompt }, ...imageMessages],
        }],
      });
      email = response.choices[0]?.message?.content || "";
    } else {
      const response = await openai.chat.completions.create({
        model: selectedModel,
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }],
      });
      email = response.choices[0]?.message?.content || "";
    }

    if (!email) throw new Error("Pusta odpowiedź od API");

    return NextResponse.json({ email });

  } catch (err: unknown) {
    console.error("API Error:", err);
    const msg = err instanceof Error ? err.message : "Nieznany błąd serwera";

    if (msg.includes("Incorrect API key") || msg.includes("invalid_api_key")) {
      return NextResponse.json({ error: "Nieprawidłowy klucz API. Sprawdź zakładkę Ustawienia." }, { status: 401 });
    }
    if (msg.includes("insufficient_quota")) {
      return NextResponse.json({ error: "Przekroczono limit API. Sprawdź konto OpenAI." }, { status: 402 });
    }

    return NextResponse.json({ error: `Błąd: ${msg}` }, { status: 500 });
  }
}
