window.onload = function () {
  const authBtn = document.getElementById("authBtn");
  const logoutDialog = document.getElementById("logoutDialog");
  const token = localStorage.getItem("accessToken");

  if (token) {
    authBtn.textContent = "Log Out";
    authBtn.onclick = () => {
      logoutDialog.showModal();
    };
  } else {
    authBtn.textContent = "Log In";
    authBtn.onclick = () => {
      window.location.href = "../LogIn-SinUp/html/LogIn.html";
    };
  }

  document.getElementById("confirmLogout").addEventListener("click", () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    logoutDialog.close();
    authBtn.textContent = "Log In";
    authBtn.onclick = () => {
      window.location.href = "../LogIn-SinUp/html/LogIn.html";
    };
  });

  document.getElementById("cancelLogout").addEventListener("click", () => {
    logoutDialog.close();
  });
};
