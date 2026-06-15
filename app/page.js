"use client";
import { useState, useEffect, useRef } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const COUNTRIES = {
  "Sweden": {
    flag: "🇸🇪", years: ["2026"], electionDate: "13 September 2026",
    coordinates: [18.0, 63.0],
    description: "Sweden's Riksdag election features 8 major parties across the left–right spectrum.",
    geopolitics: "Sweden's first election as a NATO member, held against a backdrop of Russian aggression in Ukraine and growing concerns about election interference. The result will shape Sweden's defence posture, its role in the Nordic security order, and how far the nationalist right can push immigration and welfare reform. Sweden's Gotland island — described as an 'unsinkable aircraft carrier' in the Baltic Sea — sits less than 300km from Russia's Kaliningrad exclave, making Swedish defence policy acutely consequential.",
    parties: ["Socialdemokraterna", "Moderaterna", "Sverigedemokraterna", "Centerpartiet", "Vansterpartiet", "Miljopartiet", "Liberalerna", "Kristdemokraterna"],
    status: "available", newsQuery: "Sweden election 2026 Riksdag"
  },
  "Brazil": {
    flag: "🇧🇷", years: ["2026"], electionDate: "4 October 2026",
    coordinates: [-51.9, -14.2],
    description: "Brazil's general election — Lula vs. the Bolsonarista right in the world's fourth-largest democracy.",
    geopolitics: "Brazil's election will determine whether President Luiz Inácio Lula da Silva secures another term or the Bolsonarista right reclaims power. At stake is Brazil's climate policy, the Amazon, and the health of its democracy after the January 2023 Capitol-style riots.",
    parties: ["PT - Partido dos Trabalhadores", "PL - Partido Liberal", "PSD - Partido Social Democrático"],
    status: "available", newsQuery: "Brazil election 2026 Lula Bolsonaro"
  },
  "Israel": {
    flag: "🇮🇱", years: ["2026"], electionDate: "By October 2026",
    coordinates: [34.8, 31.5],
    description: "Israel's Knesset election amid ongoing conflict and Netanyahu's political future.",
    geopolitics: "Israel's election takes place against the backdrop of ongoing regional conflict and a deeply polarised electorate. The result will shape Israel's approach to ceasefire negotiations and relations with the US under Trump.",
    parties: ["Likud", "Beyachad (Together)", "The Democrats", "Shas"],
    status: "available", newsQuery: "Israel election 2026 Netanyahu Knesset"
  },
  "United States": {
    flag: "🇺🇸", years: ["2026"], electionDate: "3 November 2026",
    coordinates: [-98.5, 39.5],
    description: "US midterm elections — control of Congress and the future of Trump's second-term agenda.",
    geopolitics: "The 2026 US midterms will determine whether Republicans maintain control of both chambers of Congress or whether Democrats can retake the House or Senate to act as a check on executive power.",
    parties: ["Republican Party", "Democratic Party"],
    status: "available", newsQuery: "US midterm elections 2026 Congress"
  },
  "Nigeria": {
    flag: "🇳🇬", years: ["2027"], electionDate: "16 January 2027",
    coordinates: [8.6, 9.0],
    description: "Nigeria's general election — Africa's most populous democracy chooses its next president.",
    geopolitics: "Nigeria is Africa's largest economy and most populous country. The 2027 election will test whether President Tinubu can win re-election after painful economic reforms that have squeezed ordinary Nigerians.",
    parties: ["APC - All Progressives Congress", "PDP - Peoples Democratic Party", "LP - Labour Party", "ADC - African Democratic Congress"],
    status: "available", newsQuery: "Nigeria election 2027 Tinubu"
  },
  "France": {
    flag: "🇫🇷", years: ["2027"], electionDate: "April 2027",
    coordinates: [2.3, 46.2],
    description: "France's presidential election — a defining moment for Europe's second-largest power.",
    geopolitics: "France's 2027 presidential election is one of the most consequential in Europe in a generation. With Macron barred from a third term, Marine Le Pen's far-right leads in many polls. A Le Pen presidency would reshape France's relationship with the EU, NATO, and Ukraine.",
    parties: ["Rassemblement National", "La France Insoumise", "Parti Socialiste", "Renaissance", "Les Républicains", "Europe Écologie Les Verts"],
    status: "available", newsQuery: "France presidential election 2027 Le Pen"
  }
};

const ISSUES = [
  { key: "Economy & Taxation", icon: "💰" },
  { key: "Healthcare", icon: "🏥" },
  { key: "Climate & Environment", icon: "🌱" },
  { key: "Immigration", icon: "🌍" },
  { key: "Education", icon: "📚" },
  { key: "EU & Foreign Policy", icon: "🇪🇺" }
];

