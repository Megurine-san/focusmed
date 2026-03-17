let currentChapterData = null;

/* ===================== */
/* ===== MODE ENTRY ===== */
/* ===================== */

function enterDeepMode() {
    document.getElementById("home").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
    renderCourses();
}

function enterArenaMode() {
    document.getElementById("home").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");

    document.body.style.background =
        "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.85)), url('arena.png') center/cover no-repeat fixed";

    renderArena();
}

/* ===================== */
/* ===== COURSES ===== */
/* ===================== */

function renderCourses() {

    const app = document.getElementById("app");

    app.innerHTML = `
        <button class="back-btn" onclick="goHome()">← Volver</button>
        <h1 class="main-title">Deep Mode</h1>
        <div class="grid" id="course-grid"></div>
    `;

    const grid = document.getElementById("course-grid");

    const icons = {
        Fisiopatologia: "🧬",
        Semiologia: "🩺",
        Anatomia: "🦴",
        Embriologia: "👶",
        Farmacologia: "💊",
        Fisiologia: "⚡",
        Microbiologia: "🦠",
        Patologia: "🔬"
    };

    Object.keys(database || {}).forEach(course => {

        const card = document.createElement("div");
        card.className = "glass-card";

        card.innerHTML = `
            <div class="emoji">${icons[course] || "📘"}</div>
            <div class="card-title">${course}</div>
        `;

        card.onclick = () => renderBooks(course);

        grid.appendChild(card);

    });
}

/* ===================== */
/* ===== BOOKS ===== */
/* ===================== */

function renderBooks(course) {

    const app = document.getElementById("app");

    app.innerHTML = `
        <button class="back-btn" onclick="renderCourses()">← Volver</button>
        <h1 class="main-title">${course}</h1>
        <div class="grid" id="book-grid"></div>
    `;

    const grid = document.getElementById("book-grid");

    Object.keys(database[course]).forEach(book => {

        const card = document.createElement("div");
        card.className = "glass-card";

        card.innerHTML = `
            <div class="emoji">📚</div>
            <div class="card-title">${book}</div>
        `;

        card.onclick = () => renderChapters(course, book);

        grid.appendChild(card);

    });
}

/* ===================== */
/* ===== CHAPTERS ===== */
/* ===================== */

function renderChapters(course, book) {

    const app = document.getElementById("app");
    const chapters = database[course][book];

    app.innerHTML = `
        <button class="back-btn" onclick="renderBooks('${course}')">← Volver</button>
        <h1 class="main-title">${book}</h1>
        <div class="grid" id="chapter-grid"></div>
    `;

    const grid = document.getElementById("chapter-grid");

    Object.keys(chapters).forEach(item => {

        const card = document.createElement("div");
        card.className = "glass-card";

        // normalize text to detect "Parte"
        const normalized = item.trim().toLowerCase();
        const isPart = normalized.startsWith("parte");

        card.innerHTML = `
            <div class="emoji">${isPart ? "📂" : "📖"}</div>
            <div class="card-title">${item}</div>
        `;

        if (isPart) {
            card.onclick = () => renderParts(course, book, item);
        } else {
            card.onclick = () => renderContent(course, book, item);
        }

        grid.appendChild(card);

    });

}
/* ===================== */
/* ===== PARTS ===== */
/* ===================== */

function renderParts(course, book, chapter) {

    const app = document.getElementById("app");

    const parts = database[course][book][chapter];

    app.innerHTML = `
        <button class="back-btn" onclick="renderChapters('${course}','${book}')">← Volver</button>
        <h1 class="main-title">${chapter}</h1>
        <div class="grid" id="parts-grid"></div>
    `;

    const grid = document.getElementById("parts-grid");

    Object.keys(parts).forEach(part => {

        const card = document.createElement("div");
        card.className = "glass-card";

        card.innerHTML = `
            <div class="emoji">📖</div>
            <div class="card-title">${part}</div>
        `;

        card.onclick = () => renderPartContent(course, book, chapter, part);

        grid.appendChild(card);

    });

}
/* ===================== */
/* ===== PART CONTENT ===== */
/* ===================== */

