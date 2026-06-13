fetch("/fixedLayout/header.html")
    .then(response => response.text())
    .then(data => {
        document.getElementById("header").innerHTML = data;

        document.getElementById("pageTitle").textContent =
            window.pageTitle || "KanUbake";

        const authBtn = document.getElementById("authBtn");
        const token = localStorage.getItem("accessToken");
        authBtn.textContent = token ? "Log Out" : "Log In";
        authBtn.style.visibility = "visible";

        if (typeof initAuthBtn === "function") {
            initAuthBtn();
        }
    });
