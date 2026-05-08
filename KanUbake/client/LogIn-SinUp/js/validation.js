/* ── Helpers ─────────────────────────────────────────── */
function getErrorP(input) {
  let el = input.nextElementSibling;
  if (!el || el.tagName !== "P") {
    el = input.parentElement.nextElementSibling;
  }
  return el && el.tagName === "P" ? el : null;
}

function showError(input, message) {
  const p = getErrorP(input);
  if (p) p.textContent = message;
  input.classList.remove('valid');
}

function clearError(input) {
  const p = getErrorP(input);
  if (p) p.textContent = '';
  input.classList.add('valid');
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isLettersOnly(value) {
  return /^[a-zA-ZÀ-ÿ\s'-]+$/.test(value);
}

/* ── Field validators ────────────────────────────────── */
function validateName(input) {
  const value = input.value.trim();
  if (value === "") {
    showError(input, "This field is required");
    return false;
  }
  if (!isLettersOnly(value)) {
    showError(input, "Only letters are allowed");
    return false;
  }
  clearError(input);
  return true;
}

function validateEmail(input) {
  const value = input.value.trim();
  if (value === "") {
    showError(input, "Email is required");
    return false;
  }
  if (!isValidEmail(value)) {
    showError(input, "Enter a valid email address");
    return false;
  }
  clearError(input);
  return true;
}

function validatePassword(input) {
  const value = input.value;
  if (value === "") {
    showError(input, "Password is required");
    return false;
  }
  if (value.length < 12) {
    showError(input, `At least 12 characters (${value.length}/12)`);
    return false;
  }
  clearError(input);
  return true;
}

function validateConfirmPassword(input, passwordInput) {
  const value = input.value;
  if (value === "") {
    showError(input, "Please confirm your password");
    return false;
  }
  if (value !== passwordInput.value) {
    showError(input, "Passwords do not match");
    return false;
  }
  clearError(input);
  return true;
}

function validateDate(input) {
  const value = input.value;
  if (value === "") {
    showError(input, "Date of birth is required");
    return false;
  }
  const year = new Date(value).getFullYear();
  if (year < 1900 || year > new Date().getFullYear()) {
    showError(input, "Enter a valid date");
    return false;
  }
  clearError(input);
  return true;
}

/* ── Attach listeners ────────────────────────────────── */
const firstName = document.getElementById("first_name");
const lastName = document.getElementById("last_name");
const emailInput = document.getElementById("login_email");
const passwordInput = document.getElementById("login_pass");
const confirmInput = document.getElementById("login_pass_confirm");
const dateInput = document.getElementById("date_of_birth");

if (firstName)
  firstName.addEventListener("input", () => validateName(firstName));
if (lastName) lastName.addEventListener("input", () => validateName(lastName));
if (emailInput)
  emailInput.addEventListener("input", () => validateEmail(emailInput));
if (dateInput)
  dateInput.addEventListener("input", () => validateDate(dateInput));

if (passwordInput)
  passwordInput.addEventListener("input", () => {
    validatePassword(passwordInput);
    if (confirmInput && confirmInput.value !== "")
      validateConfirmPassword(confirmInput, passwordInput);
  });

if (confirmInput)
  confirmInput.addEventListener("input", () =>
    validateConfirmPassword(confirmInput, passwordInput)
  );
