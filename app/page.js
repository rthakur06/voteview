"use client";
import { useState, useEffect, useRef } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { geoCentroid } from "d3-geo";

const GEO_URL = "/us-states.json";

/* ============================================================
   Voteview — 2026 U.S. Senate Battlegrounds
   A non-partisan tool: compare the candidates, find your lean,
   and see what's at stake for control of the Senate.
   ============================================================ */

const DATA_AS_OF = "June 2026";
const ELECTION_DAY = "2026-11-03T00:00:00-05:00";

// Current Senate standing (post-2024). 53 R, 45 D, 2 independents caucus D.
const SENATE = { R: 53, D: 45, I: 2, majority: 51, seatsUp: 35, demNeed: 4 };

const PARTY = {
  D: { name: "Democratic", short: "D", color: "#2b6cb0", soft: "#2b6cb022" },
  R: { name: "Republican", short: "R", color: "#c5413b", soft: "#c5413b22" },
  I: { name: "Independent", short: "I", color: "#6b54b8", soft: "#6b54b822" },
};

const bp = name => `https://ballotpedia.org/wiki/index.php?search=${encodeURIComponent(name)}`;

// Real races + matchups as of June 2026. Candidate-specific issue records are
// NOT yet verified — see PLATFORM (party-level) below and the corrections flow.
const RACES = [
  { id: "GA", state: "Georgia", type: "Regular", rating: "Toss-up", heldBy: "D",
    stakes: "Democrats' most vulnerable incumbent. A Republican win here widens the GOP majority and lengthens the Democrats' path back.",
    candidates: [
      { name: "Jon Ossoff", party: "D", role: "Incumbent", status: "Nominee" },
      { name: "Mike Collins", party: "R", role: "Challenger", status: "Nominee" },
    ] },
  { id: "NC", state: "North Carolina", type: "Regular", rating: "Toss-up", heldBy: "R", open: true,
    stakes: "An open Republican-held seat and the cycle's marquee toss-up. A Democratic pickup is central to almost every path to the majority.",
    candidates: [
      { name: "Roy Cooper", party: "D", role: "Open-seat candidate", status: "Nominee" },
      { name: "Michael Whatley", party: "R", role: "Open-seat candidate", status: "Nominee" },
    ] },
  { id: "ME", state: "Maine", type: "Regular", rating: "Toss-up", heldBy: "R",
    stakes: "A Republican incumbent in a state Harris won in 2024 — the Democrats' single best flip opportunity.",
    candidates: [
      { name: "Graham Platner", party: "D", role: "Challenger", status: "Nominee" },
      { name: "Susan Collins", party: "R", role: "Incumbent", status: "Nominee" },
    ] },
  { id: "MI", state: "Michigan", type: "Regular", rating: "Toss-up", heldBy: "D", open: true,
    stakes: "An open seat in a true swing state that both parties treat as must-win.",
    candidates: [
      { name: "Haley Stevens", party: "D", role: "Open-seat candidate", status: "Primary pending" },
      { name: "Mike Rogers", party: "R", role: "Open-seat candidate", status: "Presumptive" },
    ] },
  { id: "OH", state: "Ohio", type: "Special", rating: "Toss-up", heldBy: "R",
    stakes: "A special election for the seat JD Vance vacated — a high-profile attempt at a Democratic comeback.",
    candidates: [
      { name: "Sherrod Brown", party: "D", role: "Challenger", status: "Nominee" },
      { name: "Jon Husted", party: "R", role: "Appointed incumbent", status: "Nominee" },
    ] },
  { id: "TX", state: "Texas", type: "Regular", rating: "Lean R", heldBy: "R",
    stakes: "Long a Republican stronghold; an unusual matchup gives Democrats hope of putting it in play.",
    candidates: [
      { name: "James Talarico", party: "D", role: "Challenger", status: "Nominee" },
      { name: "Ken Paxton", party: "R", role: "Open-seat candidate", status: "Nominee" },
    ] },
  { id: "IA", state: "Iowa", type: "Regular", rating: "Lean R", heldBy: "R", open: true,
    stakes: "An open Republican-held seat Democrats call a possible sleeper amid economic discontent.",
    candidates: [
      { name: "Josh Turek", party: "D", role: "Open-seat candidate", status: "Nominee" },
      { name: "Ashley Hinson", party: "R", role: "Open-seat candidate", status: "Nominee" },
    ] },
  { id: "NE", state: "Nebraska", type: "Regular", rating: "Lean R", heldBy: "R",
    stakes: "An independent challenger gives a nominally safe Republican seat unexpected competitiveness.",
    candidates: [
      { name: "Dan Osborn", party: "I", role: "Challenger", status: "Nominee" },
      { name: "Pete Ricketts", party: "R", role: "Incumbent", status: "Nominee" },
    ] },
  { id: "AK", state: "Alaska", type: "Regular", rating: "Lean R", heldBy: "R",
    stakes: "A Republican incumbent faces a well-known statewide challenger in a quirky ranked-choice race.",
    candidates: [
      { name: "Mary Peltola", party: "D", role: "Challenger", status: "Nominee" },
      { name: "Dan Sullivan", party: "R", role: "Incumbent", status: "Nominee" },
    ] },
  { id: "NH", state: "New Hampshire", type: "Regular", rating: "Lean D", heldBy: "D", open: true,
    stakes: "An open, Democratic-leaning seat that two former-senator Republicans are fighting to flip.",
    candidates: [
      { name: "Chris Pappas", party: "D", role: "Open-seat candidate", status: "Presumptive" },
      { name: "John E. Sununu", party: "R", role: "Open-seat candidate", status: "Primary pending" },
    ] },
];

const RATING_META = {
  "Toss-up": { color: "var(--text-primary)", bg: "var(--bg-muted)", label: "Toss-up" },
  "Lean R": { color: PARTY.R.color, bg: PARTY.R.soft, label: "Lean R" },
  "Lean D": { color: PARTY.D.color, bg: PARTY.D.soft, label: "Lean D" },
};

// Issues + general party-platform DIRECTIONS. These are neutral, widely
// documented generalizations of each party's stated platform — NOT the
// individual candidate's verified positions, and NOT direct quotes.
const ISSUES = [
  { id: "economy", label: "Cost of living", q: "To bring prices down, government should mainly…",
    D: "Invest in services and child/health costs, and raise taxes on top earners and corporations.",
    R: "Cut taxes and regulation and lower energy costs to spur growth and ease prices.",
    opts: [ ["Invest & tax the wealthy", "D"], ["A balance of both", "mix"], ["Cut taxes & regulation", "R"] ] },
  { id: "immigration", label: "Immigration", q: "On immigration and the border, you favor…",
    D: "Tighter enforcement paired with legal pathways for some long-resident immigrants and orderly asylum.",
    R: "Stricter enforcement, more removals, and lower overall immigration.",
    opts: [ ["Enforcement + legal pathways", "D"], ["Somewhere in between", "mix"], ["Stricter enforcement", "R"] ] },
  { id: "healthcare", label: "Healthcare", q: "On healthcare, government should…",
    D: "Protect and expand the Affordable Care Act, lower drug prices, and broaden coverage.",
    R: "Favor market-based options, more state flexibility, and a smaller federal role.",
    opts: [ ["Expand public coverage", "D"], ["Mix of public & market", "mix"], ["Market-based, less federal", "R"] ] },
  { id: "climate", label: "Climate & energy", q: "On energy and climate, you favor…",
    D: "A clean-energy transition with investment in renewables and limits on emissions.",
    R: "Expanded domestic oil and gas and fewer new emissions mandates.",
    opts: [ ["Clean-energy transition", "D"], ["All of the above energy", "mix"], ["Expand oil & gas", "R"] ] },
  { id: "abortion", label: "Abortion", q: "On abortion, the law should…",
    D: "Protect access to abortion at the federal level.",
    R: "Restrict abortion, generally leaving rules to the states.",
    opts: [ ["Protect access federally", "D"], ["Allow with limits", "mix"], ["Restrict / leave to states", "R"] ] },
  { id: "democracy", label: "Voting & elections", q: "On running elections, you favor…",
    D: "Expanding voting access with some federal standards.",
    R: "Stricter ID and verification rules with elections run by the states.",
    opts: [ ["Expand voting access", "D"], ["A bit of both", "mix"], ["Stricter ID & verification", "R"] ] },
];