const PARTIES = {
  "Socialdemokraterna": { color: "#E8112d", short: "S", spectrum: 25, website: "https://www.socialdemokraterna.se", leader: "Magdalena Andersson", leaderTitle: "Party leader & former Prime Minister", leaderBio: "Sweden's first female PM, Andersson led the country 2021–2022. An economist by training, she is known for fiscal discipline and a strong defence of the welfare state.", partyBio: "Sweden's oldest and historically dominant party. Advocates for a strong welfare state, workers' rights, and publicly funded healthcare and education." },
  "Moderaterna": { color: "#52BDEC", short: "M", spectrum: 65, website: "https://moderaterna.se", leader: "Ulf Kristersson", leaderTitle: "Prime Minister & party leader", leaderBio: "Current Prime Minister since 2022. A centre-right moderate, Kristersson has focused on crime, energy policy and reducing immigration.", partyBio: "Sweden's main centre-right party. Supports lower taxes, private competition in public services, and market-driven economic policy." },
  "Sverigedemokraterna": { color: "#c8a400", short: "SD", spectrum: 85, website: "https://sd.se", leader: "Jimmie Åkesson", leaderTitle: "Party leader", leaderBio: "Has led the Sweden Democrats since 2005, transforming it from a fringe party to Sweden's second-largest.", partyBio: "A nationalist party that surged to become a major political force. Prioritises reduced immigration, law and order, and Swedish cultural identity." },
  "Centerpartiet": { color: "#009933", short: "C", spectrum: 50, website: "https://www.centerpartiet.se", leader: "Elisabeth Thand Ringqvist", leaderTitle: "Party leader", leaderBio: "Took over party leadership in 2025. An entrepreneur and businesswoman focused on rural Sweden and free markets.", partyBio: "Originally an agrarian party, now a liberal-centrist party supporting entrepreneurship, decentralisation, and liberal immigration policy." },
  "Vansterpartiet": { color: "#9B1C1C", short: "V", spectrum: 10, website: "https://www.vansterpartiet.se", leader: "Nooshi Dadgostar", leaderTitle: "Party leader", leaderBio: "Led the party since 2020. Known for toppling PM Stefan Löfven in a no-confidence vote in 2021.", partyBio: "Sweden's left-socialist party. Advocates for higher taxes on wealth, public ownership, a six-hour workday, and opposition to NATO." },
  "Miljopartiet": { color: "#83B626", short: "MP", spectrum: 30, website: "https://www.mp.se", leader: "Daniel Helldén & Amanda Lind", leaderTitle: "Co-party leaders", leaderBio: "Helldén focuses on urban sustainability. Lind, a former culture minister, brings regional policy experience.", partyBio: "Sweden's green party. Supports rapid fossil fuel phase-out, generous refugee policy, and reduced working hours." },
  "Liberalerna": { color: "#006AB3", short: "L", spectrum: 58, website: "https://www.liberalerna.se", leader: "Simona Mohamsson", leaderTitle: "Party leader", leaderBio: "Focuses on individual freedoms, rule of law, and a strong education system.", partyBio: "A classical liberal party championing individual rights, high education standards, EU engagement, and a market economy." },
  "Kristdemokraterna": { color: "#231F7C", short: "KD", spectrum: 72, website: "https://www.kristdemokraterna.se", leader: "Ebba Busch", leaderTitle: "Deputy Prime Minister & party leader", leaderBio: "Deputy PM in the Kristersson government. Champions family values, Christian democratic principles, and nuclear energy.", partyBio: "A Christian democratic party rooted in family and community values. Supports nuclear power, tougher crime policy, and prioritising care for the elderly." },
  "PT - Partido dos Trabalhadores": { color: "#CC0000", short: "PT", spectrum: 20, website: "https://pt.org.br", leader: "Luiz Inácio Lula da Silva", leaderTitle: "President & PT candidate", leaderBio: "Known globally as 'Lula', he is seeking an unprecedented fourth term at 80. One of the most consequential politicians in Latin American history.", partyBio: "Brazil's main left-wing party. Focuses on poverty reduction, social programmes like Bolsa Família, workers' rights, and protecting the Amazon." },
  "PL - Partido Liberal": { color: "#002776", short: "PL", spectrum: 85, website: "https://pl.org.br", leader: "Flávio Bolsonaro", leaderTitle: "Presidential candidate & Senator", leaderBio: "Son of former President Jair Bolsonaro, carrying the Bolsonarista movement's flag in 2026 after his father was barred from running.", partyBio: "Brazil's main right-wing party, home to the Bolsonarista movement. Supports conservative social values, free market economics, and gun rights." },
  "PSD - Partido Social Democrático": { color: "#00923F", short: "PSD", spectrum: 55, website: "https://psd.org.br", leader: "Ronaldo Caiado", leaderTitle: "Presidential candidate & former Governor", leaderBio: "Former Governor of Goiás, emerging as a centre-right third-way alternative to Lula and Bolsonaro.", partyBio: "A large centrist-right party. Pragmatic and flexible, drawing support from business communities and regional politicians across Brazil." },
  "Republican Party": { color: "#CC0000", short: "GOP", spectrum: 75, website: "https://www.gop.com", leader: "Donald Trump", leaderTitle: "President & de facto party leader", leaderBio: "47th President of the United States, serving his second term. Remains the dominant force in Republican politics.", partyBio: "The GOP controls the White House, Senate and House. Its 2026 campaign centres on Trump's record — tax cuts, border security, and deregulation." },
  "Democratic Party": { color: "#003399", short: "DEM", spectrum: 30, website: "https://democrats.org", leader: "Hakeem Jeffries", leaderTitle: "House Minority Leader", leaderBio: "Leader of House Democrats since 2023, attempting to win back the House majority in 2026.", partyBio: "Democrats are on offense in 2026, needing just three seats to retake the House. Campaigning on opposition to Trump's tariffs and Medicaid cuts." },
  "APC - All Progressives Congress": { color: "#006600", short: "APC", spectrum: 60, website: "https://apc.org.ng", leader: "Bola Tinubu", leaderTitle: "President & APC candidate", leaderBio: "President since 2023, seeking a second term after implementing painful economic reforms including removing Nigeria's fuel subsidy.", partyBio: "Nigeria's ruling party since 2015. A big-tent party defending its record on economic reform, security and infrastructure." },
  "PDP - Peoples Democratic Party": { color: "#CC0000", short: "PDP", spectrum: 40, website: "https://pdpnigeria.org", leader: "Atiku Abubakar", leaderTitle: "Former Vice President & presidential candidate", leaderBio: "A veteran of Nigerian politics now aligned with Peter Obi's ADC opposition coalition to defeat Tinubu.", partyBio: "Nigeria's main opposition party and former ruling party (1999–2015). Now part of a broad coalition challenging Tinubu." },
  "LP - Labour Party": { color: "#FF0000", short: "LP", spectrum: 25, website: "https://labourparty.org.ng", leader: "Peter Obi", leaderTitle: "Former presidential candidate, now ADC", leaderBio: "Mobilised millions of young urban voters under the 'Obidient' movement in 2023. Now contesting 2027 under the ADC coalition.", partyBio: "The party that channelled Nigeria's youth protest energy in 2023. Represents a reform-minded, anti-establishment tradition." },
  "ADC - African Democratic Congress": { color: "#FF6600", short: "ADC", spectrum: 35, website: "https://adcnigeria.org", leader: "Peter Obi", leaderTitle: "Presidential candidate", leaderBio: "Leading the broad opposition coalition against Tinubu in 2027, bringing together former PDP leaders and reform-minded politicians.", partyBio: "The vehicle for a broad opposition coalition aiming to unseat Tinubu in 2027." },
  "Likud": { color: "#003399", short: "LKD", spectrum: 75, website: "https://www.likud.org.il", leader: "Benjamin Netanyahu", leaderTitle: "Prime Minister & Likud leader", leaderBio: "Israel's longest-serving Prime Minister, currently on trial for corruption while leading the country through intense conflict.", partyBio: "Israel's dominant right-wing party. Supports strong security, settlement expansion, free market economics, and has been sceptical of a two-state solution." },
  "Beyachad (Together)": { color: "#0099CC", short: "BY", spectrum: 52, website: "https://www.beyachad.org.il", leader: "Naftali Bennett & Yair Lapid", leaderTitle: "Co-leaders", leaderBio: "Former PMs Bennett and Lapid merged their parties in April 2026, polling at ~26 seats — level with Likud.", partyBio: "A new centrist-to-right alliance formed to defeat Netanyahu. Combines Bennett's security focus with Lapid's centrist agenda." },
  "The Democrats": { color: "#CC3300", short: "DEM", spectrum: 25, website: "https://democrats.org.il", leader: "Yair Golan", leaderTitle: "Party leader", leaderBio: "Former IDF Deputy Chief of Staff turned left-wing politician leading the Democrats — a merger of Labour and Meretz.", partyBio: "Israel's left-wing alliance. Supports a two-state solution, civil rights, reducing ultra-Orthodox political influence, and social democratic economics." },
  "Shas": { color: "#8B4513", short: "SHS", spectrum: 82, website: "https://www.shas.org.il", leader: "Aryeh Deri", leaderTitle: "Party leader", leaderBio: "A veteran ultra-Orthodox Sephardi politician and key Netanyahu coalition partner controlling ~10 seats.", partyBio: "An ultra-Orthodox Sephardi party. Prioritises religious law, yeshiva funding, exemptions from military service for Orthodox men." },
  "Rassemblement National": { color: "#003189", short: "RN", spectrum: 88, website: "https://www.rassemblementnational.fr", leader: "Marine Le Pen", leaderTitle: "Party leader", leaderBio: "Has led the RN since 2011, transforming it into France's most popular party by vote share.", partyBio: "France's main nationalist party. Advocates for strict immigration limits, national preference in jobs and benefits, and reclaiming sovereignty from the EU." },
  "La France Insoumise": { color: "#CC2443", short: "LFI", spectrum: 8, website: "https://lafranceinsoumise.fr", leader: "Jean-Luc Mélenchon", leaderTitle: "Founder & party leader", leaderBio: "A veteran of the French left who founded LFI in 2016 and has twice come close to reaching the presidential runoff.", partyBio: "France's hard-left party. Advocates for heavy wealth taxes, universal basic income, exit from NATO's integrated command." },
  "Parti Socialiste": { color: "#E75480", short: "PS", spectrum: 28, website: "https://www.parti-socialiste.fr", leader: "Olivier Faure", leaderTitle: "First Secretary", leaderBio: "Has led the PS since 2018 through a period of rebuilding after the party's collapse under Hollande.", partyBio: "France's historic centre-left party. Supports a strong welfare state, managed immigration, EU membership, and gradual green transition." },
  "Renaissance": { color: "#F7A800", short: "REN", spectrum: 52, website: "https://parti-renaissance.fr", leader: "Gabriel Attal", leaderTitle: "Party leader & former Prime Minister", leaderBio: "France's youngest ever Prime Minister at 34, seen as Macron's chosen successor.", partyBio: "Macron's centrist party. Supports a liberal market economy, deep EU integration, nuclear energy alongside renewables." },
  "Les Républicains": { color: "#0066CC", short: "LR", spectrum: 68, website: "https://www.republicains.fr", leader: "Laurent Wauquiez", leaderTitle: "Party leader", leaderBio: "Returned to lead LR in 2022, positioning the party further right on immigration and security.", partyBio: "France's traditional centre-right party. Supports lower taxes, strict immigration control, nuclear energy, NATO, and tougher law and order." },
  "Europe Écologie Les Verts": { color: "#00A650", short: "EELV", spectrum: 22, website: "https://www.eelv.fr", leader: "Marine Tondelier", leaderTitle: "National Secretary", leaderBio: "Took over EELV leadership in 2023, bringing a more grassroots style to the Greens.", partyBio: "France's green party. Puts climate at the centre of all policy, supports phasing out nuclear power and open immigration." },
};

