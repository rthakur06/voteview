"use client";
import { useState, useEffect } from "react";

const COUNTRIES = {
  "Sweden": {
    flag: "🇸🇪",
    years: ["2026"],
    electionDate: "13 September 2026",
    parties: ["Socialdemokraterna", "Moderaterna", "Sverigedemokraterna", "Centerpartiet", "Vansterpartiet", "Miljopartiet", "Liberalerna", "Kristdemokraterna"],
    description: "Sweden's Riksdag election features 8 major parties across the left–right spectrum.",
    geopolitics: "Sweden's first election as a NATO member, held against a backdrop of Russian aggression in Ukraine and growing concerns about election interference. The result will shape Sweden's defence posture, its role in the Nordic security order, and how far the nationalist right can push immigration and welfare reform. Sweden's Gotland island — described as an 'unsinkable aircraft carrier' in the Baltic Sea — sits less than 300km from Russia's Kaliningrad exclave, making Swedish defence policy acutely consequential.",
    status: "available"
  },
  "Brazil": {
    flag: "🇧🇷",
    years: ["2026"],
    electionDate: "October 2026",
    parties: ["PT - Partido dos Trabalhadores", "PL - Partido Liberal", "PSD - Partido Social Democrático"],
    description: "Brazil's general election — Lula vs. the Bolsonarista right in the world's fourth-largest democracy.",
    geopolitics: "Brazil's election will determine whether President Luiz Inácio Lula da Silva secures a second term or the Bolsonarista right reclaims power in Latin America's largest country. At stake is Brazil's climate policy (the Amazon, deforestation, COP commitments), its relationship with China and the US, and the health of its democracy after the January 2023 Capitol-style riots. With over 150 million voters, it is one of the biggest democratic exercises of 2026 and will shape the future of the world's largest rainforest.",
    status: "available"
  },
  "Israel": {
    flag: "🇮🇱",
    years: ["2026"],
    electionDate: "By October 2026",
    parties: ["Likud", "Beyachad (Together)", "The Democrats", "Shas"],
    description: "Israel's Knesset election amid ongoing conflict, a polarised public and Netanyahu's political future.",
    geopolitics: "Israel's election takes place against the backdrop of ongoing regional conflict, a deeply polarised electorate, and serious questions about the future direction of Israeli democracy and its relationship with allies. Prime Minister Benjamin Netanyahu and his right-wing coalition face pressure from both the left and the far right. The result will shape Israel's approach to ceasefire negotiations, relations with the US under Trump, and the long-term question of a Palestinian state. One of the most closely watched elections in the Middle East in years.",
    status: "available"
  },
  "United States": {
    flag: "🇺🇸",
    years: ["2026"],
    parties: ["Republican Party", "Democratic Party"],
    electionDate: "3 November 2026",
    description: "US midterm elections — control of Congress and the future of Trump's second-term agenda.",
    geopolitics: "The 2026 US midterms will determine whether Republicans maintain control of both chambers of Congress, giving Trump a free legislative hand through 2028, or whether Democrats can retake the House or Senate to act as a check on executive power. Every seat in the House and a third of the Senate are up for election. The result will shape US foreign policy on Ukraine and NATO, domestic policy on healthcare, immigration and trade tariffs, and the trajectory of American democracy heading into the 2028 presidential race.",
    status: "available"
  },
  "Nigeria": {
    flag: "🇳🇬",
    years: ["2027"],
    parties: ["APC - All Progressives Congress", "PDP - Peoples Democratic Party", "LP - Labour Party", "ADC - African Democratic Congress"],
    electionDate: "16 January 2027",
    description: "Nigeria's general election — Africa's most populous democracy chooses its next president and parliament.",
    geopolitics: "Nigeria is Africa's largest economy and most populous country, with over 220 million people. The 2027 election will test whether President Bola Tinubu can win re-election after painful economic reforms — including the removal of fuel subsidies — that have squeezed ordinary Nigerians hard. The vote will shape Nigeria's role in African security, its relationship with Western powers and China, and the stability of West Africa's democratic anchor at a time when military coups are spreading across the Sahel.",
    status: "available"
  },
  "France": {
    flag: "🇫🇷",
    years: ["2027"],
    electionDate: "April 2027",
    parties: ["Rassemblement National", "La France Insoumise", "Parti Socialiste", "Renaissance", "Les Républicains", "Europe Écologie Les Verts"],
    description: "France's presidential election — a defining moment for Europe's second-largest power.",
    geopolitics: "France's 2027 presidential election is one of the most consequential in Europe in a generation. With Emmanuel Macron constitutionally barred from a third term, the race is wide open. Marine Le Pen's far-right Rassemblement National leads in many polls, and a Le Pen presidency would fundamentally reshape France's relationship with the EU, NATO, and Ukraine. France holds a permanent UN Security Council seat and nuclear weapons — making this election one with genuine global implications. The outcome will define the future of European unity at its most critical moment since World War II.",
    status: "available"
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
  // Sweden
  "Socialdemokraterna": {
    color: "#E8112d", short: "S", spectrum: 25,
    website: "https://www.socialdemokraterna.se",
    leader: "Magdalena Andersson",
    leaderTitle: "Party leader & former Prime Minister",
    leaderBio: "Sweden's first female PM, Andersson led the country 2021–2022. An economist by training, she is known for fiscal discipline and a strong defence of the welfare state.",
    partyBio: "Sweden's oldest and historically dominant party. Advocates for a strong welfare state, workers' rights, and publicly funded healthcare and education.",
  },
  "Moderaterna": {
    color: "#52BDEC", short: "M", spectrum: 65,
    website: "https://moderaterna.se",
    leader: "Ulf Kristersson",
    leaderTitle: "Prime Minister & party leader",
    leaderBio: "Current Prime Minister since 2022. A centre-right moderate, Kristersson has focused on crime, energy policy and reducing immigration.",
    partyBio: "Sweden's main centre-right party. Supports lower taxes, private competition in public services, and market-driven economic policy."
  },
  "Sverigedemokraterna": {
    color: "#c8a400", short: "SD", spectrum: 85,
    website: "https://sd.se",
    leader: "Jimmie Åkesson",
    leaderTitle: "Party leader",
    leaderBio: "Has led the Sweden Democrats since 2005, transforming it from a fringe party to Sweden's second-largest. Focuses heavily on immigration restriction and national identity.",
    partyBio: "A nationalist party that surged to become a major political force. Prioritises reduced immigration, law and order, and Swedish cultural identity."
  },
  "Centerpartiet": {
    color: "#009933", short: "C", spectrum: 50,
    leader: "Elisabeth Thand Ringqvist",
    website: "https://www.centerpartiet.se",
    leaderTitle: "Party leader",
    leaderBio: "Took over party leadership in 2025. An entrepreneur and businesswoman, she has repositioned Centerpartiet with a stronger focus on rural Sweden and free markets.",
    partyBio: "Originally an agrarian party, now a liberal-centrist party supporting entrepreneurship, decentralisation, and liberal immigration policy."
  },
  "Vansterpartiet": {
    color: "#9B1C1C", short: "V", spectrum: 10,
    leader: "Nooshi Dadgostar",
    website: "https://www.vansterpartiet.se",
    leaderTitle: "Party leader",
    leaderBio: "Led the party since 2020. A tough negotiator known for toppling PM Stefan Löfven in a no-confidence vote in 2021. Focuses on housing, pensions and workers' rights.",
    partyBio: "Sweden's left-socialist party. Advocates for higher taxes on wealth, public ownership, a six-hour workday, and opposition to NATO."
  },
  "Miljopartiet": {
    color: "#83B626", short: "MP", spectrum: 30,
    leader: "Daniel Helldén & Amanda Lind",
    website: "https://www.mp.se",
    leaderTitle: "Co-party leaders (spokespeople)",
    leaderBio: "Helldén is a Stockholm politician focused on urban sustainability. Lind, a former culture minister, brings regional and cultural policy experience. The Greens use a co-leadership model.",
    partyBio: "Sweden's green party puts climate and environment at the centre of all policy. Supports rapid fossil fuel phase-out, generous refugee policy, and reduced working hours."
  },
  "Liberalerna": {
    color: "#006AB3", short: "L", spectrum: 58,
    leader: "Simona Mohamsson",
    website: "https://www.liberalerna.se",
    leaderTitle: "Party leader",
    leaderBio: "Took over the Liberal leadership after Johan Pehrson. Focuses on individual freedoms, rule of law, and a strong education system as the foundation of a liberal society.",
    partyBio: "A classical liberal party championing individual rights, high education standards, EU engagement, and a market economy with a strong social safety net."
  },
  "Kristdemokraterna": {
    color: "#231F7C", short: "KD", spectrum: 72,
    leader: "Ebba Busch",
    website: "https://www.kristdemokraterna.se",
    leaderTitle: "Deputy Prime Minister & party leader",
    leaderBio: "Deputy PM in the Kristersson government. A combative debater known for her media presence, Busch champions family values, Christian democratic principles, and nuclear energy.",
    partyBio: "A Christian democratic party rooted in family and community values. Supports nuclear power, tougher crime policy, and prioritising care for the elderly."
  },

  // France
  "Rassemblement National": {
    color: "#003189", 
    short: "RN", 
    spectrum: 88,
    website: "https://www.rassemblementnational.fr",
    leader: "Marine Le Pen",
    leaderTitle: "Party leader",
    leaderBio: "Has led the RN since 2011, transforming it from a fringe far-right party into France's most popular party by vote share. Focuses on immigration restriction, national preference policies, and Euroscepticism.",
    partyBio: "France's main nationalist party. Advocates for strict immigration limits, national preference in jobs and benefits, and reclaiming sovereignty from the EU."
  },
  "La France Insoumise": {
    color: "#CC2443", 
    short: "LFI", 
    spectrum: 8,
    website: "https://lafranceinsoumise.fr",
    leader: "Jean-Luc Mélenchon",
    leaderTitle: "Founder & party leader",
    leaderBio: "A veteran of the French left, Mélenchon founded LFI in 2016 and has twice come close to reaching the presidential runoff. Known for his combative style and radical economic programme.",
    partyBio: "France's hard-left party. Advocates for heavy wealth taxes, universal basic income, exit from NATO's integrated command, and rapid green transition away from nuclear power."
  },
  "Parti Socialiste": {
    color: "#E75480", short: "PS", spectrum: 28,
    website: "https://www.parti-socialiste.fr",
    leader: "Olivier Faure",
    leaderTitle: "First Secretary",
    leaderBio: "Has led the PS since 2018 through a period of rebuilding after the party's collapse under Hollande. Has worked to forge left-wing alliances while maintaining a moderate socialist identity.",
    partyBio: "France's historic centre-left party, now much reduced. Supports a strong welfare state, managed immigration with integration, EU membership, and gradual green transition."
  },
  "Renaissance": {
    color: "#F7A800", short: "REN", spectrum: 52,
    website: "https://parti-renaissance.fr",
    leader: "Gabriel Attal",
    leaderTitle: "Party leader & former Prime Minister",
    leaderBio: "France's youngest ever Prime Minister at 34, Attal is seen as Macron's chosen successor. Politically centrist with a technocratic style, focused on education reform and economic competitiveness.",
    partyBio: "Macron's centrist party. Supports a liberal market economy, deep EU integration, nuclear energy alongside renewables, and a firm but humane approach to immigration."
  },
  "Les Républicains": {
    color: "#0066CC", short: "LR", spectrum: 68,
    website: "https://www.republicains.fr",
    leader: "Laurent Wauquiez",
    leaderTitle: "Party leader",
    leaderBio: "Returned to lead LR in 2022 after a previous stint, positioning the party further right on immigration and security to compete with the RN. A former regional president of Auvergne-Rhône-Alpes.",
    partyBio: "France's traditional centre-right party. Supports lower taxes, strict immigration control, nuclear energy, NATO, and tougher law and order — with a social safety net for the vulnerable."
  },
  "Europe Écologie Les Verts": {
    color: "#00A650", short: "EELV", spectrum: 22,
    website: "https://www.eelv.fr",
    leader: "Marine Tondelier",
    leaderTitle: "National Secretary",
    leaderBio: "Took over EELV leadership in 2023, bringing a more grassroots and combative style to the Greens. Has focused on rebuilding the party's identity after years of fragmentation on the French left.",
    partyBio: "France's green party. Puts climate and ecology at the centre of all policy, supports phasing out nuclear power, open immigration, reduced working hours, and strong EU climate action."
  },

  // BRAZIL
  "PT - Partido dos Trabalhadores": {
    color: "#CC0000", short: "PT", spectrum: 20,
    leader: "Luiz Inácio Lula da Silva",
    website: "https://pt.org.br",
    leaderTitle: "President & PT candidate",
    leaderBio: "Known globally as 'Lula', he is one of the most consequential politicians in Latin American history. Served as President 2003–2010 and returned in 2023. At 80, he is seeking an unprecedented fourth term despite health concerns and a tightening race.",
    partyBio: "Brazil's main left-wing party. Founded by trade unionists and social movements. Focuses on poverty reduction, social programmes like Bolsa Família, workers' rights, and protecting the Amazon."
  },
  "PL - Partido Liberal": {
    color: "#002776", short: "PL", spectrum: 85,
    leader: "Flávio Bolsonaro",
    website: "https://pl.org.br",
    leaderTitle: "Presidential candidate & Senator",
    leaderBio: "Son of former President Jair Bolsonaro, who is barred from running after being imprisoned for plotting a coup. Flávio is carrying the Bolsonarista movement's flag in 2026, and has closed a 12-point gap on Lula to reach a statistical dead heat.",
    partyBio: "Brazil's main right-wing party, now home to the Bolsonarista movement. Supports conservative social values, free market economics, gun rights, and is deeply sceptical of environmental regulations."
  },
  "PSD - Partido Social Democrático": {
    color: "#00923F", short: "PSD", spectrum: 55,
    leader: "Ronaldo Caiado",
    website: "https://psd.org.br",
    leaderTitle: "Presidential candidate & former Governor",
    leaderBio: "Former Governor of Goiás, Caiado is a centre-right candidate who recently joined PSD after leaving União Brasil. A physician and ruralist politician who has emerged as a third-way alternative to Lula and Bolsonaro.",
    partyBio: "A large centrist-right party led by power broker Gilberto Kassab. Pragmatic and flexible in its ideology, it draws support from business communities and regional politicians across Brazil."
  },
  "ADC - African Democratic Congress": {
    color: "#FF6600", short: "ADC", spectrum: 35,
    leader: "Peter Obi",
    website: "https://adcnigeria.org",
    leaderTitle: "Presidential candidate",
    leaderBio: "A former Governor of Anambra State who electrified Nigerian politics in 2023 by winning millions of young urban voters as the Labour Party candidate. Now contesting 2027 under the ADC banner in an opposition coalition with Atiku Abubakar and Nasir El-Rufai.",
    partyBio: "The vehicle for a broad opposition coalition aiming to unseat Tinubu in 2027. Brings together former PDP leaders, Labour Party veterans and reform-minded politicians under one platform."
  },

  // UNITED STATES
  "Republican Party": {
    color: "#CC0000", short: "GOP", spectrum: 75,
    leader: "Donald Trump",
    website: "https://www.gop.com",
    leaderTitle: "President & de facto party leader",
    leaderBio: "47th President of the United States, serving his second term after returning to office in January 2025. Remains the dominant force in Republican politics, reshaping the party in his image through tariffs, immigration crackdowns and confrontation with democratic institutions.",
    partyBio: "The GOP currently controls the White House, Senate and House. Its 2026 campaign will centre on Trump's record — tax cuts, border security, deregulation — while defending razor-thin congressional majorities."
  },
  "Democratic Party": {
    color: "#003399", short: "DEM", spectrum: 30,
    leader: "Hakeem Jeffries",
    website: "https://democrats.org",
    leaderTitle: "House Minority Leader",
    leaderBio: "Leader of House Democrats since 2023, Jeffries is the face of the Democratic opposition heading into 2026. A Brooklyn-born lawyer known for his sharp communication style, he is attempting to win back the House majority in what polls show is a competitive environment for Democrats.",
    partyBio: "Democrats are on offense in 2026, needing just three seats to retake the House. Campaigning on opposition to Trump's tariffs, Medicaid cuts and immigration policies, with a 5-7 point lead on the generic ballot."
  },

  // NIGERIA
  "APC - All Progressives Congress": {
    color: "#006600", short: "APC", spectrum: 60,
    leader: "Bola Tinubu",
    website: "https://apc.org.ng",
    leaderTitle: "President & APC candidate",
    leaderBio: "President since 2023, Tinubu is seeking a second term after implementing painful but widely discussed economic reforms including removing Nigeria's costly fuel subsidy. A powerful political operator from Lagos, he built the coalition that brought the APC to power. His second term bid faces a united opposition.",
    partyBio: "Nigeria's ruling party since 2015. A big-tent party that combines elements of the centre-right and nationalist traditions. Currently defending its record on economic reform, security and infrastructure."
  },
  "PDP - Peoples Democratic Party": {
    color: "#CC0000", short: "PDP", spectrum: 40,
    leader: "Atiku Abubakar",
    website: "https://pdpnigeria.org",
    leaderTitle: "Former Vice President & presidential candidate",
    leaderBio: "A veteran of Nigerian politics, Atiku has run for president multiple times and is now aligned with Peter Obi's ADC opposition coalition to defeat Tinubu. Former VP under President Obasanjo, he is one of Nigeria's most prominent political figures.",
    partyBio: "Nigeria's main opposition party and former ruling party (1999–2015). Historically dominant across much of the country but weakened by defections to the APC. Now part of a broad coalition challenging Tinubu."
  },
  "LP - Labour Party": {
    color: "#FF0000", short: "LP", spectrum: 25,
    leader: "Peter Obi",
    website: "https://labourparty.org.ng",
    leaderTitle: "Former presidential candidate, now ADC",
    leaderBio: "The surprise of Nigeria's 2023 election, Obi mobilised millions of young urban voters under the 'Obidient' movement. He has since left the Labour Party to contest 2027 under the ADC coalition banner with Atiku and El-Rufai.",
    partyBio: "The party that channelled Nigeria's youth protest energy in 2023. Now weakened by Obi's departure but still represents a reform-minded, anti-establishment tradition in Nigerian politics."
  },

  // ISRAEL
  "Likud": {
    color: "#003399", short: "LKD", spectrum: 75,
    leader: "Benjamin Netanyahu",
    website: "https://www.likud.org.il",
    leaderTitle: "Prime Minister & Likud leader",
    leaderBio: "Israel's longest-serving Prime Minister, Netanyahu has dominated Israeli politics for over two decades. Currently on trial for corruption charges while leading the country through its most intense military conflict since 1948. Polls show Likud at around 25 seats — still the largest single party but facing a credible challenge.",
    partyBio: "Israel's dominant right-wing party, rooted in Revisionist Zionism. Supports a strong security posture, Jewish settlement expansion, free market economics, and has been deeply sceptical of a two-state solution."
  },
  "Beyachad (Together)": {
    color: "#0099CC", short: "BY", spectrum: 52,
    leader: "Naftali Bennett & Yair Lapid",
    website: "https://www.beyachad.org.il",
    leaderTitle: "Co-leaders",
    leaderBio: "Former PM Naftali Bennett (right-wing national) and former PM Yair Lapid (centrist) announced a dramatic merger in April 2026 to unite the fragmented opposition. Their combined party is polling at ~26 seats — level with Likud — making this the most credible challenge to Netanyahu in years.",
    partyBio: "A new centrist-to-right alliance formed specifically to defeat Netanyahu. Combines Bennett's national-security focus with Lapid's centrist economic and civil liberties agenda. Aims to form a government without ultra-Orthodox or Arab party support."
  },
  "The Democrats": {
    color: "#CC3300", short: "DEM", spectrum: 25,
    leader: "Yair Golan",
    website: "https://democrats.org.il",
    leaderTitle: "Party leader",
    leaderBio: "Former IDF Deputy Chief of Staff turned left-wing politician. Led the Democrats — a merger of Labour and Meretz — into the 2026 election as Israel's main left-wing voice, polling at around 11 seats.",
    partyBio: "Israel's left-wing alliance formed from the merger of the historic Labour Party and Meretz. Supports a two-state solution, civil rights, reducing ultra-Orthodox political influence, and social democratic economics."
  },
  "Shas": {
    color: "#8B4513", short: "SHS", spectrum: 82,
    leader: "Aryeh Deri",
    website: "https://www.shas.org.il",
    leaderTitle: "Party leader",
    leaderBio: "A veteran ultra-Orthodox Sephardi politician and key Netanyahu coalition partner. Has faced legal challenges but remains one of the most influential figures in Israeli coalition politics, controlling a bloc of ~10 seats.",
    partyBio: "An ultra-Orthodox Sephardi party and anchor of Netanyahu's coalition. Prioritises religious law in public life, yeshiva funding, exemptions from military service for Orthodox men, and Sephardi Jewish interests."
  },
};

const QUIZ_QUESTIONS = [
  {
    id: "economy",
    question: "What's your view on taxation and public spending?",
    options: [
      { label: "Tax the wealthy more to fund stronger public services for everyone", value: "left" },
      { label: "Keep a balance between taxation and spending — neither extreme", value: "centre" },
      { label: "Lower taxes and let individuals and markets decide how money is spent", value: "right" },
    ]
  },
  {
    id: "immigration",
    question: "How should your country approach immigration?",
    options: [
      { label: "Welcome immigrants openly — diversity strengthens society", value: "open" },
      { label: "Manage immigration carefully with clear rules and integration support", value: "moderate" },
      { label: "Significantly reduce immigration to protect national culture and jobs", value: "restrictive" },
    ]
  },
  {
    id: "climate",
    question: "What's your priority on climate and energy?",
    options: [
      { label: "Move as fast as possible to renewable energy, even if it's costly short-term", value: "green" },
      { label: "Transition gradually, balancing green goals with economic stability", value: "balanced" },
      { label: "Protect existing industries and jobs first — don't rush the transition", value: "cautious" },
    ]
  },
  {
    id: "welfare",
    question: "How should healthcare and education be run?",
    options: [
      { label: "Fully publicly funded and run — no private profit in essential services", value: "public" },
      { label: "Mostly public, but private options can help improve quality and choice", value: "mixed" },
      { label: "More private competition drives up quality and reduces government waste", value: "private" },
    ]
  },
  {
    id: "authority",
    question: "On law, order and individual freedom?",
    options: [
      { label: "Individual rights and civil liberties should be strongly protected", value: "liberal" },
      { label: "Balance personal freedoms with strong community standards", value: "moderate" },
      { label: "Strong law enforcement and social order should come first", value: "authoritarian" },
    ]
  },
  {
    id: "international",
    question: "How should your country engage with the world?",
    options: [
      { label: "Deep international cooperation — global problems need global solutions", value: "globalist" },
      { label: "Engage internationally but protect national interests and sovereignty", value: "moderate" },
      { label: "Put our country first — be sceptical of international institutions", value: "nationalist" },
    ]
  }
];

const PARTY_MATCH_RULES = {
  // Sweden
  "Vansterpartiet":     { economy: "left",   immigration: "open",        climate: "green",     welfare: "public",  authority: "liberal",       international: "globalist" },
  "Socialdemokraterna": { economy: "left",   immigration: "moderate",    climate: "balanced",  welfare: "mixed",   authority: "moderate",      international: "globalist" },
  "Miljopartiet":       { economy: "centre", immigration: "open",        climate: "green",     welfare: "mixed",   authority: "liberal",       international: "globalist" },
  "Centerpartiet":      { economy: "right",  immigration: "open",        climate: "balanced",  welfare: "mixed",   authority: "liberal",       international: "globalist" },
  "Liberalerna":        { economy: "centre", immigration: "moderate",    climate: "balanced",  welfare: "mixed",   authority: "liberal",       international: "globalist" },
  "Moderaterna":        { economy: "right",  immigration: "moderate",    climate: "balanced",  welfare: "private", authority: "moderate",      international: "moderate" },
  "Kristdemokraterna":  { economy: "right",  immigration: "moderate",    climate: "balanced",  welfare: "private", authority: "authoritarian", international: "moderate" },
  "Sverigedemokraterna":{ economy: "centre", immigration: "restrictive", climate: "cautious",  welfare: "mixed",   authority: "authoritarian", international: "nationalist" },
  // France
  "Rassemblement National":   { economy: "centre", immigration: "restrictive", climate: "cautious",  welfare: "mixed",   authority: "authoritarian", international: "nationalist" },
  "La France Insoumise":      { economy: "left",   immigration: "open",        climate: "green",     welfare: "public",  authority: "liberal",       international: "nationalist" },
  "Parti Socialiste":         { economy: "left",   immigration: "moderate",    climate: "balanced",  welfare: "mixed",   authority: "moderate",      international: "globalist"  },
  "Renaissance":              { economy: "centre", immigration: "moderate",    climate: "balanced",  welfare: "mixed",   authority: "moderate",      international: "globalist"  },
  "Les Républicains":         { economy: "right",  immigration: "restrictive", climate: "balanced",  welfare: "private", authority: "authoritarian", international: "moderate"   },
  "Europe Écologie Les Verts":{ economy: "centre", immigration: "open",        climate: "green",     welfare: "mixed",   authority: "liberal",       international: "globalist"  },
  // BRAZIL
  "PT - Partido dos Trabalhadores":  { economy: "left",   immigration: "open",     climate: "green",    welfare: "public",  authority: "liberal",       international: "moderate"   },
  "PL - Partido Liberal":            { economy: "right",  immigration: "moderate", climate: "cautious", welfare: "private", authority: "authoritarian", international: "nationalist" },
  "PSD - Partido Social Democrático":{ economy: "centre", immigration: "moderate", climate: "balanced", welfare: "mixed",   authority: "moderate",      international: "moderate"   },

  // UNITED STATES
  "Republican Party":                { economy: "right",  immigration: "restrictive", climate: "cautious", welfare: "private", authority: "authoritarian", international: "nationalist" },
  "Democratic Party":                { economy: "left",   immigration: "open",        climate: "green",    welfare: "mixed",   authority: "liberal",       international: "globalist"  },

  // NIGERIA
  "APC - All Progressives Congress": { economy: "centre", immigration: "moderate", climate: "balanced", welfare: "mixed",   authority: "moderate",      international: "moderate"   },
  "PDP - Peoples Democratic Party":  { economy: "centre", immigration: "moderate", climate: "balanced", welfare: "mixed",   authority: "moderate",      international: "globalist"  },
  "LP - Labour Party":               { economy: "left",   immigration: "open",     climate: "green",    welfare: "public",  authority: "liberal",       international: "globalist"  },
  "ADC - African Democratic Congress":{ economy: "centre",immigration: "moderate", climate: "balanced", welfare: "mixed",   authority: "liberal",       international: "globalist"  },

  // ISRAEL
  "Likud":                           { economy: "right",  immigration: "restrictive", climate: "cautious",  welfare: "mixed",   authority: "authoritarian", international: "nationalist" },
  "Beyachad (Together)":             { economy: "centre", immigration: "moderate",    climate: "balanced",  welfare: "mixed",   authority: "moderate",      international: "moderate"   },
  "The Democrats":                   { economy: "left",   immigration: "open",        climate: "green",     welfare: "public",  authority: "liberal",       international: "globalist"  },
  "Shas":                            { economy: "centre", immigration: "restrictive", climate: "cautious",  welfare: "mixed",   authority: "authoritarian", international: "nationalist" },
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
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: p.color, color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.28, fontWeight: 700, flexShrink: 0,
      letterSpacing: "0.01em",
    }}>
      {p.short}
    </div>
  );
}

