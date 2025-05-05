let userProgress = {};

async function loadCourses() {
    const res = await fetch("http://localhost:5050/api/Courses");
    const courses = await res.json();
    const container = document.getElementById("coursesContainer");
    container.innerHTML = "";

    courses.forEach(course => {
        const courseDiv = document.createElement("div");
        courseDiv.classList.add("course");
        courseDiv.innerHTML = `
            <h3>${course.title}</h3>
            <p>${course.description}</p>
        `;
        courseDiv.addEventListener("click", () => loadLessons(course.courseID));
        container.appendChild(courseDiv);
    });
}
// Създаване на кастомния курсор
const cursor = document.createElement('div');
cursor.classList.add('cursor');
document.body.appendChild(cursor);

// Функция за преместване на курсора
document.addEventListener('mousemove', (e) => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
});

// Функция за създаване на пръски
document.addEventListener('mousemove', (e) => {
    const splash = document.createElement('div');
    splash.classList.add('cursor-splash');
    document.body.appendChild(splash);

    // Разположение на пръската около курсора
    splash.style.left = `${e.clientX - 5}px`;
    splash.style.top = `${e.clientY - 5}px`;

    // Премахване на пръската след анимацията
    setTimeout(() => {
        splash.remove();
    }, 600);
});


async function loadLessons(courseID) {
    const res = await fetch("http://localhost:5050/api/Lessons");
    const lessons = (await res.json()).filter(l => l.courseID === courseID);
    lessons.sort((a, b) => a.orderNumber - b.orderNumber);

    const container = document.getElementById("coursesContainer");
    container.innerHTML = "";

    lessons.forEach((lesson, index) => {
        const isUnlocked = index === 0 || userProgress[lessons[index - 1].lessonID] === true;

        const lessonDiv = document.createElement("div");
        lessonDiv.classList.add("lesson");
        if (!isUnlocked) {
            lessonDiv.classList.add("locked");
            lessonDiv.innerHTML = `<h4>Урок ${lesson.orderNumber}: ${lesson.title} <span class="lock-icon">🔒</span></h4>`;
        } else {
            lessonDiv.innerHTML = `<h4>Урок ${lesson.orderNumber}: ${lesson.title}</h4>`;
            lessonDiv.addEventListener("click", () => displayLesson(lesson));
        }
        container.appendChild(lessonDiv);
    });
}

function displayLesson(lesson) {
    document.getElementById("lessonTitle").textContent = lesson.title;
    document.getElementById("lessonContent").textContent = lesson.content;
    document.getElementById("quizSection").classList.remove("hidden");

    document.getElementById("startQuizBtn").onclick = () => loadQuizForLesson(lesson.lessonID);
    document.getElementById("quizContent").innerHTML = "";
}

async function loadQuizForLesson(lessonID) {
    const quizzes = await (await fetch("http://localhost:5050/api/Quizzes")).json();
    const quiz = quizzes.find(q => q.lessonID === lessonID);

    if (!quiz) {
        document.getElementById("quizContent").innerHTML = "<p>Няма наличен тест за този урок.</p>";
        return;
    }

    const questions = await (await fetch("http://localhost:5050/api/Questions")).json();
    const quizQuestions = questions.filter(q => q.quizID === quiz.quizID);

    const quizDiv = document.getElementById("quizContent");
    quizDiv.innerHTML = "";

    quizQuestions.forEach((q, i) => {
        const questionEl = document.createElement("div");
        questionEl.classList.add("question-block");

        if (q.questionText.toLowerCase().includes("променлива")) {
            questionEl.innerHTML = `
                <p><strong>Въпрос ${i + 1}:</strong> ${q.questionText}</p>
                <label><input type="radio" name="q${q.questionID}" value="Променлива е място в паметта, където се съхраняват стойности."> Променлива е място в паметта, където се съхраняват стойности.</label><br>
                <label><input type="radio" name="q${q.questionID}" value="Променлива е CSS клас."> Променлива е CSS клас.</label><br>
                <label><input type="radio" name="q${q.questionID}" value="Променлива е команда за компилация."> Променлива е команда за компилация.</label>
            `;
        } else {
            questionEl.innerHTML = `
                <p><strong>Въпрос ${i + 1}:</strong> ${q.questionText}</p>
                <input type="text" id="answer-${q.questionID}" placeholder="Вашият отговор">
            `;
        }

        quizDiv.appendChild(questionEl);
    });

    const submitBtn = document.createElement("button");
    submitBtn.textContent = "Предай отговорите";
    submitBtn.onclick = async () => {
        let allCorrect = true;

        for (const q of quizQuestions) {
            let userAnswer = "";

            if (q.questionText.toLowerCase().includes("променлива")) {
                const selected = document.querySelector(`input[name="q${q.questionID}"]:checked`);
                if (!selected) {
                    allCorrect = false;
                    continue;
                }
                userAnswer = selected.value.trim();
                if (userAnswer !== "Променлива е място в паметта, където се съхраняват стойности.") {
                    allCorrect = false;
                }
            } else {
                const input = document.getElementById(`answer-${q.questionID}`);
                if (!input || input.value.trim() === "") {
                    allCorrect = false;
                    continue;
                }
                userAnswer = input.value.trim().toLowerCase();
                // Добави конкретна проверка по въпрос
                if (q.questionText.toLowerCase().includes("параграф") && userAnswer !== "<p>") {
                    allCorrect = false;
                }
            }
        }

        if (allCorrect) {
            alert("Тестът е успешно преминат!");
            userProgress[lessonID] = true;

            // Отключване на следващия урок
            const lessonsRes = await fetch("http://localhost:5050/api/Lessons");
            const allLessons = (await lessonsRes.json()).filter(l => l.courseID); // добави courseID, ако имаш го глобално
            const currentLesson = allLessons.find(l => l.lessonID === lessonID);
            const nextLesson = allLessons.find(l => l.orderNumber === currentLesson.orderNumber + 1 && l.courseID === currentLesson.courseID);

            if (nextLesson) {
                userProgress[nextLesson.lessonID] = false; // подготвяме го отключен
            }

            loadLessons(currentLesson.courseID);
        } else {
            alert("Има грешки. Моля, опитайте отново.");
        }
    };

    quizDiv.appendChild(submitBtn);
}



window.addEventListener("DOMContentLoaded", loadCourses);
