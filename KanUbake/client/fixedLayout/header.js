fetch("/KanUbake/client/fixedLayout/header.html")
    .then(response => response.text())
    .then(data => {
        document.getElementById("header").innerHTML = data;

        document.getElementById("pageTitle").textContent =
            window.pageTitle || "KanUbake";
    });