function PartyPill({ party, active, onClick }) {
  const p = PARTIES[party] || { color: "#888", short: "?" };
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 7,
      padding: "5px 12px 5px 5px", borderRadius: 99, cursor: "pointer",
      border: `1.5px solid ${active ? p.color : "var(--border)"}`,
      background: active ? p.color + "18" : "transparent",
      color: active ? "var(--text-primary)" : "var(--text-muted)",
      fontSize: 13, fontWeight: 500, transition: "all 0.15s",
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: "50%",
        background: active ? p.color : "var(--border)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 9, color: "white", fontWeight: 700,
      }}>{p.short}</div>
      {party}
    </button>
  );
}

function IssuePill({ issue, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "5px 14px", borderRadius: 99, fontSize: 13,
      cursor: "pointer", fontWeight: 500,
      border: `1.5px solid ${active ? "var(--text-primary)" : "var(--border)"}`,
      background: active ? "var(--text-primary)" : "transparent",
      color: active ? "var(--bg)" : "var(--text-muted)",
      display: "flex", alignItems: "center", gap: 6,
      transition: "all 0.15s",
    }}>
      <span>{issue.icon}</span>
      {issue.key}
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
    if (step < QUIZ_QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      onComplete(newAnswers);
    }
  }

  const q = QUIZ_QUESTIONS[step];
  const progress = (step / QUIZ_QUESTIONS.length) * 100;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "1rem",
    }}>
      <div style={{
        background: "var(--bg-card)", borderRadius: 20,
        padding: "2rem", maxWidth: 520, width: "100%",
        border: "1px solid var(--border)",
      }}>

        {/* Intro screen */}
        {!started ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: "1rem" }}>🗳️</div>
            <h2 style={{
              fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em",
              color: "var(--text-primary)", margin: "0 0 1rem", lineHeight: 1.3
            }}>
              Find your political match
            </h2>
            <p style={{
              fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7,
              margin: "0 0 0.75rem"
            }}>
              Answer 6 quick questions on the issues that matter most — economy, climate, immigration and more.
            </p>
            <p style={{
              fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7,
              margin: "0 0 2rem"
            }}>
              We'll match you to the party whose positions align closest with your views, so you can explore their full platform in the comparator.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button
                onClick={() => setStarted(true)}
                style={{
                  padding: "11px 24px", borderRadius: 10,
                  fontWeight: 700, fontSize: 14,
                  background: "var(--text-primary)",
                  color: "var(--bg)",
                  border: "none", cursor: "pointer",
                  letterSpacing: "-0.01em",
                }}
              >
                Take the quiz →
              </button>
              <button
                onClick={onSkip}
                style={{
                  padding: "11px 24px", borderRadius: 10,
                  fontWeight: 600, fontSize: 14,
                  background: "transparent",
                  color: "var(--text-muted)",
                  border: "1.5px solid var(--border)",
                  cursor: "pointer",
                }}
              >
                Skip for now
              </button>
            </div>
          </div>
        ) : (

          /* Quiz questions */
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Question {step + 1} of {QUIZ_QUESTIONS.length}
              </span>
              <button onClick={onSkip} style={{ background: "none", border: "none", fontSize: 13, color: "var(--text-muted)", cursor: "pointer", padding: 0 }}>
                Skip →
              </button>
            </div>
            <div style={{ height: 3, background: "var(--bg-muted)", borderRadius: 99, marginBottom: "1.5rem" }}>
              <div style={{ height: "100%", borderRadius: 99, background: "var(--text-primary)", width: `${progress}%`, transition: "width 0.3s" }} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)", marginBottom: "1.5rem", lineHeight: 1.3 }}>
              {q.question}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {q.options.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleAnswer(q.id, opt.value)}
                  style={{
                    padding: "14px 16px", borderRadius: 12, cursor: "pointer",
                    border: "1.5px solid var(--border)", background: "var(--bg)",
                    color: "var(--text-primary)", fontSize: 14, textAlign: "left",
                    fontWeight: 500, transition: "all 0.15s", lineHeight: 1.4,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--text-primary)"; e.currentTarget.style.background = "var(--bg-muted)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--bg)"; }}
                >
                  {opt.label}
                </button>
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
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border)",
      borderRadius: 14, padding: "1.25rem 1.5rem",
      marginBottom: "2rem",
      borderLeft: `4px solid ${p.color}`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-muted)", margin: "0 0 8px" }}>
            Your political match
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <Avatar party={top.party} size={40} />
            <div>
              <p style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.01em" }}>
                {top.party}
              </p>
              <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
                {top.pct}% alignment with your answers
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {matches.slice(1).map(m => {
              const mp = PARTIES[m.party] || { color: "#888" };
              return (
                <div key={m.party} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  fontSize: 12, color: "var(--text-muted)",
                  background: "var(--bg-muted)", padding: "4px 10px",
                  borderRadius: 99, border: "1px solid var(--border)",
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: mp.color }} />
                  {m.party} · {m.pct}%
                </div>
              );
            })}
          </div>
        </div>
        <button onClick={onDismiss} style={{
          background: "none", border: "none", fontSize: 18,
          color: "var(--text-muted)", cursor: "pointer", padding: 0, lineHeight: 1,
        }}>×</button>
      </div>
    </div>
  );
}

