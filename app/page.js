"use client";
import { useState, useEffect, useRef } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

/* ---------- Icons ---------- */
const Icon = {
  globe: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>,
  vote: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="9" width="18" height="12" rx="1.5"/><path d="M7 9V6a5 5 0 0 1 10 0v3"/><path d="M9 14l2 2 4-4"/></svg>,
  arrowRight: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>,
  check: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>,
  sun: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>,
  moon: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/></svg>,
  close: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>,
  chart: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3v18h18M7 16l4-4 3 3 5-6"/></svg>,
  users: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.3 3.1-6 7-6s7 2.7 7 6"/><circle cx="17" cy="9" r="2.7"/><path d="M16.5 14.2c2.6.6 4.5 2.6 4.5 5.3"/></svg>,
  money: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 0 1 5 0c0 1.4-1.2 2-2.5 2.5S9.5 13 9.5 14.5a2.5 2.5 0 0 0 5 0"/><path d="M12 7v1.2M12 15.8V17"/></svg>,
  heart: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.8 8.6c0 4.3-8.8 10.5-8.8 10.5S3.2 12.9 3.2 8.6A4.6 4.6 0 0 1 12 6.3a4.6 4.6 0 0 1 8.8 2.3z"/></svg>,
  leaf: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 21c8-1 13-7 13-15-8 0-13 5-13 13 0 1 0 1.5.4 2z"/><path d="M5 21c.5-3 2.5-7 6-9.5"/></svg>,
  book: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15z"/></svg>,
  flag: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 3v18"/><path d="M5 4h13l-3 4 3 4H5"/></svg>,
  news: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="14" height="16" rx="1.5"/><path d="M7 8h6M7 12h6M7 16h3"/><path d="M17 8h2.5A1.5 1.5 0 0 1 21 9.5V18a2 2 0 0 1-2 2h0"/></svg>,
  link: (s = 11) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M10 14a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1 1"/><path d="M14 10a5 5 0 0 0-7.1 0l-2 2a5 5 0 0 0 7.1 7.1l1-1"/></svg>,
  warn: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>,
};

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
  { key: "Economy & Taxation", icon: "money" },
  { key: "Healthcare", icon: "heart" },
  { key: "Climate & Environment", icon: "leaf" },
  { key: "Immigration", icon: "globe" },
  { key: "Education", icon: "book" },
  { key: "EU & Foreign Policy", icon: "flag" }
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

/* ---------- Shared components ---------- */

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
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px 6px 6px", borderRadius: 99, cursor: "pointer", border: `1.5px solid ${active ? p.color : "var(--border)"}`, background: active ? p.color + "16" : "transparent", color: active ? "var(--text-primary)" : "var(--text-muted)", fontSize: 13, fontWeight: 500, transition: "all 0.18s ease" }}>
      <div style={{ width: 22, height: 22, borderRadius: "50%", background: active ? p.color : "var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "white", fontWeight: 700 }}>{p.short}</div>
      {party}
    </button>
  );
}

function IssuePill({ issue, active, onClick }) {
  return (
    <button onClick={onClick} style={{ padding: "7px 16px", borderRadius: 99, fontSize: 13, cursor: "pointer", fontWeight: 500, border: `1.5px solid ${active ? "var(--text-primary)" : "var(--border)"}`, background: active ? "var(--text-primary)" : "transparent", color: active ? "var(--bg)" : "var(--text-muted)", display: "flex", alignItems: "center", gap: 7, transition: "all 0.18s ease" }}>
      {issue.icon ? Icon[issue.icon](14) : null}{issue.key}
    </button>
  );
}

