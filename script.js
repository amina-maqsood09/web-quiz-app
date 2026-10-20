// ---------- Question bank (15 questions, 10 are picked at random) ----------
const bank = [
  { q: "Which HTML tag is used for the largest heading?", options: ["<h6>", "<h1>", "<head>", "<title>"], answer: 1 },
  { q: "Which CSS property changes the text colour?", options: ["font-style", "text-color", "color", "background"], answer: 2 },
  { q: "Which keyword creates a variable that can be changed in JavaScript?", options: ["let", "const", "static", "fixed"], answer: 0 },
  { q: "Which Bootstrap class makes a responsive container?", options: [".box", ".container", ".wrapper", ".page"], answer: 1 },
  { q: "What does CSS stand for?", options: ["Creative Style Sheets", "Computer Style Sheets", "Cascading Style Sheets", "Colorful Style Sheets"], answer: 2 },
  { q: "Which method selects an element by its id in JavaScript?", options: ["getElementById()", "querySelectorAll()", "getElementsByTag()", "selectId()"], answer: 0 },
  { q: "Which HTML tag is used to add a hyperlink?", options: ["<link>", "<a>", "<href>", "<url>"], answer: 1 },
  { q: "Which CSS layout system arranges items in rows and columns?", options: ["float", "position", "display: grid", "visibility"], answer: 2 },
  { q: "Which symbol is used for an id selector in CSS?", options: [".", "#", "*", "&"], answer: 1 },
  { q: "Which event runs when a user clicks a button?", options: ["onhover", "onload", "onchange", "onclick"], answer: 3 },
  { q: "Which HTML tag is used to show an image?", options: ["<img>", "<picture>", "<image>", "<src>"], answer: 0 },
  { q: "Which CSS property adds space outside an element?", options: ["padding", "margin", "border", "spacing"], answer: 1 },
  { q: "Which Bootstrap class creates a blue primary button?", options: [".btn-blue", ".button-primary", ".btn btn-primary", ".primary"], answer: 2 },
  { q: "Which JavaScript method adds an item to the end of an array?", options: ["push()", "pop()", "shift()", "add()"], answer: 0 },
  { q: "Which HTML attribute makes a text box show a hint inside it?", options: ["hint", "placeholder", "value", "label"], answer: 1 }
];

const TOTAL_QUESTIONS = 10;
const TIME_PER_QUESTION = 20;

// ---------- Page elements ----------
const $ = (id) => document.getElementById(id);
const startScreen = $("startScreen"), quizScreen = $("quizScreen"), resultScreen = $("resultScreen");

// ---------- State ----------
let questions = [], current = 0, score = 0, timeLeft = TIME_PER_QUESTION, timerId = null;
let results = [];       // stores what happened in each question
let playerName = "";

// Shuffle helper (Fisher-Yates)
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function show(screen) {
  [startScreen, quizScreen, resultScreen].forEach((s) => s.classList.add("d-none"));
  screen.classList.remove("d-none");
}

// ---------- Start / restart ----------
function startQuiz() {
  playerName = $("nameInput").value.trim() || "Student";
  // pick 5 random questions and shuffle their options too
  questions = shuffle(bank).slice(0, TOTAL_QUESTIONS).map((item) => {
    const correctText = item.options[item.answer];
    const opts = shuffle(item.options);
    return { q: item.q, options: opts, answer: opts.indexOf(correctText) };
  });
  current = 0; score = 0; results = [];
  buildSegBar();
  show(quizScreen);
  loadQuestion();
}

function buildSegBar() {
  $("segBar").innerHTML = questions.map(() => '<div class="seg"></div>').join("");
}

function updateSeg(index, status) {
  const segs = document.querySelectorAll(".seg");
  segs.forEach((s) => s.classList.remove("current"));
  if (status) segs[index].classList.add(status);
  else segs[index].classList.add("current");
}

// ---------- Show a question ----------
function loadQuestion() {
  const item = questions[current];
  $("qCount").textContent = `Question ${current + 1} of ${questions.length}`;
  $("qText").textContent = item.q;
  $("nextBtn").classList.add("d-none");
  updateSeg(current, null);

  $("options").innerHTML = "";
  item.options.forEach((text, i) => {
    const btn = document.createElement("button");
    btn.className = "opt";
    btn.textContent = text;
    btn.addEventListener("click", () => checkAnswer(i));
    $("options").appendChild(btn);
  });

  startTimer();
}