const QUIZ_QUESTIONS = [
  { id: "economy", question: "What's your view on taxation and public spending?", options: [ { label: "Tax the wealthy more to fund stronger public services for everyone", value: "left" }, { label: "Keep a balance between taxation and spending — neither extreme", value: "centre" }, { label: "Lower taxes and let individuals and markets decide how money is spent", value: "right" } ] },
  { id: "immigration", question: "How should your country approach immigration?", options: [ { label: "Welcome immigrants openly — diversity strengthens society", value: "open" }, { label: "Manage immigration carefully with clear rules and integration support", value: "moderate" }, { label: "Significantly reduce immigration to protect national culture and jobs", value: "restrictive" } ] },
  { id: "climate", question: "What's your priority on climate and energy?", options: [ { label: "Move as fast as possible to renewable energy, even if it's costly short-term", value: "green" }, { label: "Transition gradually, balancing green goals with economic stability", value: "balanced" }, { label: "Protect existing industries and jobs first — don't rush the transition", value: "cautious" } ] },
  { id: "welfare", question: "How should healthcare and education be run?", options: [ { label: "Fully publicly funded and run — no private profit in essential services", value: "public" }, { label: "Mostly public, but private options can help improve quality and choice", value: "mixed" }, { label: "More private competition drives up quality and reduces government waste", value: "private" } ] },
  { id: "authority", question: "On law, order and individual freedom?", options: [ { label: "Individual rights and civil liberties should be strongly protected", value: "liberal" }, { label: "Balance personal freedoms with strong community standards", value: "moderate" }, { label: "Strong law enforcement and social order should come first", value: "authoritarian" } ] },
  { id: "international", question: "How should your country engage with the world?", options: [ { label: "Deep international cooperation — global problems need global solutions", value: "globalist" }, { label: "Engage internationally but protect national interests and sovereignty", value: "moderate" }, { label: "Put our country first — be sceptical of international institutions", value: "nationalist" } ] }
];