function renderPartContent(course, book, chapter, part) {

    const app = document.getElementById("app");

    const data = database[course][book][chapter][part];

    currentChapterData = data;

    app.innerHTML = `
        <button class="back-btn" onclick="renderParts('${course}','${book}','${chapter}')">← Volver</button>
        <h1 class="main-title">${chapter} - ${part}</h1>
        <div id="chapter-content" class="chapter-layout"></div>
    `;

    const container = document.getElementById("chapter-content");

    renderObject(data, container);

}

/* ===================== */
/* ===== CONTENT ===== */
/* ===================== */

function renderContent(course, book, chapter) {

    const app = document.getElementById("app");

    const data = database[course][book][chapter];

    currentChapterData = data;

    app.innerHTML = `
        <button class="back-btn" onclick="renderChapters('${course}','${book}')">← Volver</button>
        <h1 class="main-title">${chapter}</h1>
        <div id="chapter-content" class="chapter-layout"></div>
    `;

    const container = document.getElementById("chapter-content");

    renderObject(data, container);

}

/* ===================== */
/* ===== RENDER OBJECT ===== */
/* ===================== */

function renderObject(obj, parent) {

    Object.entries(obj).forEach(([key, value]) => {

        if (key === "arenaSeeds") return;

        const block = document.createElement("div");
        block.className = "accordion-item";

        const title = document.createElement("div");
        title.className = "accordion-title";
        title.textContent = formatTitle(key);

        const content = document.createElement("div");
        content.className = "accordion-content";

        title.onclick = () => {
            block.classList.toggle("active");
        };

        if (Array.isArray(value) && typeof value[0] === "string") {

            value.forEach(item => {

                const p = document.createElement("p");
                p.textContent = item;

                content.appendChild(p);

            });

        }

        else if (typeof value === "object") {

            if (value.title) {

                const h3 = document.createElement("h3");
                h3.textContent = value.title;

                content.appendChild(h3);

            }

            if (value.text) {

                value.text.forEach(paragraph => {

                    const p = document.createElement("p");
                    p.textContent = paragraph;

                    content.appendChild(p);

                });

            }

            if (value.lists) {

                const ul = document.createElement("ul");

                value.lists.forEach(item => {

                    const li = document.createElement("li");
                    li.textContent = item;

                    ul.appendChild(li);

                });

                content.appendChild(ul);

            }

            Object.entries(value).forEach(([subKey, subValue]) => {

                if (
                    subKey === "title" ||
                    subKey === "text" ||
                    subKey === "lists"
                ) return;

                if (typeof subValue === "object") {
                    renderObject({ [subKey]: subValue }, content);
                }

            });

        }

        block.appendChild(title);
        block.appendChild(content);

        parent.appendChild(block);

    });

}

/* ===================== */
/* ===== HELPERS ===== */
/* ===================== */

function formatTitle(str) {

    if (!str) return "";

    return str
        .replace(/([A-Z])/g, " $1")
        .replace(/_/g, " ")
        .replace(/^./, s => s.toUpperCase());

}

function goHome() {

    document.getElementById("app").classList.add("hidden");
    document.getElementById("home").classList.remove("hidden");

}

/* ===================== */
/* ===== ARENA MODE ENGINE ===== */
/* ===================== */

let arenaChapter = null;
let arenaQuestions = [];
let arenaBook = null;
let currentArenaIndex = 0;
let arenaCourse = null;
let arenaDifficulty = null;
let failedQuestions = [];

/* ===================== */
/* COURSE SELECTION */
/* ===================== */

