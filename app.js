/**
 * InterviewForge AI — Main Application
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
  scores: [],
  scores: [],
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
async function callGemini(prompt, streaming = false) {
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

// ─── Generate all questions upfront ───────────────────────
async function generateQuestions() {
  if (state.isDemo) {
    const mockQuestions = [
      "Can you explain the difference between REST and GraphQL with a real-world example?",
      "What approaches do you take for state management in large frontend applications?",
      "Describe a difficult technical bug you solved recently and your debugging process.",
      "How do you optimize a web application for maximum performance and fast load times?",
      "Explain the concept of Closure in JavaScript and provide a common use-case.",
      "How do you approach ensuring your web application is fully accessible (WCAG compliant)?",
      "Explain the Virtual DOM and how it improves application performance."
    ];
    return new Promise((resolve) => setTimeout(() => resolve(mockQuestions.slice(0, state.numQuestions)), 1500));
  }

  const prompt = `You are an expert technical interviewer.
Generate exactly ${state.numQuestions} interview questions for a ${state.experience}-level ${state.role} position.
Language: ${state.language}.

Rules:
- Mix of technical, behavioural, and situational questions
- Each question on its own line, numbered 1. 2. 3. etc.
- No additional commentary, just the numbered questions
- Keep each question under 30 words
- Make them realistic and challenging`;

  const raw = await callGemini(prompt);
  // Parse numbered lines
  const lines = raw
    .split("\n")
    .map((l) => l.replace(/^\d+[\.\)]\s*/, "").trim())
    .filter((l) => l.length > 10);
  return lines.slice(0, state.numQuestions);
}

// ─── Score a single answer ─────────────────────────────────
async function scoreAnswer(question, answer) {
  if (state.isDemo) {
    return new Promise((resolve) => setTimeout(() => resolve({
      score: answer.length > 30 ? 85 : 45,
      strengths: "You provided a straight-forward answer touching on the basic concepts.",
      improvements: "Try to add more technical depth and specific examples from your past projects.",
      sample: "A comprehensive answer would start with the definition, followed by trade-offs, and conclude with a specific real-world example."
    }), 2000));
  }

  const prompt = `You are a strict but fair technical interviewer evaluating a candidate's answer.

Role: ${state.role} (${state.experience} level)
Question: "${question}"
Candidate's Answer: "${answer || "(no answer provided)"}"

Evaluate and respond ONLY in this exact JSON format (no markdown, no extra text):
{
  "score": <integer 0-100>,
  "strengths": "<1-2 sentences about what was good>",
  "improvements": "<1-2 sentences on what to improve>",
  "sample": "<2-3 sentence ideal answer>"
}`;

  const raw = await callGemini(prompt);
  try {
    const clean = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    // Fallback parse
    const scoreMatch = raw.match(/"score"\s*:\s*(\d+)/);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 50;
    return {
      score,
      strengths: "You provided a response to the question.",
      improvements: "Try to be more specific with examples from your experience.",
      sample: "A strong answer would include concrete examples, specific technologies, and measurable outcomes.",
    };
  }
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
  state.isDemo = (key === "demo");
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
    alert("Error generating questions: " + e.message + "\n\nCheck your API key and try again.");
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
  $("progress-fill").closest("[role=progressbar]").setAttribute("aria-valuenow", index + 1);
  $("progress-fill").closest("[role=progressbar]").setAttribute("aria-valuemax", total);

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
    $("feedback-loading").textContent = "Error scoring answer. Please try again.";
    $("btn-submit-answer").disabled = false;
    $("btn-submit-answer").querySelector(".btn-text").textContent = "Submit Answer";
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
  const ringColor = score >= 70 ? "var(--green)" : score >= 40 ? "var(--amber)" : "var(--red)";
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

  const avg = Math.round(state.scores.reduce((a, b) => a + (b || 0), 0) / state.scores.length);
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
    // Preparing the rows for the Apps Script
    const rows = state.questions.map((q, i) => [
      new Date().toLocaleString(),
      state.role,
      state.experience,
      `Q${i + 1}`,
      q,
      state.answers[i] || "N/A",
      state.scores[i] ?? 0,
      state.feedbacks[i]?.strengths || ""
    ]);

    // Your exact Apps Script URL
    const url = "https://script.google.com/macros/s/AKfycbzwZx6u9WjGq-Ep4NggZGpaVA6vzEJlwxs8XWpv_Gaa5d5LzCi3NMICSXVNEqtOEn9HjQ/exec";

    // Sending data via POST to your script
    const res = await fetch(url, {
      method: "POST",
      mode: "no-cors", // This is required for Apps Script Web Apps
      cache: "no-cache",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ values: rows }),
    });

    // Since "no-cors" doesn't give a response body, we assume success if no error is thrown
    status.textContent = "✓ Interview results synced to NUERA Database!";
    status.style.color = "var(--green)";
    
  } catch (error) {
    console.error("Save Error:", error);
    status.textContent = "Error saving. Downloading CSV as fallback...";
    exportCSV(); // Fallback to CSV if the script fails
  } finally {
    btn.disabled = false;
    btn.querySelector(".btn-text").textContent = "Save to Google Sheets";
  }
}

// ─── CSV fallback export ───────────────────────────────────
function exportCSV() {
  const header = ["Date", "Role", "Level", "Q#", "Question", "Answer", "Score", "Strengths", "Improvements"];
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
  a.href = url; a.download = `interview-results-${Date.now()}.csv`;
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
