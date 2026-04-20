# ⬡ Nuera EcoTracker — AI Sustainability Auditor

> **Live Demo:** https://sharathstash21-design.github.io/Nuera-EcoTracker/  
>
> *(Replace with your final deployed URL if needed)*

---

## 1. Chosen Vertical

**Sustainability / Green Technology**

Nuera EcoTracker addresses a critical gap in the market: small businesses and digital agencies lack accessible tools to measure and improve their environmental impact.

While large enterprises rely on dedicated ESG teams, smaller organizations struggle with:
- Tracking e-waste  
- Monitoring energy consumption  
- Understanding carbon footprint  

This tool provides **AI-powered, real-time ESG insights** to help businesses take actionable steps toward sustainability.

---

## 2. Approach and Logic

**Core Flow: Audit → Analyze → Action**
User selects Industry + Audit Depth
↓
Gemini API generates sustainability-focused audit questions
↓
User inputs current business practices
↓
Gemini API evaluates responses using ESG logic (JSON output)
↓
App displays Eco Score + Insights + Improvements
↓
Data synced to Google Sheets (NUERA OS)


### Why Gemini API in Code:

- `generateQuestions()`  
  Uses structured prompts for E-waste, Energy, and Carbon metrics  

- `scoreAnswer()`  
  Converts qualitative answers into:
  - Eco Scores  
  - Structured JSON feedback  
  - Actionable improvements  

---

## 3. How the Solution Works

### User Flow

1. **Audit Setup**  
   Select industry + audit depth (3 / 5 / 7)

2. **Secure API Key**  
   Stored in `sessionStorage` (never hardcoded)

3. **Dynamic Questions**  
   AI generates industry-specific audit questions  

4. **Real-Time Evaluation**  
   Instant scoring + feedback per answer  

5. **Visual Feedback**  
   Cyberpunk-Green UI with score indicators  

6. **Final Report**  
   Sustainability score + insights  

7. **Data Storage**  
   Synced to Google Sheets  

---

### Key Technical Decisions

- Modular Audit Engine  
- Demo Mode (`isDemo`) without API  
- Pure JavaScript (no frameworks)  

---

## 4. Google Services Used

| Service | Usage |
|--------|------|
| Gemini API (`gemini-2.0-flash`) | Question generation + scoring |
| Google Sheets API | Store audit results |

### API Endpoints

- `POST /v1beta/models/gemini-2.0-flash:generateContent`  
- `POST /v4/spreadsheets/{id}/values/...:append`  

---

## 5. Assumptions

- Data is user-provided  
- Uses general ESG standards  
- Internet required  
- Session-based storage  
- Modern browser needed  

---

## 6. Project Structure
Nuera-EcoTracker/
├── index.html
├── style.css
├── app.js
├── config.js
├── test.js
└── README.md


---

## 7. Running Locally

```bash
git clone https://github.com/sharathstash21-design/Nuera-EcoTracker.git
cd Nuera-EcoTracker

open index.html

8. Accessibility & Performance
Accessibility
High contrast UI (WCAG 2.1)
Semantic HTML
aria-live support
Performance
< 100KB bundle
No dependencies
Fast loading
9. Score Booster Checklist
 Sustainability-focused innovation
 Secure API handling
 Google Sheets integration
 Unique UI design
 Scalable architecture

🔥 Built for Google GenAI Exchange Hackathon