function SpectrumBar({ parties }) {
  return (
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border)",
      borderRadius: 14, padding: "1.25rem 1.5rem", marginBottom: "2rem",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        {["← Left", "Centre", "Right →"].map(label => (
          <span key={label} style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-muted)" }}>
            {label}
          </span>
        ))}
      </div>
      <div style={{ position: "relative", height: 4, borderRadius: 99, background: "linear-gradient(to right, #cc3333, #cccccc, #3366cc)", marginBottom: 28 }}>
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", width: 1, height: 12, background: "var(--border)" }} />
        {parties.map(party => {
          const p = PARTIES[party];
          if (!p) return null;
          return (
            <div key={party} style={{ position: "absolute", left: `${p.spectrum}%`, top: "50%", transform: "translate(-50%, -50%)" }}>
              <div style={{ width: 16, height: 16, borderRadius: "50%", background: p.color, border: "2px solid var(--bg-card)" }} />
              <div style={{ position: "absolute", top: 20, left: "50%", transform: "translateX(-50%)", fontSize: 9, fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                {p.short}
              </div>
            </div>
          );
        })}
      </div>
      <p style={{ fontSize: 11, color: "var(--text-faint)", margin: 0, lineHeight: 1.5 }}>
        Party colours are official party colours, not spectrum indicators. Spectrum positions are approximate based on general political science classifications.
      </p>
    </div>
  );
}

