// ─────────────────────────────────────────────────────────────
//  authModel.js
//  Handles: user storage, JWT creation, session management
//  Used by: login.js and any other page that needs auth
// ─────────────────────────────────────────────────────────────


const MODEL_KEY   = "auth_users";
const SESSION_KEY = "auth_session";


// ── USER MODEL ────────────────────────────────────────────────

function getUsers() {
  return JSON.parse(localStorage.getItem(MODEL_KEY) || "[]");
}

function saveUsers(users) {
  localStorage.setItem(MODEL_KEY, JSON.stringify(users));
}

function findUser(email) {
  return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
}

function addUser(user) {
  const users = getUsers();
  users.push(user);
  saveUsers(users);
}


// ── JWT ───────────────────────────────────────────────────────

function createToken(user) {
  const header  = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({
    email:     user.email,
    firstname: user.firstname,
    lastname:  user.lastname,
    iat:       Date.now(),
    exp:       Date.now() + 60 * 60 * 1000  // 1 hour
  }));
  const signature = btoa("secret_key_" + user.email);
  return `${header}.${payload}.${signature}`;
}

function decodeToken(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}


// ── SESSION ───────────────────────────────────────────────────

function saveSession(token) {
  localStorage.setItem(SESSION_KEY, token);
}

function getSession() {
  const token = localStorage.getItem(SESSION_KEY);
  if (!token) return null;

  const payload = decodeToken(token);
  if (!payload) return null;

  if (payload.exp < Date.now()) {
    clearSession();
    return null;
  }
  return payload;
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function logout(redirectTo = "Login/login.html") {
  clearSession();
  window.location.href = redirectTo;
}

// Call this from any page to get the logged-in user
// Returns the payload object or null if not logged in
//
// Example (in another JS file):
//   const user = getLoggedInUser();
//   if (!user) window.location.href = "Login/login.html";
function getLoggedInUser() {
  return getSession();
}