const LEAN_VAL = { D: -1, mix: 0, R: 1 };

/* Candidate-specific, SOURCED positions. Paraphrased from public reporting as
   of June 2026. Only the four settled toss-ups are sourced so far; everything
   else falls back to the party-platform baseline (shown as "Unverified").
   Each entry: { text, by, url }. */
const SRC = {
  ajcO: { by: "AJC", url: "https://www.ajc.com/politics/2026/04/jon-ossoff-a-look-at-the-ajcs-coverage/" },
  csO: { by: "City & State", url: "https://www.cityandstatepa.com/prediction-markets/candidates/jon-ossoff" },
  vsO: { by: "Vote Smart", url: "https://justfacts.votesmart.org/candidate/political-courage-test/176134/jon-ossoff" },
  ajcC: { by: "AJC", url: "https://www.ajc.com/politics/2026/04/mike-collins-a-look-at-the-ajcs-coverage/" },
  nbcC: { by: "NBC News", url: "https://www.nbcnews.com/politics/2026-election/georgia-senate-midterms-primary-winner-collins-rcna350028" },
  wralNC: { by: "WRAL", url: "https://www.wral.com/news/nccapitol/election-primary-north-carolina-us-senate-cooper-whately-march-2026/" },
  bbNC: { by: "Breaking Battlegrounds", url: "https://breakingbattlegrounds.vote/north-carolina-senate-race-2026/" },
  wuncNC: { by: "WUNC", url: "https://www.wunc.org/term/news/2026-03-03/roy-cooper-michael-whatley-north-carolina-senate" },
  asmNC: { by: "The Assembly", url: "https://www.theassemblync.com/news/politics/roy-cooper-michael-whatley-senate-nc-2026/" },
  mms: { by: "Maine Morning Star", url: "https://mainemorningstar.com/voter-guides/contests/2026-democratic-primary/" },
  wgme: { by: "WGME", url: "https://wgme.com/news/local/planned-parenthood-endorses-graham-platner-while-senator-susan-collins-defends-justice-brett-kavanaugh-support-maine-senate-race-politics-health-healthcare" },
  prospect: { by: "The American Prospect", url: "https://prospect.org/2026/06/15/graham-platner-susan-collins-maine-senate/" },
  pf: { by: "PolitiFact", url: "https://www.politifact.com/factchecks/2026/jun/23/susan-collins/Maine-Senate-abortion-Supreme-Court-Kavanaugh/" },
  cnOH: { by: "Campaign Now", url: "https://www.campaignnow.com/blog/ohios-special-senate-battle-sherrod-brown-vs.-jon-husted" },
  bfOH: { by: "The Buckeye Flame", url: "https://thebuckeyeflame.com/2026/05/12/sherrod-brown-will-face-anti-transgender-republican-sen-jon-husted-in-bid-for-ohio-senate-seat/" },
};
const POSITIONS = {
  "Jon Ossoff": {
    economy: { text: "Blames Trump's tariffs and policies for higher costs; voted to cap insulin at $35 and let Medicare negotiate drug prices; backs lower taxes for all but the wealthiest plus targeted relief.", ...SRC.ajcO },
    immigration: { text: "Supports deporting people who commit crimes and are here illegally, but has investigated and condemned abuses in ICE detention and opposes warrantless raids.", ...SRC.ajcO },
    healthcare: { text: "Wants to strengthen and expand the Affordable Care Act and extend its subsidies; favors a public option rather than Medicare-for-All; push to lower drug prices.", ...SRC.csO },
    climate: { text: "Backs accelerating clean energy through federal investment and tax credits, and expanding U.S. solar manufacturing.", ...SRC.csO },
    abortion: { text: "Supports codifying Roe into federal law; opposes Georgia's six-week ban; backs protections for contraception and IVF.", ...SRC.csO },
    democracy: { text: "Opposes the Citizens United decision and supports campaign-finance reform.", ...SRC.vsO },
  },
  "Mike Collins": {
    economy: { text: "Favors free markets and deregulation; wants to cut taxes and red tape, lower housing costs, and bring jobs back from overseas; blames Biden-era policy for inflation.", ...SRC.ajcC },
    immigration: { text: "Lead sponsor of the Laken Riley Act; makes tougher border security and immigration enforcement a central message.", ...SRC.ajcC },
    healthcare: { text: "Blames the Affordable Care Act for rising costs; voted for rural-hospital funding in the 2025 budget law; wants to limit malpractice lawsuits against providers.", ...SRC.ajcC },
    climate: { text: "Opposes 'costly' environmental mandates; backs deregulation to speed construction and shield farmers from environmental lawsuits.", ...SRC.ajcC },
    abortion: { text: "Opposes abortion rights and campaigns as a strong social conservative aligned with Trump.", ...SRC.nbcC },
  },
  "Roy Cooper": {
    economy: { text: "Centers his campaign on affordability — promising to 'make stuff cost less' — and points to job growth during his two terms as governor.", ...SRC.wralNC },
    healthcare: { text: "Highlights persuading North Carolina's Republican legislature to expand Medicaid; wants to protect coverage and lower costs.", ...SRC.wuncNC },
    immigration: { text: "Casts himself as a border-security pragmatist who supports deporting violent criminals but opposes mass deportation and indiscriminate sweeps.", ...SRC.bbNC },
  },
  "Michael Whatley": {
    economy: { text: "Runs on an 'America First' agenda of strengthening the economy in alignment with President Trump.", ...SRC.wuncNC },
    immigration: { text: "Makes border security and immigration enforcement central, praising stepped-up enforcement and pledging to 'back the blue.'", ...SRC.wralNC },
  },
  "Graham Platner": {
    economy: { text: "Runs on affordability and curbing corporate power; backs a billionaire minimum tax, more federal housing support, and banning hedge funds from buying homes.", ...SRC.mms },
    healthcare: { text: "Supports Medicare for All; opposes cuts to Medicare and Medicaid; wants to break up health-care monopolies, cut drug prices, and reopen shuttered hospitals.", ...SRC.mms },
    immigration: { text: "Calls for dismantling ICE and ending mass deportations, while pairing border security with paths to citizenship.", ...SRC.mms },
    climate: { text: "Links energy affordability to reining in fossil-fuel companies and corporate influence in politics.", ...SRC.mms },
    abortion: { text: "Endorsed by Planned Parenthood; frames health care, including reproductive care, as a human right.", ...SRC.wgme },
  },
  "Susan Collins": {
    economy: { text: "Chairs the Senate Appropriations Committee and emphasizes steering federal funding to Maine; casts herself as an effective, moderate dealmaker.", ...SRC.prospect },
    healthcare: { text: "Says she has pushed back on cuts to Medicare and defends access to care, including the role of Planned Parenthood health centers.", ...SRC.wgme },
    abortion: { text: "Co-sponsored a failed bill to codify Roe and says she is disappointed by the Dobbs ruling, while defending her vote to confirm Justice Kavanaugh.", ...SRC.pf },
  },
  "Sherrod Brown": {
    economy: { text: "Built his career on labor and blue-collar workers; campaigns on cost-of-living solutions and is skeptical of trade deals he says hurt American workers.", ...SRC.cnOH },
    healthcare: { text: "Casts himself as a defender of health-care access and lower costs for working families.", ...SRC.bfOH },
  },
  "Jon Husted": {
    economy: { text: "Runs on economic growth, regulatory relief, and traditional conservative values; a former Ohio secretary of state and lieutenant governor.", ...SRC.cnOH },
  },
};

