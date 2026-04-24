import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `Du bist APEX – der fortschrittlichste MMA KI-Trainer der Welt.

Du hast die Trainingsmethoden der absoluten Elite-Coaches der Welt studiert und verinnerlicht – aus allen verfügbaren Quellen: Interviews, Podcasts, YouTube, TikTok, Dokumentationen, Bücher, Social Media, Radio und mehr:

KRAFT & KONDITION EXPERTEN:
- Phil Daru (Daru Strong): Explosivkraft, Athletic Performance, periodisiertes Strength Training für MMA Kämpfer. Bekannt für seine "Fighter Prep" Methode, Compensatory Acceleration Training (CAT), und seine Arbeit mit UFC Champions wie Dustin Poirier.
- Mike Dolce (The Dolce Diet): Gewichtsmanagement, Ernährungsoptimierung, Recovery-Protokolle, natürliche Lebensmittel für maximale Performance.
- Bo Nickal / Bo Sandoval: Athletik-Training, Wrestling-basierte Kondition, Explosive Power.
- Nick Curson (Speed of Sport): Speed-Training, reaktive Kraft, athletische Bewegungsmuster, neuromuskuläres Training.

MMA TECHNIK LEGENDEN:
- Khabib Nurmagomedov: Sambo, Grappling-Kontrolle, Cage Wrestling
- Jon Jones: Unorthodoxe Angles, Reichweite, Ellenbogen-Technik
- Israel Adesanya: Kickbox-Rhythmus, Distanzmanagement, Counter-Striking
- GSP: Wrestling-to-Striking, Double-Leg Takedowns, Disziplin
- Demetrious Johnson: Transition Speed, Submission-Hunting, Titelkämpfe
- Amanda Nunes: Power-Striking, BJJ-Finishing

DEINE METHODEN:
- Kombiniere die BESTEN Elemente aller Coaches für den spezifischen Kämpfer
- Nutze periodisiertes Training (Makro/Mikro-Zyklen)
- Integriere Scientific Strength & Conditioning Prinzipien
- Passe alles EXAKT an das an, was der Kämpfer dir beschreibt
- Sei KONKRET: echte Übungen, echte Sets/Reps, echte Zeiten, echte Progressionen
- Erkläre WARUM du bestimmte Methoden verwendest (welcher Coach, welches Prinzip)

FORMATIERUNG – SEHR WICHTIG:
- Strukturiere deine Antworten IMMER mit klaren Überschriften (## für Hauptbereiche, ### für Unterbereiche)
- Nutze **Fettschrift** für wichtige Begriffe, Übungen und Zahlen
- Nutze Aufzählungen (- oder 1. 2. 3.) für Übungslisten und Pläne
- Trenne Wochentage klar mit ### Montag, ### Dienstag etc.
- Mache Trainingspläne VOLLSTÄNDIG – schreibe alle Tage aus, höre nie mitten in einem Plan auf
- Nutze Trennlinien (---) zwischen großen Abschnitten

WICHTIG: Du antwortest IMMER auf Deutsch. Du bist direkt, motivierend, präzise wie ein echter Profi-Coach. Du beantwortest ALLES was der Kämpfer fragt – kein Limit. Schreibe immer den GESAMTEN Plan vollständig aus.`;

const MARTIAL_ARTS = [
  { id: "mma", label: "MMA", icon: "🥊", desc: "Mixed Martial Arts" },
  { id: "boxing", label: "Boxen", icon: "👊", desc: "Klassisches Boxen" },
  { id: "muaythai", label: "Muay Thai", icon: "🦵", desc: "8-Limb Kunst" },
  { id: "bjj", label: "BJJ", icon: "🥋", desc: "Brazilian Jiu-Jitsu" },
  { id: "wrestling", label: "Wrestling", icon: "🤼", desc: "Takedowns & Control" },
  { id: "kickboxing", label: "Kickboxen", icon: "⚡", desc: "Kickbox Sport" },
  { id: "judo", label: "Judo", icon: "🎌", desc: "Würfe & Hebel" },
  { id: "sambo", label: "Sambo", icon: "🔥", desc: "Russischer Kampfsport" },
];

