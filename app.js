/**
 * InterviewForge AI / Nuera EcoTracker — Main Application
 * Uses: Gemini API (question generation + scoring) + Google Sheets API (result saving)
 */

// ─── State ────────────────────────────────────────────────
const state = {
  apiKey: "",
  role: "",
  experience: "mid",
  numQuestions: 5,
  language: "English",
  questions: [],
  currentIndex: 0,
  answers: [],
  scores: [],       // ✅ Fixed: removed duplicate key
  feedbacks: [],
  isDemo: false,
};

// ─── DOM helpers ──────────────────────────────────────────
const $ = (id) => document.getElementById(id);
const show = (el) => el.classList.add("active");
const hide = (el) => el.classList.remove("active");

// ─── API Key management ───────────────────────────────────
function getApiKey() {
  let key = sessionStorage.getItem("if_gemini_key") || CONFIG.GEMINI_API_KEY;
  if (!key) {
    key = prompt(
      "Enter your Gemini API key to use live AI\n(OR leave blank to use Demo Mode with mock data):"
    );
    if (key && key.trim()) {
      sessionStorage.setItem("if_gemini_key", key.trim());
    }
  }
  return key ? key.trim() : "demo";
}

// ─── Gemini API call ──────────────────────────────────────
async function callGemini(prompt) {
  const key = state.apiKey;
  const url = `${CONFIG.GEMINI_ENDPOINT}${CONFIG.GEMINI_MODEL}:generateContent?key=${key}`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 1024,
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error?.message || `Gemini error ${res.status}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

// ─── Generate Questions ───────────────────────────────────
async function generateQuestions() {
  if (state.isDemo) {
    // ✅ Fixed: mock data is now correctly inside this function
    const mockQuestions = [
      "How does your agency handle electronic waste (e-waste) disposal?",
      "What strategies do you use to reduce server-side energy consumption?",
      "How do you track the carbon footprint of your digital marketing campaigns?",
      "Describe your approach to sustainable procurement for office supplies.",
      "What KPIs do you use to measure your agency's environmental impact?",
      "How do you communicate sustainability initiatives to clients?",
      "What renewable energy options have you explored for your office?",
    ];
    return new Promise((resolve) =>
      setTimeout(() => resolve(mockQuestions.slice(0, state.numQuestions)), 1200)
    );
  }

  const prompt = `You are an expert interviewer specializing in sustainability and green business practices.
Generate exactly ${state.numQuestions} interview questions for a ${state.experience}-level "${state.role}" candidate.
Focus on: carbon footprint tracking, e-waste, green procurement, renewable energy, and ESG reporting.
Language: ${state.language}.
Return ONLY a JSON array of strings. No preamble, no markdown, no extra text.
Example: ["Question 1?", "Question 2?"]`;

  const text = await callGemini(prompt);
  const clean = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(clean);
  return Array.isArray(parsed) ? parsed : [];
}

// ─── Score Answer ─────────────────────────────────────────
async function scoreAnswer(question, answer) {
  if (state.isDemo) {
    // ✅ Fixed: mock feedback is now correctly inside this function
    return new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            score: answer.length > 30 ? 90 : 50,
            strengths:
              "Great focus on energy reduction and hardware lifecycle management.",
            improvements:
              "Consider adding specific metrics for carbon offsetting and third-party audits.",
            sample:
              "An ideal policy includes using green hosting providers, a mandatory recycling program for all office electronics, and annual third-party sustainability audits.",
          }),
        2000
      )
    );
  }

  const prompt = `You are a sustainability auditor evaluating an interview answer.
Question: "${question}"
Candidate's Answer: "${answer}"

Evaluate the answer and return ONLY a JSON object with these exact keys:
- score (integer 0–100)
- strengths (string: 1–2 sentences on what was good)
- improvements (string: 1–2 sentences on what could be better)
- sample (string: 2–3 sentence model answer)

No preamble, no markdown, no extra text. Just the JSON object.`;

  const text = await callGemini(prompt);
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// ─── Screen transitions ────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => {
    s.classList.remove("active");
  });
  $(id).classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ─── START INTERVIEW ───────────────────────────────────────
async function startInterview() {
  const role = $("job-role").value.trim();
  if (!role) {
    $("job-role").focus();
    $("job-role").style.borderColor = "#f87171";
    setTimeout(() => ($("job-role").style.borderColor = ""), 2000);
    return;
  }

  const key = getApiKey();
  state.isDemo = key === "demo";
  state.apiKey = state.isDemo ? "demo_key" : key;

  state.role = role;
  state.experience = $("experience").value;
  state.numQuestions = parseInt($("num-questions").value);
  state.language = $("language").value;
  state.questions = [];
  state.currentIndex = 0;
  state.answers = [];
  state.scores = [];
  state.feedbacks = [];

  const btn = $("btn-start");
  btn.disabled = true;
  btn.querySelector(".btn-text").textContent = "Generating questions…";

  try {
    state.questions = await generateQuestions();
    if (!state.questions.length) throw new Error("No questions returned");

    showScreen("screen-interview");
    renderQuestion(0);
  } catch (e) {
    alert(
      "Error generating questions: " +
        e.message +
        "\n\nCheck your API key and try again."
    );
    btn.disabled = false;
    btn.querySelector(".btn-text").textContent = "Start Interview";
  }
}

// ─── Render question ───────────────────────────────────────
function renderQuestion(index) {
  const total = state.questions.length;

  $("progress-label").textContent = `Question ${index + 1} of ${total}`;
  $("role-label-interview").textContent = state.role;
  $("progress-fill").style.width = `${((index + 1) / total) * 100}%`;
  $("progress-fill")
    .closest("[role=progressbar]")
    .setAttribute("aria-valuenow", index + 1);
  $("progress-fill")
    .closest("[role=progressbar]")
    .setAttribute("aria-valuemax", total);

  $("q-number").textContent = String(index + 1).padStart(2, "0");
  $("q-text").textContent = state.questions[index];
  $("q-text").classList.add("fade-up");
  setTimeout(() => $("q-text").classList.remove("fade-up"), 500);

  $("user-answer").value = "";
  $("char-count").textContent = "0 characters";
  $("btn-submit-answer").disabled = false;
  $("btn-submit-answer").querySelector(".btn-text").textContent = "Submit Answer";

  // Hide feedback panel
  $("feedback-panel").classList.remove("visible");
  $("feedback-content").classList.remove("visible");
  $("feedback-loading").classList.remove("visible");
}

// Character counter
document.addEventListener("DOMContentLoaded", () => {
  $("user-answer")?.addEventListener("input", () => {
    const len = $("user-answer").value.length;
    $("char-count").textContent = `${len} character${len !== 1 ? "s" : ""}`;
  });
});

// ─── SUBMIT ANSWER ─────────────────────────────────────────
async function submitAnswer() {
  const answer = $("user-answer").value.trim();
  const question = state.questions[state.currentIndex];

  $("btn-submit-answer").disabled = true;
  $("btn-submit-answer").querySelector(".btn-text").textContent = "Scoring…";

  // Show feedback panel in loading state
  $("feedback-panel").classList.add("visible");
  $("feedback-loading").classList.add("visible");
  $("feedback-content").classList.remove("visible");

  try {
    const result = await scoreAnswer(question, answer);
    state.answers[state.currentIndex] = answer;
    state.scores[state.currentIndex] = result.score;
    state.feedbacks[state.currentIndex] = result;

    renderFeedback(result);
  } catch (e) {
    $("feedback-loading").classList.remove("visible");
    $("feedback-loading").textContent =
      "Error scoring answer. Please try again.";
    $("btn-submit-answer").disabled = false;
    $("btn-submit-answer").querySelector(".btn-text").textContent =
      "Submit Answer";
  }
}

// ─── Render feedback ───────────────────────────────────────
function renderFeedback(result) {
  $("feedback-loading").classList.remove("visible");
  $("feedback-content").classList.add("visible");

  // Score ring animation
  const score = result.score;
  const circumference = 201; // 2 * π * 32
  const offset = circumference - (score / 100) * circumference;
  $("ring-fill").style.strokeDashoffset = offset;
  $("score-value").textContent = score;

  // Colour ring by score
  const ringColor =
    score >= 70
      ? "var(--green)"
      : score >= 40
      ? "var(--amber)"
      : "var(--red)";
  $("ring-fill").style.stroke = ringColor;
  $("score-value").style.color = ringColor;

  $("fb-strengths").textContent = result.strengths;
  $("fb-improvements").textContent = result.improvements;
  $("fb-sample").textContent = result.sample;
}

// ─── NEXT QUESTION ─────────────────────────────────────────
function nextQuestion() {
  const next = state.currentIndex + 1;
  if (next >= state.questions.length) {
    showResults();
  } else {
    state.currentIndex = next;
    renderQuestion(next);
  }
}

// ─── SHOW RESULTS ──────────────────────────────────────────
function showResults() {
  showScreen("screen-results");

  const avg = Math.round(
    state.scores.reduce((a, b) => a + (b || 0), 0) / state.scores.length
  );
  $("overall-score").textContent = avg;
  $("overall-grade").textContent = gradeLabel(avg);
  $("results-sub").textContent = `${state.role} · ${state.questions.length} questions`;

  // Breakdown
  const breakdown = $("results-breakdown");
  breakdown.innerHTML = "";
  state.questions.forEach((q, i) => {
    const s = state.scores[i] ?? 0;
    const cls = s >= 70 ? "score-high" : s >= 40 ? "score-mid" : "score-low";
    const item = document.createElement("div");
    item.className = "breakdown-item fade-up";
    item.style.animationDelay = `${i * 0.07}s`;
    item.innerHTML = `
      <span class="bi-qnum">Q${i + 1}</span>
      <span class="bi-question" title="${q}">${q}</span>
      <span class="bi-score ${cls}">${s}</span>
    `;
    breakdown.appendChild(item);
  });
}

function gradeLabel(score) {
  if (score >= 85) return "🏆 Excellent — You're interview-ready!";
  if (score >= 70) return "👍 Good — A few more practice rounds and you're set";
  if (score >= 50) return "📈 Developing — Keep practising, you're improving";
  return "💪 Needs work — Review fundamentals and try again";
}

// ─── SAVE TO GOOGLE SHEETS ─────────────────────────────────
async function saveToSheets() {
  const btn = $("btn-sheets");
  const status = $("sheets-status");

  btn.disabled = true;
  btn.querySelector(".btn-text").textContent = "Saving to Database…";

  try {
    const rows = state.questions.map((q, i) => [
      new Date().toLocaleString(),
      state.role,
      state.experience,
      `Q${i + 1}`,
      q,
      state.answers[i] || "N/A",
      state.scores[i] ?? 0,
      state.feedbacks[i]?.strengths || "",
    ]);

    const url =
      "https://script.google.com/macros/s/AKfycbzwZx6u9WjGq-Ep4NggZGpaVA6vzEJlwxs8XWpv_Gaa5d5LzCi3NMICSXVNEqtOEn9HjQ/exec";

    await fetch(url, {
      method: "POST",
      mode: "no-cors",
      cache: "no-cache",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ values: rows }),
    });

    status.textContent = "✓ Interview results synced to NUERA Database!";
    status.style.color = "var(--success)";
  } catch (error) {
    console.error("Save Error:", error);
    status.textContent = "Error saving. Downloading CSV as fallback...";
    exportCSV();
  } finally {
    btn.disabled = false;
    btn.querySelector(".btn-text").textContent = "Save to Google Sheets";
  }
}

// ─── CSV fallback export ───────────────────────────────────
function exportCSV() {
  const header = [
    "Date",
    "Role",
    "Level",
    "Q#",
    "Question",
    "Answer",
    "Score",
    "Strengths",
    "Improvements",
  ];
  const rows = state.questions.map((q, i) => [
    new Date().toISOString(),
    state.role,
    state.experience,
    `Q${i + 1}`,
    `"${q.replace(/"/g, '""')}"`,
    `"${(state.answers[i] || "").replace(/"/g, '""')}"`,
    state.scores[i] ?? 0,
    `"${(state.feedbacks[i]?.strengths || "").replace(/"/g, '""')}"`,
    `"${(state.feedbacks[i]?.improvements || "").replace(/"/g, '""')}"`,
  ]);

  const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `interview-results-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  $("sheets-status").textContent = "✓ Results downloaded as CSV";
}

// ─── RESET ────────────────────────────────────────────────
function resetInterview() {
  state.questions = [];
  state.currentIndex = 0;
  state.answers = [];
  state.scores = [];
  state.feedbacks = [];
  $("job-role").value = "";
  showScreen("screen-setup");
  $("btn-start").disabled = false;
  $("btn-start").querySelector(".btn-text").textContent = "Start Interview";
}