/* ---------- Icons ---------- */
const Icon = {
  vote: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4"/><rect x="3" y="4" width="18" height="16" rx="2"/></svg>,
  arrow: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>,
  back: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>,
  check: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 6L9 17l-5-5"/></svg>,
  close: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M18 6L6 18M6 6l12 12"/></svg>,
  sun: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>,
  moon: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z"/></svg>,
  link: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.5.5l3-3a5 5 0 00-7-7l-1.5 1.5"/><path d="M14 11a5 5 0 00-7.5-.5l-3 3a5 5 0 007 7L12 19"/></svg>,
  warn: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 2.6 17a2 2 0 001.7 3h15.4a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"/></svg>,
  shield: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M12 2 4 5v6c0 5 3.4 8.5 8 11 4.6-2.5 8-6 8-11V5l-8-3z"/><path d="M9 12l2 2 4-4"/></svg>,
  cpu: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3"/></svg>,
  edit: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>,
  share: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>,
  download: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 21h16"/></svg>,
  image: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.8"/><path d="M21 15l-5-5L5 21"/></svg>,
  scale: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3v18M5 7h14M5 7l-3 6h6l-3-6zM19 7l-3 6h6l-3-6zM8 21h8"/></svg>,
  flag: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 22V4M4 4h13l-2 4 2 4H4"/></svg>,
};

/* ---------- Helpers ---------- */
function leanLabel(score) {
  if (score == null) return null;
  if (score < -0.55) return "Solidly Democratic";
  if (score < -0.18) return "Leans Democratic";
  if (score <= 0.18) return "Right in the middle";
  if (score <= 0.55) return "Leans Republican";
  return "Solidly Republican";
}
function closerParty(score) {
  if (score == null || Math.abs(score) <= 0.12) return null;
  return score < 0 ? "D" : "R";
}
function PartyAvatar({ party, size = 40 }) {
  const p = PARTY[party] || PARTY.I;
  return (
    <span style={{ width: size, height: size, borderRadius: "50%", background: p.color, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: size * 0.4, flexShrink: 0 }}>{p.short}</span>
  );
}
function initials(name) {
  return name.split(" ").map(w => w[0]).slice(0, 2).join("");
}
function RatingPill({ rating }) {
  const m = RATING_META[rating] || RATING_META["Toss-up"];
  return <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: m.color, background: m.bg, border: `1px solid ${m.color}33`, padding: "3px 9px", borderRadius: 99 }}>{m.label}</span>;
}

/* ---------- Senate control bar ---------- */
function SenateControl() {
  const total = 100;
  const dAligned = SENATE.D + SENATE.I;
  const pct = n => (n / total) * 100;
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 18, padding: "1.5rem 1.6rem", boxShadow: "var(--shadow-sm)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        <p className="mono-label" style={{ margin: 0 }}>Balance of power · current Senate</p>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)", margin: 0 }}>{SENATE.seatsUp} seats up Nov 3</p>
      </div>
      <div style={{ position: "relative", height: 30, borderRadius: 8, overflow: "hidden", display: "flex", border: "1px solid var(--border)" }}>
        <div style={{ width: `${pct(dAligned)}%`, background: PARTY.D.color, display: "flex", alignItems: "center", paddingLeft: 10 }}>
          <span style={{ color: "#fff", fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700 }}>{dAligned}</span>
        </div>
        <div style={{ width: `${pct(SENATE.R)}%`, background: PARTY.R.color, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 10 }}>
          <span style={{ color: "#fff", fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700 }}>{SENATE.R}</span>
        </div>
        {/* majority line at 51 */}
        <div style={{ position: "absolute", left: "51%", top: -3, bottom: -3, width: 2, background: "var(--text-primary)" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11.5, color: "var(--text-muted)" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 9, height: 9, borderRadius: 2, background: PARTY.D.color }} /> Democrats + 2 independents</span>
        <span style={{ fontFamily: "var(--font-mono)" }}>51 = majority</span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>Republicans <span style={{ width: 9, height: 9, borderRadius: 2, background: PARTY.R.color }} /></span>
      </div>
      <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "14px 0 0", paddingTop: 14, borderTop: "1px solid var(--border-light)" }}>
        Republicans hold <strong style={{ color: "var(--text-primary)" }}>{SENATE.R}</strong> seats to the Democrats&apos; <strong style={{ color: "var(--text-primary)" }}>{dAligned}</strong> (counting the two independents who vote with them). Democrats need to flip a net of <strong style={{ color: PARTY.D.color }}>{SENATE.demNeed} seats</strong> to reach 51 and take charge — anything short of that, and a 50–50 tie goes to Republicans, because the vice president breaks ties. These {RACES.length} races decide it.
      </p>
    </div>
  );
}

/* ---------- Countdown ---------- */
function useCountdown(target) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 60000); return () => clearInterval(t); }, []);
  const diff = Math.max(0, new Date(target).getTime() - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  return { days, hours, done: diff === 0 };
}

/* ---------- Provenance + corrections ---------- */
function CorrectionModal({ race, party, issue, onClose }) {
  const [form, setForm] = useState({ problem: "", correction: "", source: "", email: "" });
  const [state, setState] = useState("idle");
  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  async function submit() {
    if (!form.problem.trim()) return;
    setState("sending");
    try {
      const res = await fetch("/api/corrections", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ country: "US", party: PARTY[party]?.name, issue: `${race} — ${issue}`, ...form }) });
      setState(res.ok ? "done" : "error");
    } catch { setState("error"); }
  }
  function copyReport() {
    const txt = [`Voteview correction`, `Race: ${race}`, `Party/candidate: ${party}`, `Issue: ${issue}`, `Problem: ${form.problem}`, form.correction ? `Correct: ${form.correction}` : null, form.source ? `Source: ${form.source}` : null].filter(Boolean).join("\n");
    navigator.clipboard?.writeText(txt).catch(() => {}); setState("done");
  }
  const field = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text-primary)", fontSize: 13.5, fontFamily: "inherit", lineHeight: 1.5, resize: "vertical" };
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 340, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.25rem", animation: "fadeIn 0.2s ease-out" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "var(--bg-card)", borderRadius: 20, padding: "1.6rem 1.7rem", maxWidth: 500, width: "100%", border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)", maxHeight: "92vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}><span style={{ display: "flex", color: "var(--accent)" }}>{Icon.edit(16)}</span><h3 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: 23, color: "var(--text-primary)", margin: 0 }}>Suggest a correction</h3></div>
          <button onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4, display: "flex" }}>{Icon.close(18)}</button>
        </div>
        <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 16px", lineHeight: 1.55 }}>{race} · {issue}. Help us source a candidate's actual record — ideally with a link to an official statement or vote.</p>
        {state === "done" ? (
          <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--accent-soft)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>{Icon.check(22)}</div>
            <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px" }}>Thank you</p>
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>Recorded for review.</p>
            <button onClick={onClose} style={{ marginTop: 18, padding: "10px 22px", borderRadius: 11, border: "none", background: "var(--accent)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Close</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div><label className="mono-label" style={{ display: "block", marginBottom: 6 }}>What&apos;s wrong or missing? *</label><textarea value={form.problem} onChange={upd("problem")} rows={2} placeholder="e.g. This candidate has actually said the opposite on this." style={field} /></div>
            <div><label className="mono-label" style={{ display: "block", marginBottom: 6 }}>The candidate&apos;s actual position</label><textarea value={form.correction} onChange={upd("correction")} rows={2} style={field} /></div>
            <div><label className="mono-label" style={{ display: "block", marginBottom: 6 }}>Source link</label><input value={form.source} onChange={upd("source")} placeholder="https://…" style={field} /></div>
            <div><label className="mono-label" style={{ display: "block", marginBottom: 6 }}>Your email (optional)</label><input value={form.email} onChange={upd("email")} style={field} /></div>
            {state === "error" && <p style={{ fontSize: 12.5, color: PARTY.R.color, margin: 0 }}>Couldn&apos;t reach the server — copy the report and email it instead.</p>}
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button onClick={submit} disabled={!form.problem.trim() || state === "sending"} style={{ flex: 1, padding: "12px", borderRadius: 11, border: "none", background: form.problem.trim() ? "var(--accent)" : "var(--bg-muted)", color: form.problem.trim() ? "#fff" : "var(--text-faint)", fontSize: 14, fontWeight: 700, cursor: form.problem.trim() ? "pointer" : "not-allowed" }}>{state === "sending" ? "Sending…" : "Submit"}</button>
              <button onClick={copyReport} style={{ padding: "12px 16px", borderRadius: 11, border: "1px solid var(--border-strong)", background: "var(--bg-muted)", color: "var(--text-secondary)", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 7 }}>{Icon.link(13)} Copy</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function UnverifiedBadge({ race, party, issue }) {
  const [open, setOpen] = useState(false);
  const [correcting, setCorrecting] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline-flex" }}>
      {correcting && <CorrectionModal race={race} party={party} issue={issue} onClose={() => { setCorrecting(false); setOpen(false); }} />}
      <button onClick={() => setOpen(o => !o)} title="Party-platform baseline — not verified for this candidate"
        style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 8px", borderRadius: 99, border: "1px solid var(--border)", background: "var(--bg-muted)", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600, letterSpacing: "0.04em", cursor: "pointer", textTransform: "uppercase" }}>
        {Icon.cpu(9)} Unverified
      </button>
      {open && (
        <>
          <span onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 60 }} />
          <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 61, width: 250, background: "var(--bg-card)", border: "1px solid var(--border-strong)", borderRadius: 12, boxShadow: "var(--shadow-md)", padding: "12px 13px" }}>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "0 0 10px", lineHeight: 1.5 }}>We haven&apos;t confirmed this candidate&apos;s own words yet, so we&apos;re showing what the party generally stands for as a placeholder. Know their actual position? Add a source.</p>
            <button onClick={() => setCorrecting(true)} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "var(--accent-ink)", background: "none", border: "none", padding: 0, cursor: "pointer" }}>{Icon.edit(11)} Add a sourced position</button>
          </div>
        </>
      )}
    </span>
  );
}