function QuizModal({ onComplete, onClose }) {
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
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <div style={{ background: "var(--bg-card)", borderRadius: 24, padding: "2.25rem", maxWidth: 540, width: "100%", border: "1px solid var(--border)", boxShadow: "0 24px 60px rgba(0,0,0,0.25)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase" }}>Question {step + 1} of {QUIZ_QUESTIONS.length}</span>
          <button onClick={onClose} aria-label="Close quiz" style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 6, display: "flex", borderRadius: 8 }}>{Icon.close(18)}</button>
        </div>
        <div style={{ height: 4, background: "var(--bg-muted)", borderRadius: 99, marginBottom: "1.75rem", overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 99, background: "var(--accent)", width: `${progress}%`, transition: "width 0.35s ease" }} />
        </div>
        <h2 style={{ fontSize: 19, fontWeight: 700, letterSpacing: "-0.01em", color: "var(--text-primary)", marginBottom: "1.5rem", lineHeight: 1.35 }}>{q.question}</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {q.options.map(opt => (
            <button key={opt.value} onClick={() => handleAnswer(q.id, opt.value)}
              style={{ padding: "15px 18px", borderRadius: 14, cursor: "pointer", border: "1.5px solid var(--border)", background: "var(--bg)", color: "var(--text-primary)", fontSize: 14, textAlign: "left", fontWeight: 500, transition: "all 0.18s ease", lineHeight: 1.45 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.background = "var(--bg-muted)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--bg)"; }}
            >{opt.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MatchBanner({ matches, onDismiss }) {
  if (!matches || matches.length === 0) return null;
  const top = matches[0];
  const p = PARTIES[top.party] || { color: "#888" };
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: "1.5rem 1.75rem", marginBottom: "2rem", borderLeft: `4px solid ${p.color}`, animation: "slideIn 0.4s ease-out" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14 }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-muted)", margin: "0 0 10px" }}>Your political match</p>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
            <Avatar party={top.party} size={42} />
            <div>
              <p style={{ fontWeight: 700, fontSize: 17, color: "var(--text-primary)", margin: 0 }}>{top.party}</p>
              <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>{top.pct}% alignment with your answers</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {matches.slice(1).map(m => {
              const mp = PARTIES[m.party] || { color: "#888" };
              return <div key={m.party} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "var(--text-muted)", background: "var(--bg-muted)", padding: "5px 12px", borderRadius: 99, border: "1px solid var(--border)" }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: mp.color }} />{m.party} · {m.pct}%</div>;
            })}
          </div>
        </div>
        <button onClick={onDismiss} aria-label="Dismiss" style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4, display: "flex", borderRadius: 8 }}>{Icon.close(16)}</button>
      </div>
    </div>
  );
}

function SpectrumBar({ parties }) {
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: "1.5rem 1.75rem", marginBottom: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        {["Left", "Centre", "Right"].map(l => <span key={l} style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-muted)" }}>{l}</span>)}
      </div>
      <div style={{ position: "relative", height: 4, borderRadius: 99, background: "linear-gradient(to right, #cc3333, var(--border), #3366cc)", marginBottom: 32 }}>
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 1, height: 14, background: "var(--text-faint)" }} />
        {parties.map(party => {
          const p = PARTIES[party];
          if (!p) return null;
          return (
            <div key={party} style={{ position: "absolute", left: `${p.spectrum}%`, top: "50%", transform: "translate(-50%,-50%)" }}>
              <div style={{ width: 16, height: 16, borderRadius: "50%", background: p.color, border: "3px solid var(--bg-card)", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }} />
              <div style={{ position: "absolute", top: 22, left: "50%", transform: "translateX(-50%)", fontSize: 10, fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{p.short}</div>
            </div>
          );
        })}
      </div>
      <p style={{ fontSize: 11, color: "var(--text-faint)", margin: 0 }}>Marker colours are official party colours, not spectrum indicators. Positions are approximate.</p>
    </div>
  );
}