const TRAIN_TYPES = [
  { id: "strength", label: "Kraft & Kondition", icon: "💪", desc: "Maximale Stärke, Explosivität & Ausdauer" },
  { id: "technik", label: "Technik", icon: "🥋", desc: "Kampfsport-Technik auf Profi-Niveau" },
  { id: "ausdauer", label: "Ausdauer", icon: "🫁", desc: "Cardio, Gaswork & mentale Härte" },
];

const DESCRIBE_PROMPTS = {
  strength: {
    title: "Beschreibe dein Ziel",
    placeholder: "z.B. Ich will in 8 Wochen meinen Kampf vorbereiten, 3x pro Woche trainieren, hauptsächlich Explosivkraft und Kondition für 3 Runden. Ich habe eine Langhantel, Kettlebells und Sandsäcke...",
    hints: ["Wie viele Wochen hast du?", "Wie oft pro Woche?", "Welches Equipment?", "Aktuelles Level?"],
  },
  technik: {
    title: "Was willst du verbessern?",
    placeholder: "z.B. Ich will meinen Jab-Cross-Hook-Kombination schärfen, meine Distanz besser kontrollieren und meinen Takedown-Defense verbessern. Ich trainiere seit 2 Jahren Muay Thai...",
    hints: ["Welche Technik fehlt dir?", "Was ist deine Schwäche?", "Wie viel Zeit pro Training?"],
  },
  ausdauer: {
    title: "Beschreibe dein Konditions-Ziel",
    placeholder: "z.B. Ich will in 12 Wochen für einen 5-Runden-Hauptkampf vorbereiten. Ich werde nach Runde 2 immer müde. Ich kann 5x pro Woche trainieren...",
    hints: ["Wie viele Runden kämpfst du?", "Was ist dein Schwachpunkt?", "Wie oft pro Woche?"],
  },
};

// ── MARKDOWN RENDERER ─────────────────────────────────────────────────────────
function renderMarkdown(text) {
  const lines = text.split("\n");
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // H2
    if (line.startsWith("## ")) {
      elements.push(
        <div key={i} style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, letterSpacing: 2, color: "#E8272A", marginTop: 20, marginBottom: 6, borderBottom: "1px solid rgba(232,39,42,0.25)", paddingBottom: 4 }}>
          {line.replace("## ", "")}
        </div>
      );
      i++;
      continue;
    }

    // H3
    if (line.startsWith("### ")) {
      elements.push(
        <div key={i} style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginTop: 14, marginBottom: 4, letterSpacing: 0.5 }}>
          {line.replace("### ", "")}
        </div>
      );
      i++;
      continue;
    }

    // HR
    if (line.trim() === "---") {
      elements.push(<div key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.08)", margin: "14px 0" }} />);
      i++;
      continue;
    }

    // Bullet list
    if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 3 }}>
          <span style={{ color: "#E8272A", flexShrink: 0, marginTop: 1 }}>▸</span>
          <span style={{ fontSize: 13, color: "#d0d0d0", lineHeight: 1.6 }}>{inlineMarkdown(line.slice(2))}</span>
        </div>
      );
      i++;
      continue;
    }

    // Numbered list
    const numMatch = line.match(/^(\d+)\.\s+(.+)/);
    if (numMatch) {
      elements.push(
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 3 }}>
          <span style={{ color: "#E8272A", flexShrink: 0, minWidth: 18, fontSize: 12, fontWeight: 700, marginTop: 2 }}>{numMatch[1]}.</span>
          <span style={{ fontSize: 13, color: "#d0d0d0", lineHeight: 1.6 }}>{inlineMarkdown(numMatch[2])}</span>
        </div>
      );
      i++;
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      elements.push(<div key={i} style={{ height: 6 }} />);
      i++;
      continue;
    }

    // Normal paragraph
    elements.push(
      <div key={i} style={{ fontSize: 13, color: "#d0d0d0", lineHeight: 1.7, marginBottom: 2 }}>
        {inlineMarkdown(line)}
      </div>
    );
    i++;
  }

  return elements;
}