/* ---------- Quiz (weighted) ---------- */
const WEIGHTS = [ { v: 1, label: "A little" }, { v: 2, label: "Important" }, { v: 3, label: "Crucial" } ];

function QuizModal({ onComplete, onClose }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [weights, setWeights] = useState({});
  const q = ISSUES[step];
  const isLast = step === ISSUES.length - 1;
  const chosen = answers[q.id];
  const weight = weights[q.id] ?? 2;
  const progress = ((step + (chosen ? 1 : 0)) / ISSUES.length) * 100;

  function choose(v) { setAnswers(a => ({ ...a, [q.id]: v })); setWeights(w => ({ ...w, [q.id]: w[q.id] ?? 2 })); }
  function next() { if (isLast) onComplete({ answers, weights }); else setStep(s => s + 1); }
  function skip() { const na = { ...answers }; delete na[q.id]; const nw = { ...weights, [q.id]: 0 }; setAnswers(na); setWeights(nw); if (isLast) onComplete({ answers: na, weights: nw }); else setStep(s => s + 1); }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.62)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.25rem", animation: "fadeIn 0.2s ease-out" }}>
      <div style={{ background: "var(--bg-card)", borderRadius: 24, padding: "clamp(1.5rem,4vw,2.25rem)", maxWidth: 560, width: "100%", border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)", maxHeight: "92vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.4rem" }}>
          <span className="mono-label">Question {step + 1} / {ISSUES.length} · {q.label}</span>
          <button onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 6, display: "flex" }}>{Icon.close(18)}</button>
        </div>
        <div style={{ height: 4, background: "var(--bg-muted)", borderRadius: 99, marginBottom: "1.6rem", overflow: "hidden" }}><div style={{ height: "100%", borderRadius: 99, background: "var(--accent)", width: `${progress}%`, transition: "width 0.35s ease" }} /></div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(22px,5vw,28px)", fontWeight: 400, color: "var(--text-primary)", marginBottom: "1.2rem", lineHeight: 1.2 }}>{q.q}</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {q.opts.map(([label, val]) => {
            const sel = chosen === val;
            return (
              <button key={val} onClick={() => choose(val)} style={{ padding: "14px 16px", borderRadius: 14, cursor: "pointer", border: `1.5px solid ${sel ? "var(--accent)" : "var(--border)"}`, background: sel ? "var(--accent-soft)" : "var(--bg)", color: "var(--text-primary)", fontSize: 14, textAlign: "left", fontWeight: 500, display: "flex", gap: 12, alignItems: "center", transition: "all 0.15s" }}>
                <span style={{ flexShrink: 0, width: 18, height: 18, borderRadius: "50%", border: `2px solid ${sel ? "var(--accent)" : "var(--border-strong)"}`, background: sel ? "var(--accent)" : "transparent", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>{sel && Icon.check(10)}</span>
                {label}
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: "1.3rem", opacity: chosen ? 1 : 0.4, pointerEvents: chosen ? "auto" : "none", transition: "opacity 0.2s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}><span style={{ display: "flex", color: "var(--text-muted)" }}>{Icon.scale(13)}</span><span className="mono-label" style={{ margin: 0 }}>How much does this issue matter?</span></div>
          <div style={{ display: "flex", gap: 8 }}>
            {WEIGHTS.map(wo => { const active = weight === wo.v && chosen; return <button key={wo.v} onClick={() => setWeights(w => ({ ...w, [q.id]: wo.v }))} style={{ flex: 1, padding: "8px 12px", borderRadius: 10, border: `1.5px solid ${active ? "var(--accent)" : "var(--border)"}`, background: active ? "var(--accent)" : "var(--bg)", color: active ? "#fff" : "var(--text-secondary)", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>{wo.label}</button>; })}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: "1.7rem" }}>
          <button onClick={() => step > 0 ? setStep(s => s - 1) : onClose()} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>{step > 0 ? "← Back" : "Cancel"}</button>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button onClick={skip} style={{ background: "none", border: "none", color: "var(--text-faint)", fontSize: 13, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>Skip</button>
            <button onClick={next} disabled={!chosen} style={{ display: "flex", alignItems: "center", gap: 7, padding: "11px 22px", borderRadius: 12, border: "none", background: chosen ? "var(--accent)" : "var(--bg-muted)", color: chosen ? "#fff" : "var(--text-faint)", fontSize: 14, fontWeight: 700, cursor: chosen ? "pointer" : "not-allowed" }}>{isLast ? "See my result" : "Next"} {Icon.arrow(15)}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function scoreQuiz(answers, weights) {
  const ids = Object.keys(answers).filter(id => (weights[id] ?? 2) > 0);
  if (!ids.length) return null;
  let weighted = 0, tw = 0;
  for (const id of ids) { const w = weights[id] ?? 2; weighted += LEAN_VAL[answers[id]] * w; tw += w; }
  return tw ? weighted / tw : 0;
}

/* ---------- Share card (canvas → PNG) ---------- */
function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

function ShareCardModal({ score, lean, onClose }) {
  const ref = useRef(null);
  const [status, setStatus] = useState("");
  const [canShare, setCanShare] = useState(false);
  const W = 1200, H = 675;
  const cp = closerParty(score);
  const accent = cp ? PARTY[cp].color : "#8b83ff";

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && !!navigator.canShare);
    let stop = false;
    (async () => {
      const c = ref.current; if (!c) return;
      try { await Promise.all([document.fonts.load('400 64px "Instrument Serif"'), document.fonts.load('700 80px "JetBrains Mono"'), document.fonts.ready]); } catch {}
      if (stop) return;
      const ctx = c.getContext("2d");
      ctx.fillStyle = "#0a0c11"; ctx.fillRect(0, 0, W, H);
      const g = ctx.createRadialGradient(W - 160, 120, 40, W - 160, 120, 520); g.addColorStop(0, accent + "33"); g.addColorStop(1, accent + "00"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "rgba(255,255,255,0.045)"; for (let x = 40; x < W; x += 30) for (let y = 40; y < H; y += 30) { ctx.beginPath(); ctx.arc(x, y, 1.1, 0, 7); ctx.fill(); }
      ctx.fillStyle = accent; ctx.fillRect(0, 0, W, 8);
      const PAD = 74;
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = "#f0f1f4"; ctx.font = '400 40px "Instrument Serif", Georgia, serif'; ctx.fillText("Voteview", PAD, 96);
      ctx.fillStyle = "#6c7280"; ctx.font = '500 16px "JetBrains Mono", monospace'; ctx.fillText("2026 SENATE BATTLEGROUNDS", PAD + 188, 92);
      ctx.fillStyle = accent; ctx.font = '500 20px "JetBrains Mono", monospace'; ctx.fillText("MY LEAN", PAD, 230);
      ctx.fillStyle = "#ffffff"; ctx.font = '400 76px "Instrument Serif", Georgia, serif';
      // wrap lean into up to 2 lines
      const words = (lean || "").split(" "); const lines = []; let cur = "";
      ctx.font = '400 72px "Instrument Serif", Georgia, serif';
      for (const w of words) { const t = cur ? cur + " " + w : w; if (ctx.measureText(t).width > 720 && cur) { lines.push(cur); cur = w; } else cur = t; }
      if (cur) lines.push(cur);
      lines.slice(0, 2).forEach((ln, i) => ctx.fillText(ln, PAD, 312 + i * 78));
      // scale meter
      const my = 312 + Math.min(lines.length, 2) * 78 + 40, mx = PAD, mw = W - PAD * 2, mh = 16;
      ctx.fillStyle = "#1a1e28"; roundRect(ctx, mx, my, mw, mh, 8); ctx.fill();
      const dotX = mx + ((score + 1) / 2) * mw;
      ctx.fillStyle = PARTY.D.color; ctx.font = '600 18px "JetBrains Mono", monospace'; ctx.fillText("DEM", mx, my - 14);
      ctx.fillStyle = PARTY.R.color; ctx.textAlign = "right"; ctx.fillText("REP", mx + mw, my - 14); ctx.textAlign = "left";
      ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(dotX, my + mh / 2, 18, 0, 7); ctx.fill(); ctx.strokeStyle = "#0a0c11"; ctx.lineWidth = 5; ctx.stroke();
      ctx.strokeStyle = "#1d2129"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(PAD, H - 80); ctx.lineTo(W - PAD, H - 80); ctx.stroke();
      ctx.fillStyle = "#6c7280"; ctx.font = '500 19px "JetBrains Mono", monospace'; ctx.fillText("Find your lean in 10 toss-up Senate races", PAD, H - 44);
      ctx.fillStyle = "#a5aab4"; ctx.textAlign = "right"; ctx.fillText("Voteview", W - PAD, H - 44); ctx.textAlign = "left";
    })();
    return () => { stop = true; };
  }, [score, lean, accent]);

  const withBlob = cb => ref.current?.toBlob(b => b && cb(b), "image/png");
  const download = () => withBlob(b => { const u = URL.createObjectURL(b); const a = document.createElement("a"); a.href = u; a.download = "voteview-senate-lean.png"; a.click(); URL.revokeObjectURL(u); setStatus("Downloaded"); setTimeout(() => setStatus(""), 1800); });
  const shareImg = () => withBlob(async b => { const f = new File([b], "voteview.png", { type: "image/png" }); try { if (navigator.canShare && navigator.canShare({ files: [f] })) await navigator.share({ files: [f], title: "My 2026 Senate lean", text: lean }); else download(); } catch {} });
  const copyImg = () => withBlob(async b => { try { await navigator.clipboard.write([new ClipboardItem({ "image/png": b })]); setStatus("Copied"); setTimeout(() => setStatus(""), 1800); } catch { setStatus("Use Download"); setTimeout(() => setStatus(""), 2200); } });

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.25rem", animation: "fadeIn 0.2s ease-out" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "var(--bg-card)", borderRadius: 22, padding: "1.5rem", maxWidth: 640, width: "100%", border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)", maxHeight: "92vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}><p className="mono-label" style={{ margin: 0 }}>Share your lean</p><button onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4, display: "flex" }}>{Icon.close(18)}</button></div>
        <canvas ref={ref} width={W} height={H} style={{ width: "100%", height: "auto", borderRadius: 14, border: "1px solid var(--border)", display: "block", background: "#0a0c11" }} />
        <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
          {canShare && <button onClick={shareImg} style={{ flex: "1 1 130px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 18px", borderRadius: 12, border: "none", background: "var(--accent)", color: "#fff", fontSize: 14, fontWeight: 700 }}>{Icon.share(15)} Share</button>}
          <button onClick={download} style={{ flex: "1 1 130px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 18px", borderRadius: 12, border: canShare ? "1px solid var(--border-strong)" : "none", background: canShare ? "var(--bg-muted)" : "var(--accent)", color: canShare ? "var(--text-primary)" : "#fff", fontSize: 14, fontWeight: 700 }}>{Icon.download(15)} Download</button>
          <button onClick={copyImg} style={{ flex: "1 1 110px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 18px", borderRadius: 12, border: "1px solid var(--border-strong)", background: "var(--bg-muted)", color: "var(--text-primary)", fontSize: 14, fontWeight: 600 }}>{Icon.image(15)} Copy</button>
        </div>
        <p style={{ minHeight: 18, margin: "10px 0 0", textAlign: "center", fontSize: 12.5, fontWeight: 600, color: "var(--accent-ink)" }}>{status}</p>
      </div>
    </div>
  );
}

/* ---------- Battleground map ---------- */
const RACE_BY_STATE = Object.fromEntries(RACES.map(r => [r.state, r]));

function USMap({ cp, onOpen }) {
  const [hover, setHover] = useState(null);
  const fillFor = (race, hovered) => {
    const base = race.rating === "Lean R" ? PARTY.R.color : race.rating === "Lean D" ? PARTY.D.color : "var(--accent)";
    return { fill: base, fillOpacity: hovered ? 0.92 : 0.6 };
  };
  const hoveredRace = hover ? RACE_BY_STATE[hover] : null;

  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 18, padding: "1.2rem 1.3rem 1rem", boxShadow: "var(--shadow-sm)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8, marginBottom: 6 }}>
        <p className="mono-label" style={{ margin: 0 }}>The map · click a battleground</p>
        <div style={{ display: "flex", gap: 13, flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10.5, color: "var(--text-muted)" }}><span style={{ width: 10, height: 10, borderRadius: 3, background: "var(--accent)", opacity: 0.7 }} /> Toss-up</span>
          <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10.5, color: "var(--text-muted)" }}><span style={{ width: 10, height: 10, borderRadius: 3, background: PARTY.D.color, opacity: 0.7 }} /> Lean D</span>
          <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10.5, color: "var(--text-muted)" }}><span style={{ width: 10, height: 10, borderRadius: 3, background: PARTY.R.color, opacity: 0.7 }} /> Lean R</span>
        </div>
      </div>

      <ComposableMap projection="geoAlbersUsa" style={{ width: "100%", height: "auto" }} projectionConfig={{ scale: 1000 }}>
        <Geographies geography={GEO_URL}>
          {({ geographies }) => geographies.map(geo => {
            const name = geo.properties.name;
            const race = RACE_BY_STATE[name];
            const isHover = hover === name;
            if (!race) {
              return <Geography key={geo.rsmKey} geography={geo} style={{
                default: { fill: "var(--bg-muted)", stroke: "var(--border)", strokeWidth: 0.5, outline: "none" },
                hover: { fill: "var(--bg-muted)", stroke: "var(--border)", strokeWidth: 0.5, outline: "none" },
                pressed: { outline: "none" },
              }} />;
            }
            const f = fillFor(race, isHover);
            return (
              <g key={geo.rsmKey}>
                <Geography geography={geo}
                  onMouseEnter={() => setHover(name)} onMouseLeave={() => setHover(null)}
                  onClick={() => onOpen(race)}
                  style={{
                    default: { fill: f.fill, fillOpacity: f.fillOpacity, stroke: "var(--bg-card)", strokeWidth: 1, outline: "none", cursor: "pointer", transition: "fill-opacity 0.15s" },
                    hover: { fill: f.fill, fillOpacity: 0.92, stroke: "var(--bg-card)", strokeWidth: 1.4, outline: "none", cursor: "pointer" },
                    pressed: { outline: "none" },
                  }} />
                <Marker coordinates={geoCentroid(geo)}>
                  <text textAnchor="middle" style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, fill: "#fff", pointerEvents: "none" }} dy={3}>{race.id}</text>
                </Marker>
              </g>
            );
          })}
        </Geographies>
      </ComposableMap>

      <div style={{ minHeight: 44, marginTop: 6, paddingTop: 10, borderTop: "1px solid var(--border-light)", display: "flex", alignItems: "center", gap: 10 }}>
        {hoveredRace ? (
          <>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--text-primary)" }}>{hoveredRace.state}</span>
            <RatingPill rating={hoveredRace.rating} />
            <span style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
              {hoveredRace.candidates.map((c, i) => (
                <span key={c.name}>{i > 0 && <span style={{ color: "var(--text-faint)" }}> vs </span>}<span style={{ color: cp && c.party === cp ? PARTY[c.party].color : "var(--text-secondary)", fontWeight: cp && c.party === cp ? 700 : 500 }}>{c.name} ({c.party})</span></span>
              ))}
            </span>
          </>
        ) : (
          <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>Hover a highlighted state to preview the race — click to compare the candidates.</span>
        )}
      </div>
    </div>
  );
}