function PartyLeaderCards({ parties }) {
  return (
    <div style={{ marginBottom: "2rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 14 }}>
        {parties.map(party => {
          const p = PARTIES[party];
          if (!p) return null;
          return (
            <div key={party} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
              <div style={{ height: 3, background: p.color }} />
              <div style={{ padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 12 }}>
                  <Avatar party={party} size={38} />
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 13.5, color: "var(--text-primary)", margin: 0 }}>{p.leader}</p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>{party}</p>
                  </div>
                </div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: p.color, margin: "0 0 6px" }}>{p.leaderTitle}</p>
                <p style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 10px" }}>{p.leaderBio}</p>
                <p style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.55, margin: 0, borderTop: "1px solid var(--border)", paddingTop: 10, fontStyle: "italic" }}>{p.partyBio}</p>
                {p.website && <a href={p.website} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 12, fontSize: 11, color: "var(--text-faint)", textDecoration: "none", borderTop: "1px solid var(--border-light)", paddingTop: 10, width: "100%" }}>{Icon.link()} Official website</a>}
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
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: "1.5rem 1.75rem", marginBottom: "2rem", borderLeft: "4px solid var(--accent)" }}>
      <p style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-muted)", margin: "0 0 10px" }}>{Icon.globe(13)} Why this election matters</p>
      <p style={{ fontSize: 14.5, color: "var(--text-primary)", lineHeight: 1.75, margin: 0 }}>{c.geopolitics}</p>
      {c.electionDate && <p style={{ fontSize: 12.5, color: "var(--text-muted)", margin: "12px 0 0" }}>Election date: {c.electionDate}</p>}
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
    <div style={{ marginTop: "3rem", borderTop: "1px solid var(--border)", paddingTop: "2.25rem" }}>
      <h3 style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 17, fontWeight: 700, letterSpacing: "-0.01em", color: "var(--text-primary)", margin: "0 0 1.25rem" }}>
        {Icon.news(18)} Latest news — {c?.flag} {country}
      </h3>
      {loading && <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Loading news…</p>}
      {error && <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{error}</p>}
      {!loading && !error && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {articles.map((a, i) => (
            <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden", display: "block", transition: "border-color 0.18s, transform 0.18s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; }}>
              {a.urlToImage && <img src={a.urlToImage} alt="" style={{ width: "100%", height: 140, objectFit: "cover", display: "block" }} onError={e => { e.target.style.display = "none"; }} />}
              <div style={{ padding: "14px 16px" }}>
                <p style={{ fontSize: 11.5, color: "var(--text-muted)", margin: "0 0 7px", fontWeight: 600 }}>{a.source?.name}</p>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 7px", lineHeight: 1.45, letterSpacing: "-0.01em" }}>{a.title}</p>
                <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>{new Date(a.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
              </div>
            </a>
          ))}
        </div>
      )}
      {!loading && !error && articles.length === 0 && <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No recent news found for this election.</p>}
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
      <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text-primary)", lineHeight: 1 }}>{count.toLocaleString()}</div>
      <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 8, fontWeight: 500, letterSpacing: "0.01em", lineHeight: 1.3 }}>{label}</div>
    </div>
  );
}

