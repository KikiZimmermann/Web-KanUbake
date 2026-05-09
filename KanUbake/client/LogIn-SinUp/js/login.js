document.getElementById("log_in").addEventListener("click", (e) => {
  const email = document.getElementById("login_email").value;
  const password = document.getElementById("login_pass").value;

  // check if any field is empty
  if (!email || !password) {
    showPopup("Please fill in all fields");
    return; // stop here — don't send the request
  }

  fetch("http://localhost:4010/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Invalid credentials");
      }
      return response.json();
    })
    .then((user) => {
      localStorage.setItem("accessToken", user.accessToken);
      localStorage.setItem("refreshToken", user.refreshToken);
      showPopup("Login successful! Redirecting...", "success");
      setTimeout(() => {
        window.location.href = "../../index/index.html";
      }, 2000);
    })
    .catch((error) => {
      showPopup("Login failed — please check your credentials");
    });
});