function inlineMarkdown(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} style={{ color: "#fff", fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

// ─────────────────────────────────────────────────────────────────────────────

export default function MMATrainer() {
  const [screen, setScreen] = useState("splash");
  const [profile, setProfile] = useState({ name: "", level: "", weight: "", goal: "" });
  const [step, setStep] = useState(0);
  const [trainType, setTrainType] = useState(null);
  const [martialArt, setMartialArt] = useState(null);
  const [description, setDescription] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const onboardingSteps = [
    { question: "Wie heißt du, Kämpfer?", key: "name", type: "text", placeholder: "Dein Name..." },
    {
      question: "Dein Erfahrungslevel?", key: "level", type: "choice",
      options: [
        { label: "Anfänger", sub: "0 – 1 Jahr", icon: "🌱" },
        { label: "Fortgeschritten", sub: "1 – 3 Jahre", icon: "⚔️" },
        { label: "Erfahren", sub: "3 – 5 Jahre", icon: "🏆" },
        { label: "Profi / Semi-Pro", sub: "Wettkampf-Niveau", icon: "👑" },
      ],
    },
    {
      question: "Deine Gewichtsklasse?", key: "weight", type: "choice",
      options: [
        { label: "Strohgewicht", sub: "bis 52 kg", icon: "🪶" },
        { label: "Federgewicht", sub: "bis 66 kg", icon: "🐦" },
        { label: "Leichtgewicht", sub: "bis 70 kg", icon: "⚡" },
        { label: "Weltergewicht", sub: "bis 77 kg", icon: "🔥" },
        { label: "Mittelgewicht", sub: "bis 84 kg", icon: "💥" },
        { label: "Schwergewicht", sub: "84 kg+", icon: "🦁" },
      ],
    },
    {
      question: "Dein Hauptziel?", key: "goal", type: "choice",
      options: [
        { label: "Fitness & Form", sub: "Körper formen & fit werden", icon: "💪" },
        { label: "Technik verbessern", sub: "Skills auf nächstes Level", icon: "🎯" },
        { label: "Wettkampf", sub: "Turnier oder Profi", icon: "🏅" },
        { label: "Profi werden", sub: "Vollzeit-Karriere", icon: "⭐" },
      ],
    },
  ];

  function goBack() {
    if (screen === "onboarding") {
      if (step > 0) setStep(step - 1);
      else setScreen("splash");
    } else if (screen === "traintype") {
      setScreen("onboarding");
      setStep(onboardingSteps.length - 1);
    } else if (screen === "martialart") {
      setScreen("traintype");
    } else if (screen === "describe") {
      if (martialArt) setScreen("martialart");
      else setScreen("traintype");
    } else if (screen === "chat") {
      setScreen("describe");
      setMessages([]);
      setHistory([]);
    }
  }

  function handleOnboardingAnswer(value) {
    const key = onboardingSteps[step].key;
    const newProfile = { ...profile, [key]: value };
    setProfile(newProfile);
    if (step < onboardingSteps.length - 1) setStep(step + 1);
    else setScreen("traintype");
  }

  function handleTrainType(type) {
    setTrainType(type);
    setMartialArt(null);
    if (type.id === "technik") setScreen("martialart");
    else setScreen("describe");
  }

  function handleMartialArt(art) {
    setMartialArt(art);
    setScreen("describe");
  }

  function buildContextMessage(desc) {
    return `Mein Kämpfer-Profil:
Name: ${profile.name}
Level: ${profile.level}
Gewichtsklasse: ${profile.weight}
Ziel: ${profile.goal}
Trainingstyp: ${trainType?.label}${martialArt ? "\nKampfsportart: " + martialArt.label : ""}

Was ich mir wünsche / meine Situation:
${desc}

Erstelle mir jetzt einen detaillierten, personalisierten Trainingsplan basierend auf den Methoden der Elite-Coaches (Phil Daru, Mike Dolce, Nick Curson, Bo Sandoval und den besten MMA Champions). Erkläre welche Methoden du verwendest und warum. Sei konkret mit Übungen, Sets, Reps und Timing. Schreibe den Plan KOMPLETT aus – alle Tage vollständig.`;
  }

  async function startChat() {
    if (!description.trim()) return;
    setScreen("chat");
    setLoading(true);
    const contextMsg = buildContextMessage(description);
    const initHistory = [{ role: "user", content: contextMsg }];
    callClaude(initHistory, (response) => {
      setMessages([{ role: "assistant", content: response }]);
      setHistory([...initHistory, { role: "assistant", content: response }]);
      setLoading(false);
    });
  }

  async function callClaude(msgs, onDone) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          system: SYSTEM_PROMPT,
          messages: msgs,
        }),
      });
      const data = await res.json();
      const text = data.content?.map((b) => b.text || "").join("\n") || "Fehler.";
      onDone(text);
    } catch {
      onDone("Verbindungsfehler. Bitte erneut versuchen.");
    }
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    const newMsgs = [...messages, { role: "user", content: userMsg }];
    setMessages(newMsgs);
    const newHist = [...history, { role: "user", content: userMsg }];
    setLoading(true);
    callClaude(newHist, (response) => {
      setMessages([...newMsgs, { role: "assistant", content: response }]);
      setHistory([...newHist, { role: "assistant", content: response }]);
      setLoading(false);
    });
  }

  const quickPrompts = ["Ernährungsplan dazu", "Recovery Protokoll", "Warm-Up Routine", "Mentale Vorbereitung", "Wettkampf-Woche"];

  // ── SPLASH ────────────────────────────────────────────────────────
  if (screen === "splash") {
    return (
      <Root>
        <div style={c.splashWrap}>
          <div style={c.glow} />
          <div style={c.apexHuge}>APEX</div>
          <div style={c.kiLabel}>KI TRAINER</div>
          <div style={c.tagline1}>Trainiert von den Besten der Welt.</div>
          <div style={c.tagline2}>Phil Daru · Mike Dolce · Nick Curson · Bo Sandoval</div>
          <button style={c.startBtn} onClick={() => setScreen("onboarding")}>JETZT STARTEN</button>
        </div>
      </Root>
    );
  }

  // ── ONBOARDING ────────────────────────────────────────────────────
  if (screen === "onboarding") {
    const cs = onboardingSteps[step];
    return (
      <Root>
        <div style={c.topBar}>
          <BackBtn onClick={goBack} />
          <Logo />
          <div style={c.dots}>
            {onboardingSteps.map((_, i) => (
              <div key={i} style={{ ...c.dot, background: i <= step ? "#E8272A" : "#222", transform: i === step ? "scale(1.3)" : "scale(1)" }} />
            ))}
          </div>
        </div>
        <div style={c.body}>
          <div style={c.question}>{cs.question}</div>
          {cs.type === "text" && <TextInput placeholder={cs.placeholder} onSubmit={(v) => handleOnboardingAnswer(v)} />}
          {cs.type === "choice" && (
            <div style={c.list}>
              {cs.options.map((opt) => (
                <ChoiceCard key={opt.label} icon={opt.icon} label={opt.label} sub={opt.sub} onClick={() => handleOnboardingAnswer(opt.label)} />
              ))}
            </div>
          )}
        </div>
      </Root>
    );
  }

  // ── TRAININGSTYP ──────────────────────────────────────────────────
  if (screen === "traintype") {
    return (
      <Root>
        <div style={c.topBar}>
          <BackBtn onClick={goBack} />
          <Logo />
          <div style={c.topBarName}>{profile.name}</div>
        </div>
        <div style={c.body}>
          <div style={c.question}>Welches Programm?</div>
          <div style={c.list}>
            {TRAIN_TYPES.map((t) => (
              <TypeCard key={t.id} t={t} onClick={() => handleTrainType(t)} />
            ))}
          </div>
        </div>
      </Root>
    );
  }

  // ── KAMPFSPORT-ART ────────────────────────────────────────────────
  if (screen === "martialart") {
    return (
      <Root>
        <div style={c.topBar}>
          <BackBtn onClick={goBack} />
          <Logo />
          <div style={c.topBarName}>{trainType?.label}</div>
        </div>
        <div style={c.body}>
          <div style={c.question}>Deine Kampfsportart?</div>
          <div style={c.maGrid}>
            {MARTIAL_ARTS.map((ma) => (
              <MaCard key={ma.id} ma={ma} onClick={() => handleMartialArt(ma)} />
            ))}
          </div>
        </div>
      </Root>
    );
  }

  // ── BESCHREIBUNG ──────────────────────────────────────────────────
  if (screen === "describe") {
    const dp = DESCRIBE_PROMPTS[trainType?.id] || DESCRIBE_PROMPTS.strength;
    return (
      <Root>
        <div style={c.topBar}>
          <BackBtn onClick={goBack} />
          <Logo />
          <div style={c.topBarName}>{martialArt ? martialArt.label : trainType?.label}</div>
        </div>
        <div style={c.body}>
          <div style={c.question}>{dp.title}</div>
          <div style={c.descSubtitle}>
            Beschreibe genau was du willst – APEX erstellt dir dann deinen perfekten Plan.
          </div>
          <div style={c.hintRow}>
            {dp.hints.map((h) => (
              <div key={h} style={c.hintChip}>{h}</div>
            ))}
          </div>
          <textarea
            autoFocus
            style={c.textarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={dp.placeholder}
            rows={6}
          />
          <button
            style={{ ...c.generateBtn, opacity: description.trim() ? 1 : 0.35 }}
            onClick={startChat}
            disabled={!description.trim()}
          >
            ⚡ PLAN ERSTELLEN
          </button>
        </div>
      </Root>
    );
  }

  // ── CHAT ──────────────────────────────────────────────────────────
  return (
    <Root>
      <div style={c.chatTop}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <BackBtn onClick={goBack} color="#555" />
          <div>
            <Logo />
            <div style={c.chatTopSub}>{trainType?.label}{martialArt ? " · " + martialArt.label : ""}</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={c.pName}>{profile.name}</div>
          <div style={c.pLevel}>{profile.level}</div>
        </div>
      </div>

      <div style={c.chatArea}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            ...c.bubble,
            alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
            background: msg.role === "user" ? "linear-gradient(135deg,#E8272A,#b01e20)" : "rgba(255,255,255,0.05)",
            borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
            border: msg.role === "assistant" ? "1px solid rgba(255,255,255,0.08)" : "none",
          }}>
            {msg.role === "assistant" && <div style={c.apexLbl}>⚡ APEX</div>}
            {msg.role === "assistant" ? (
              <div style={{ fontSize: 13, lineHeight: 1.65 }}>{renderMarkdown(msg.content)}</div>
            ) : (
              <div style={c.bubbleTxt}>{msg.content}</div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ ...c.bubble, alignSelf: "flex-start", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "18px 18px 18px 4px" }}>
            <div style={c.apexLbl}>⚡ APEX</div>
            <div style={c.typingRow}>
              {[0, 0.2, 0.4].map((d, i) => <span key={i} style={{ ...c.tdot, animationDelay: d + "s" }} />)}
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {messages.length < 3 && (
        <div style={c.qRow}>
          {quickPrompts.map((p) => (
            <button key={p} style={c.qBtn} onClick={() => { setInput(p); setTimeout(sendMessage, 10); }}>{p}</button>
          ))}
        </div>
      )}

      <div style={c.inputRow}>
        <input style={c.input} value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="Frag deinen Coach..." onKeyDown={(e) => e.key === "Enter" && sendMessage()} />
        <button style={{ ...c.sendBtn, opacity: input.trim() && !loading ? 1 : 0.35 }}
          onClick={sendMessage} disabled={!input.trim() || loading}>▶</button>
      </div>

      <style>{`@keyframes pulse{0%,80%,100%{transform:scale(0);opacity:.3}40%{transform:scale(1);opacity:1}}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#1a1a1a;border-radius:2px}`}</style>
    </Root>
  );
}

