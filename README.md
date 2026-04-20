# ⬡ Nuera EcoTracker AI — Sustainability Auditor

> **Live Demo:** https://sharathstash21-design.github.io/Nuera-EcoTracker/  

**Nuera EcoTracker AI** is an intelligent, dynamic sustainability tool designed to help businesses, particularly small and mid-sized enterprises (SMEs), track, audit, and improve their environmental impact. Built with an immersive glassmorphic UI, it bridges the gap between complex ESG compliance frameworks and actionable, easy-to-understand AI-driven insights.

---

## 1. Chosen Vertical

**Sustainability / Environmental Science**

While large enterprise organizations often rely on dedicated Environmental, Social, and Governance (ESG) teams, digital agencies and small businesses struggle with accessible monitoring tools. They lack visibility into:
- Proper management and disposal of e-waste.
- Optimization of server-side data loads and corporate energy consumption.
- Quantitative carbon footprint tracking and green procurement strategies.

Nuera EcoTracker operates natively as a **Lead Sustainability Auditor** using Prompt Engineering contextualized strictly around sustainability principles, offering a real-world entry point to ecological responsibility.

---

## 2. Approach and Logic

Our logic relies heavily on **Persona Injection** and **Contextual Steering** within the Gemini AI framework. Rather than acting as a standard conversational chatbot, EcoTracker processes company variables to dynamically construct a personalized compliance audit.

**Core Workflow (The Audit → Analyze → Action Pipeline):**
1. **Context Initialization**: The user declares their *Industry Sector* (e.g., "Web Design Agency") and *Company Size* (e.g., "SME (11-50)").
2. **Contextual Steering**: Gemini AI translates the sector into specific ecological concerns (e.g., hardware lifecycle policies for Web Agencies).
3. **Audit Generation**: The system procedurally generates a customized set of audit questions tailored specifically to the company's size and industry. 
4. **Structured JSON Output & Evaluation**: The AI explicitly filters answers into isolated constraints—outputting only strict JSON formatted with quantifiable eco-scores, strengths, actionable improvements, and best practices.
5. **Score Calculation**: A composite ESG rating is generated, mapped, and visualized.

---

## 3. How the Solution Works

### The User Journey
1. **Audit Setup**: Users specify their active industrial sector, corporate footprint, and preferred language, establishing baseline heuristics.
2. **Dynamic Queries**: The core JS engine dispatches a call to Gemini to return a customized array of compliance questions in real-time.
3. **Response & Iteration**: For each prompt, the company inputs its ongoing policies. Gemini analyzes the qualitative answer to output a quantitative subset of data.
4. **Visual Progression & Feedback**: Utilizing a pure-CSS, cyberpunk-green thematic UI, an interactive ring chart logs real-time scores alongside categorized feedback.
5. **Database Syncing**: Upon completion, the tool compiles all Q&As, scores, and feedback strings, pushing them non-blockingly via HTTP to a cloud-based Google Sheets backend.

---

## 4. Evaluation Focus Areas

### ⚙️ Google Services Integration
- **Gemini 2.0 Flash (`gemini-2.0-flash`)**: Serves as the primary logic and data structuring engine. Used for both generative questioning and deterministic, JSON-bound response scoring.
- **Google Sheets API / Apps Script**: Used as a scalable, fast, real-time logging backend to persist user scores and progress without requiring dedicated NoSQL architectural overhead. 

### 🛡️ Security Implementation
- **Client-Side Storage**: To prevent API leakage, the application does not hardcode private keys. Keys are requested at runtime and securely stored inside `sessionStorage` (which strictly clears upon tab closure). 

### 🚀 Efficiency & Code Quality
- **Zero Dependencies Framework**: The application resolves at less than `100KB` by rejecting bulky libraries (no React, no Node `modules`). 
- **Modular JavaScript**: The internal JS cleanly separates concerns across specific functional states (API Handlers, DOM Manipulators, Prompt State, UI Renderers).
- **Asynchronous Execution**: Strict integration of ES8 `async/await` features guarantees smooth API communications without blocking the main browser thread. 

### ♿ Accessibility & UI/UX
- **Usable Design**: Implements deep WCAG compliant markup including standard `aria-labels`, `aria-live` politeness checks, and structured keyboard-accessible semantic HTML (`<main>`, `<header>`). All focus states and form targets have strong contrast definitions.

### 🧪 Testing
- The architecture features a native **Demo Mode/Mock Toggle** built seamlessly into the client. By bypassing the live Gemini endpoint, reviewers and testers can debug animations and evaluate the entire UI state progression instantly without utilizing billing-scale API limits. 

---

## 5. Assumptions Made
- **Client-Side Operation**: We assumed a purely front-end client combined with Apps Script is most optimal for maximum portability without requiring backend containerization.
- **Modern Browser Engine**: The interactive cursor tracking, CSS variables (`var(--accent)`), and `backdrop-filter: blur(24px)` glassmorphism assumes the client runs on a modern WebKit or Chromium-based framework.
- **User Cooperation**: The auditor relies on honest inputs from candidates to give applicable sustainability recommendations. 

---

### Running the App Locally

To clone the repository and launch the application directly:

```bash
git clone https://github.com/sharathstash21-design/Nuera-EcoTracker.git
cd Nuera-EcoTracker
start index.html
```