const PARTY_MATCH_RULES = {
  "Vansterpartiet":     { economy: "left",   immigration: "open",        climate: "green",    welfare: "public",  authority: "liberal",       international: "globalist" },
  "Socialdemokraterna": { economy: "left",   immigration: "moderate",    climate: "balanced", welfare: "mixed",   authority: "moderate",      international: "globalist" },
  "Miljopartiet":       { economy: "centre", immigration: "open",        climate: "green",    welfare: "mixed",   authority: "liberal",       international: "globalist" },
  "Centerpartiet":      { economy: "right",  immigration: "open",        climate: "balanced", welfare: "mixed",   authority: "liberal",       international: "globalist" },
  "Liberalerna":        { economy: "centre", immigration: "moderate",    climate: "balanced", welfare: "mixed",   authority: "liberal",       international: "globalist" },
  "Moderaterna":        { economy: "right",  immigration: "moderate",    climate: "balanced", welfare: "private", authority: "moderate",      international: "moderate"  },
  "Kristdemokraterna":  { economy: "right",  immigration: "moderate",    climate: "balanced", welfare: "private", authority: "authoritarian", international: "moderate"  },
  "Sverigedemokraterna":{ economy: "centre", immigration: "restrictive", climate: "cautious", welfare: "mixed",   authority: "authoritarian", international: "nationalist"},
  "PT - Partido dos Trabalhadores":  { economy: "left",   immigration: "open",        climate: "green",    welfare: "public",  authority: "liberal",       international: "globalist"  },
  "PL - Partido Liberal":            { economy: "right",  immigration: "moderate",    climate: "cautious", welfare: "private", authority: "authoritarian", international: "nationalist"},
  "PSD - Partido Social Democrático":{ economy: "centre", immigration: "moderate",    climate: "balanced", welfare: "mixed",   authority: "moderate",      international: "moderate"   },
  "Republican Party":                { economy: "right",  immigration: "restrictive", climate: "cautious", welfare: "private", authority: "authoritarian", international: "nationalist"},
  "Democratic Party":                { economy: "left",   immigration: "open",        climate: "green",    welfare: "mixed",   authority: "liberal",       international: "globalist"  },
  "APC - All Progressives Congress": { economy: "centre", immigration: "moderate",    climate: "balanced", welfare: "mixed",   authority: "moderate",      international: "moderate"   },
  "PDP - Peoples Democratic Party":  { economy: "centre", immigration: "moderate",    climate: "balanced", welfare: "mixed",   authority: "moderate",      international: "globalist"  },
  "LP - Labour Party":               { economy: "left",   immigration: "open",        climate: "green",    welfare: "public",  authority: "liberal",       international: "globalist"  },
  "ADC - African Democratic Congress":{ economy: "centre",immigration: "moderate",    climate: "balanced", welfare: "mixed",   authority: "liberal",       international: "globalist"  },
  "Likud":                           { economy: "right",  immigration: "restrictive", climate: "cautious", welfare: "mixed",   authority: "authoritarian", international: "nationalist"},
  "Beyachad (Together)":             { economy: "centre", immigration: "moderate",    climate: "balanced", welfare: "mixed",   authority: "moderate",      international: "moderate"   },
  "The Democrats":                   { economy: "left",   immigration: "open",        climate: "green",    welfare: "public",  authority: "liberal",       international: "globalist"  },
  "Shas":                            { economy: "centre", immigration: "restrictive", climate: "cautious", welfare: "mixed",   authority: "authoritarian", international: "nationalist"},
  "Rassemblement National":          { economy: "centre", immigration: "restrictive", climate: "cautious", welfare: "mixed",   authority: "authoritarian", international: "nationalist"},
  "La France Insoumise":             { economy: "left",   immigration: "open",        climate: "green",    welfare: "public",  authority: "liberal",       international: "nationalist"},
  "Parti Socialiste":                { economy: "left",   immigration: "moderate",    climate: "balanced", welfare: "mixed",   authority: "moderate",      international: "globalist"  },
  "Renaissance":                     { economy: "centre", immigration: "moderate",    climate: "balanced", welfare: "mixed",   authority: "moderate",      international: "globalist"  },
  "Les Républicains":                { economy: "right",  immigration: "restrictive", climate: "balanced", welfare: "private", authority: "authoritarian", international: "moderate"   },
  "Europe Écologie Les Verts":       { economy: "centre", immigration: "open",        climate: "green",    welfare: "mixed",   authority: "liberal",       international: "globalist"  },
};

function computeMatch(answers, countryParties) {
  const scores = {};
  for (const party of countryParties) {
    const rules = PARTY_MATCH_RULES[party];
    if (!rules) continue;
    let score = 0;
    for (const [q, val] of Object.entries(answers)) {
      if (rules[q] === val) score++;
    }
    scores[party] = score;
  }
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([party, score]) => ({ party, score, pct: Math.round((score / QUIZ_QUESTIONS.length) * 100) }));
}

function Avatar({ party, size = 34 }) {
  const p = PARTIES[party] || { color: "#888", short: "?" };
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: p.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.28, fontWeight: 700, flexShrink: 0, letterSpacing: "0.01em" }}>
      {p.short}
    </div>
  );
}

