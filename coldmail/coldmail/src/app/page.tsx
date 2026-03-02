"use client";

import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────
// TYPY
// ─────────────────────────────────────────────
type Page = "login" | "register" | "app";
type AppTab = "generator" | "history" | "settings";

interface User {
  email: string;
  name: string;
  apiKey: string;
  model: string;
}

interface HistoryEntry {
  id: string;
  date: string;
  companyName: string;
  city: string;
  industry: string;
  hasWebsite: boolean;
  email: string;
}

// ─────────────────────────────────────────────
// STYLE (design system)
// ─────────────────────────────────────────────
const C = {
  bg: "#0f172a",
  surface: "#1e293b",
  surface2: "#0f172a",
  border: "#334155",
  accent: "#6366f1",
  accentDark: "#4f46e5",
  muted: "#94a3b8",
  text: "#f1f5f9",
  danger: "#ef4444",
  success: "#22c55e",
  warning: "#f59e0b",
};

// ─────────────────────────────────────────────
// UI HELPERS
// ─────────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 16,
      padding: 32,
      ...style,
    }}>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ color: C.muted, fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
      {children}
    </div>
  );
}

function TextInput({
  placeholder, value, onChange, type = "text", disabled = false
}: {
  placeholder: string; value: string; onChange: (v: string) => void; type?: string; disabled?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: "100%", padding: "12px 16px", borderRadius: 10,
        border: `1px solid ${focused ? C.accent : C.border}`,
        background: disabled ? "#1a2535" : C.surface2,
        color: C.text, fontSize: 15, outline: "none",
        boxShadow: focused ? `0 0 0 3px rgba(99,102,241,0.2)` : "none",
        transition: "all 0.2s",
        opacity: disabled ? 0.6 : 1,
      }}
    />
  );
}

