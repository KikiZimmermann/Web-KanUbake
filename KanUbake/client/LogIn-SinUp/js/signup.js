// catch the values of each input by clicking sign up button
document.getElementById("sign_up").addEventListener("click", (e) => {
  const firstName = document.getElementById("first_name").value;
  const lastName = document.getElementById("last_name").value;
  const loginEmail = document.getElementById("login_email").value;
  const dateOfBirth = document.getElementById("date_of_birth").value;
  const loginPass = document.getElementById("login_pass").value;
  const loginPassConfirm = document.getElementById("login_pass_confirm").value;

  // check if any field is empty
  if (
    !firstName ||
    !lastName ||
    !loginEmail ||
    !dateOfBirth ||
    !loginPass ||
    !loginPassConfirm
  ) {
    showPopup("Please fill in all fields");
    return; // stop here — don't send the request
  }

  // check if passwords match
  if (loginPass !== loginPassConfirm) {
    showPopup("Passwords do not match");
    return; // stop here — don't send the request
  }

  // run all validators
  const isValid =
    validateName(document.getElementById("first_name")) &&
    validateName(document.getElementById("last_name")) &&
    validateEmail(document.getElementById("login_email")) &&
    validateDate(document.getElementById("date_of_birth")) &&
    validatePassword(document.getElementById("login_pass")) &&
    validateConfirmPassword(
      document.getElementById("login_pass_confirm"),
      document.getElementById("login_pass")
    );

  // if any field is invalid → stop
  if (!isValid) {
    showPopup("Please fix the errors before signing up");
    return;
  }
  // Send the signup data to the server
  fetch("http://localhost:4010/signup", {
    method: "POST", // sending data to the server
    headers: { "Content-Type": "application/json" }, // telling server we're sending JSON
    body: JSON.stringify({
      // convert all field values to a JSON string to send over the internet
      // field names must match exactly what the server expects in req.body
      first_name: firstName,
      last_name: lastName,
      login_email: loginEmail,
      date_of_birth: dateOfBirth,
      login_pass: loginPass,
    }),
  })
    .then((response) => {
      // runs when the server replies
      if (response.status === 409) {
        // 409 = Conflict — this email is already registered
        showPopup("Email already exists — please log in instead");
        return; // stop here — don't continue
      }
      if (!response.ok) {
        // any other error (500, 400 etc.) — something went wrong on the server
        throw new Error("Signup failed");
      }
      // if we get here — signup was successful!
      showPopup("Account created successfully! Redirecting...", "success");
      // wait 2 seconds so user can read the success message, then redirect to login
      setTimeout(() => {
        window.location.href = "./LogIn.html";
      }, 2000);
    })
    .catch((error) => {
      showPopup("Signup failed — please check your credentials");
    });
});
