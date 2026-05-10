/* ── Helpers ─────────────────────────────────────────── */

// Finds the <p> element next to an input where error messages are displayed
// First checks the next sibling, then the parent's next sibling
function getErrorP(input) {
  let el = input.nextElementSibling;
  if (!el || el.tagName !== "P") {
    el = input.parentElement.nextElementSibling;
  }
  return el && el.tagName === "P" ? el : null;
}

// Shows an error message below the input and removes the 'valid' green style
function showError(input, message) {
  const p = getErrorP(input);
  if (p) p.textContent = message;
  input.classList.remove('valid');
}

// Clears the error message and adds the 'valid' green style
function clearError(input) {
  const p = getErrorP(input);
  if (p) p.textContent = '';
  input.classList.add('valid');
}

// Checks if an email has the correct format (something@something.something)
function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// Checks if a value contains only letters (including accented letters like é, ü)
function isLettersOnly(value) {
  return /^[a-zA-ZÀ-ÿ\s'-]+$/.test(value);
}

/* ── Field validators ────────────────────────────────── */

// Validates a name field — must not be empty and must contain only letters
// Returns true if valid, false if not
function validateName(input) {
  const value = input.value.trim(); // remove spaces from start and end
  if (value === "") {
    showError(input, "This field is required");
    return false;
  }
  if (!isLettersOnly(value)) {
    showError(input, "Only letters are allowed");
    return false;
  }
  clearError(input); // all good — clear any previous error
  return true;
}

// Validates an email field — must not be empty and must have correct format
// Returns true if valid, false if not
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

// Validates a password field — must not be empty and must be at least 12 characters
// Returns true if valid, false if not
function validatePassword(input) {
  const value = input.value;
  if (value === "") {
    showError(input, "Password is required");
    return false;
  }
  if (value.length < 12) {
    // shows how many characters the user has typed so far
    showError(input, `At least 12 characters (${value.length}/12)`);
    return false;
  }
  clearError(input);
  return true;
}

// Validates the confirm password field — must match the original password
// Takes two inputs: the confirm field and the original password field
// Returns true if valid, false if not
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

// Validates a date of birth field — must not be empty and must be a realistic year
// Returns true if valid, false if not
function validateDate(input) {
  const value = input.value;
  if (value === "") {
    showError(input, "Date of birth is required");
    return false;
  }

  const birthYear = new Date(value).getFullYear();
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;

  if (birthYear < 1900) {
    showError(input, "Enter a valid date");
    return false;
  }

  if (age < 10) {
    showError(input, "You must be at least 10 years old");
    return false;
  }

  clearError(input);
  return true;
}

/* ── Attach listeners ────────────────────────────────── */
// Get references to all input elements on the page
// These will be null on pages where the input doesn't exist (e.g. login page has no first_name)
const firstName = document.getElementById("first_name");
const lastName = document.getElementById("last_name");
const emailInput = document.getElementById("login_email");
const passwordInput = document.getElementById("login_pass");
const confirmInput = document.getElementById("login_pass_confirm");
const dateInput = document.getElementById("date_of_birth");

// Only attach listeners if the element exists on the current page
// This way the same validation.js works for both LogIn.html and SignUp.html

// Validate first name every time the user types
if (firstName)
  firstName.addEventListener("input", () => validateName(firstName));

// Validate last name every time the user types
if (lastName) 
  lastName.addEventListener("input", () => validateName(lastName));

// Validate email every time the user types
if (emailInput)
  emailInput.addEventListener("input", () => validateEmail(emailInput));

// Validate date of birth every time the user changes it
if (dateInput)
  dateInput.addEventListener("input", () => validateDate(dateInput));

// Validate password every time the user types
// Also re-validates confirm password if it already has a value
if (passwordInput)
  passwordInput.addEventListener("input", () => {
    validatePassword(passwordInput);
    if (confirmInput && confirmInput.value !== "")
      validateConfirmPassword(confirmInput, passwordInput);
  });

// Validate confirm password every time the user types
if (confirmInput)
  confirmInput.addEventListener("input", () =>
    validateConfirmPassword(confirmInput, passwordInput)
  );