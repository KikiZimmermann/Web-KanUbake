fetch("/KanUbake/client/fixedLayout/header.html")
    .then(response => response.text())
    .then(data => {
        document.getElementById("header").innerHTML = data;

        document.getElementById("pageTitle").textContent =
            window.pageTitle || "KanUbake";

        // initialize the auth button after the header HTML is in the DOM
        if (typeof initAuthBtn === "function") initAuthBtn();
    });
