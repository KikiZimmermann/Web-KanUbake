function showGoodbyePopup() {
  // create popup element if it doesn't exist yet
  let popup = document.getElementById("authPopup");
  if (!popup) {
    popup = document.createElement("div");
    popup.id = "authPopup";
    popup.style.cssText = `
      position: fixed; top: 20px; right: 20px;
      background: #f0f8f0; border-left: 4px solid #4caf50;
      border-radius: 10px; padding: 14px 22px;
      box-shadow: 0 4px 20px rgba(76,175,80,0.2);
      transform: translateX(200%); transition: transform 0.35s ease;
      z-index: 9999; min-width: 260px;
      font-size: 14px; color: #2e7d32; font-weight: 600;
    `;
    document.body.appendChild(popup);
  }

  popup.textContent = "Goodbye! See you next time 👋";
  popup.style.transform = "translateX(0)";

  setTimeout(() => {
    popup.style.transform = "translateX(200%)";
  }, 2500);
}

// runs when the page fully loads
window.onload = function () {
  // get the auth button and logout dialog elements
  const authBtn = document.getElementById("authBtn");
  const logoutDialog = document.getElementById("logoutDialog");

  // check if an accessToken exists in the browser's localStorage
  // if it exists → user is logged in
  const token = localStorage.getItem("accessToken");

  if (token) {
    // user is logged in → show "Log Out" button
    authBtn.textContent = "Log Out";
    // when clicked → show the logout confirmation dialog
    authBtn.onclick = () => {
      logoutDialog.showModal();
    };
  } else {
    // user is not logged in → show "Log In" button
    authBtn.textContent = "Log In";
    // when clicked → redirect to login page
    authBtn.onclick = () => {
      window.location.href = "/LogIn-SinUp/html/LogIn.html";
    };
  }

  // when user confirms logout
  document.getElementById("confirmLogout").addEventListener("click", async () => {
    const refreshToken = localStorage.getItem("refreshToken");

    // tell the server to invalidate the refresh token
    if (refreshToken) {
      await fetch("http://localhost:4010/logout", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: refreshToken }),
      }).catch(() => {}); // ignore network errors — still log out locally
    }

    // remove both tokens from localStorage — user is now logged out
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    // close the dialog
    logoutDialog.close();
    // show goodbye popup
    showGoodbyePopup();
    // change button back to "Log In"
    authBtn.textContent = "Log In";
    // when clicked → redirect to login page
    authBtn.onclick = () => {
      window.location.href = "/LogIn-SinUp/html/LogIn.html";
    };
  });

  // when user cancels logout → just close the dialog and stay logged in
  document.getElementById("cancelLogout").addEventListener("click", () => {
    logoutDialog.close();
  });
};

// called by header.js after header HTML is injected into the DOM
function initAuthBtn() {
  const authBtn = document.getElementById("authBtn");
  const logoutDialog = document.getElementById("logoutDialog");

  const token = localStorage.getItem("accessToken");

  if (token) {
    authBtn.textContent = "Log Out";
    authBtn.onclick = () => logoutDialog.showModal();
  } else {
    authBtn.textContent = "Log In";
    authBtn.onclick = () => {
      window.location.href = "/LogIn-SinUp/html/LogIn.html";
    };
  }

  document.getElementById("confirmLogout").addEventListener("click", async () => {
    const refreshToken = localStorage.getItem("refreshToken");

    if (refreshToken) {
      await fetch("http://localhost:4010/logout", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: refreshToken }),
      }).catch(() => {});
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    logoutDialog.close();
    showGoodbyePopup();
    authBtn.textContent = "Log In";
    authBtn.onclick = () => {
      window.location.href = "/LogIn-SinUp/html/LogIn.html";
    };
  });

  document.getElementById("cancelLogout").addEventListener("click", () => {
    logoutDialog.close();
  });
}