function Btn({
  children, onClick, disabled = false, variant = "primary", full = false, small = false
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  full?: boolean;
  small?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const bg: Record<string, string> = {
    primary: hovered && !disabled ? C.accentDark : C.accent,
    secondary: hovered && !disabled ? "#273548" : C.surface,
    danger: hovered && !disabled ? "#dc2626" : "#7f1d1d",
    ghost: hovered && !disabled ? "rgba(99,102,241,0.15)" : "transparent",
  };
  const border: Record<string, string> = {
    primary: "none",
    secondary: `1px solid ${C.border}`,
    danger: `1px solid ${C.danger}`,
    ghost: `1px solid ${C.accent}`,
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: small ? "7px 14px" : "12px 24px",
        borderRadius: 10, border: border[variant],
        background: disabled ? "#1e293b" : bg[variant],
        color: variant === "secondary" ? C.text : variant === "ghost" ? C.accent : "#fff",
        fontSize: small ? 13 : 15, fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "all 0.2s",
        width: full ? "100%" : "auto",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

function Alert({ msg, type }: { msg: string; type: "error" | "success" | "info" }) {
  const colors = {
    error: { bg: "rgba(239,68,68,0.1)", border: C.danger, text: "#fca5a5" },
    success: { bg: "rgba(34,197,94,0.1)", border: C.success, text: "#86efac" },
    info: { bg: "rgba(99,102,241,0.1)", border: C.accent, text: "#a5b4fc" },
  };
  const c = colors[type];
  return (
    <div style={{ padding: "12px 16px", background: c.bg, border: `1px solid ${c.border}`, borderRadius: 10, color: c.text, fontSize: 14 }}>
      {msg}
    </div>
  );
}

// ─────────────────────────────────────────────
// AUTH PAGES
// ─────────────────────────────────────────────
function LoginPage({ onLogin, onGoRegister }: { onLogin: (u: User) => void; onGoRegister: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = () => {
    setError("");
    if (!email || !password) { setError("Uzupełnij wszystkie pola"); return; }
    const stored = localStorage.getItem("users");
    const users: (User & { password: string })[] = stored ? JSON.parse(stored) : [];
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) { setError("Nieprawidłowy email lub hasło"); return; }
    const { password: _, ...user } = found;
    localStorage.setItem("loggedUser", JSON.stringify(user));
    onLogin(user);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 36, fontWeight: 800, background: "linear-gradient(135deg,#6366f1,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            ColdMail Generator
          </div>
          <div style={{ color: C.muted, marginTop: 8, fontSize: 15 }}>Zaloguj się do swojego konta</div>
        </div>
        <Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div><Label>Email</Label><TextInput placeholder="twoj@email.pl" value={email} onChange={setEmail} type="email" /></div>
            <div><Label>Hasło</Label><TextInput placeholder="••••••••" value={password} onChange={setPassword} type="password" /></div>
            {error && <Alert msg={error} type="error" />}
            <Btn full onClick={login}>Zaloguj się →</Btn>
            <div style={{ textAlign: "center", color: C.muted, fontSize: 14 }}>
              Nie masz konta?{" "}
              <span onClick={onGoRegister} style={{ color: C.accent, cursor: "pointer", fontWeight: 600 }}>Zarejestruj się</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function RegisterPage({ onRegister, onGoLogin }: { onRegister: (u: User) => void; onGoLogin: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");

  const register = () => {
    setError("");
    if (!name || !email || !password) { setError("Uzupełnij wszystkie pola"); return; }
    if (password !== password2) { setError("Hasła się nie zgadzają"); return; }
    if (password.length < 6) { setError("Hasło musi mieć min. 6 znaków"); return; }
    const stored = localStorage.getItem("users");
    const users: (User & { password: string })[] = stored ? JSON.parse(stored) : [];
    if (users.find(u => u.email === email)) { setError("Konto z tym emailem już istnieje"); return; }
    const newUser: User & { password: string } = { name, email, password, apiKey: "", model: "gpt-4o" };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    const { password: _, ...user } = newUser;
    localStorage.setItem("loggedUser", JSON.stringify(user));
    onRegister(user);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 36, fontWeight: 800, background: "linear-gradient(135deg,#6366f1,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            ColdMail Generator
          </div>
          <div style={{ color: C.muted, marginTop: 8, fontSize: 15 }}>Stwórz nowe konto</div>
        </div>
        <Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div><Label>Imię i nazwisko</Label><TextInput placeholder="Jan Kowalski" value={name} onChange={setName} /></div>
            <div><Label>Email</Label><TextInput placeholder="twoj@email.pl" value={email} onChange={setEmail} type="email" /></div>
            <div><Label>Hasło</Label><TextInput placeholder="min. 6 znaków" value={password} onChange={setPassword} type="password" /></div>
            <div><Label>Powtórz hasło</Label><TextInput placeholder="••••••••" value={password2} onChange={setPassword2} type="password" /></div>
            {error && <Alert msg={error} type="error" />}
            <Btn full onClick={register}>Zarejestruj się →</Btn>
            <div style={{ textAlign: "center", color: C.muted, fontSize: 14 }}>
              Masz już konto?{" "}
              <span onClick={onGoLogin} style={{ color: C.accent, cursor: "pointer", fontWeight: 600 }}>Zaloguj się</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SETTINGS TAB
// ─────────────────────────────────────────────
function SettingsTab({ user, onUpdate }: { user: User; onUpdate: (u: User) => void }) {
  const [apiKey, setApiKey] = useState(user.apiKey || "");
  const [model, setModel] = useState(user.model || "gpt-4o");
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState(user.name);

  const save = () => {
    const updated = { ...user, apiKey, model, name };
    // Zaktualizuj w localStorage
    const stored = localStorage.getItem("users");
    if (stored) {
      const users: (User & { password: string })[] = JSON.parse(stored);
      const idx = users.findIndex(u => u.email === user.email);
      if (idx !== -1) {
        users[idx] = { ...users[idx], apiKey, model, name };
        localStorage.setItem("users", JSON.stringify(users));
      }
    }
    localStorage.setItem("loggedUser", JSON.stringify(updated));
    onUpdate(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <Card>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, color: C.text }}>⚙️ Ustawienia konta</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          <div><Label>Imię i nazwisko</Label><TextInput placeholder="Jan Kowalski" value={name} onChange={setName} /></div>
          <div><Label>Email (nie można zmienić)</Label><TextInput placeholder="" value={user.email} onChange={() => {}} disabled /></div>

          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 16 }}>🔑 Klucz OpenAI API</h3>
            <div style={{ marginBottom: 16 }}>
              <Label>Klucz API</Label>
              <input
                type="password"
                placeholder="sk-proj-..."
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: 10,
                  border: `1px solid ${C.border}`, background: C.surface2,
                  color: C.text, fontSize: 15, outline: "none", fontFamily: "monospace",
                }}
              />
              <div style={{ color: C.muted, fontSize: 12, marginTop: 6 }}>
                Pobierz klucz na:{" "}
                <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" style={{ color: C.accent }}>
                  platform.openai.com/api-keys
                </a>
              </div>
            </div>

            <div>
              <Label>Model AI</Label>
              <select
                value={model}
                onChange={e => setModel(e.target.value)}
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: 10,
                  border: `1px solid ${C.border}`, background: C.surface2,
                  color: C.text, fontSize: 15, outline: "none",
                }}
              >
                <option value="gpt-4o">GPT-4o – najlepszy (rekomendowany)</option>
                <option value="gpt-4o-mini">GPT-4o Mini – szybszy i tańszy</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
              </select>
            </div>
          </div>

          <Btn full onClick={save} variant={saved ? "secondary" : "primary"}>
            {saved ? "✅ Zapisano!" : "💾 Zapisz ustawienia"}
          </Btn>
        </div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────
// HISTORY TAB
// ─────────────────────────────────────────────
function HistoryTab({ userEmail }: { userEmail: string }) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [selected, setSelected] = useState<HistoryEntry | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(`history_${userEmail}`);
    if (raw) setHistory(JSON.parse(raw));
  }, [userEmail]);

  const deleteEntry = (id: string) => {
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem(`history_${userEmail}`, JSON.stringify(updated));
    if (selected?.id === id) setSelected(null);
  };

  const copy = async () => {
    if (!selected) return;
    await navigator.clipboard.writeText(selected.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (history.length === 0) {
    return (
      <Card style={{ textAlign: "center", padding: 60 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
        <div style={{ color: C.muted, fontSize: 16 }}>Brak wygenerowanych maili</div>
        <div style={{ color: "#64748b", fontSize: 14, marginTop: 8 }}>Wygeneruj pierwszy mail w zakładce Generator</div>
      </Card>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20, alignItems: "start" }}>
      {/* Lista */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {history.map(h => (
          <div
            key={h.id}
            onClick={() => setSelected(h)}
            style={{
              padding: "14px 16px", borderRadius: 12, cursor: "pointer",
              border: `1px solid ${selected?.id === h.id ? C.accent : C.border}`,
              background: selected?.id === h.id ? "rgba(99,102,241,0.1)" : C.surface,
              transition: "all 0.15s",
            }}
          >
            <div style={{ fontWeight: 600, color: C.text, fontSize: 14 }}>{h.companyName}</div>
            <div style={{ color: C.muted, fontSize: 12, marginTop: 3 }}>{h.industry} · {h.city}</div>
            <div style={{ color: "#64748b", fontSize: 11, marginTop: 4 }}>
              {h.hasWebsite ? "📄 Ma stronę" : "🚫 Bez strony"} · {new Date(h.date).toLocaleDateString("pl")}
            </div>
          </div>
        ))}
      </div>

      {/* Podgląd */}
      {selected ? (
        <Card style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 18, color: C.text }}>{selected.companyName}</div>
              <div style={{ color: C.muted, fontSize: 13 }}>{selected.industry} · {selected.city} · {new Date(selected.date).toLocaleString("pl")}</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn small variant="ghost" onClick={copy}>{copied ? "✅ Skopiowano" : "📋 Kopiuj"}</Btn>
              <Btn small variant="danger" onClick={() => deleteEntry(selected.id)}>🗑 Usuń</Btn>
            </div>
          </div>
          <textarea
            value={selected.email}
            readOnly
            style={{
              width: "100%", minHeight: 420, padding: 16, borderRadius: 10,
              border: `1px solid ${C.border}`, background: C.surface2,
              color: C.text, fontSize: 14, lineHeight: 1.75, resize: "vertical",
              outline: "none", fontFamily: "inherit",
            }}
          />
        </Card>
      ) : (
        <Card style={{ textAlign: "center", padding: 60, color: C.muted }}>
          Wybierz mail z listy aby go podejrzeć
        </Card>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// GENERATOR TAB
// ─────────────────────────────────────────────
function GeneratorTab({ user }: { user: User }) {
  const [companyName, setCompanyName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [industry, setIndustry] = useState("");
  const [city, setCity] = useState("");
  const [hasWebsite, setHasWebsite] = useState<boolean | null>(null);
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const toBase64 = (file: File): Promise<string> =>
    new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result as string);
      r.onerror = rej;
      r.readAsDataURL(file);
    });

  const generate = async () => {
    if (!user.apiKey) { setError("Dodaj klucz API w zakładce ⚙️ Ustawienia"); return; }
    if (!companyName.trim()) { setError("Podaj nazwę firmy"); return; }
    if (!industry.trim()) { setError("Podaj branżę"); return; }
    if (!city.trim()) { setError("Podaj miasto"); return; }
    if (hasWebsite === null) { setError("Zaznacz czy firma posiada stronę"); return; }

    setLoading(true); setError(""); setGeneratedEmail("");

    try {
      const imgs = await Promise.all(
        screenshots.filter(f => f.type.startsWith("image/")).slice(0, 3).map(toBase64)
      );

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: user.apiKey,
          model: user.model,
          companyName, websiteUrl, industry, city, hasWebsite,
          screenshots: imgs,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Błąd API");

      setGeneratedEmail(data.email);

      // Zapisz do historii
      const entry: HistoryEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        companyName, city, industry, hasWebsite,
        email: data.email,
      };
      const raw = localStorage.getItem(`history_${user.email}`);
      const history: HistoryEntry[] = raw ? JSON.parse(raw) : [];
      history.unshift(entry);
      localStorage.setItem(`history_${user.email}`, JSON.stringify(history.slice(0, 100)));

    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Nieznany błąd");
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(generatedEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setGeneratedEmail(""); setError("");
    setCompanyName(""); setWebsiteUrl(""); setIndustry(""); setCity(""); setHasWebsite(null); setScreenshots([]);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: generatedEmail || loading ? "1fr 1fr" : "1fr", gap: 24, alignItems: "start" }}>

      {/* ── FORMULARZ ── */}
      <Card>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 24, paddingBottom: 14, borderBottom: `1px solid ${C.border}` }}>
          📋 Dane firmy
        </h2>

        {!user.apiKey && (
          <div style={{ marginBottom: 20, padding: "12px 16px", background: "rgba(245,158,11,0.1)", border: `1px solid ${C.warning}`, borderRadius: 10, color: "#fcd34d", fontSize: 13 }}>
            ⚠️ Brak klucza API — przejdź do zakładki <strong>⚙️ Ustawienia</strong> aby go dodać
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div><Label>Nazwa firmy *</Label><TextInput placeholder="np. Auto Serwis Kowalski" value={companyName} onChange={setCompanyName} /></div>
          <div><Label>Branża *</Label><TextInput placeholder="np. Mechanika samochodowa, Restauracja, Dentysta" value={industry} onChange={setIndustry} /></div>
          <div><Label>Miasto *</Label><TextInput placeholder="np. Warszawa, Kraków, Gdańsk" value={city} onChange={setCity} /></div>
          <div><Label>Link do strony <span style={{ fontWeight: 400, textTransform: "none" }}>(opcjonalny)</span></Label><TextInput type="url" placeholder="https://przykladowafirma.pl" value={websiteUrl} onChange={setWebsiteUrl} /></div>

          {/* Radio */}
          <div>
            <Label>Status strony internetowej *</Label>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { val: true, label: "✅ Firma posiada stronę internetową" },
                { val: false, label: "❌ Firma nie posiada strony internetowej" },
              ].map(({ val, label }) => {
                const active = hasWebsite === val;
                return (
                  <label key={String(val)} style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                    borderRadius: 10, cursor: "pointer",
                    border: `1px solid ${active ? C.accent : C.border}`,
                    background: active ? "rgba(99,102,241,0.1)" : "transparent",
                    transition: "all 0.2s",
                  }}>
                    <input type="radio" name="hasWebsite" checked={active}
                      onChange={() => { setHasWebsite(val); setScreenshots([]); }}
                      style={{ accentColor: C.accent, width: 18, height: 18 }} />
                    <span style={{ color: C.text, fontSize: 15 }}>{label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Upload */}
          {hasWebsite === true && (
            <div>
              <Label>Zrzuty ekranu strony <span style={{ fontWeight: 400, textTransform: "none" }}>(max 5 – PNG/JPG)</span></Label>
              <div
                onClick={() => fileRef.current?.click()}
                style={{
                  border: `2px dashed ${C.border}`, borderRadius: 10, padding: "20px 16px",
                  textAlign: "center", cursor: "pointer", transition: "all 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = C.accent)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}
              >
                <div style={{ fontSize: 28, marginBottom: 6 }}>📎</div>
                <div style={{ color: C.muted, fontSize: 14 }}>Kliknij aby dodać pliki</div>
                <div style={{ color: "#64748b", fontSize: 12, marginTop: 3 }}>AI przeanalizuje UI/UX strony</div>
              </div>
              <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg" multiple
                onChange={e => { if (e.target.files) setScreenshots(prev => [...prev, ...Array.from(e.target.files!)].slice(0, 5)); }}
                style={{ display: "none" }} />
              {screenshots.map((f, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "8px 12px", marginTop: 8,
                  background: "rgba(99,102,241,0.1)", border: `1px solid ${C.accent}`, borderRadius: 8,
                }}>
                  <span style={{ color: "#c7d2fe", fontSize: 13 }}>📄 {f.name}</span>
                  <button onClick={() => setScreenshots(prev => prev.filter((_, j) => j !== i))}
                    style={{ color: C.danger, background: "none", border: "none", cursor: "pointer", fontSize: 20, lineHeight: 1 }}>×</button>
                </div>
              ))}
            </div>
          )}

          {error && <Alert msg={error} type="error" />}

          <div style={{ display: "flex", gap: 10 }}>
            <Btn full onClick={generate} disabled={loading}>
              {loading ? "⏳ Generowanie..." : "✨ Generuj mail"}
            </Btn>
            {(generatedEmail || error) && (
              <Btn variant="secondary" onClick={reset}>↺ Reset</Btn>
            )}
          </div>
        </div>
      </Card>

      {/* ── OUTPUT ── */}
      {(generatedEmail || loading) && (
        <Card className="fadeIn">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingBottom: 14, borderBottom: `1px solid ${C.border}` }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text }}>✉️ Wygenerowany mail</h2>
            {generatedEmail && (
              <Btn small variant="ghost" onClick={copy}>
                {copied ? "✅ Skopiowano!" : "📋 Kopiuj"}
              </Btn>
            )}
          </div>

          {loading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300, gap: 16 }}>
              <div style={{ width: 44, height: 44, border: "3px solid #334155", borderTopColor: C.accent, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              <div style={{ color: C.muted }}>AI generuje mail...</div>
            </div>
          )}

          {!loading && generatedEmail && (
            <>
              <textarea
                value={generatedEmail}
                onChange={e => setGeneratedEmail(e.target.value)}
                style={{
                  width: "100%", minHeight: 480, padding: 16, borderRadius: 10,
                  border: `1px solid ${C.border}`, background: C.surface2,
                  color: C.text, fontSize: 14, lineHeight: 1.75, resize: "vertical",
                  outline: "none", fontFamily: "inherit",
                }}
              />
              <div style={{ color: "#64748b", fontSize: 12, textAlign: "center", marginTop: 10 }}>
                ✏️ Możesz edytować tekst przed wysłaniem · Zapisano automatycznie w historii
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN APP (po zalogowaniu)
// ─────────────────────────────────────────────
function AppShell({ user, onLogout, onUserUpdate }: { user: User; onLogout: () => void; onUserUpdate: (u: User) => void }) {
  const [tab, setTab] = useState<AppTab>("generator");

  const tabs: { id: AppTab; label: string }[] = [
    { id: "generator", label: "✉️ Generator" },
    { id: "history", label: "📂 Historia" },
    { id: "settings", label: "⚙️ Ustawienia" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      {/* NAVBAR */}
      <nav style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <div style={{ fontSize: 20, fontWeight: 800, background: "linear-gradient(135deg,#6366f1,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            ColdMail Generator
          </div>

          {/* Taby */}
          <div style={{ display: "flex", gap: 4 }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: "7px 16px", borderRadius: 8, border: "none", cursor: "pointer",
                background: tab === t.id ? C.accent : "transparent",
                color: tab === t.id ? "#fff" : C.muted,
                fontWeight: 600, fontSize: 13, transition: "all 0.2s",
              }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* User + Logout */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ color: C.muted, fontSize: 13 }}>👤 {user.name}</span>
            <Btn small variant="secondary" onClick={onLogout}>Wyloguj</Btn>
          </div>
        </div>
      </nav>

      {/* CONTENT */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 20px" }}>
        {tab === "generator" && <GeneratorTab user={user} />}
        {tab === "history" && <HistoryTab userEmail={user.email} />}
        {tab === "settings" && <SettingsTab user={user} onUpdate={onUserUpdate} />}
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────────
export default function Root() {
  const [page, setPage] = useState<Page>("login");
  const [user, setUser] = useState<User | null>(null);

  // Sprawdź czy jest zalogowany użytkownik
  useEffect(() => {
    const stored = localStorage.getItem("loggedUser");
    if (stored) {
      setUser(JSON.parse(stored));
      setPage("app");
    }
  }, []);

  const handleLogin = (u: User) => { setUser(u); setPage("app"); };
  const handleRegister = (u: User) => { setUser(u); setPage("app"); };
  const handleLogout = () => {
    localStorage.removeItem("loggedUser");
    setUser(null);
    setPage("login");
  };
  const handleUserUpdate = (u: User) => setUser(u);

  if (page === "login") return <LoginPage onLogin={handleLogin} onGoRegister={() => setPage("register")} />;
  if (page === "register") return <RegisterPage onRegister={handleRegister} onGoLogin={() => setPage("login")} />;
  if (page === "app" && user) return <AppShell user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />;
  return null;
}
