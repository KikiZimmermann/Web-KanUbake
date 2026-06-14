async function loadCakes() {
    const token = localStorage.getItem("accessToken");

    if (!token) {
        console.log("Not logged in");
        return;
    }

    try {
        const response = await fetch("http://localhost:3010/get/cake", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch forms");
        }

        const cakes = await response.json();
        renderCakes(cakes);

    } catch (err) {
        console.error(err);
    }
}

function renderCakes(cakes) {
    const container = document.querySelector(".showcase-container");

    container.innerHTML = "";

    cakes.forEach(cake => {
        const article = document.createElement("article");
        article.className = "showcase";

        article.innerHTML = `
            <div class="introduction">
                <h3>${cake.title}</h3>
                <p>Last Updated: ${cake.updated_at || "unknown"}</p>
                <button>View / Edit</button>
                <button>Delete</button>
            </div>
        `;

        container.appendChild(article);
    });
}

loadCakes();