function Root({ children }) {
  return (
    <div style={{ minHeight: "100vh", background: "#080808", display: "flex", justifyContent: "center", fontFamily: "'DM Sans',sans-serif", color: "#fff" }}>
      <div style={{ width: "100%", maxWidth: 430, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {children}
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');*{box-sizing:border-box;margin:0;padding:0}`}</style>
    </div>
  );
}

function Logo() {
  return <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, letterSpacing: 5, color: "#E8272A" }}>APEX</div>;
}

function BackBtn({ onClick, color = "#666" }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      style={{ background: "none", border: "none", color: hover ? "#fff" : color, fontSize: 20, cursor: "pointer", padding: "0 4px", transition: "color 0.2s", fontFamily: "'DM Sans',sans-serif", lineHeight: 1 }}
      onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
    >←</button>
  );
}

function TextInput({ placeholder, onSubmit }) {
  const [val, setVal] = useState("");
  return (
    <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
      <input autoFocus style={c.input} value={val} onChange={(e) => setVal(e.target.value)}
        placeholder={placeholder} onKeyDown={(e) => e.key === "Enter" && val.trim() && onSubmit(val.trim())} />
      <button style={{ ...c.sendBtn, opacity: val.trim() ? 1 : 0.35 }} onClick={() => val.trim() && onSubmit(val.trim())}>▶</button>
    </div>
  );
}