function WorldMap({ onSelectCountry, selectedCountry }) {
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, country: null });
  const activeCountries = Object.keys(COUNTRIES);
  const countryNameMap = { "United States of America": "United States" };

  return (
    <div style={{ position: "relative", background: "var(--bg-card)", borderRadius: 24, border: "1px solid var(--border)", overflow: "hidden" }}>
      <div style={{ padding: "1.75rem 1.75rem 0.75rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", margin: "0 0 6px" }}>Interactive map</p>
          <p style={{ fontSize: 14.5, color: "var(--text-secondary)", margin: 0 }}>Click a highlighted country below to load its election</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {activeCountries.map(name => {
            const c = COUNTRIES[name];
            const sel = selectedCountry === name;
            return (
              <button key={name} onClick={() => onSelectCountry(name)}
                style={{ background: sel ? "var(--accent-soft)" : "var(--bg-muted)", border: `1px solid ${sel ? "var(--accent)" : "var(--border)"}`, borderRadius: 99, padding: "6px 13px", cursor: "pointer", fontSize: 12.5, color: sel ? "var(--accent)" : "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6, transition: "all 0.18s ease", fontWeight: sel ? 600 : 500 }}>
                <span aria-hidden="true">{c.flag}</span> {name}
              </button>
            );
          })}
        </div>
      </div>

      <ComposableMap projectionConfig={{ scale: 165, center: [10, 10] }} style={{ width: "100%", height: 540 }}>
        <Geographies geography={GEO_URL}>
          {({ geographies }) => geographies.map(geo => {
            const rawName = geo.properties.name;
            const mappedName = countryNameMap[rawName] || rawName;
            const isActive = activeCountries.includes(mappedName);
            const isSelected = selectedCountry === mappedName;
            return (
              <Geography key={geo.rsmKey} geography={geo}
                onClick={() => isActive && onSelectCountry(mappedName)}
                onMouseEnter={e => { if (isActive) setTooltip({ visible: true, x: e.clientX, y: e.clientY, country: mappedName }); }}
                onMouseMove={e => { if (isActive) setTooltip(t => ({ ...t, x: e.clientX, y: e.clientY })); }}
                onMouseLeave={() => setTooltip({ visible: false, x: 0, y: 0, country: null })}
                style={{
                  default: { fill: isSelected ? "var(--accent)" : isActive ? "var(--text-faint)" : "var(--border-light)", stroke: "var(--border)", strokeWidth: 0.5, outline: "none", cursor: isActive ? "pointer" : "default", transition: "fill 0.2s" },
                  hover: { fill: isActive ? (isSelected ? "var(--accent)" : "var(--text-muted)") : "var(--border-light)", stroke: "var(--border)", strokeWidth: 0.5, outline: "none" },
                  pressed: { fill: isActive ? "var(--accent)" : "var(--border-light)", outline: "none" }
                }}
              />
            );
          })}
        </Geographies>

        {activeCountries.map(name => {
          const c = COUNTRIES[name];
          if (!c.coordinates) return null;
          const isSelected = selectedCountry === name;
          return (
            <Marker key={name} coordinates={c.coordinates} onClick={() => onSelectCountry(name)}>
              <circle r={isSelected ? 8 : 5} fill={isSelected ? "var(--accent)" : "var(--text-secondary)"} stroke={isSelected ? "var(--accent-soft)" : "transparent"} strokeWidth={isSelected ? 6 : 0} style={{ cursor: "pointer" }} />
              {isSelected && <circle r={14} fill="none" stroke="var(--accent)" strokeOpacity={0.35} strokeWidth={1.5} />}
            </Marker>
          );
        })}
      </ComposableMap>

      {tooltip.visible && tooltip.country && (
        <div style={{ position: "fixed", left: tooltip.x + 14, top: tooltip.y - 42, background: "var(--text-primary)", color: "var(--bg)", padding: "7px 13px", borderRadius: 9, fontSize: 12.5, fontWeight: 600, pointerEvents: "none", zIndex: 999, whiteSpace: "nowrap" }}>
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
    <div style={{ maxWidth: 1300, margin: "0 auto", padding: "3rem 2rem 4rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: 14 }}>
        <div>
          <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginBottom: 6, fontWeight: 500 }}>{COUNTRIES[country]?.flag} {country} · {year} election</p>
          <h2 style={{ fontSize: 25, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)", margin: 0 }}>Party positions</h2>
        </div>
        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{parties.length} parties · {ISSUES.length} issues</div>
      </div>

      {matchResults && showMatch && <MatchBanner matches={matchResults} onDismiss={() => setShowMatch(false)} />}
      <GeopoliticsCard country={country} />
      <SpectrumBar parties={parties} />

      <div style={{ display: "flex", gap: 6, marginBottom: "2rem", borderBottom: "1px solid var(--border)" }}>
        {[{ id: "positions", label: "Positions", icon: "chart" }, { id: "leaders", label: "Leaders & parties", icon: "users" }].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "none", border: "none", cursor: "pointer", fontSize: 13.5, fontWeight: 600, color: activeTab === tab.id ? "var(--text-primary)" : "var(--text-muted)", borderBottom: `2px solid ${activeTab === tab.id ? "var(--accent)" : "transparent"}`, marginBottom: -1, transition: "all 0.18s ease" }}>{Icon[tab.icon](15)}{tab.label}</button>
        ))}
      </div>

      {activeTab === "leaders" && <PartyLeaderCards parties={allParties} />}

      {activeTab === "positions" && (
        <>
          <div style={{ marginBottom: "1.5rem" }}>
            <span style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 10 }}>Parties</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {allParties.map(party => <PartyPill key={party} party={party} active={!selectedParties || selectedParties.includes(party)} onClick={() => toggleParty(party)} />)}
            </div>
          </div>
          <div style={{ marginBottom: "2.5rem" }}>
            <span style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 10 }}>Issue</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <IssuePill issue={{ key: "All issues", icon: "vote" }} active={!selectedIssue} onClick={() => setSelectedIssue(null)} />
              {ISSUES.map(issue => <IssuePill key={issue.key} issue={issue} active={selectedIssue === issue.key} onClick={() => setSelectedIssue(issue.key === selectedIssue ? null : issue.key)} />)}
            </div>
          </div>

          {selectedIssue && (() => {
            const issue = ISSUES.find(i => i.key === selectedIssue);
            return (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.75rem" }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: "var(--bg-muted)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}>{Icon[issue.icon](20)}</div>
                  <div>
                    <h3 style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)", margin: 0 }}>{issue.key}</h3>
                    <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 3 }}>Where each party stands</p>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(265px, 1fr))", gap: 16 }}>
                  {parties.map(party => {
                    const p = PARTIES[party] || { color: "#888" };
                    const pos = data[party]?.[selectedIssue];
                    const noData = !pos || pos.position_summary === "No position found in platform text";
                    const expanded = !!expandedCells[`${party}__${selectedIssue}`];
                    return (
                      <div key={party} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
                        <div style={{ height: 4, background: p.color }} />
                        <div style={{ padding: "18px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 15 }}>
                            <Avatar party={party} size={40} />
                            <div>
                              <span style={{ fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)", display: "block" }}>{party}</span>
                              <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{p.leader}</span>
                            </div>
                          </div>
                          {noData ? <p style={{ fontSize: 13, color: "var(--text-faint)", fontStyle: "italic" }}>No official position found in platform</p> : (
                            <>
                              {pos.key_policies?.length > 0 && (
                                <ul style={{ margin: "0 0 11px", paddingLeft: 0, listStyle: "none" }}>
                                  {pos.key_policies.map((pol, i) => (
                                    <li key={i} style={{ fontSize: 13.5, color: "var(--text-primary)", lineHeight: 1.6, padding: "6px 0", display: "flex", gap: 9, alignItems: "flex-start", borderBottom: i < pos.key_policies.length - 1 ? "1px solid var(--border-light)" : "none" }}>
                                      <span style={{ color: p.color, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>›</span>{pol}
                                    </li>
                                  ))}
                                </ul>
                              )}
                              <button onClick={() => toggleCell(party, selectedIssue)} style={{ fontSize: 12.5, background: "none", border: "none", cursor: "pointer", color: p.color, padding: 0, fontWeight: 700 }}>
                                {expanded ? "Hide summary" : "Show summary"}
                              </button>
                              {expanded && <p style={{ margin: "11px 0 0", fontSize: 13.5, lineHeight: 1.7, color: "var(--text-muted)", fontStyle: "italic", borderLeft: `3px solid ${p.color}`, paddingLeft: 13 }}>{pos.position_summary}</p>}
                              {p.website && <a href={p.website} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 12, fontSize: 11, color: "var(--text-faint)", textDecoration: "none", borderTop: "1px solid var(--border-light)", paddingTop: 11, width: "100%" }}>{Icon.link()} Official party website</a>}
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
            <div style={{ overflowX: "auto", borderRadius: 16, border: "1px solid var(--border)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", background: "var(--bg-card)", minWidth: 700 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    <th style={{ padding: "16px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-muted)", background: "var(--thead-bg)", width: 165, position: "sticky", left: 0, zIndex: 2, borderRight: "1px solid var(--border)" }}>Issue</th>
                    {parties.map(party => {
                      const p = PARTIES[party] || { color: "#888" };
                      return (
                        <th key={party} style={{ padding: "16px 18px", textAlign: "center", background: "var(--thead-bg)", minWidth: 175, borderRight: "1px solid var(--border-light)" }}>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                            <Avatar party={party} size={32} />
                            <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-secondary)", letterSpacing: "-0.01em", lineHeight: 1.35 }}>{party}</span>
                            <span style={{ fontSize: 10.5, color: "var(--text-muted)" }}>{p.leader}</span>
                            <div style={{ width: 26, height: 2.5, background: p.color, borderRadius: 99 }} />
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {issuesToShow.map(({ key, icon }, rowIdx) => (
                    <tr key={key} style={{ borderBottom: rowIdx < issuesToShow.length - 1 ? "1px solid var(--border-light)" : "none", background: rowIdx % 2 === 0 ? "var(--bg-card)" : "var(--row-alt)" }}>
                      <td style={{ padding: "18px 20px", verticalAlign: "top", position: "sticky", left: 0, zIndex: 1, background: rowIdx % 2 === 0 ? "var(--bg-card)" : "var(--row-alt)", borderRight: "1px solid var(--border)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9, color: "var(--text-primary)" }}>
                          {Icon[icon](16)}
                          <span style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: "-0.01em" }}>{key}</span>
                        </div>
                      </td>
                      {parties.map(party => {
                        const p = PARTIES[party] || { color: "#888" };
                        const pos = data[party]?.[key];
                        const noData = !pos || pos.position_summary === "No position found in platform text";
                        const expanded = !!expandedCells[`${party}__${key}`];
                        return (
                          <td key={party} style={{ padding: "16px 18px", verticalAlign: "top", borderRight: "1px solid var(--border-light)" }}>
                            {noData ? <span style={{ fontStyle: "italic", fontSize: 13, fontWeight: 600, color: "var(--text-faint)" }}>—</span> : (
                              <div>
                                {pos.key_policies?.length > 0 && (
                                  <ul style={{ margin: "0 0 7px", paddingLeft: 0, listStyle: "none" }}>
                                    {pos.key_policies.map((pol, i) => (
                                      <li key={i} style={{ fontSize: 12.5, color: "var(--text-primary)", lineHeight: 1.6, padding: "3px 0", display: "flex", gap: 7, alignItems: "flex-start", borderBottom: i < pos.key_policies.length - 1 ? "1px solid var(--border-light)" : "none" }}>
                                        <span style={{ color: p.color, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>›</span>{pol}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                                <button onClick={() => toggleCell(party, key)} style={{ marginTop: 5, fontSize: 11.5, background: "none", border: "none", cursor: "pointer", color: p.color, padding: 0, fontWeight: 700 }}>
                                  {expanded ? "Hide summary" : "Show summary"}
                                </button>
                                {expanded && <p style={{ margin: "9px 0 0", fontSize: 12.5, lineHeight: 1.7, color: "var(--text-muted)", fontStyle: "italic", borderLeft: `3px solid ${p.color}`, paddingLeft: 11 }}>{pos.position_summary}</p>}
                                {p.website && <a href={p.website} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 9, fontSize: 10.5, color: "var(--text-faint)", textDecoration: "none" }}>{Icon.link(10)} Official source</a>}
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

      <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.75rem", marginTop: "2.5rem", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-muted)" }}>Key</span>
          <span style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 12.5, color: "var(--text-muted)" }}>
            <span style={{ fontStyle: "italic", fontSize: 13, fontWeight: 600, color: "var(--text-faint)", background: "var(--bg-muted)", padding: "2px 11px", borderRadius: 7, border: "1px solid var(--border)" }}>—</span>
            No official position found in party platform
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 12.5, color: "var(--text-muted)" }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-muted)", background: "var(--bg-muted)", padding: "2px 11px", borderRadius: 7, border: "1px solid var(--border)" }}>› bullet</span>
            Key policy extracted from platform
          </span>
        </div>
        <p style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12.5, color: "var(--text-faint)", lineHeight: 1.65, margin: 0 }}>
          <span style={{ flexShrink: 0, marginTop: 2 }}>{Icon.warn(13)}</span>
          Positions are AI-generated summaries for informational purposes only. Always verify with official party sources before making voting decisions.
        </p>
      </div>

      <NewsFeed country={country} />
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
  const [revealed, setRevealed] = useState(false);
  const [matchResults, setMatchResults] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState(null);
  const comparatorRef = useRef(null);
  const mapRef = useRef(null);

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
    revealMap();
  }

  function revealMap() {
    setRevealed(true);
    setTimeout(() => mapRef.current?.scrollIntoView({ behavior: "smooth" }), 150);
  }

  const totalParties = Object.keys(PARTIES).length;
  const totalPositions = totalParties * ISSUES.length;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", transition: "background 0.2s" }}>

      {showQuiz && <QuizModal onComplete={handleQuizComplete} onClose={() => { setShowQuiz(false); revealMap(); }} />}

      {/* Nav */}
      <nav style={{ borderBottom: "1px solid var(--border)", background: "var(--nav-bg)", backdropFilter: "blur(14px)", position: "sticky", top: 0, zIndex: 100, padding: "0 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
        <div style={{ fontWeight: 700, fontSize: 15.5, letterSpacing: "-0.02em", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 9 }}>
          {Icon.vote(19)} Voteview
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", background: "var(--bg-muted)", color: "var(--text-muted)", padding: "3px 9px", borderRadius: 99 }}>Beta</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {revealed && (
            <button onClick={() => setShowQuiz(true)} style={{ display: "flex", alignItems: "center", gap: 7, background: "none", border: "1px solid var(--border)", borderRadius: 99, padding: "7px 16px", fontSize: 13, color: "var(--text-secondary)", cursor: "pointer", transition: "all 0.18s ease" }}>
              {Icon.vote(14)} {quizAnswers ? "Retake quiz" : "Take quiz"}
            </button>
          )}
          <button onClick={() => setDark(d => !d)} aria-label="Toggle theme" style={{ display: "flex", alignItems: "center", gap: 7, background: "none", border: "1px solid var(--border)", borderRadius: 99, padding: "7px 14px", fontSize: 13, color: "var(--text-secondary)", cursor: "pointer" }}>
            {dark ? Icon.sun(14) : Icon.moon(14)}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background: "var(--bg)", padding: "5.5rem 2rem 4.5rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: "-10%", left: "50%", transform: "translateX(-50%)",
          width: 900, height: 500,
          background: "linear-gradient(120deg, var(--grad-1), var(--grad-2), var(--grad-3), var(--grad-4))",
          backgroundSize: "300% 300%",
          animation: "gradientShift 8s ease infinite",
          opacity: 0.16,
          filter: "blur(60px)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", maxWidth: 760, margin: "0 auto" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11.5, fontWeight: 700,
            color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase",
            background: "var(--bg-card)", padding: "6px 16px", borderRadius: 99, marginBottom: "2rem",
            border: "1px solid var(--border)",
            animation: "bounceIn 0.6s ease-out",
          }}>
            <span style={{ display: "inline-flex", animation: "wiggle 2.5s ease-in-out infinite" }}>{Icon.globe(13)}</span> Global election intelligence
          </div>

          <h1 style={{
            fontSize: 60, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.06,
            color: "var(--text-primary)", marginBottom: "1.5rem",
            animation: "floatUp 0.7s ease-out 0.1s both",
          }}>
            Make An<br />
            <span style={{
              background: "linear-gradient(120deg, var(--grad-1), var(--grad-2), var(--grad-3))",
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              animation: "gradientShift 5s ease infinite",
              display: "inline-block",
            }}>INFORMED VOTE</span>
          </h1>
          <p style={{
            fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
            color: "var(--text-muted)", marginBottom: "1.75rem",
            animation: "floatUp 0.7s ease-out 0.15s both",
          }}>
            Know before you vote
          </p>

          <p style={{ fontSize: 17.5, color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: 540, margin: "0 auto 1.25rem", animation: "floatUp 0.7s ease-out 0.2s both" }}>
            Voteview compares political party positions side-by-side, in plain language, straight from official platforms — no spin, no jargon.
          </p>

          <p style={{ fontSize: 14.5, color: "var(--text-muted)", lineHeight: 1.7, maxWidth: 460, margin: "0 auto 3rem", animation: "floatUp 0.7s ease-out 0.3s both" }}>
            Start with a short quiz to find your political match, then explore any election on the map.
          </p>

          {!revealed && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, marginBottom: "3.5rem", animation: "floatUp 0.7s ease-out 0.4s both" }}>
              <button
                onClick={() => setShowQuiz(true)}
                onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.06) rotate(-1deg)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1) rotate(0deg)"; }}
                style={{
                  display: "flex", alignItems: "center", gap: 9, padding: "15px 32px", borderRadius: 16,
                  fontWeight: 700, fontSize: 15.5,
                  background: "linear-gradient(120deg, var(--grad-1), var(--grad-2))",
                  color: "#fff", border: "none", cursor: "pointer",
                  boxShadow: "0 10px 30px rgba(232,93,117,0.3)",
                  transition: "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                {Icon.vote(18)} Take the quiz
              </button>
              <button onClick={revealMap} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", fontSize: 13.5, color: "var(--text-muted)", cursor: "pointer", padding: "4px 8px" }}>
                Skip and browse elections {Icon.arrowRight(13)}
              </button>
            </div>
          )}

          {/* Bento stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, maxWidth: 640, margin: "0 auto 2.5rem", animation: "floatUp 0.7s ease-out 0.5s both" }}>
            {[
              { end: Object.keys(COUNTRIES).length, label: "Elections tracked", grad: "var(--grad-1)" },
              { end: totalParties, label: "Parties analysed", grad: "var(--grad-2)" },
              { end: totalPositions, label: "Positions extracted", grad: "var(--grad-3)" },
              { end: 849000000, label: "Voting in 2026", duration: 1500, grad: "var(--grad-4)" },
            ].map((s, i) => (
              <div key={i}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px) scale(1.03)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0) scale(1)"; }}
                style={{
                  background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16,
                  padding: "1.25rem 0.75rem", borderTop: `3px solid ${s.grad}`,
                  transition: "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)", cursor: "default",
                }}>
                <StatCounter end={s.end} label={s.label} duration={s.duration} />
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", animation: "floatUp 0.7s ease-out 0.6s both" }}>
            {["AI-extracted from official sources", "Neutral & non-partisan", "Real-time election news"].map((f, i) => (
              <span key={f} style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 7, background: "var(--bg-card)", padding: "6px 14px", borderRadius: 99, border: "1px solid var(--border)" }}>
                <span style={{ color: [`var(--grad-1)`, `var(--grad-2)`, `var(--grad-3)`][i % 3], display: "flex" }}>{Icon.check(12)}</span> {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {revealed && (
        <div ref={mapRef} style={{ background: "var(--bg)", padding: "3.5rem 2rem", borderTop: "1px solid var(--border)" }}>
          <div style={{ maxWidth: 1300, margin: "0 auto" }}>
            <WorldMap onSelectCountry={handleSelectCountry} selectedCountry={country} />
          </div>
        </div>
      )}

      {loading && (
        <div style={{ maxWidth: 1300, margin: "0 auto", padding: "3rem 2rem" }}>
          <div style={{ height: 24, width: 200, background: "var(--bg-muted)", borderRadius: 8, marginBottom: 12, animation: "pulse 1.4s ease-in-out infinite" }} />
          <div style={{ height: 36, width: 280, background: "var(--bg-muted)", borderRadius: 8, marginBottom: 28, animation: "pulse 1.4s ease-in-out infinite" }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ height: 160, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, animation: "pulse 1.4s ease-in-out infinite" }} />
            ))}
          </div>
        </div>
      )}

      <div ref={comparatorRef}>
        {data && !loading && (
          <ComparisonView data={data} country={country} year={year} matchResults={matchResults} />
        )}
      </div>

    </div>
  );
}