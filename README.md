# 🗳️ Voteview — Global Election Comparator

A web app that lets voters compare political party positions side-by-side, across issues, in plain language, extracted from official party platforms using AI.

Built as a tool for informed democratic participation — neutral, non-partisan, and open.

**Live demo:** [voteview.vercel.app](https://voteview.vercel.app)

---

## What it does

- **Political quiz** — answer 6 issue-based questions and get matched to the party closest to your views
- **Party comparison table** — compare all parties across 6 key issues at a glance
- **Issue deep-dive** — click any issue to see every party's position as a focused card view
- **Political spectrum bar** — see where each party sits on the left-right spectrum
- **Party leader cards** — who leads each party and what they stand for
- **Geopolitical context** — why each election matters in world politics
- **Dark mode** — because of course
- **More countries coming** — built to scale globally

---

## Current coverage

| Country | Election | Status |
|---|---|---|
| 🇸🇪 Sweden | September 2026 | ✅ Available |
| 🇧🇷 Brazil | October 2026 | 🚧 Coming soon |
| 🇮🇱 Israel | October 2026 | 🚧 Coming soon |
| 🇺🇸 United States | November 2026 | 🚧 Coming soon |
| 🇳🇬 Nigeria | January 2027 | 🚧 Coming soon |
| 🇫🇷 France | April 2027 | 🚧 Coming soon |

---

## How it works

### Data pipeline (Python)

Party platform text is fed into Claude (Anthropic's AI) via a structured extraction prompt. For each party and issue, Claude returns:

- A neutral 1-2 sentence position summary
- 3 key policies extracted from the platform
- A supporting quote from the source text

The output is saved as a JSON file served statically by the frontend.

```
Party platform text
       ↓
   Claude API (structured prompt)
       ↓
   JSON: { party: { issue: { summary, policies, quote } } }
       ↓
   Frontend comparison table
```

### Frontend (Next.js)

A single-page Next.js app that reads the extracted JSON and renders:
- A landing page with country/year selectors
- A political quiz modal on first visit
- A comparison view with table, filters, spectrum bar and leader cards

---

## Tech stack

| Layer | Tool |
|---|---|
| LLM extraction | Anthropic Claude API (claude-sonnet-4-6) |
| Data pipeline | Python 3.12 |
| Frontend | Next.js 14, React |
| Styling | Inline styles with CSS variables |
| Hosting | Vercel |

---

## Project structure

```
election-comparator/          # Python data pipeline
├── extract_positions.py      # Main extraction script (Sweden)
├── extract_france.py         # France extraction script
├── data/
│   ├── extracted_positions.json          # Sweden party data
│   └── extracted_positions_france.json   # France party data
└── .env                      # API keys (not committed)

election-comparator-ui/       # Next.js frontend
├── app/
│   ├── page.js               # Main app — all components
│   └── globals.css           # CSS variables, base styles
└── public/
    └── extracted_positions.json   # Party data served statically
```

---

## Adding a new country

1. **Create an extraction script** — copy `extract_positions.py`, add platform text for each party, run it to generate a JSON file
2. **Copy the JSON** to `election-comparator-ui/public/`
3. **Update `page.js`** in three places:
   - Add the country to `COUNTRIES` with `status: "available"` and a `parties` array
   - Add each party to `PARTIES` with color, leader info and bio
   - Add match rules to `PARTY_MATCH_RULES` across 6 dimensions
4. **Update `handleLoad`** to map the country to its JSON file

---

## Running locally

**Data pipeline:**
```bash
cd election-comparator
python3 -m venv venv
source venv/bin/activate
pip install requests python-dotenv anthropic
# add your ANTHROPIC_API_KEY to .env
python3 extract_positions.py
```

**Frontend:**
```bash
cd election-comparator-ui
npm install
npm run dev
# open localhost:3000
```

---

## Disclaimer

Party positions are AI-generated summaries extracted from official platform text for informational purposes only. Political spectrum positions are approximate. Always verify with official party sources before making voting decisions.

---

## Author

Built by Rishabh Thakkar as a project combining AI, international affairs, and civic technology.