/* ---------- Race card ---------- */
function RaceCard({ race, cp, onOpen, index = 0 }) {
  const [hover, setHover] = useState(false);
  return (
    <button onClick={() => onOpen(race)} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} className="press"
      style={{ textAlign: "left", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: "1.1rem 1.2rem", cursor: "pointer", boxShadow: hover ? "var(--elev-2)" : "var(--elev-1)", transform: hover ? "translateY(-3px)" : "none", transition: "transform 0.22s var(--spring), box-shadow 0.22s var(--ease-out), border-color 0.15s", width: "100%", display: "flex", flexDirection: "column", gap: 12, animation: `staggerIn 0.5s var(--ease-out) ${Math.min(index, 12) * 0.04}s both` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13, color: "var(--text-muted)" }}>{race.id}</span>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 19, color: "var(--text-primary)", lineHeight: 1 }}>{race.state}</span>
        </div>
        <RatingPill rating={race.rating} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {race.candidates.map(c => {
          const isCloser = cp && c.party === cp;
          return (
            <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 9, padding: "5px 8px", borderRadius: 9, background: isCloser ? PARTY[c.party].soft : "transparent", border: isCloser ? `1px solid ${PARTY[c.party].color}55` : "1px solid transparent" }}>
              <PartyAvatar party={c.party} size={26} />
              <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", flex: 1 }}>{c.name}</span>
              {isCloser && <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, color: PARTY[c.party].color, letterSpacing: "0.04em" }}>CLOSER TO YOU</span>}
              {c.status === "Incumbent" || c.status === "Appointed incumbent" ? <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-faint)" }}>INC</span> : null}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border-light)", paddingTop: 9 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-faint)", letterSpacing: "0.04em", textTransform: "uppercase" }}>{race.open ? "Open seat" : race.type === "Special" ? "Special election" : "Re-election"} · {race.open ? "last held by" : "held by"} {PARTY[race.heldBy].name}s</span>
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: hover ? "var(--accent)" : "var(--text-muted)" }}>Compare {Icon.arrow(12)}</span>
      </div>
    </button>
  );
}

