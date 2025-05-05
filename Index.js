// Toast съобщение
function showToast(message, isSuccess = true) {
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.className = `toast ${isSuccess ? 'success' : 'error'}`;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("show");
    }, 100); // малко забавяне за анимация

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 500); // изтриване
    }, 3000); // показва се за 3 секунди
}

// Валидация на email (основна)
function isValidEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
}

// Регистрация
document.getElementById("registrationForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    if (!isValidEmail(email)) {
        showToast("Моля, въведи валиден имейл.", false);
        return;
    }

    if (password.length < 6) {
        showToast("Паролата трябва да е поне 6 символа.", false);
        return;
    }

    const newUser = {
        username,
        email,
        passwordHash: password,
        role,
        createdAt: new Date().toISOString()
    };

    try {
        const response = await fetch("http://localhost:5050/api/Users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newUser)
        });

        const data = await response.json();

        if (response.ok) {
            showToast("Регистрацията беше успешна!");
            document.getElementById("registrationForm").reset();
        } else {
            showToast(data.message || "Неуспешна регистрация.", false);
        }
    } catch (error) {
        console.error("Грешка при заявката:", error);
        showToast("Грешка при връзка със сървъра.", false);
    }
});

// Вход
document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!isValidEmail(email)) {
        showToast("Моля, въведи валиден имейл.", false);
        return;
    }

    const credentials = {
        email,
        password
    };

    try {
        const response = await fetch("http://localhost:5050/api/Users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(credentials)
        });

        const data = await response.json();

        if (response.ok) {
            showToast("Успешен вход!");
            document.getElementById("loginForm").reset();
            setTimeout(() => {
                window.location.href = 'HomePage.html';
            }, 1500);
        } else {
            showToast(data.message || "Грешен имейл или парола.", false);
        }
    } catch (error) {
        console.error("Грешка при заявката:", error);
        showToast("Грешка при връзка със сървъра.", false);
    }
});

// Превключване между форми
document.getElementById("showRegister").addEventListener("click", function () {
    document.getElementById("registerContainer").style.display = "block";
    document.getElementById("loginContainer").style.display = "none";
    document.title = "Регистрация";
});

document.getElementById("showLogin").addEventListener("click", function () {
    document.getElementById("registerContainer").style.display = "none";
    document.getElementById("loginContainer").style.display = "block";
    document.title = "Вход";
});

// По подразбиране показваме регистрацията
document.getElementById("registerContainer").style.display = "block";
document.getElementById("loginContainer").style.display = "none";
document.title = "Регистрация";
