// redirect to login if not logged in
if (!localStorage.getItem("accessToken")) {
  window.location.href = "/LogIn-SinUp/html/LogIn.html";
}

const firstNameEl      = document.getElementById("first_name");
const lastNameEl       = document.getElementById("last_name");
const dateEl           = document.getElementById("date_of_birth");
const currentPassEl    = document.getElementById("current_pass");
const newPassEl        = document.getElementById("new_pass");
const newPassConfirmEl = document.getElementById("new_pass_confirm");

// attach live validation listeners (validators come from validation.js)
firstNameEl.addEventListener("input",      () => validateName(firstNameEl));
lastNameEl.addEventListener("input",       () => validateName(lastNameEl));
dateEl.addEventListener("input",           () => validateDate(dateEl));
currentPassEl.addEventListener("input",    () => {
  // only validate if the user has started typing
  if (currentPassEl.value) validatePassword(currentPassEl);
  else clearError(currentPassEl);
  // re-check confirm whenever current changes
  if (newPassConfirmEl.value) validateConfirmPassword(newPassConfirmEl, newPassEl);
});
newPassEl.addEventListener("input",        () => {
  if (newPassEl.value) validatePassword(newPassEl);
  else clearError(newPassEl);
  if (newPassConfirmEl.value) validateConfirmPassword(newPassConfirmEl, newPassEl);
});
newPassConfirmEl.addEventListener("input", () => validateConfirmPassword(newPassConfirmEl, newPassEl));

// pre-fill the form with the user's current data
window.addEventListener("load", async () => {
  const response = await fetch("http://localhost:3010/user");
  if (!response.ok) return;

  const user = await response.json();
  firstNameEl.value = user.firstName || "";
  lastNameEl.value  = user.lastName  || "";
  if (user.dateOfBirth) {
    dateEl.value = user.dateOfBirth.split("T")[0];
  }
});

// save changes
document.getElementById("save_changes").addEventListener("click", async () => {
  // run all validators and stop if any fail
  const nameOk = validateName(firstNameEl) & validateName(lastNameEl);
  const dateOk = validateDate(dateEl);

  const changingPassword = currentPassEl.value.length > 0;
  let passOk = true;
  if (changingPassword) {
    passOk = validatePassword(currentPassEl)
           & validatePassword(newPassEl)
           & validateConfirmPassword(newPassConfirmEl, newPassEl);
  }

  if (!nameOk || !dateOk || !passOk) return;

  const body = {
    firstName:   firstNameEl.value.trim(),
    lastName:    lastNameEl.value.trim(),
    dateOfBirth: dateEl.value,
  };
  if (changingPassword) {
    body.currentPassword = currentPassEl.value;
    body.newPassword     = newPassEl.value;
  }

  const response = await fetch("http://localhost:3010/user", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (response.ok) {
    showPopup("Changes saved! Redirecting...", "success");
    setTimeout(() => {
      window.location.href = "/index/index.html";
    }, 2000);
  } else if (response.status === 403) {
    showPopup("Current password is incorrect");
  } else {
    showPopup("Failed to save changes — please try again");
  }
});

// delete account
document.getElementById("delete_account").addEventListener("click", () => {
  document.getElementById("deleteDialog").showModal();
});

document.getElementById("confirmDelete").addEventListener("click", async () => {
  const password = document.getElementById("deletePassInput").value;
  const errorEl = document.getElementById("deletePassError");

  if (!password) {
    errorEl.textContent = "Please enter your password";
    return;
  }
  errorEl.textContent = "";

  const refreshToken = localStorage.getItem("refreshToken");

  const response = await fetch("http://localhost:3010/user", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken, password }),
  });

  if (response.ok || response.status === 204) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    document.getElementById("deleteDialog").close();
    showPopup("Account deleted. Goodbye!", "success");
    setTimeout(() => {
      window.location.href = "/index/index.html";
    }, 2000);
  } else if (response.status === 403) {
    errorEl.textContent = "Incorrect password";
  } else {
    showPopup("Failed to delete account — please try again");
    document.getElementById("deleteDialog").close();
  }
});

document.getElementById("cancelDelete").addEventListener("click", () => {
  document.getElementById("deletePassInput").value = "";
  document.getElementById("deletePassError").textContent = "";
  document.getElementById("deleteDialog").close();
});