function PartyPill({ party, active, onClick }) {
  const p = PARTIES[party] || { color: "#888", short: "?" };
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 12px 5px 5px", borderRadius: 99, cursor: "pointer", border: `1.5px solid ${active ? p.color : "var(--border)"}`, background: active ? p.color + "18" : "transparent", color: active ? "var(--text-primary)" : "var(--text-muted)", fontSize: 13, fontWeight: 500, transition: "all 0.15s" }}>
      <div style={{ width: 22, height: 22, borderRadius: "50%", background: active ? p.color : "var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "white", fontWeight: 700 }}>{p.short}</div>
      {party}
    </button>
  );
}

function IssuePill({ issue, active, onClick }) {
  return (
    <button onClick={onClick} style={{ padding: "5px 14px", borderRadius: 99, fontSize: 13, cursor: "pointer", fontWeight: 500, border: `1.5px solid ${active ? "var(--text-primary)" : "var(--border)"}`, background: active ? "var(--text-primary)" : "transparent", color: active ? "var(--bg)" : "var(--text-muted)", display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s" }}>
      <span>{issue.icon}</span>{issue.key}
    </button>
  );
}

function QuizModal({ onComplete, onSkip }) {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  function handleAnswer(questionId, value) {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    if (step < QUIZ_QUESTIONS.length - 1) setStep(step + 1);
    else onComplete(newAnswers);
  }

  const q = QUIZ_QUESTIONS[step];
  const progress = (step / QUIZ_QUESTIONS.length) * 100;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: "var(--bg-card)", borderRadius: 20, padding: "2rem", maxWidth: 520, width: "100%", border: "1px solid var(--border)" }}>
        {!started ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: "1rem" }}>🗳️</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)", margin: "0 0 1rem", lineHeight: 1.3 }}>Find your political match</h2>
            <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7, margin: "0 0 0.75rem" }}>Answer 6 quick questions on the issues that matter most — economy, climate, immigration and more.</p>
            <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7, margin: "0 0 2rem" }}>We'll match you to the party whose positions align closest with your views, so you can explore their full platform in the comparator.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => setStarted(true)} style={{ padding: "11px 24px", borderRadius: 10, fontWeight: 700, fontSize: 14, background: "var(--text-primary)", color: "var(--bg)", border: "none", cursor: "pointer" }}>Take the quiz →</button>
              <button onClick={onSkip} style={{ padding: "11px 24px", borderRadius: 10, fontWeight: 600, fontSize: 14, background: "transparent", color: "var(--text-muted)", border: "1.5px solid var(--border)", cursor: "pointer" }}>Skip for now</button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Question {step + 1} of {QUIZ_QUESTIONS.length}</span>
              <button onClick={onSkip} style={{ background: "none", border: "none", fontSize: 13, color: "var(--text-muted)", cursor: "pointer", padding: 0 }}>Skip →</button>
            </div>
            <div style={{ height: 3, background: "var(--bg-muted)", borderRadius: 99, marginBottom: "1.5rem" }}>
              <div style={{ height: "100%", borderRadius: 99, background: "var(--text-primary)", width: `${progress}%`, transition: "width 0.3s" }} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)", marginBottom: "1.5rem", lineHeight: 1.3 }}>{q.question}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {q.options.map(opt => (
                <button key={opt.value} onClick={() => handleAnswer(q.id, opt.value)}
                  style={{ padding: "14px 16px", borderRadius: 12, cursor: "pointer", border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text-primary)", fontSize: 14, textAlign: "left", fontWeight: 500, transition: "all 0.15s", lineHeight: 1.4 }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--text-primary)"; e.currentTarget.style.background = "var(--bg-muted)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--bg)"; }}
                >{opt.label}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MatchBanner({ matches, onDismiss }) {
  if (!matches || matches.length === 0) return null;
  const top = matches[0];
  const p = PARTIES[top.party] || { color: "#888" };
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "1.25rem 1.5rem", marginBottom: "2rem", borderLeft: `4px solid ${p.color}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-muted)", margin: "0 0 8px" }}>Your political match</p>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <Avatar party={top.party} size={40} />
            <div>
              <p style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)", margin: 0 }}>{top.party}</p>
              <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>{top.pct}% alignment with your answers</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {matches.slice(1).map(m => {
              const mp = PARTIES[m.party] || { color: "#888" };
              return <div key={m.party} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)", background: "var(--bg-muted)", padding: "4px 10px", borderRadius: 99, border: "1px solid var(--border)" }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: mp.color }} />{m.party} · {m.pct}%</div>;
            })}
          </div>
        </div>
        <button onClick={onDismiss} style={{ background: "none", border: "none", fontSize: 18, color: "var(--text-muted)", cursor: "pointer", padding: 0 }}>×</button>
      </div>
    </div>
  );
}

function SpectrumBar({ parties }) {
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "1.25rem 1.5rem", marginBottom: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        {["← Left", "Centre", "Right →"].map(l => <span key={l} style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-muted)" }}>{l}</span>)}
      </div>
      <div style={{ position: "relative", height: 4, borderRadius: 99, background: "linear-gradient(to right, #cc3333, #cccccc, #3366cc)", marginBottom: 28 }}>
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 1, height: 12, background: "var(--border)" }} />
        {parties.map(party => {
          const p = PARTIES[party];
          if (!p) return null;
          return (
            <div key={party} style={{ position: "absolute", left: `${p.spectrum}%`, top: "50%", transform: "translate(-50%,-50%)" }}>
              <div style={{ width: 16, height: 16, borderRadius: "50%", background: p.color, border: "2px solid var(--bg-card)" }} />
              <div style={{ position: "absolute", top: 20, left: "50%", transform: "translateX(-50%)", fontSize: 9, fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{p.short}</div>
            </div>
          );
        })}
      </div>
      <p style={{ fontSize: 11, color: "var(--text-faint)", margin: 0 }}>Party colours are official — not spectrum indicators. Positions are approximate.</p>
    </div>
  );
}

function PartyLeaderCards({ parties }) {
  return (
    <div style={{ marginBottom: "2rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
        {parties.map(party => {
          const p = PARTIES[party];
          if (!p) return null;
          return (
            <div key={party} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ height: 3, background: p.color }} />
              <div style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <Avatar party={party} size={36} />
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)", margin: 0 }}>{p.leader}</p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>{party}</p>
                  </div>
                </div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: p.color, margin: "0 0 4px" }}>{p.leaderTitle}</p>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.55, margin: "0 0 8px" }}>{p.leaderBio}</p>
                <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5, margin: 0, borderTop: "1px solid var(--border)", paddingTop: 8, fontStyle: "italic" }}>{p.partyBio}</p>
                {p.website && <a href={p.website} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 10, fontSize: 11, color: "var(--text-faint)", textDecoration: "none", borderTop: "1px solid var(--border-light)", paddingTop: 8, width: "100%" }}>↗ Official website</a>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GeopoliticsCard({ country }) {
  const c = COUNTRIES[country];
  if (!c?.geopolitics) return null;
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "1.25rem 1.5rem", marginBottom: "2rem", borderLeft: "4px solid var(--text-primary)" }}>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-muted)", margin: "0 0 8px" }}>🌐 Why this election matters</p>
      <p style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.7, margin: 0 }}>{c.geopolitics}</p>
      {c.electionDate && <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "10px 0 0" }}>📅 Election date: {c.electionDate}</p>}
    </div>
  );
}

function NewsFeed({ country }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const c = COUNTRIES[country];

  useEffect(() => {
    if (!country || !c?.newsQuery) return;
    setLoading(true);
    setError(null);
    fetch(`/api/news?q=${encodeURIComponent(c.newsQuery)}`)
      .then(r => r.json())
      .then(data => {
        if (data.status === "ok") setArticles(data.articles.filter(a => a.title && a.url && a.title !== "[Removed]"));
        else setError("Couldn't load news.");
        setLoading(false);
      })
      .catch(() => { setError("Couldn't load news."); setLoading(false); });
  }, [country]);

  return (
    <div style={{ marginTop: "2.5rem", borderTop: "1px solid var(--border)", paddingTop: "2rem" }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em", color: "var(--text-primary)", margin: "0 0 1rem" }}>
        📰 Latest news — {c?.flag} {country}
      </h3>
      {loading && <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Loading news...</p>}
      {error && <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{error}</p>}
      {!loading && !error && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {articles.map((a, i) => (
            <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", display: "block", transition: "border-color 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--text-primary)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; }}>
              {a.urlToImage && <img src={a.urlToImage} alt="" style={{ width: "100%", height: 140, objectFit: "cover", display: "block" }} onError={e => { e.target.style.display = "none"; }} />}
              <div style={{ padding: "12px 14px" }}>
                <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 6px", fontWeight: 600 }}>{a.source?.name}</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 6px", lineHeight: 1.4, letterSpacing: "-0.01em" }}>{a.title}</p>
                <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>{new Date(a.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
              </div>
            </a>
          ))}
        </div>
      )}
      {!loading && !error && articles.length === 0 && (
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No recent news found for this election.</p>
      )}
    </div>
  );
}

function StatCounter({ end, label, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const step = end / (duration / 16);
        const timer = setInterval(() => {
          start += step;
          if (start >= end) { setCount(end); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 16);
        observer.disconnect();
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return (
    <div ref={ref} style={{ textAlign: "center" }}>
      <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: "-0.04em", color: "white", lineHeight: 1 }}>{count.toLocaleString()}</div>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 6, fontWeight: 500, letterSpacing: "0.02em" }}>{label}</div>
    </div>
  );
}

function WorldMap({ onSelectCountry, selectedCountry }) {
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, country: null });

  const activeCountries = Object.keys(COUNTRIES);
  const countryNameMap = { "United States of America": "United States" };

  return (
    <div style={{ position: "relative", background: "rgba(255,255,255,0.03)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden", marginBottom: "3rem" }}>
      <div style={{ padding: "1.5rem 1.5rem 0.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", margin: "0 0 4px" }}>Interactive map</p>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", margin: 0 }}>Click a highlighted country to explore its election</p>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          {activeCountries.map(name => {
            const c = COUNTRIES[name];
            return (
              <button key={name} onClick={() => onSelectCountry(name)}
                style={{ background: selectedCountry === name ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${selectedCountry === name ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)"}`, borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontSize: 12, color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", gap: 5 }}>
                {c.flag} {name}
              </button>
            );
          })}
        </div>
      </div>

      <ComposableMap projectionConfig={{ scale: 160, center: [10, 10] }} style={{ width: "100%", height: 520 }}>
        <Geographies geography={GEO_URL}>
          {({ geographies }) => geographies.map(geo => {
            const countryName = geo.properties.name;
            const mappedName = countryNameMap[countryName] || countryName;
            const isActive = activeCountries.includes(mappedName);
            const isSelected = selectedCountry === mappedName;
            const isHovered = hoveredCountry === mappedName;
            return (
              <Geography key={geo.rsmKey} geography={geo}
                onClick={() => isActive && onSelectCountry(mappedName)}
                onMouseEnter={e => {
                  if (isActive) {
                    setHoveredCountry(mappedName);
                    setTooltip({ visible: true, x: e.clientX, y: e.clientY, country: mappedName });
                  }
                }}
                onMouseMove={e => { if (isActive) setTooltip(t => ({ ...t, x: e.clientX, y: e.clientY })); }}
                onMouseLeave={() => { setHoveredCountry(null); setTooltip({ visible: false, x: 0, y: 0, country: null }); }}
                style={{
                  default: {
                    fill: isSelected ? "#fff"
                      : isActive ? "rgba(255,255,255,0.65)"
                      : "rgba(255,255,255,0.06)",
                    stroke: "rgba(255,255,255,0.1)",
                    strokeWidth: 0.5,
                    outline: "none",
                    cursor: isActive ? "pointer" : "default",
                    transition: "fill 0.2s"
                  },
                  hover: {
                    fill: isActive ? (isSelected ? "#fff" : "rgba(255,255,255,0.65)")
                      : "rgba(255,255,255,0.06)",
                    stroke: "rgba(255,255,255,0.1)",
                    strokeWidth: 0.5,
                    outline: "none"
                  },
                  pressed: {
                    fill: isActive ? "#fff" : "rgba(255,255,255,0.06)",
                    outline: "none"
                  }
                }}
              />
            );
          })}
        </Geographies>

        {/* Pulse markers on active countries */}
        {activeCountries.map(name => {
          const c = COUNTRIES[name];
          if (!c.coordinates) return null;
          const isSelected = selectedCountry === name;
          return (
            <Marker key={name} coordinates={c.coordinates} onClick={() => onSelectCountry(name)}>
              <circle r={isSelected ? 8 : 5} fill={isSelected ? "#fff" : "rgba(255,255,255,0.8)"} stroke={isSelected ? "rgba(255,255,255,0.3)" : "transparent"} strokeWidth={isSelected ? 6 : 0} style={{ cursor: "pointer" }} />
              {isSelected && <circle r={14} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} />}
            </Marker>
          );
        })}
      </ComposableMap>

      {/* Tooltip */}
      {tooltip.visible && tooltip.country && (
        <div style={{ position: "fixed", left: tooltip.x + 12, top: tooltip.y - 40, background: "rgba(0,0,0,0.9)", color: "white", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, pointerEvents: "none", zIndex: 999, border: "1px solid rgba(255,255,255,0.1)", whiteSpace: "nowrap" }}>
          {COUNTRIES[tooltip.country]?.flag} {tooltip.country} · {COUNTRIES[tooltip.country]?.electionDate}
        </div>
      )}
    </div>
  );
}