function renderArena() {

    const app = document.getElementById("app");

    let courseCards = "";

    Object.keys(database).forEach(course => {

        courseCards += `
            <div class="glass-card" onclick="selectArenaCourse('${course}')">
                <div class="emoji">📚</div>
                <div class="card-title">${course}</div>
            </div>
        `;

    });

    courseCards += `
        <div class="glass-card" onclick="selectArenaCourse('ALL')">
            <div class="emoji">🔥</div>
            <div class="card-title">Hard Mode (All Courses)</div>
        </div>
    `;

    app.innerHTML = `
        <button class="back-btn" onclick="goHome()">← Volver</button>
        <h1 class="main-title">Arena Mode</h1>
        <div class="grid">${courseCards}</div>
    `;

}
function selectArenaCourse(course) {

    arenaCourse = course;

    const app = document.getElementById("app");

    if (course === "ALL") {
        selectArenaDifficulty();
        return;
    }

    let booksHTML = "";

    Object.keys(database[course]).forEach(book => {

        booksHTML += `
            <div class="glass-card" onclick="selectArenaBook('${book}')">
                <div class="emoji">📚</div>
                <div class="card-title">${book}</div>
            </div>
        `;

    });

    app.innerHTML = `
        <button class="back-btn" onclick="renderArena()">← Volver</button>
        <h1 class="main-title">${course}</h1>
        <div class="grid">${booksHTML}</div>
    `;

}
function selectArenaBook(book) {

    const app = document.getElementById("app");

    let chapterHTML = "";

    Object.keys(database[arenaCourse][book]).forEach(chapter => {

        chapterHTML += `
            <div class="glass-card" onclick="selectArenaChapter('${book}','${chapter}')">
                <div class="emoji">📖</div>
                <div class="card-title">${chapter}</div>
            </div>
        `;

    });

    app.innerHTML = `
        <button class="back-btn" onclick="selectArenaCourse('${arenaCourse}')">← Volver</button>
        <h1 class="main-title">${book}</h1>
        <div class="grid">${chapterHTML}</div>
    `;

}
function selectArenaChapter(book, chapter) {

    arenaChapter = chapter;
    arenaBook = book;

    selectArenaDifficulty();

}
/* ===================== */
/* DIFFICULTY SELECTION */
/* ===================== */

function selectArenaDifficulty() {

    const app = document.getElementById("app");

    app.innerHTML = `
        <button class="back-btn" onclick="renderArena()">← Volver</button>

        <h1 class="main-title">Select Difficulty</h1>

        <div class="grid">

            <div class="glass-card" onclick="startArena('easy')">
                <div class="emoji">🟢</div>
                <div class="card-title">Easy</div>
            </div>

            <div class="glass-card" onclick="startArena('medium')">
                <div class="emoji">🟡</div>
                <div class="card-title">Medium</div>
            </div>

            <div class="glass-card" onclick="startArena('hard')">
                <div class="emoji">🔴</div>
                <div class="card-title">Hard</div>
            </div>

        </div>
    `;

}/* ===================== */
/* COLLECT QUESTIONS */
/* ===================== */

function collectArenaSeeds() {

    arenaQuestions = [];

    function scan(obj, courseName) {

        if (!obj || typeof obj !== "object") return;

        if (obj.arenaSeeds) {

            obj.arenaSeeds.forEach(seed => {

               if (typeof seed === "string") {

    arenaQuestions.push({
        type: "open",
        difficulty: "hard",
        question: seed,
        explanation: "",
        course: courseName
    });

    arenaQuestions.push({
    type: "mcq",
    difficulty: "easy",
    question: seed,
    options: generarOpcionesMCQ(seed),
    correct: 0,
    explanation: generarExplicacion(seed),
    course: courseName
});

}

                else {

                    arenaQuestions.push({
    type: "open",
    difficulty: "hard",
    question: seed,
    explanation: "",
    course: courseName
});

arenaQuestions.push({
    type: "mcq",
    difficulty: "easy",
    question: seed,
    options: [
        "Correct statement about this concept",
        "Incorrect interpretation",
        "Opposite of the concept",
        "Unrelated clinical idea"
    ],
    correct: 0,
    explanation: "",
    course: courseName
});

                }

            });

        }

        Object.values(obj).forEach(v => scan(v, courseName));

    }

    if (arenaCourse === "ALL") {

        Object.keys(database).forEach(course => {
            scan(database[course], course);
        });

    } else {

        scan(database[arenaCourse][arenaBook][arenaChapter], arenaCourse);

    }

}

/* ===================== */
/* START ARENA */
/* ===================== */