// ---------- Countdown timer ----------
function startTimer() {
  clearInterval(timerId);
  timeLeft = TIME_PER_QUESTION;
  renderTimer();
  timerId = setInterval(() => {
    timeLeft--;
    renderTimer();
    if (timeLeft <= 0) {
      clearInterval(timerId);
      checkAnswer(-1); // -1 means time ran out
    }
  }, 1000);
}

function renderTimer() {
  const t = $("timer");
  t.textContent = timeLeft + "s";
  t.classList.toggle("low", timeLeft <= 5);
}

// ---------- Check the answer ----------
function checkAnswer(chosen) {
  clearInterval(timerId);
  const item = questions[current];
  const buttons = document.querySelectorAll(".opt");
  const isCorrect = chosen === item.answer;

  buttons.forEach((b, i) => {
    b.disabled = true;
    if (i === item.answer) b.classList.add("correct");
    else if (i === chosen) b.classList.add("wrong");
  });

  if (isCorrect) score++;
  updateSeg(current, isCorrect ? "correct" : "wrong");

  results.push({
    q: item.q,
    yourAnswer: chosen === -1 ? "No answer (time up)" : item.options[chosen],
    correctAnswer: item.options[item.answer],
    isCorrect
  });

  const nextBtn = $("nextBtn");
  nextBtn.textContent = current === questions.length - 1 ? "See results" : "Next question";
  nextBtn.classList.remove("d-none");
}

function nextQuestion() {
  current++;
  if (current < questions.length) loadQuestion();
  else showResult();
}

// ---------- Result screen ----------
function showResult() {
  show(resultScreen);
  $("scoreText").textContent = `${score} / ${questions.length}`;
  const pct = (score / questions.length) * 100;
  $("msgText").textContent =
    pct === 100 ? "Perfect score. Great work!" :
      pct >= 60 ? "Good job. Keep practising." :
        "Keep learning. You can do better next time.";

  $("review").innerHTML = results.map((r, i) => `
    <div class="review-item ${r.isCorrect ? "ok" : "bad"}">
      <div class="fw-semibold">${i + 1}. ${r.q}</div>
      <small>Your answer: ${r.yourAnswer}</small><br>
      <small>Correct answer: ${r.correctAnswer}</small>
    </div>`).join("");
}

// ---------- Download PDF (jsPDF) ----------
function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 20;

  doc.setFontSize(18);
  doc.text("Web Tech Quiz - Result", 14, y); y += 10;
  doc.setFontSize(12);
  doc.text(`Name: ${playerName}`, 14, y); y += 7;
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, y); y += 7;
  doc.text(`Score: ${score} / ${questions.length}`, 14, y); y += 12;

  results.forEach((r, i) => {
    const lines = doc.splitTextToSize(`${i + 1}. ${r.q}`, 180);
    if (y + lines.length * 6 + 18 > 280) { doc.addPage(); y = 20; }
    doc.setFont(undefined, "bold");
    doc.text(lines, 14, y); y += lines.length * 6;
    doc.setFont(undefined, "normal");
    doc.text(`Your answer: ${r.yourAnswer}`, 18, y); y += 6;
    doc.text(`Correct answer: ${r.correctAnswer}`, 18, y); y += 6;
    doc.text(r.isCorrect ? "Result: Correct" : "Result: Wrong", 18, y); y += 10;
  });

  doc.save("quiz-result.pdf");
}

// ---------- Dark / light mode ----------
function setTheme(theme) {
  document.documentElement.setAttribute("data-bs-theme", theme);
  $("themeBtn").textContent = theme === "dark" ? "Light mode" : "Dark mode";
  try { localStorage.setItem("quizTheme", theme); } catch (e) { }
}
$("themeBtn").addEventListener("click", () => {
  const now = document.documentElement.getAttribute("data-bs-theme");
  setTheme(now === "dark" ? "light" : "dark");
});
try { setTheme(localStorage.getItem("quizTheme") || "light"); } catch (e) { setTheme("light"); }

// ---------- Button events ----------
$("startBtn").addEventListener("click", startQuiz);
$("nextBtn").addEventListener("click", nextQuestion);
$("pdfBtn").addEventListener("click", downloadPDF);
$("restartBtn").addEventListener("click", () => show(startScreen));