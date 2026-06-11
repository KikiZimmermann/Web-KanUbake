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
      window.location.href = "../LogIn-SinUp/html/LogIn.html";
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
    // change button back to "Log In"
    authBtn.textContent = "Log In";
    // when clicked → redirect to login page
    authBtn.onclick = () => {
      window.location.href = "../LogIn-SinUp/html/LogIn.html";
    };
  });

  // when user cancels logout → just close the dialog and stay logged in
  document.getElementById("cancelLogout").addEventListener("click", () => {
    logoutDialog.close();
  });
};