function startArena(difficulty) {

    arenaDifficulty = difficulty;

    collectArenaSeeds();

    arenaQuestions = arenaQuestions.filter(q => {

    if (difficulty === "easy") {
        return q.type === "mcq";
    }

    if (difficulty === "medium") {
        return q.type === "open";
    }

    if (difficulty === "hard") {
        return q.type === "open";
    }

});

    shuffle(arenaQuestions);

    currentArenaIndex = 0;

    showArenaQuestion();

}

/* ===================== */
/* SHOW QUESTION */
/* ===================== */

function showArenaQuestion() {

    const q = arenaQuestions[currentArenaIndex];

    const app = document.getElementById("app");

    if (!q) {

        app.innerHTML = `
            <button class="back-btn" onclick="selectArenaChapter(arenaBook, arenaChapter)">← Volver</button>
            <h1 class="main-title">No questions available</h1>
        `;

        return;

    }

    if (q.type === "mcq") {

        let optionsHTML = "";

        q.options.forEach((opt, i) => {

            optionsHTML += `
                <button class="arena-option" onclick="checkAnswer(${i})">
                    ${opt}
                </button>
            `;

        });

        app.innerHTML = `
            <button class="back-btn" onclick="selectArenaChapter(arenaBook, arenaChapter)">← Volver</button>

            <h1 class="main-title">Arena Mode</h1>

            <div class="concept-block">

                <h2>${q.question}</h2>

                <div class="arena-options">
                    ${optionsHTML}
                </div>

                <div id="arena-feedback"></div>

            </div>
        `;

    }

    else {

        app.innerHTML = `
            <button class="back-btn" onclick="selectArenaChapter(arenaBook, arenaChapter)">← Volver</button>

            <h1 class="main-title">Arena Mode</h1>

            <div class="concept-block">

                <h2>${q.question}</h2>

                <div style="margin-top:40px; text-align:center;">

                    <button class="arena-btn" onclick="showExplanation()">
                        Show Explanation
                    </button>

                    <button class="arena-btn" onclick="nextArenaQuestion()">
                        Next Question
                    </button>

                </div>

                <div id="arena-feedback"></div>

            </div>
        `;

    }

}

/* ===================== */
/* CHECK ANSWER */
/* ===================== */

function checkAnswer(i) {

    const q = arenaQuestions[currentArenaIndex];

    const feedback = document.getElementById("arena-feedback");

    if (i === q.correct) {

        feedback.innerHTML = `
<p style="color:red;">Incorrecto</p>

<div style="margin-top:15px;">
${q.explanation}
</div>

<button class="arena-btn" onclick="showExplanation()">
Ver explicación completa
</button>

<button class="arena-btn" onclick="nextArenaQuestion()">
Siguiente
</button>
`;

    }

    else {

    failedQuestions.push(q);

    feedback.innerHTML = `
        <p style="color:red;">Incorrect</p>
        <p>${q.explanation || "Review the concept shown below."}</p>
        <button class="arena-btn" onclick="nextArenaQuestion()">Next</button>
    `;

}

}

/* ===================== */
/* SHOW EXPLANATION */
/* ===================== */