/* ---------- Race detail ---------- */
function RaceDetail({ race, cp, onClose }) {
  const dem = race.candidates.find(c => c.party === "D");
  const rep = race.candidates.find(c => c.party === "R");
  const ind = race.candidates.find(c => c.party === "I");
  const left = dem || ind || race.candidates[0];
  const right = rep || race.candidates[1];

  const CandCard = ({ c, closer }) => c ? (
    <div style={{ flex: 1, minWidth: 0, background: closer ? PARTY[c.party].soft : "var(--bg)", border: `1px solid ${closer ? PARTY[c.party].color + "66" : "var(--border)"}`, borderRadius: 14, padding: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 8 }}>
        <PartyAvatar party={c.party} size={42} />
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: 0, lineHeight: 1.15 }}>{c.name}</p>
          <p style={{ fontSize: 11.5, color: PARTY[c.party].color, fontWeight: 600, margin: "2px 0 0" }}>{PARTY[c.party].name} · {c.role}</p>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {c.status === "Primary pending" && <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600, color: "var(--text-muted)", background: "var(--bg-muted)", border: "1px solid var(--border)", padding: "2px 7px", borderRadius: 99, textTransform: "uppercase" }}>Primary pending</span>}
        {c.status === "Presumptive" && <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600, color: "var(--text-muted)", background: "var(--bg-muted)", border: "1px solid var(--border)", padding: "2px 7px", borderRadius: 99, textTransform: "uppercase" }}>Presumptive</span>}
        {closer && <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, color: PARTY[c.party].color, letterSpacing: "0.04em" }}>CLOSER TO YOU</span>}
        <a href={bp(c.name)} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 600, color: "var(--text-muted)", textDecoration: "none", marginLeft: "auto" }}>{Icon.link(11)} Research</a>
      </div>
    </div>
  ) : <div style={{ flex: 1 }} />;

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 260, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "1.25rem", overflowY: "auto", animation: "fadeIn 0.2s ease-out" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "var(--bg-card)", borderRadius: 22, maxWidth: 760, width: "100%", border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)", margin: "auto", overflow: "hidden" }}>
        <div style={{ padding: "1.5rem 1.7rem 1.2rem", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: 30, color: "var(--text-primary)", margin: 0, lineHeight: 1 }}>{race.state}</h2>
                <RatingPill rating={race.rating} />
              </div>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", margin: 0, letterSpacing: "0.04em", textTransform: "uppercase" }}>{race.type} election{race.open ? " · open seat" : ""} · currently held by {PARTY[race.heldBy].name}s</p>
            </div>
            <button onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4, display: "flex" }}>{Icon.close(20)}</button>
          </div>
        </div>

        <div style={{ padding: "1.4rem 1.7rem" }}>
          {/* candidates */}
          <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
            <CandCard c={left} closer={cp && left && left.party === cp} />
            <CandCard c={right} closer={cp && right && right.party === cp} />
          </div>

          {/* stakes */}
          <div style={{ display: "flex", gap: 11, padding: "13px 15px", borderRadius: 12, background: "var(--accent-soft)", border: "1px solid var(--accent)", marginBottom: 20 }}>
            <span style={{ flexShrink: 0, color: "var(--accent)", marginTop: 1 }}>{Icon.flag(15)}</span>
            <p style={{ fontSize: 13.5, color: "var(--text-primary)", margin: 0, lineHeight: 1.6 }}><strong>What&apos;s at stake:</strong> {race.stakes}</p>
          </div>

          {/* candidate comparison */}
          <p className="mono-label" style={{ margin: "0 0 4px" }}>Where they stand</p>
          <div style={{ display: "flex", gap: 11, padding: "10px 13px", borderRadius: 10, background: "var(--bg-muted)", border: "1px solid var(--border)", marginBottom: 14 }}>
            <span style={{ flexShrink: 0, color: "var(--text-muted)", marginTop: 1 }}>{Icon.warn(13)}</span>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0, lineHeight: 1.55 }}>Rows marked <strong>with a source</strong> are the candidate&apos;s own stated position (tap the tag to read it). Rows marked <strong>Unverified</strong> show what the party generally stands for, as a placeholder until we confirm that candidate&apos;s record — tap to help us source it.</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {ISSUES.map((iss, i) => {
              const cell = (c) => {
                if (!c) return <div style={{ flex: 1 }} />;
                const sourced = POSITIONS[c.name]?.[iss.id];
                const baseline = c.party === "R" ? iss.R : c.party === "I" ? "Independent — position on this issue not yet sourced." : iss.D;
                return (
                  <div style={{ flex: 1, minWidth: 0, borderLeft: `3px solid ${PARTY[c.party].color}`, paddingLeft: 11 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, fontWeight: 600, color: PARTY[c.party].color, letterSpacing: "0.04em", textTransform: "uppercase" }}>{c.name}</span>
                      {sourced
                        ? <a href={sourced.url} target="_blank" rel="noopener noreferrer" title={`Source: ${sourced.by}`} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "var(--font-mono)", fontSize: 8.5, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--grad-3)", background: "color-mix(in srgb, var(--grad-3) 12%, transparent)", border: "1px solid color-mix(in srgb, var(--grad-3) 45%, transparent)", padding: "1px 6px", borderRadius: 99, textDecoration: "none" }}>{Icon.shield(8)} {sourced.by}</a>
                        : <UnverifiedBadge race={race.state} party={c.party} issue={iss.label} />}
                    </div>
                    <p style={{ fontSize: 12.5, color: sourced ? "var(--text-primary)" : "var(--text-muted)", margin: 0, lineHeight: 1.55, fontStyle: sourced ? "normal" : "italic" }}>{sourced ? sourced.text : baseline}</p>
                  </div>
                );
              };
              return (
                <div key={iss.id} style={{ padding: "14px 0", borderTop: i === 0 ? "none" : "1px solid var(--border-light)" }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: 9 }}>{iss.label}</span>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    {cell(left)}
                    {cell(right)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Result banner ---------- */
function ResultBanner({ score, lean, onShare, onRetake, onDismiss }) {
  const cp = closerParty(score);
  const dotX = ((score + 1) / 2) * 100;
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 18, overflow: "hidden", boxShadow: "var(--shadow-md)", marginBottom: "2rem", animation: "slideIn 0.45s ease-out" }}>
      <div style={{ height: 4, background: `linear-gradient(90deg, ${PARTY.D.color}, ${cp ? PARTY[cp].color : "var(--accent)"}, ${PARTY.R.color})` }} />
      <div style={{ padding: "1.5rem 1.7rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
          <div>
            <p className="mono-label" style={{ margin: "0 0 5px" }}>Your result</p>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: 28, color: "var(--text-primary)", margin: 0, lineHeight: 1.05 }}>{lean}</p>
          </div>
          <button onClick={onDismiss} aria-label="Dismiss" style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4, display: "flex" }}>{Icon.close(16)}</button>
        </div>
        <div style={{ position: "relative", height: 14, borderRadius: 8, background: `linear-gradient(90deg, ${PARTY.D.color}, var(--bg-muted), ${PARTY.R.color})`, marginBottom: 8 }}>
          <div style={{ position: "absolute", top: "50%", left: `${dotX}%`, transform: "translate(-50%,-50%)", width: 22, height: 22, borderRadius: "50%", background: cp ? PARTY[cp].color : "var(--text-primary)", border: "3px solid var(--bg-card)", boxShadow: "var(--shadow-sm)" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text-muted)", marginBottom: 16 }}><span>DEMOCRATIC</span><span>REPUBLICAN</span></div>
        <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 16px" }}>
          {cp ? <>Across these races, the <strong style={{ color: PARTY[cp].color }}>{PARTY[cp].name}</strong> candidate usually lines up better with your answers — we&apos;ve tagged them &ldquo;closer to you&rdquo; on each race. Open any race to see the details and decide for yourself.</> : <>Your answers sit close to the middle, so neither party is a clear fit. Open any race to weigh the two candidates yourself.</>}
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={onShare} style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 11, border: "none", background: "var(--accent)", color: "#fff", fontSize: 13.5, fontWeight: 700 }}>{Icon.share(14)} Share my lean</button>
          <button onClick={onRetake} style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 11, border: "1px solid var(--border-strong)", background: "var(--bg-muted)", color: "var(--text-secondary)", fontSize: 13.5, fontWeight: 600 }}>Retake</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Path to 51: interactive majority tracker ---------- */
