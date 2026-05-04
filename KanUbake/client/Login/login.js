// ─────────────────────────────────────────────────────────────
//  login.js
//  Handles: UI, validation, tab switching, form submission
//  Depends on: authModel.js  (load it first in login.html)
// ─────────────────────────────────────────────────────────────

// ── SIGN UP ───────────────────────────────────────────────────

function handleSignup(form) {
  const firstname = form.querySelector("#signup-firstname");
  const lastname = form.querySelector("#signup-lastname");
  const email = form.querySelector("#signup-email");
  const dob = form.querySelector("#signup-dob");
  const password = form.querySelector("#signup-password");

  const isValid = [...form.querySelectorAll("input")].every(validateInput);
  if (!isValid) return;

  if (findUser(email.value.trim())) {
    showError(email, "This email is already registered");
    return;
  }

  addUser({
    firstname: firstname.value.trim(),
    lastname: lastname.value.trim(),
    email: email.value.trim(),
    dob: dob.value,
    password: password.value,
  });

  showGlobalMessage("Account created! You can now log in.", "success");
  switchTab(true);
}

// ── LOGIN ─────────────────────────────────────────────────────

function handleLogin(form) {
  const emailInput = form.querySelector("#login-email");
  const passwordInput = form.querySelector("#login-password");

  const isValid = [...form.querySelectorAll("input")].every(validateInput);
  if (!isValid) return;

  const user = findUser(emailInput.value.trim());

  if (!user) {
    showError(emailInput, "No account found with this email");
    return;
  }

  if (user.password !== passwordInput.value) {
    showError(passwordInput, "Incorrect password");
    return;
  }

  saveSession(createToken(user));

  showGlobalMessage(`Welcome back, ${user.firstname}! Redirecting…`, "success");
  setTimeout(() => {
    window.location.href = "../index.html";
  }, 1200);
}

// ── GLOBAL MESSAGE BANNER ─────────────────────────────────────

function showGlobalMessage(text, type = "success") {
  let el = document.getElementById("global-msg");

  if (!el) {
    el = document.createElement("div");
    el.id = "global-msg";
    Object.assign(el.style, {
      position: "fixed",
      top: "1rem",
      left: "50%",
      transform: "translateX(-50%)",
      padding: "12px 24px",
      borderRadius: "999px",
      fontSize: "0.875rem",
      fontWeight: "500",
      zIndex: "9999",
      boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
      transition: "opacity 0.3s",
    });
    document.body.appendChild(el);
  }

  el.textContent = text;
  el.style.opacity = "1";
  el.style.background = type === "success" ? "#aaed5a" : "#fee2e2";
  el.style.color = type === "success" ? "#274900" : "#dc2626";

  clearTimeout(el._timeout);
  el._timeout = setTimeout(() => {
    el.style.opacity = "0";
  }, 3500);
}

// ── VALIDATION ────────────────────────────────────────────────

function getErrorEl(input) {
  return input.closest(".field-group").querySelector(".error-msg");
}

function showError(input, message) {
  input.classList.add("error");
  getErrorEl(input).textContent = message;
}

function clearError(input) {
  input.classList.remove("error");
  getErrorEl(input).textContent = "";
}

function validateInput(input) {
  const value = input.value.trim();
  clearError(input);

  if (input.required && value === "") {
    showError(input, "This field is required");
    return false;
  }

  if (input.type === "email" && value !== "") {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(value)) {
      showError(input, "Enter a valid email");
      return false;
    }
  }

  if (input.id === "signup-password" && value.length < 6) {
    showError(input, "At least 6 characters");
    return false;
  }

  if (input.id === "signup-confirm-password") {
    const password = document.getElementById("signup-password").value;
    if (value !== password) {
      showError(input, "Passwords do not match");
      return false;
    }
  }

  return true;
}

// ── TAB SWITCHING ─────────────────────────────────────────────

const btnLogin = document.getElementById("btn-login");
const btnSignup = document.getElementById("btn-signup");
const panelLogin = document.getElementById("panel-login");
const panelSignup = document.getElementById("panel-signup");

function resetForm(form) {
  form.reset();
  form.querySelectorAll("input").forEach(clearError);
}

function switchTab(showLogin) {
  btnLogin.classList.toggle("active", showLogin);
  btnSignup.classList.toggle("active", !showLogin);
  btnLogin.setAttribute("aria-selected", String(showLogin));
  btnSignup.setAttribute("aria-selected", String(!showLogin));

  panelLogin.classList.toggle("active", showLogin);
  panelSignup.classList.toggle("active", !showLogin);
  panelLogin.toggleAttribute("hidden", !showLogin);
  panelSignup.toggleAttribute("hidden", showLogin);

  resetForm(
    showLogin
      ? panelSignup.querySelector("form")
      : panelLogin.querySelector("form")
  );
}

btnLogin.addEventListener("click", () => switchTab(true));
btnSignup.addEventListener("click", () => switchTab(false));

// ── LIVE VALIDATION ───────────────────────────────────────────

document.querySelectorAll(".auth-form input").forEach((input) => {
  input.addEventListener("input", () => validateInput(input));
});

const signupConfirm = document.getElementById("signup-confirm-password");
const signupPassword = document.getElementById("signup-password");

signupConfirm.addEventListener("input", () => {
  if (signupConfirm.value && signupConfirm.value !== signupPassword.value) {
    showError(signupConfirm, "Passwords do not match");
  } else {
    clearError(signupConfirm);
  }
});

// ── FORM SUBMIT ───────────────────────────────────────────────

panelLogin.querySelector("form").addEventListener("submit", (e) => {
  e.preventDefault();
  handleLogin(e.target);
});

panelSignup.querySelector("form").addEventListener("submit", (e) => {
  e.preventDefault();
  handleSignup(e.target);
});

// ── PASSWORD TOGGLE ───────────────────────────────────────────

document.addEventListener("click", (e) => {
  const button = e.target.closest(".toggle-pw");
  if (!button) return;

  const input = document.getElementById(button.dataset.target);
  if (!input) return;

  const show = input.type === "password";
  input.type = show ? "text" : "password";
  button.setAttribute("aria-label", show ? "Hide password" : "Show password");
  button.querySelector(".icon-eye").style.display = show ? "none" : "block";
  button.querySelector(".icon-eye-off").style.display = show ? "block" : "none";
});

// ── AUTO-REDIRECT IF ALREADY LOGGED IN ───────────────────────

(function () {
  if (getSession()) window.location.href = "../index.html";
})();
