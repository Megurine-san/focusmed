let currentChapterData = null;
let failedQuestions = [];

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

    if (course === "questions") return;

    const card = document.createElement("div");

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

    Object.keys(database.questions[course] || {}).forEach(book => {

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
    const chapters = database.questions[course][book];

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

    const chapterData = database[course][book][chapter];

    // 🔥 KEY FIX
    const parts = chapterData.core || chapterData;

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

    const chapterData = database[course][book][chapter];
    const parts = chapterData.core || chapterData;

    const data = parts[part];

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
        title.textContent = value.title || formatTitle(key);

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

            // ✅ Support content (string)
if (value.content) {

    const p = document.createElement("p");
    p.textContent = value.content;

    content.appendChild(p);
}

// ✅ Support text array
if (value.text) {

    value.text.forEach(paragraph => {

        const p = document.createElement("p");
        p.textContent = paragraph;

        content.appendChild(p);

    });
}

// ✅ Support sections (your new structure)
if (value.sections) {

    value.sections.forEach(section => {

        if (section.subtitle) {
            const h4 = document.createElement("h4");
            h4.textContent = section.subtitle;
            h4.style.marginTop = "10px";
            content.appendChild(h4);
        }

        const p = document.createElement("p");
        p.textContent = section.text;

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
/* ===== ARENA MODE (MCQ ONLY — FINAL) ===== */
/* ===================== */

let arenaChapter = null;
let arenaQuestions = [];
let arenaBook = null;
let currentArenaIndex = 0;
let arenaCourse = null;
let arenaPart = null;

/* ===================== */
/* COURSE SELECTION */
/* ===================== */

function renderArena() {

    const app = document.getElementById("app");

    let html = "";

    Object.keys(database).forEach(course => {

        if (course === "questions") return;

        html += `
            <div class="glass-card" onclick="selectArenaCourse('${course}')">
                <div class="emoji">📚</div>
                <div class="card-title">${course}</div>
            </div>
        `;
    });

    app.innerHTML = `
        <button class="back-btn" onclick="goHome()">← Volver</button>
        <h1 class="main-title">Arena Mode</h1>
        <div class="grid">${html}</div>
    `;
}

/* ===================== */
/* COURSE → BOOK */
/* ===================== */

function selectArenaCourse(course) {

    arenaCourse = course;

    const app = document.getElementById("app");

    let html = "";

    Object.keys(database.questions[course] || {}).forEach(book => {

        html += `
            <div class="glass-card" onclick="selectArenaBook('${book}')">
                <div class="emoji">📚</div>
                <div class="card-title">${book}</div>
            </div>
        `;
    });

    app.innerHTML = `
        <button class="back-btn" onclick="renderArena()">← Volver</button>
        <h1 class="main-title">${course}</h1>
        <div class="grid">${html}</div>
    `;
}
function goBackArena() {

    // From question → back to chapter list
    if (arenaChapter !== null) {
        selectArenaPart(arenaBook, arenaPart);
        arenaChapter = null;
        return;
    }

    // From chapter list → back to parts
    if (arenaPart !== null) {
        selectArenaBook(arenaBook);
        return;
    }

    // From parts → back to books
    if (arenaBook !== null) {
        selectArenaCourse(arenaCourse);
        return;
    }

    // From books → back to Arena home
    renderArena();
}
/* ===================== */
/* BOOK → PART */
/* ===================== */

function selectArenaBook(book) {

    arenaBook = book;
    arenaPart = null;

    const app = document.getElementById("app");
   const data = database.questions[arenaCourse][book];

    let html = "";

    Object.keys(data).forEach(item => {

        html += `
            <div class="glass-card" onclick="selectArenaPart('${book}','${item}')">
                <div class="emoji">📂</div>
                <div class="card-title">${item}</div>
            </div>
        `;
    });

    app.innerHTML = `
        <button class="back-btn" onclick="selectArenaCourse('${arenaCourse}')">← Volver</button>
        <h1 class="main-title">${book}</h1>
        <div class="grid">${html}</div>
    `;
}

/* ===================== */
/* PART → CHAPTER */
/* ===================== */

function selectArenaPart(book, part) {

    arenaPart = part;

    const app = document.getElementById("app");
    const data = database.questions[arenaCourse][book][part];

    let html = "";

    Object.keys(data).forEach(chapter => {

        html += `
            <div class="glass-card" onclick="selectArenaChapter('${book}','${part}','${chapter}')">
                <div class="emoji">📖</div>
                <div class="card-title">${chapter}</div>
            </div>
        `;
    });

    app.innerHTML = `
        <button class="back-btn" onclick="selectArenaBook('${book}')">← Volver</button>
        <h1 class="main-title">${part}</h1>
        <div class="grid">${html}</div>
    `;

}
function selectArenaChapter(book, part, chapter) {

    arenaBook = book;
    arenaPart = part;
    arenaChapter = chapter;

    startArena();
}

/* ===================== */
/* START ARENA */
/* ===================== */

function startArena() {

    failedQuestions = []; // 🔥 reset every session

    arenaQuestions = collectArenaQuestions();

    if (arenaQuestions.length === 0) {
        showArenaQuestion();
        return;
    }

    shuffle(arenaQuestions);

    currentArenaIndex = 0;

    showArenaQuestion();
}

/* ===================== */
/* COLLECT MCQ ONLY */
/* ===================== */

function normalize(str) {
    return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/–/g, "-")
        .replace(/\s+/g, " ")
        .trim();
}

function findKey(obj, target) {
    if (!obj || !target) return null;

    const normTarget = normalize(target);

    let bestMatch = null;

    Object.keys(obj).forEach(k => {
        const normKey = normalize(k);

        if (
            normKey.includes(normTarget) ||
            normTarget.includes(normKey)
        ) {
            bestMatch = k;
        }
    });

    return bestMatch;
}

function collectArenaQuestions() {

    let questions = [];
console.log("Course:", arenaCourse);
console.log("Book:", arenaBook);
console.log("Part:", arenaPart);
console.log("Chapter:", arenaChapter);
    let courseQ = database.questions && findKey(database.questions, arenaCourse)
    ? database.questions[findKey(database.questions, arenaCourse)]
    : null;
    let bookQ = courseQ && courseQ[findKey(courseQ, arenaBook)];
    let partQ = bookQ && bookQ[findKey(bookQ, arenaPart)];
    let chapterQ = null;

if (partQ) {
    const key = findKey(partQ, arenaChapter);

    console.log("Matched chapter key:", key);

    if (key) {
        chapterQ = partQ[key];
    } else {
        console.log("⚠️ No match found. Available keys:");
        console.log(Object.keys(partQ));
    }
}

    if (!chapterQ || !chapterQ.core) {
        console.log("❌ Still no MCQs:", chapterQ);
        return [];
    }

    Object.entries(chapterQ.core).forEach(([key, arr]) => {

        if (!Array.isArray(arr)) return;

        arr.forEach(item => {

            if (item.question && item.options) {

                questions.push({
    question: item.question,
    options: item.options,

    // ✅ support BOTH formats
    correct: item.correct !== undefined ? item.correct : item.answer,

    correctFeedback: item.correctFeedback || item.explanation || "",
incorrectFeedback: item.incorrectFeedback || item.explanation || ""
});

            }

        });

    });

    console.log("✅ MCQs loaded:", questions.length);

    return questions;
}


/* ===================== */
/* SHOW QUESTION */
/* ===================== */

function showArenaQuestion() {

    const q = arenaQuestions[currentArenaIndex];
    const app = document.getElementById("app");

    if (!q) {
    app.innerHTML = `
        <button class="back-btn" onclick="goBackArena()">← Volver</button>
        <h1 class="main-title">No MCQs available</h1>
    `;
    return;
}

    let options = "";

    q.options.forEach((opt, i) => {

        options += `
            <button class="arena-option" onclick="checkAnswer(${i})">
                ${opt}
            </button>
        `;
    });

    app.innerHTML = `
    <button class="back-btn" onclick="goBackArena()">← Volver</button>

    <h1 class="main-title">Arena Mode</h1>

    <div class="arena-container">

        <div class="arena-question">
            ${q.question}
        </div>

        <div class="arena-options">
            ${options}
        </div>

        <div id="arena-feedback"></div>

    </div>
`;
}

/* ===================== */
/* CHECK ANSWER */
/* ===================== */

function checkAnswer(i) {

    const q = arenaQuestions[currentArenaIndex];
    const feedback = document.getElementById("arena-feedback");

    const isCorrect = i === q.correct;

    if (!isCorrect) {
        failedQuestions.push(q);
    }

    feedback.innerHTML = `
    <p style="font-weight:600; color:${isCorrect ? "#14b8a6" : "#ef4444"};">
        ${isCorrect ? "Correcto" : "Incorrecto"}
    </p>

    <div style="margin-top:15px; padding:15px; background:rgba(255,255,255,0.08); border-radius:10px;">
        <strong>Explicación:</strong><br><br>
        ${q.correctFeedback}

        ${!isCorrect ? `
        <br><br>
        <strong>Tu error:</strong> elegiste "${q.options[i]}"
        ` : ""}

        <br><br>
        <strong>Respuesta correcta:</strong> ${q.options[q.correct]}
    </div>

    <button class="arena-btn" onclick="nextArenaQuestion()">Siguiente</button>
`;
const buttons = document.querySelectorAll(".arena-option");

buttons.forEach((btn, index) => {
    if (index === q.correct) {
        btn.classList.add("correct");
    } else if (index === i) {
        btn.classList.add("incorrect");
    }
    btn.disabled = true;
});
}

/* ===================== */
/* NEXT */
/* ===================== */

function nextArenaQuestion() {

    // 🎯 20% chance to repeat a failed question
    if (failedQuestions.length > 0 && Math.random() < 0.2) {

        const randomIndex = Math.floor(Math.random() * failedQuestions.length);

        arenaQuestions.splice(currentArenaIndex + 3, 0, failedQuestions[randomIndex]);
    }

    currentArenaIndex++;

    if (currentArenaIndex >= arenaQuestions.length) {
        currentArenaIndex = 0;
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