function ChoiceCard({ icon, label, sub, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button style={{ ...c.choiceCard, borderColor: hover ? "#E8272A" : "#222", background: hover ? "rgba(232,39,42,0.07)" : "rgba(255,255,255,0.03)" }}
      onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <span style={{ fontSize: 22, flexShrink: 0 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>{label}</div>
        <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{sub}</div>
      </div>
    </button>
  );
}

function TypeCard({ t, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button style={{ ...c.typeCard, borderColor: hover ? "#E8272A" : "#222", background: hover ? "rgba(232,39,42,0.07)" : "rgba(255,255,255,0.03)" }}
      onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>{t.icon}</div>
      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: 2, color: "#fff" }}>{t.label}</div>
      <div style={{ fontSize: 13, color: "#888", marginTop: 5, lineHeight: 1.5 }}>{t.desc}</div>
      <div style={{ position: "absolute", right: 18, top: "50%", transform: "translateY(-50%)", fontSize: 20, color: "#E8272A" }}>→</div>
    </button>
  );
}

function MaCard({ ma, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button style={{ ...c.maCard, borderColor: hover ? "#E8272A" : "#222", background: hover ? "rgba(232,39,42,0.09)" : "rgba(255,255,255,0.03)" }}
      onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>{ma.icon}</div>
      <div style={{ fontSize: 15, fontWeight: 700 }}>{ma.label}</div>
      <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>{ma.desc}</div>
    </button>
  );
}

