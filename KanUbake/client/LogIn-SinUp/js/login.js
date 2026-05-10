// catch the values of each input by clicking log in button
document.getElementById("log_in").addEventListener("click", (e) => {
  // get the values the user typed
  const email = document.getElementById("login_email").value;
  const password = document.getElementById("login_pass").value;

  // check if any field is empty — stop if so
  if (!email || !password) {
    showPopup("Please fill in all fields");
    return; // stop here — don't send the request
  }

  // send email and password to the server
  fetch("http://localhost:4010/login", {
    method: "POST", // sending data to the server
    headers: { "Content-Type": "application/json" }, // telling server we're sending JSON
    body: JSON.stringify({ email, password }), // convert to JSON string
  })
    .then((response) => {
      // runs when the server replies
      if (!response.ok) {
        // server said no (401 = wrong email or password)
        throw new Error("Invalid credentials"); // jump to .catch()
      }
      return response.json(); // open the response and read the tokens
    })
    .then((user) => {
      // runs when we successfully read the tokens
      // save both tokens in the browser's localStorage
      // so we can use them later without logging in again
      localStorage.setItem("accessToken", user.accessToken);
      localStorage.setItem("refreshToken", user.refreshToken);

      // show success message
      showPopup("Login successful! Redirecting...", "success");

      // wait 2 seconds then redirect to home page
      setTimeout(() => {
        window.location.href = "../../index/index.html";
      }, 2000);
    })
    .catch((error) => {
      // runs if anything went wrong (wrong password, server down etc.)
      showPopup("Login failed — please check your credentials");
    });
});