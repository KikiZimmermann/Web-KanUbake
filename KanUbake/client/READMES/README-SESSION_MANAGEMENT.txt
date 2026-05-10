====================================================
  SESSION MANAGEMENT - KanUbake
====================================================

OVERVIEW
--------
This document explains the full flow of session management in the KanUbake web app,
from clicking "Log In" on the home page to clicking "Log Out".


====================================================
STEP 1 - User clicks "Log In" on the home page
====================================================
File: authBtn.js

When the page loads, authBtn.js checks if an accessToken exists in localStorage.
Since the user is not logged in yet, no token exists - so the button shows "Log In".

    const token = localStorage.getItem("accessToken");

    if (token) {
        authBtn.textContent = "Log Out"; // already logged in
    } else {
        authBtn.textContent = "Log In";  // not logged in
        authBtn.onclick = () => {
            window.location.href = "../LogIn-SinUp/html/LogIn.html";
        };
    }

Result: User is redirected to LogIn.html.


====================================================
STEP 2 - User fills in the login form
====================================================
File: LogIn.html

The user types their email and password and clicks the "Log In" button.


====================================================
STEP 3 - Login form is validated and sent to the server
====================================================
File: login.js

    // get values from the form
    const email = document.getElementById("login_email").value;
    const password = document.getElementById("login_pass").value;

    // check if fields are empty
    if (!email || !password) {
        showPopup("Please fill in all fields");
        return;
    }

    // send credentials to the server
    fetch("http://localhost:4010/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    })

Result: Email and password are sent to AuthServer.js on port 4010.


====================================================
STEP 4 - Server checks credentials
====================================================
File: AuthServer.js

The server receives the login request and does 3 checks:

    app.post("/login", async function (req, res) {
        // 1. read users from file
        const users = JSON.parse(fs.readFileSync(__dirname + "/users.json"));

        // 2. check if email exists
        const existingUser = users.find((user) => user.email === email);
        if (!existingUser) {
            return res.sendStatus(401); // email not found
        }

        // 3. check if password matches
        const passwordMatch = await bcrypt.compare(req.body.password, existingUser.password);
        if (!passwordMatch) {
            return res.sendStatus(401); // wrong password
        }

    Check               | Result if fails
    --------------------|------------------
    Email exists?       | 401 Unauthorized
    Password matches?   | 401 Unauthorized
    All good?           | Create tokens


====================================================
STEP 5 - Server creates JWT tokens
====================================================
File: AuthServer.js

If credentials are correct, the server creates two tokens:

    // short-lived token - expires in 20 seconds
    const accessToken = generateAccessToken(user);

    // long-lived token - never expires
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN);

    // send both tokens back to the browser
    res.json({ accessToken: accessToken, refreshToken: refreshToken });

What is a JWT token?
A JWT (JSON Web Token) is like a wristband at a concert:
  - It contains user information (who you are)
  - It is locked with a secret key from .env
  - If anyone tries to fake it - the server knows immediately

    Token           | Purpose                      | Expires
    ----------------|------------------------------|------------------
    accessToken     | Access protected pages       | After 20 seconds
    refreshToken    | Get a new accessToken        | Never


====================================================
STEP 6 - Browser saves the tokens
====================================================
File: login.js

    .then((user) => {
        // save tokens in browser's localStorage (the browser's pocket)
        localStorage.setItem("accessToken", user.accessToken);
        localStorage.setItem("refreshToken", user.refreshToken);

        // show success message
        showPopup("Login successful! Redirecting...", "success");

        // wait 2 seconds then redirect to home page
        setTimeout(() => {
            window.location.href = "../../index/index.html";
        }, 2000);
    })

Result: Tokens are saved in localStorage and user is redirected to home page.


====================================================
STEP 7 - Home page detects the user is logged in
====================================================
File: authBtn.js

When the home page loads again, it finds the token in localStorage:

    const token = localStorage.getItem("accessToken");

    if (token) {
        // token found - user is logged in - show "Log Out"
        authBtn.textContent = "Log Out";
        authBtn.onclick = () => {
            logoutDialog.showModal(); // show logout confirmation dialog
        };
    }

Result: Button now shows "Log Out" instead of "Log In".


====================================================
STEP 8 - User clicks "Log Out"
====================================================
File: authBtn.js

Clicking "Log Out" opens a confirmation dialog:

    +-----------------------------+
    |  Are you sure you want to   |
    |        log out?             |
    |                             |
    |  [Yes, Log Out]  [Cancel]   |
    +-----------------------------+


====================================================
STEP 9 - User confirms logout
====================================================
File: authBtn.js

    document.getElementById("confirmLogout").addEventListener("click", () => {
        // remove tokens from localStorage - session is now destroyed
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        // close the dialog
        logoutDialog.close();

        // update button back to "Log In"
        authBtn.textContent = "Log In";
        authBtn.onclick = () => {
            window.location.href = "../LogIn-SinUp/html/LogIn.html";
        };
    });

Result: Tokens are deleted, session is destroyed, button shows "Log In" again.


====================================================
FULL FLOW SUMMARY
====================================================

 1.  Home page loads
 2.  No token in localStorage -> show "Log In" button
 3.  User clicks "Log In" -> redirect to LogIn.html
 4.  User fills email + password -> click "Log In" button
 5.  Client validates fields -> sends data to server with fetch
 6.  Server checks email exists in users.json
 7.  Server checks password matches with bcrypt
 8.  Server creates accessToken + refreshToken (JWT)
 9.  Browser saves both tokens in localStorage
 10. Show success popup -> wait 2 seconds -> redirect to home page
 11. Token found in localStorage -> show "Log Out" button
 12. User clicks "Log Out" -> confirmation dialog appears
 13. User confirms -> tokens removed from localStorage
 14. Button changes back to "Log In"


====================================================
SECURITY NOTES
====================================================

- Passwords are NEVER stored in plain text - always hashed with bcrypt
- Secret keys are stored in .env - never in the code
- accessToken expires after 20 seconds - limits damage if stolen
- refreshToken is used to get new accessToken without logging in again