const BG_HELD_D = RACES.filter(r => r.heldBy === "D").length;          // currently-D battlegrounds
const D_SAFE = (SENATE.D + SENATE.I) - BG_HELD_D;                      // 44
const R_SAFE = SENATE.R - (RACES.length - BG_HELD_D);                  // 46
const defaultPick = r => r.rating === "Lean D" ? "D" : r.rating === "Lean R" ? "R" : null;

function SenateScenario({ picks, setPicks, onOpen }) {
  const called = RACES.reduce((a, r) => { const p = picks[r.id]; if (p === "D") a.d++; else if (p === "R") a.r++; else a.u++; return a; }, { d: 0, r: 0, u: 0 });
  const D = D_SAFE + called.d, R = R_SAFE + called.r, U = called.u;
  const demWins = D >= 51;
  const demNeed = Math.max(0, 51 - D);
  const pct = n => (n / 100) * 100;

  const set = (id, val) => setPicks(p => ({ ...p, [id]: p[id] === val ? null : val }));
  const reset = () => setPicks(Object.fromEntries(RACES.map(r => [r.id, defaultPick(r)])));

  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, padding: "clamp(1.3rem,3vw,1.8rem)", boxShadow: "var(--elev-2)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>
        <div>
          <p className="mono-label" style={{ margin: "0 0 5px" }}>Interactive · path to 51</p>
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "clamp(22px,4vw,28px)", color: "var(--text-primary)", margin: 0, lineHeight: 1.05 }}>Call the races. Watch the math.</h3>
        </div>
        <button onClick={reset} className="press" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: "1px solid var(--border-strong)", background: "var(--bg-muted)", color: "var(--text-secondary)", fontSize: 12.5, fontWeight: 600, cursor: "pointer", minHeight: 38 }}>Reset to forecast</button>
      </div>

      {/* live count */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ textAlign: "left" }}>
          <span key={`d${D}`} className="font-mono tnum" style={{ display: "block", fontSize: 40, fontWeight: 700, color: PARTY.D.color, lineHeight: 1, animation: "countPop 0.4s var(--spring)" }}>{D}</span>
          <span className="mono-label" style={{ margin: "4px 0 0", display: "block" }}>Dem + Ind</span>
        </div>
        <div style={{ textAlign: "center", paddingBottom: 4 }}>
          {U > 0 && <span className="font-mono tnum" style={{ fontSize: 13, color: "var(--text-muted)" }}>{U} undecided</span>}
        </div>
        <div style={{ textAlign: "right" }}>
          <span key={`r${R}`} className="font-mono tnum" style={{ display: "block", fontSize: 40, fontWeight: 700, color: PARTY.R.color, lineHeight: 1, animation: "countPop 0.4s var(--spring)" }}>{R}</span>
          <span className="mono-label" style={{ margin: "4px 0 0", display: "block", textAlign: "right" }}>Republican</span>
        </div>
      </div>

      {/* stacked bar with 51 marker */}
      <div style={{ position: "relative", height: 26, borderRadius: 7, overflow: "hidden", display: "flex", border: "1px solid var(--border)", marginBottom: 6 }}>
        <div style={{ width: `${pct(D)}%`, background: PARTY.D.color, transition: "width 0.4s var(--ease-out)" }} />
        <div style={{ width: `${pct(U)}%`, background: "repeating-linear-gradient(45deg, var(--bg-muted), var(--bg-muted) 6px, var(--border) 6px, var(--border) 12px)", transition: "width 0.4s var(--ease-out)" }} />
        <div style={{ width: `${pct(R)}%`, background: PARTY.R.color, transition: "width 0.4s var(--ease-out)" }} />
        <div style={{ position: "absolute", left: "51%", top: -4, bottom: -4, width: 2, background: "var(--text-primary)" }} />
        <div style={{ position: "absolute", left: "51%", top: -18, transform: "translateX(-50%)", fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, color: "var(--text-primary)" }}>51</div>
      </div>

      {/* verdict */}
      <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "11px 14px", borderRadius: 11, marginTop: 14, marginBottom: 18, background: demWins ? "color-mix(in srgb, var(--grad-3) 12%, transparent)" : "var(--bg-muted)", border: `1px solid ${demWins ? "color-mix(in srgb, var(--grad-3) 45%, transparent)" : "var(--border)"}` }}>
        <span style={{ display: "flex", color: demWins ? "var(--grad-3)" : "var(--text-muted)" }}>{demWins ? Icon.check(16) : Icon.flag(15)}</span>
        <p style={{ fontSize: 13.5, color: "var(--text-primary)", margin: 0, lineHeight: 1.5 }}>
          {demWins
            ? <>In this scenario <strong>Democrats flip the Senate</strong> with {D} seats.</>
            : U === 0
              ? <><strong>Republicans keep control</strong> — Democrats finish {demNeed} short of a majority.</>
              : demNeed <= U
                ? <>Republicans hold for now. Democrats need <strong>{demNeed}</strong> more of the {U} undecided {U === 1 ? "race" : "races"} to reach 51.</>
                : <>Even winning {U === 1 ? "the last undecided race" : `all ${U} undecided races`}, Democrats reach just <strong>{D + U}</strong> — still {demNeed - U} short. To flip the Senate they&apos;d also have to win a Lean R seat (Texas, Alaska, Iowa or Nebraska).</>}
        </p>
      </div>

      {/* race callers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px,1fr))", gap: 8 }}>
        {RACES.map(r => {
          const pick = picks[r.id];
          return (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 8px 7px 11px", borderRadius: 11, border: "1px solid var(--border)", background: "var(--bg)" }}>
              <button onClick={() => onOpen(r)} className="press" title={`Open ${r.state}`} style={{ flex: 1, minWidth: 0, textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 7 }}>
                <span className="font-mono" style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", width: 22 }}>{r.id}</span>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.state}</span>
              </button>
              <div role="group" aria-label={`Call ${r.state}`} style={{ display: "flex", gap: 3, flexShrink: 0 }}>
                {["D", "R"].map(side => {
                  const on = pick === side;
                  return (
                    <button key={side} onClick={() => set(r.id, side)} aria-pressed={on} aria-label={`Call ${r.state} for ${PARTY[side].name}`} className="press"
                      style={{ width: 36, height: 36, borderRadius: 9, border: `1.5px solid ${on ? PARTY[side].color : "var(--border)"}`, background: on ? PARTY[side].color : "transparent", color: on ? "#fff" : "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{side}</button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Home ---------- */
export default function Home() {
  const [dark, setDark] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [result, setResult] = useState(null); // { score, lean }
  const [showResult, setShowResult] = useState(true);
  const [showCard, setShowCard] = useState(false);
  const [openRace, setOpenRace] = useState(null);
  const [picks, setPicks] = useState(() => Object.fromEntries(RACES.map(r => [r.id, defaultPick(r)])));
  const { days } = useCountdown(ELECTION_DAY);

  useEffect(() => { document.documentElement.setAttribute("data-theme", dark ? "dark" : "light"); }, [dark]);

  const cp = result ? closerParty(result.score) : null;

  function completeQuiz({ answers, weights }) {
    const score = scoreQuiz(answers, weights);
    setResult({ score: score ?? 0, lean: leanLabel(score ?? 0) });
    setShowResult(true);
    setShowQuiz(false);
    setTimeout(() => document.getElementById("result-anchor")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  }

  return (
    <div style={{ minHeight: "100vh", position: "relative", zIndex: 1 }}>
      {showQuiz && <QuizModal onComplete={completeQuiz} onClose={() => setShowQuiz(false)} />}
      {showCard && result && <ShareCardModal score={result.score} lean={result.lean} onClose={() => setShowCard(false)} />}
      {openRace && <RaceDetail race={openRace} cp={cp} onClose={() => setOpenRace(null)} />}

      {/* Nav */}
      <nav style={{ borderBottom: "1px solid var(--border)", background: "var(--nav-bg)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", position: "sticky", top: 0, zIndex: 100, padding: "0 clamp(1rem,4vw,2rem)", display: "flex", alignItems: "center", justifyContent: "space-between", height: 62 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ display: "flex", color: "var(--accent)" }}>{Icon.vote(20)}</span>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 23, color: "var(--text-primary)", lineHeight: 1 }}>Voteview</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", background: "var(--bg-muted)", color: "var(--text-muted)", padding: "3px 8px", borderRadius: 6, border: "1px solid var(--border)" }}>Senate &apos;26</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => setShowQuiz(true)} style={{ display: "flex", alignItems: "center", gap: 7, background: "none", border: "1px solid var(--border)", borderRadius: 99, padding: "7px 16px", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", cursor: "pointer" }}>{Icon.vote(14)} {result ? "Retake quiz" : "Find your lean"}</button>
          <button onClick={() => setDark(d => !d)} aria-label={dark ? "Light mode" : "Dark mode"} style={{ display: "flex", alignItems: "center", background: "none", border: "1px solid var(--border)", borderRadius: 99, padding: "8px 12px", color: "var(--text-secondary)", cursor: "pointer" }}>{dark ? Icon.sun(15) : Icon.moon(15)}</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ padding: "clamp(2.5rem,6vw,4.5rem) clamp(1rem,4vw,2rem) 2.5rem", maxWidth: 1080, margin: "0 auto", position: "relative" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 9, fontFamily: "var(--font-mono)", fontSize: 10.5, fontWeight: 500, color: "var(--text-muted)", letterSpacing: "0.14em", textTransform: "uppercase", background: "var(--bg-card)", padding: "7px 16px", borderRadius: 99, marginBottom: "1.6rem", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: PARTY.R.color, boxShadow: `0 0 0 3px ${PARTY.R.color}33` }} />
          {days} days to Election Day · Nov 3, 2026
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "clamp(38px,7vw,64px)", letterSpacing: "-0.01em", lineHeight: 1.04, color: "var(--text-primary)", marginBottom: "1.1rem", maxWidth: 820 }}>
          The 2026 Senate runs through <span className="ink-underline" style={{ fontStyle: "italic", color: "var(--accent)" }}>ten races</span>.
        </h1>
        <p style={{ fontSize: "clamp(15px,2.2vw,18px)", color: "var(--text-secondary)", lineHeight: 1.65, maxWidth: 600, marginBottom: "1.5rem" }}>
          Compare the candidates, find where you lean, and see exactly what&apos;s at stake for control of the Senate — battleground by battleground, in plain language.
        </p>
        <div className="ornament" style={{ maxWidth: 600, marginBottom: "2rem" }}><span className="ornament-mark">❧</span></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))", gap: 16, alignItems: "stretch" }}>
          <SenateControl />
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 18, padding: "1.5rem 1.6rem", display: "flex", flexDirection: "column", justifyContent: "center", boxShadow: "var(--shadow-sm)" }}>
            <p className="mono-label" style={{ margin: "0 0 8px" }}>Not sure where you fit?</p>
            <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 16px" }}>Answer six quick questions to find your lean and see which candidate in each race is closest to you.</p>
            <button onClick={() => setShowQuiz(true)} style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 9, padding: "12px 24px", borderRadius: 12, border: "none", background: "var(--accent)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "var(--shadow-sm)" }}>{Icon.vote(16)} Find your lean</button>
          </div>
        </div>
      </div>

      {/* Board */}
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 clamp(1rem,4vw,2rem) 3rem" }}>
        <div id="result-anchor" />
        {result && showResult && <ResultBanner score={result.score} lean={result.lean} onShare={() => setShowCard(true)} onRetake={() => setShowQuiz(true)} onDismiss={() => setShowResult(false)} />}

        <div style={{ marginBottom: "2rem" }}>
          <SenateScenario picks={picks} setPicks={setPicks} onOpen={setOpenRace} />
        </div>

        <div style={{ marginBottom: "2rem" }}>
          <USMap cp={cp} onOpen={setOpenRace} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8, marginBottom: "1.25rem" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "clamp(26px,4vw,34px)", color: "var(--text-primary)", margin: 0 }}>The battlegrounds</h2>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)" }}>{RACES.length} races · click to compare</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))", gap: 14 }}>
          {RACES.map((r, i) => <RaceCard key={r.id} race={r} cp={cp} onOpen={setOpenRace} index={i} />)}
        </div>

        {/* Footer / methodology */}
        <div style={{ marginTop: "2.5rem", padding: "1.5rem 1.6rem", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 22px", marginBottom: 14 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--text-muted)" }}><span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, color: "var(--grad-3)", background: "color-mix(in srgb, var(--grad-3) 12%, transparent)", padding: "3px 8px", borderRadius: 99, border: "1px solid color-mix(in srgb, var(--grad-3) 45%, transparent)", textTransform: "uppercase" }}>{Icon.shield(10)} Sourced</span> Paraphrases the candidate&apos;s stated record — tap for the source</span>
            <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--text-muted)" }}><span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600, color: "var(--text-muted)", background: "var(--bg-muted)", padding: "3px 8px", borderRadius: 99, border: "1px solid var(--border)", textTransform: "uppercase" }}>{Icon.cpu(10)} Unverified</span> Party-platform baseline — help us source it</span>
          </div>
          <p style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12.5, color: "var(--text-faint)", lineHeight: 1.65, margin: 0 }}>
            <span style={{ flexShrink: 0, marginTop: 2 }}>{Icon.warn(13)}</span>
            Races, candidates and ratings reflect public reporting as of {DATA_AS_OF}; Michigan&apos;s Democratic candidate is decided at its August primary. Where a row has a source tag, it&apos;s that candidate&apos;s own stated position; where it says &ldquo;Unverified,&rdquo; we&apos;re showing the party&apos;s general stance as a placeholder until we confirm theirs. This tool is non-partisan and isn&apos;t tied to any campaign or party. Always double-check with official sources before you vote.
          </p>
        </div>
      </div>
    </div>
  );
}