import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Receives a structured correction report for a party position.
// In development it appends to .data/corrections.jsonl so you can review
// submissions locally. In production (serverless / read-only FS) it logs to
// the server console — swap this for your store of choice (a database, an
// email/webhook, or a GitHub issue) before launch.
export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const { country, party, issue, problem, correction, source, email } = body || {};
  if (!party || !issue || !problem) {
    return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 422 });
  }

  const record = {
    id: `corr_${Date.now().toString(36)}`,
    receivedAt: new Date().toISOString(),
    country: country || null,
    party,
    issue,
    problem: String(problem).slice(0, 4000),
    correction: correction ? String(correction).slice(0, 4000) : null,
    source: source ? String(source).slice(0, 2000) : null,
    email: email ? String(email).slice(0, 320) : null,
  };

  try {
    const dir = path.join(process.cwd(), ".data");
    fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(path.join(dir, "corrections.jsonl"), JSON.stringify(record) + "\n");
  } catch {
    // Read-only FS (e.g. serverless): fall back to logging.
    console.log("[correction]", JSON.stringify(record));
  }

  return NextResponse.json({ ok: true, id: record.id });
}