function ComparisonView({ data, country, year, matchResults }) {
  const allParties = Object.keys(data);
  const [selectedParties, setSelectedParties] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [expandedCells, setExpandedCells] = useState({});
  const [showMatch, setShowMatch] = useState(true);
  const [activeTab, setActiveTab] = useState("positions");

  const parties = selectedParties || allParties;

  function toggleParty(party) {
    if (!selectedParties) setSelectedParties(allParties.filter(p => p !== party));
    else if (selectedParties.includes(party)) {
      const next = selectedParties.filter(p => p !== party);
      setSelectedParties(next.length === 0 ? null : next);
    } else {
      const next = [...selectedParties, party];
      setSelectedParties(next.length === allParties.length ? null : next);
    }
  }

  function toggleCell(party, issue) {
    const k = `${party}__${issue}`;
    setExpandedCells(prev => ({ ...prev, [k]: !prev[k] }));
  }

  const issuesToShow = selectedIssue ? [ISSUES.find(i => i.key === selectedIssue)] : ISSUES;

  return (
    <div>
      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "2.5rem 2rem 4rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem", flexWrap: "wrap", gap: 12 }}>
          <div>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4, fontWeight: 500 }}>{COUNTRIES[country]?.flag} {country} · {year} election</p>
            <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)", margin: 0 }}>Party positions</h2>
          </div>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{parties.length} parties · {ISSUES.length} issues</div>
        </div>

        {matchResults && showMatch && <MatchBanner matches={matchResults} onDismiss={() => setShowMatch(false)} />}
        <GeopoliticsCard country={country} />
        <SpectrumBar parties={parties} />

        <div style={{ display: "flex", gap: 4, marginBottom: "1.75rem", borderBottom: "1px solid var(--border)" }}>
          {[{ id: "positions", label: "📊 Positions" }, { id: "leaders", label: "👤 Leaders & parties" }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: "8px 16px", background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: activeTab === tab.id ? "var(--text-primary)" : "var(--text-muted)", borderBottom: `2px solid ${activeTab === tab.id ? "var(--text-primary)" : "transparent"}`, marginBottom: -1, transition: "all 0.15s" }}>{tab.label}</button>
          ))}
        </div>

        {activeTab === "leaders" && <PartyLeaderCards parties={allParties} />}

        {activeTab === "positions" && (
          <>
            <div style={{ marginBottom: "1.25rem" }}>
              <span style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>Parties</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {allParties.map(party => <PartyPill key={party} party={party} active={!selectedParties || selectedParties.includes(party)} onClick={() => toggleParty(party)} />)}
              </div>
            </div>
            <div style={{ marginBottom: "2.5rem" }}>
              <span style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>Issue</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                <IssuePill issue={{ key: "All issues", icon: "🗳️" }} active={!selectedIssue} onClick={() => setSelectedIssue(null)} />
                {ISSUES.map(issue => <IssuePill key={issue.key} issue={issue} active={selectedIssue === issue.key} onClick={() => setSelectedIssue(issue.key === selectedIssue ? null : issue.key)} />)}
              </div>
            </div>

            {selectedIssue && (() => {
              const issue = ISSUES.find(i => i.key === selectedIssue);
              return (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.5rem" }}>
                    <span style={{ fontSize: 28 }}>{issue.icon}</span>
                    <div>
                      <h3 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)", margin: 0 }}>{issue.key}</h3>
                      <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>Where each party stands</p>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
                    {parties.map(party => {
                      const p = PARTIES[party] || { color: "#888" };
                      const pos = data[party]?.[selectedIssue];
                      const noData = !pos || pos.position_summary === "No position found in platform text";
                      const expanded = !!expandedCells[`${party}__${selectedIssue}`];
                      return (
                        <div key={party} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
                          <div style={{ height: 4, background: p.color }} />
                          <div style={{ padding: "16px 18px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                              <Avatar party={party} size={38} />
                              <div>
                                <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)", display: "block" }}>{party}</span>
                                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{p.leader}</span>
                              </div>
                            </div>
                            {noData ? <p style={{ fontSize: 13, color: "var(--text-faint)", fontStyle: "italic" }}>No official position found in platform</p> : (
                              <>
                                {pos.key_policies?.length > 0 && (
                                  <ul style={{ margin: "0 0 10px", paddingLeft: 0, listStyle: "none" }}>
                                    {pos.key_policies.map((pol, i) => (
                                      <li key={i} style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.55, padding: "5px 0", display: "flex", gap: 8, alignItems: "flex-start", borderBottom: i < pos.key_policies.length - 1 ? "1px solid var(--border-light)" : "none" }}>
                                        <span style={{ color: p.color, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>›</span>{pol}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                                <button onClick={() => toggleCell(party, selectedIssue)} style={{ fontSize: 12, background: "none", border: "none", cursor: "pointer", color: p.color, padding: 0, fontWeight: 700 }}>
                                  {expanded ? "Hide summary ▲" : "Show summary ▼"}
                                </button>
                                {expanded && <p style={{ margin: "10px 0 0", fontSize: 13, lineHeight: 1.65, color: "var(--text-muted)", fontStyle: "italic", borderLeft: `3px solid ${p.color}`, paddingLeft: 12 }}>{pos.position_summary}</p>}
                                {p.website && <a href={p.website} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 10, fontSize: 11, color: "var(--text-faint)", textDecoration: "none", borderTop: "1px solid var(--border-light)", paddingTop: 10, width: "100%" }}>↗ Official party website</a>}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {!selectedIssue && (
              <div style={{ overflowX: "auto", borderRadius: 14, border: "1px solid var(--border)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", background: "var(--bg-card)", minWidth: 700 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      <th style={{ padding: "14px 18px", textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-muted)", background: "var(--thead-bg)", width: 160, position: "sticky", left: 0, zIndex: 2, borderRight: "1px solid var(--border)" }}>Issue</th>
                      {parties.map(party => {
                        const p = PARTIES[party] || { color: "#888" };
                        return (
                          <th key={party} style={{ padding: "14px 16px", textAlign: "center", background: "var(--thead-bg)", minWidth: 170, borderRight: "1px solid var(--border-light)" }}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                              <Avatar party={party} size={30} />
                              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", letterSpacing: "-0.01em", lineHeight: 1.3 }}>{party}</span>
                              <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{p.leader}</span>
                              <div style={{ width: 24, height: 2, background: p.color, borderRadius: 99 }} />
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {issuesToShow.map(({ key, icon }, rowIdx) => (
                      <tr key={key} style={{ borderBottom: rowIdx < issuesToShow.length - 1 ? "1px solid var(--border-light)" : "none", background: rowIdx % 2 === 0 ? "var(--bg-card)" : "var(--row-alt)" }}>
                        <td style={{ padding: "16px 18px", verticalAlign: "top", position: "sticky", left: 0, zIndex: 1, background: rowIdx % 2 === 0 ? "var(--bg-card)" : "var(--row-alt)", borderRight: "1px solid var(--border)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 16 }}>{icon}</span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>{key}</span>
                          </div>
                        </td>
                        {parties.map(party => {
                          const p = PARTIES[party] || { color: "#888" };
                          const pos = data[party]?.[key];
                          const noData = !pos || pos.position_summary === "No position found in platform text";
                          const expanded = !!expandedCells[`${party}__${key}`];
                          return (
                            <td key={party} style={{ padding: "14px 16px", verticalAlign: "top", borderRight: "1px solid var(--border-light)" }}>
                              {noData ? <span style={{ fontStyle: "italic", fontSize: 13, fontWeight: 600, color: "var(--text-faint)" }}>—</span> : (
                                <div>
                                  {pos.key_policies?.length > 0 && (
                                    <ul style={{ margin: "0 0 6px", paddingLeft: 0, listStyle: "none" }}>
                                      {pos.key_policies.map((pol, i) => (
                                        <li key={i} style={{ fontSize: 12, color: "var(--text-primary)", lineHeight: 1.55, padding: "3px 0", display: "flex", gap: 6, alignItems: "flex-start", borderBottom: i < pos.key_policies.length - 1 ? "1px solid var(--border-light)" : "none" }}>
                                          <span style={{ color: p.color, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>›</span>{pol}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                  <button onClick={() => toggleCell(party, key)} style={{ marginTop: 4, fontSize: 11, background: "none", border: "none", cursor: "pointer", color: p.color, padding: 0, fontWeight: 700 }}>
                                    {expanded ? "Hide summary ▲" : "Show summary ▼"}
                                  </button>
                                  {expanded && <p style={{ margin: "8px 0 0", fontSize: 12, lineHeight: 1.65, color: "var(--text-muted)", fontStyle: "italic", borderLeft: `3px solid ${p.color}`, paddingLeft: 10 }}>{pos.position_summary}</p>}
                                  {p.website && <a href={p.website} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 8, fontSize: 10, color: "var(--text-faint)", textDecoration: "none" }}>↗ Official source</a>}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.5rem", marginTop: "2rem", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-muted)" }}>Key</span>
            <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-muted)" }}>
              <span style={{ fontStyle: "italic", fontSize: 13, fontWeight: 600, color: "var(--text-faint)", background: "var(--bg-muted)", padding: "1px 10px", borderRadius: 6, border: "1px solid var(--border)" }}>—</span>
              No official position found in party platform
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-muted)" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", background: "var(--bg-muted)", padding: "1px 10px", borderRadius: 6, border: "1px solid var(--border)" }}>› bullet</span>
              Key policy extracted from platform
            </span>
          </div>
          <p style={{ fontSize: 12, color: "var(--text-faint)", lineHeight: 1.6, margin: 0 }}>⚠️ Positions are AI-generated summaries for informational purposes only. Always verify with official party sources.</p>
        </div>

        <NewsFeed country={country} />
      </div>
    </div>
  );
}

export default function Home() {
  const [country, setCountry] = useState(null);
  const [year, setYear] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [matchResults, setMatchResults] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState(null);
  const comparatorRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, [dark]);

  function handleSelectCountry(name) {
    const c = COUNTRIES[name];
    if (!c || c.status !== "available") return;
    setCountry(name);
    setYear(c.years[0]);
    setData(null);
    setLoading(true);

    const fileMap = {
      "Sweden": "/extracted_positions.json",
      "France": "/extracted_positions_france.json",
      "Brazil": "/extracted_positions_brazil.json",
      "United States": "/extracted_positions_usa.json",
      "Nigeria": "/extracted_positions_nigeria.json",
      "Israel": "/extracted_positions_israel.json",
    };

    fetch(fileMap[name] || "/extracted_positions.json")
      .then(r => r.json())
      .then(d => {
        setData(d);
        setLoading(false);
        if (quizAnswers) {
          const countryParties = COUNTRIES[name]?.parties || Object.keys(PARTY_MATCH_RULES);
          setMatchResults(computeMatch(quizAnswers, countryParties));
        }
        setTimeout(() => comparatorRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      });
  }

  function handleQuizComplete(answers) {
    setQuizAnswers(answers);
    const countryParties = (country && COUNTRIES[country]?.parties?.length) ? COUNTRIES[country].parties : Object.keys(PARTY_MATCH_RULES);
    setMatchResults(computeMatch(answers, countryParties));
    setShowQuiz(false);
  }

  const totalParties = Object.keys(PARTIES).length;
  const totalPositions = totalParties * ISSUES.length;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", transition: "background 0.2s" }}>

      {showQuiz && <QuizModal onComplete={handleQuizComplete} onSkip={() => setShowQuiz(false)} />}

      {/* Nav */}
      <nav style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(10,10,10,0.9)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 100, padding: "0 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
        <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.02em", color: "white", display: "flex", alignItems: "center", gap: 8 }}>
          🗳️ Voteview
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", padding: "2px 7px", borderRadius: 99 }}>Beta</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setShowQuiz(true)} style={{ background: "none", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 99, padding: "5px 14px", fontSize: 13, color: "rgba(255,255,255,0.6)", cursor: "pointer" }}>
            🗳️ {quizAnswers ? "Retake quiz" : "Take quiz"}
          </button>
          <button onClick={() => setDark(d => !d)} style={{ background: "none", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 99, padding: "5px 14px", fontSize: 13, color: "rgba(255,255,255,0.6)", cursor: "pointer" }}>
            {dark ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #0f1923 50%, #0a0a0a 100%)", padding: "5rem 2rem 4rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
        {/* Background glow */}
        <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 600, height: 300, background: "radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", maxWidth: 800, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", background: "rgba(255,255,255,0.05)", padding: "5px 14px", borderRadius: 99, marginBottom: "2rem", border: "1px solid rgba(255,255,255,0.08)" }}>
            🌐 Global election intelligence
          </div>

          <h1 style={{ fontSize: 64, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.05, color: "white", marginBottom: "1.5rem" }}>
            Know what you're<br />
            <span style={{ background: "linear-gradient(135deg, #818cf8, #6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>voting for</span>
          </h1>

          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 520, margin: "0 auto 3rem" }}>
            Compare political party positions side-by-side — across issues, in plain language, straight from official platforms.
          </p>

          {/* Animated stats */}
          <div style={{ display: "flex", justifyContent: "center", gap: "4rem", marginBottom: "4rem", flexWrap: "wrap" }}>
            <StatCounter end={Object.keys(COUNTRIES).length} label="Elections tracked" />
            <StatCounter end={totalParties} label="Parties analysed" />
            <StatCounter end={totalPositions} label="Positions extracted" />
            <StatCounter end={1600000000} label="People voting in 2026" duration={3000} />
          </div>

          {/* Feature pills */}
          <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
            {["AI-extracted from official sources", "Neutral & non-partisan", "Real-time election news"].map(f => (
              <span key={f} style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.04)", padding: "5px 12px", borderRadius: 99, border: "1px solid rgba(255,255,255,0.08)" }}>
                <span style={{ color: "#818cf8" }}>✓</span> {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Map section */}
      <div style={{ background: "linear-gradient(180deg, #0f1923 0%, #0a0a0a 100%)", padding: "3rem 2rem" }}>
        <div style={{ maxWidth: 1300, margin: "0 auto" }}>
          <WorldMap onSelectCountry={handleSelectCountry} selectedCountry={country} />
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)", fontSize: 14 }}>
          Loading party data for {country}...
        </div>
      )}

      {/* Comparator */}
      <div ref={comparatorRef}>
        {data && !loading && (
          <ComparisonView data={data} country={country} year={year} matchResults={matchResults} />
        )}
      </div>

    </div>
  );
}