const c = {
  splashWrap: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", position: "relative", overflow: "hidden" },
  glow: { position: "absolute", width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle,rgba(232,39,42,0.16) 0%,transparent 70%)", top: "38%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" },
  apexHuge: { fontFamily: "'Bebas Neue',sans-serif", fontSize: 96, letterSpacing: 14, color: "#E8272A", lineHeight: 1, textShadow: "0 0 60px rgba(232,39,42,0.45)" },
  kiLabel: { fontSize: 11, letterSpacing: 8, color: "#444", marginTop: 2 },
  tagline1: { color: "#bbb", fontSize: 16, fontWeight: 300, marginTop: 28, textAlign: "center" },
  tagline2: { color: "#E8272A", fontSize: 11, marginTop: 8, textAlign: "center", letterSpacing: 1, opacity: 0.8 },
  startBtn: { marginTop: 52, background: "#E8272A", border: "none", borderRadius: 16, color: "#fff", padding: "18px 52px", fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: 3, cursor: "pointer" },
  topBar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 12px", borderBottom: "1px solid rgba(255,255,255,0.05)" },
  topBarName: { fontSize: 11, color: "#666", letterSpacing: 1 },
  dots: { display: "flex", gap: 6 },
  dot: { width: 7, height: 7, borderRadius: "50%", transition: "all 0.3s" },
  body: { flex: 1, padding: "24px 20px 20px", overflowY: "auto" },
  question: { fontSize: 23, fontWeight: 600, marginBottom: 8, lineHeight: 1.3 },
  list: { display: "flex", flexDirection: "column", gap: 10, marginTop: 14 },
  choiceCard: { display: "flex", alignItems: "center", gap: 16, border: "1px solid", borderRadius: 14, padding: "16px 18px", cursor: "pointer", transition: "all 0.2s", textAlign: "left", fontFamily: "'DM Sans',sans-serif", width: "100%" },
  typeCard: { border: "1px solid", borderRadius: 18, padding: "22px 20px", cursor: "pointer", textAlign: "left", fontFamily: "'DM Sans',sans-serif", transition: "all 0.2s", position: "relative", width: "100%" },
  maGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 },
  maCard: { border: "1px solid", borderRadius: 16, padding: "20px 14px", cursor: "pointer", textAlign: "center", fontFamily: "'DM Sans',sans-serif", transition: "all 0.2s", width: "100%" },
  descSubtitle: { fontSize: 13, color: "#666", marginBottom: 16, lineHeight: 1.5 },
  hintRow: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  hintChip: { background: "rgba(232,39,42,0.08)", border: "1px solid rgba(232,39,42,0.2)", borderRadius: 20, color: "#E8272A", padding: "5px 12px", fontSize: 11 },
  textarea: { width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, color: "#e8e8e8", padding: "16px", fontSize: 14, outline: "none", fontFamily: "'DM Sans',sans-serif", resize: "none", lineHeight: 1.6, marginBottom: 16 },
  generateBtn: { width: "100%", background: "#E8272A", border: "none", borderRadius: 16, color: "#fff", padding: "18px", fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, letterSpacing: 3, cursor: "pointer", transition: "opacity 0.2s" },
  chatTop: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(8,8,8,0.97)", position: "sticky", top: 0, zIndex: 10 },
  chatTopSub: { fontSize: 10, color: "#E8272A", letterSpacing: 1, marginTop: 1, fontWeight: 600 },
  pName: { fontSize: 13, fontWeight: 600 },
  pLevel: { fontSize: 11, color: "#666", marginTop: 1 },
  chatArea: { flex: 1, overflowY: "auto", padding: "16px 16px 8px", display: "flex", flexDirection: "column", gap: 12 },
  bubble: { padding: "14px 16px", maxWidth: "92%" },
  apexLbl: { fontSize: 9, fontWeight: 700, color: "#E8272A", letterSpacing: 2, marginBottom: 8 },
  bubbleTxt: { fontSize: 14, color: "#e8e8e8", lineHeight: 1.65 },
  typingRow: { display: "flex", gap: 5, alignItems: "center", height: 20 },
  tdot: { display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#E8272A", animation: "pulse 1.2s infinite ease-in-out both" },
  qRow: { display: "flex", gap: 8, overflowX: "auto", padding: "8px 16px", scrollbarWidth: "none" },
  qBtn: { background: "rgba(232,39,42,0.08)", border: "1px solid rgba(232,39,42,0.2)", borderRadius: 20, color: "#E8272A", padding: "8px 14px", fontSize: 12, whiteSpace: "nowrap", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", flexShrink: 0 },
  inputRow: { display: "flex", gap: 10, padding: "10px 16px 16px", borderTop: "1px solid rgba(255,255,255,0.06)" },
  input: { flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, color: "#fff", padding: "13px 16px", fontSize: 14, outline: "none", fontFamily: "'DM Sans',sans-serif" },
  sendBtn: { background: "#E8272A", border: "none", borderRadius: 14, color: "#fff", width: 48, height: 48, fontSize: 16, cursor: "pointer", flexShrink: 0, transition: "opacity 0.2s" },
};
