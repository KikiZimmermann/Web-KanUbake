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
    return;
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
  fetch("http://localhost:4010/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      first_name: firstName,
      last_name: lastName,
      login_email: loginEmail,
      date_of_birth: dateOfBirth,
      login_pass: loginPass,
      login_pass_confirm: loginPassConfirm,
    }),
  })
    .then((response) => {
      if (response.status === 409) {
        showPopup("Email already exists — please log in instead");
        return;
      }
      if (!response.ok) {
        throw new Error("Signup failed");
      }
      showPopup("Account created successfully! Redirecting...", "success");
      setTimeout(() => {
        window.location.href = "./LogIn.html";
      }, 2000);
    })
    .catch((error) => {
      showPopup("Signup failed — please check your credentials");
    });
});
