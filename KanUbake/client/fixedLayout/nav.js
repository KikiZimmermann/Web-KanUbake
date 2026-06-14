function loadNav() {
    fetch("../fixedLayout/nav.html")
        .then(response => response.text())
        .then(data => {

            const nav = document.getElementById("nav");
            nav.innerHTML = data;
            const token = localStorage.getItem("accessToken");
            const dashboard = nav.querySelector("#dashboard");

            if (token && dashboard) {
                dashboard.innerHTML = `
                <a href="../dashboard/dashboard.html">My Cakes</a>
            `;
            }
            else if (dashboard) {
                dashboard.remove();
            }
        });
}
loadNav();