function showExplanation() {

    const q = arenaQuestions[currentArenaIndex];
    const feedback = document.getElementById("arena-feedback");
    const chapterContent = database[arenaCourse][arenaBook][arenaChapter];

    let paragraphs = [];

    function collectText(obj) {
        if (!obj || typeof obj !== "object") return;

        if (obj.text && Array.isArray(obj.text)) {
            paragraphs = paragraphs.concat(obj.text);
        }

        Object.values(obj).forEach(v => collectText(v));
    }

    collectText(chapterContent);

    const questionText = q.question.toLowerCase().replace(/[.,:;¿?¡!()]/g, " ");
    const questionWords = questionText
        .split(/\s+/)
        .filter(word =>
            word.length > 3 &&
            ![
                "explique", "analice", "compare", "describa", "mencione",
                "diferencias", "conceptuales", "significado", "impacto",
                "como", "para", "entre", "sobre", "porque", "cual"
            ].includes(word)
        );

    let ranked = paragraphs.map(p => {
        const text = p.toLowerCase();
        let score = 0;

        questionWords.forEach(word => {
            if (text.includes(word)) score += 2;
        });

        if (questionText.includes("primaria") && text.includes("primaria")) score += 4;
        if (questionText.includes("secundaria") && text.includes("secundaria")) score += 4;
        if (questionText.includes("terciaria") && text.includes("terciaria")) score += 4;
        if (questionText.includes("cuaternaria") && text.includes("cuaternaria")) score += 4;

        if (questionText.includes("maslow") && text.includes("maslow")) score += 6;
        if (questionText.includes("cif") && text.includes("cif")) score += 6;
        if (questionText.includes("calidad de vida") && text.includes("calidad de vida")) score += 6;
        if (questionText.includes("prevalencia") && text.includes("prevalencia")) score += 6;
        if (questionText.includes("falsos positivos") && text.includes("falsos positivos")) score += 6;

        return { text: p, score };
    });

    ranked = ranked
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score);

    const isComparisonQuestion =
        questionText.includes("entre") ||
        questionText.includes("diferencias") ||
        questionText.includes("compare") ||
        questionText.includes("tipos") ||
        questionText.includes("niveles") ||
        questionText.includes("primaria") ||
        questionText.includes("secundaria") ||
        questionText.includes("terciaria") ||
        questionText.includes("cuaternaria");

    let selectedParagraphs = [];

    if (isComparisonQuestion) {
        selectedParagraphs = ranked.slice(0, 8).map(item => item.text);
    } else {
        selectedParagraphs = ranked.slice(0, 5).map(item => item.text);
    }

    // Eliminar duplicados
    selectedParagraphs = [...new Set(selectedParagraphs)];

    let explanationText = "";

    if (selectedParagraphs.length > 0) {
        explanationText = selectedParagraphs.join("<br><br>");
    } else if (q.explanation) {
        explanationText = q.explanation;
    } else {
        explanationText = "No se encontró una explicación suficientemente relacionada en este capítulo.";
    }

    feedback.innerHTML = `
        <div style="margin-top:20px;padding:20px;background:rgba(255,255,255,0.08);border-radius:12px;">
            <strong>Concept explanation:</strong><br><br>
            ${explanationText}
        </div>
    `;
}

/* ===================== */
/* NEXT QUESTION */
/* ===================== */

function nextArenaQuestion() {

    currentArenaIndex++;

    if (currentArenaIndex >= arenaQuestions.length) {

        if (failedQuestions.length > 0) {

            arenaQuestions = arenaQuestions.concat(failedQuestions);
            failedQuestions = [];
            shuffle(arenaQuestions);
            currentArenaIndex = 0;

        } else {

            currentArenaIndex = 0;

        }

    }

    showArenaQuestion();

}
/* ===================== */
/* SHUFFLE */
/* ===================== */

function shuffle(array) {

    for (let i = array.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [array[i], array[j]] = [array[j], array[i]];

    }

}
function generarOpcionesMCQ(pregunta) {

    const palabras = pregunta
        .toLowerCase()
        .replace(/[.,:;¿?¡!]/g, "")
        .split(" ")
        .filter(p => p.length > 4);

    const concepto = palabras.slice(-2).join(" ");

    const correcta = `Porque ${concepto} influye directamente en la comprensión del proceso de salud y enfermedad.`;

    const distractores = [
        `Porque ${concepto} solo describe procesos biológicos aislados.`,
        `Porque ${concepto} reemplaza completamente el juicio clínico.`,
        `Porque ${concepto} elimina la necesidad de evaluación médica integral.`
    ];

    return shuffleArray([correcta, ...distractores]);
}

function generarExplicacion(pregunta) {

    return "La opción correcta representa la interpretación adecuada del concepto evaluado en la pregunta. Revise el capítulo correspondiente en Deep Mode para reforzar la comprensión completa.";

}

function shuffleArray(array) {

    const arr = [...array];

    for (let i = arr.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [arr[i], arr[j]] = [arr[j], arr[i]];

    }

    return arr;

}
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js")
    .then(() => console.log("Service Worker registered"));
}