function PartyLeaderCards({ parties }) {
  return (
    <div style={{ marginBottom: "2rem" }}>
      <span style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 10 }}>
        Party leaders
      </span>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
        {parties.map(party => {
          const p = PARTIES[party];
          if (!p) return null;
          return (
            <div key={party} style={{
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: 12, overflow: "hidden",
            }}>
              <div style={{ height: 3, background: p.color }} />
              <div style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <Avatar party={party} size={36} />
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.01em" }}>
                      {p.leader}
                    </p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>
                      {party}
                    </p>
                  </div>
                </div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: p.color, margin: "0 0 4px" }}>
                  {p.leaderTitle}
                </p>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.55, margin: "0 0 8px" }}>
                  {p.leaderBio}
                </p>
                <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5, margin: 0, borderTop: "1px solid var(--border)", paddingTop: 8, fontStyle: "italic" }}>
                  {p.partyBio}
                </p>
              </div>
            </div>
          );
        })}
      </div>
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
    if (!selectedParties) {
      setSelectedParties(allParties.filter(p => p !== party));
    } else if (selectedParties.includes(party)) {
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

  const issuesToShow = selectedIssue
    ? [ISSUES.find(i => i.key === selectedIssue)]
    : ISSUES;

  return (
    <div>
      <hr style={{ border: "none", borderTop: "1px solid var(--border)" }} />
      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "2.5rem 2rem 4rem" }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem", flexWrap: "wrap", gap: 12 }}>
          <div>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4, fontWeight: 500 }}>
              {COUNTRIES[country]?.flag} {country} · {year} election
            </p>
            <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)", margin: 0 }}>
              Party positions
            </h2>
          </div>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
            {parties.length} parties · {ISSUES.length} issues
          </div>
        </div>

        {/* Match banner */}
        {matchResults && showMatch && (
          <MatchBanner matches={matchResults} onDismiss={() => setShowMatch(false)} />
        )}

        {/* Spectrum */}
        <SpectrumBar parties={parties} />

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: "1.75rem", borderBottom: "1px solid var(--border)", paddingBottom: 0 }}>
          {[
            { id: "positions", label: "📊 Positions" },
            { id: "leaders", label: "👤 Leaders & parties" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: "8px 16px", background: "none", border: "none",
              cursor: "pointer", fontSize: 13, fontWeight: 600,
              color: activeTab === tab.id ? "var(--text-primary)" : "var(--text-muted)",
              borderBottom: `2px solid ${activeTab === tab.id ? "var(--text-primary)" : "transparent"}`,
              marginBottom: -1, transition: "all 0.15s",
            }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Leaders tab */}
        {activeTab === "leaders" && <PartyLeaderCards parties={allParties} />}

        {/* Positions tab */}
        {activeTab === "positions" && (
          <>
            <div style={{ marginBottom: "1.25rem" }}>
              <span style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>
                Parties
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {allParties.map(party => (
                  <PartyPill key={party} party={party}
                    active={!selectedParties || selectedParties.includes(party)}
                    onClick={() => toggleParty(party)} />
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "2.5rem" }}>
              <span style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>
                Issue
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                <IssuePill issue={{ key: "All issues", icon: "🗳️" }} active={!selectedIssue} onClick={() => setSelectedIssue(null)} />
                {ISSUES.map(issue => (
                  <IssuePill key={issue.key} issue={issue}
                    active={selectedIssue === issue.key}
                    onClick={() => setSelectedIssue(issue.key === selectedIssue ? null : issue.key)} />
                ))}
              </div>
            </div>

            {/* Single issue cards */}
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
                                <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)", letterSpacing: "-0.01em", display: "block" }}>{party}</span>
                                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{p.leader}</span>
                              </div>
                            </div>
                            {noData ? (
                              <p style={{ fontSize: 13, color: "var(--text-faint)", fontStyle: "italic" }}>No official position found in platform</p>
                            ) : (
                              <>
                                {pos.key_policies?.length > 0 && (
                                  <ul style={{ margin: "0 0 10px", paddingLeft: 0, listStyle: "none" }}>
                                    {pos.key_policies.map((pol, i) => (
                                      <li key={i} style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.55, padding: "5px 0", display: "flex", gap: 8, alignItems: "flex-start", borderBottom: i < pos.key_policies.length - 1 ? "1px solid var(--border-light)" : "none" }}>
                                        <span style={{ color: p.color, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>›</span>
                                        {pol}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                                <button onClick={() => toggleCell(party, selectedIssue)} style={{ fontSize: 12, background: "none", border: "none", cursor: "pointer", color: p.color, padding: 0, fontWeight: 700 }}>
                                  {expanded ? "Hide summary ▲" : "Show summary ▼"}
                                </button>
                                {p.website && (
                                  <a
                                    href={p.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      display: "inline-flex", alignItems: "center", gap: 4,
                                      marginTop: 10, fontSize: 11, color: "var(--text-faint)",
                                      textDecoration: "none", borderTop: "1px solid var(--border-light)",
                                      paddingTop: 10, width: "100%",
                                    }}
                                  >
                                    ↗ Official party website
                                  </a>
                                )}
                                {expanded && (
                                  <p style={{ margin: "10px 0 0", fontSize: 13, lineHeight: 1.65, color: "var(--text-muted)", fontStyle: "italic", borderLeft: `3px solid ${p.color}`, borderRadius: 0, paddingLeft: 12 }}>
                                    {pos.position_summary}
                                  </p>
                                )}
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

            {/* All issues table */}
            {!selectedIssue && (
              <div style={{ overflowX: "auto", borderRadius: 14, border: "1px solid var(--border)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", background: "var(--bg-card)", minWidth: 700 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      <th style={{ padding: "14px 18px", textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-muted)", background: "var(--thead-bg)", width: 160, position: "sticky", left: 0, zIndex: 2, borderRight: "1px solid var(--border)" }}>
                        Issue
                      </th>
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
                              {noData ? (
                                <span style={{ fontStyle: "italic", fontSize: 13, fontWeight: 600, color: "var(--text-faint)" }}>—</span>
                              ) : (
                                <div>
                                  {pos.key_policies?.length > 0 && (
                                    <ul style={{ margin: "0 0 6px", paddingLeft: 0, listStyle: "none" }}>
                                      {pos.key_policies.map((pol, i) => (
                                        <li key={i} style={{ fontSize: 12, color: "var(--text-primary)", lineHeight: 1.55, padding: "3px 0", display: "flex", gap: 6, alignItems: "flex-start", borderBottom: i < pos.key_policies.length - 1 ? "1px solid var(--border-light)" : "none" }}>
                                          <span style={{ color: p.color, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>›</span>
                                          {pol}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                  <button onClick={() => toggleCell(party, key)} style={{ marginTop: 4, fontSize: 11, background: "none", border: "none", cursor: "pointer", color: p.color, padding: 0, fontWeight: 700 }}>
                                    {expanded ? "Hide summary ▲" : "Show summary ▼"}
                                  </button>
                                  {p.website && (
                                    <a
                                      href={p.website}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{
                                        display: "inline-flex", alignItems: "center", gap:4,
                                        marginTop: 10, fontSize: 11, color: "var(--text-faint)",
                                        textDecoration: "none", borderTop: "1px solid var(--border-light)",
                                        paddingTop: 10, width: "100%",
                                      }}
                                      onMouseEnter={e => e.currentTarget.style.color = p.color}
                                      onMouseLeave={e => e.currentTarget.style.color = "var(--text-faint)"}
                                    >
                                      ↗ Official party website
                                    </a>
                                  )}
                                  {expanded && (
                                    <p style={{ margin: "8px 0 0", fontSize: 12, lineHeight: 1.65, color: "var(--text-muted)", fontStyle: "italic", borderLeft: `3px solid ${p.color}`, borderRadius: 0, paddingLeft: 10 }}>
                                      {pos.position_summary}
                                    </p>
                                  )}
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

        {/* Legend + disclaimer */}
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
            <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-muted)" }}>
              <div style={{ display: "flex", gap: 3 }}>
                {Object.values(PARTIES).slice(0, 3).map((p, i) => (
                  <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: p.color }} />
                ))}
              </div>
              Party colours are official — not spectrum indicators
            </span>
          </div>
          <p style={{ fontSize: 12, color: "var(--text-faint)", lineHeight: 1.6, margin: 0 }}>
            ⚠️ Positions are AI-generated summaries for informational purposes only. Spectrum positions are approximate. Always verify with official party sources before making voting decisions.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [country, setCountry] = useState("");
  const [year, setYear] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(false);
  const [showQuiz, setShowQuiz] = useState(true);
  const [matchResults, setMatchResults] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, [dark]);

  function handleCountryChange(c) {
    setCountry(c);
    setYear("");
    setData(null);
  }

  function handleLoad() {
    if (!country || !year) return;
    const selected = COUNTRIES[country];
    if (selected?.status !== "available") return;
    setLoading(true);
    setData(null);

    const fileMap = {
      "Sweden": "/extracted_positions.json",
      "France": "/extracted_positions_france.json",
      "Brazil": "/extracted_positions_brazil.json",
      "United States": "/extracted_positions_usa.json",
      "Nigeria": "/extracted_positions_nigeria.json",
      "Israel": "/extracted_positions_israel.json",
    };
    const file = fileMap[country] || "/extracted_positions.json";

    fetch(file)
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
        if (quizAnswers) {
          const countryParties = COUNTRIES[country]?.parties || Object.keys(PARTY_MATCH_RULES);
          setMatchResults(computeMatch(quizAnswers, countryParties));
        }
      });
  }

  function handleQuizComplete(answers) {
    setQuizAnswers(answers);
    const countryParties = (country && COUNTRIES[country]?.parties?.length)
      ? COUNTRIES[country].parties
      : Object.keys(PARTY_MATCH_RULES);
    setMatchResults(computeMatch(answers, countryParties));
    setShowQuiz(false);
  }

  const years = country ? COUNTRIES[country]?.years || [] : [];
  const canLoad = country && year;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", transition: "background 0.2s" }}>

      {showQuiz && (
        <QuizModal
          onComplete={handleQuizComplete}
          onSkip={() => setShowQuiz(false)}
        />
      )}

      <nav style={{ borderBottom: "1px solid var(--border)", background: "var(--nav-bg)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 100, padding: "0 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
        <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.02em", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
          🗳️ Voteview
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", background: "var(--bg-muted)", color: "var(--text-muted)", padding: "2px 7px", borderRadius: 99 }}>Beta</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setShowQuiz(true)} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 99, padding: "5px 14px", fontSize: 13, color: "var(--text-muted)", cursor: "pointer" }}>
            🗳️ Retake quiz
          </button>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>More countries coming soon</span>
          <button onClick={() => setDark(d => !d)} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 99, padding: "5px 14px", fontSize: 13, color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            {dark ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "5rem 2rem 4rem", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", background: "var(--bg-muted)", padding: "5px 14px", borderRadius: 99, marginBottom: "1.5rem" }}>
          🌐 Global election intelligence
        </div>
        <h1 style={{ fontSize: 48, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1, color: "var(--text-primary)", marginBottom: "1.25rem" }}>
          Know what you're<br />voting for
        </h1>
        <p style={{ fontSize: 17, color: "var(--text-muted)", lineHeight: 1.7, maxWidth: 520, margin: "0 auto 2.5rem" }}>
          Compare political party positions side-by-side — across issues, in plain language, straight from official platforms.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "2rem", marginBottom: "3rem", flexWrap: "wrap" }}>
          {["AI-extracted from official sources", "8 parties · 6 issues", "Neutral & non-partisan"].map(f => (
            <span key={f} style={{ fontSize: 13, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "var(--text-primary)" }}>✓</span> {f}
            </span>
          ))}
        </div>

        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: "1.5rem", maxWidth: 600, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 6 }}>Country</label>
              <select value={country} onChange={e => handleCountryChange(e.target.value)}>
                <option value="">Select country…</option>
                {Object.keys(COUNTRIES).map(c => (
                  <option key={c} value={c}>{COUNTRIES[c].flag} {c}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 6 }}>Election year</label>
              <select value={year} onChange={e => setYear(e.target.value)} disabled={!country}>
                <option value="">Select year…</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <button onClick={handleLoad} disabled={!canLoad} style={{ width: "100%", padding: "11px", borderRadius: 10, fontWeight: 700, fontSize: 14, letterSpacing: "-0.01em", background: canLoad ? "var(--text-primary)" : "var(--bg-muted)", color: canLoad ? "var(--bg)" : "var(--text-faint)", border: "none", cursor: canLoad ? "pointer" : "not-allowed", transition: "all 0.15s" }}>
            {loading ? "Loading…" : "Compare parties →"}
          </button>
          {country && (
            <p style={{ marginTop: 12, fontSize: 12, color: "var(--text-muted)", textAlign: "center", lineHeight: 1.5 }}>
              {COUNTRIES[country].description}
            </p>
          )}
        </div>
      </div>

      {data && !loading && (
        <ComparisonView data={data} country={country} year={year} matchResults={matchResults} />
      )}
    </div>
  );
}