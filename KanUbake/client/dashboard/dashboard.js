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
                <h3>${cake.data.displayName}</h3>
                <p>Last Updated: ${cake.updated_at || "noch nicht angegeben"}</p>
                <button class="edit-btn" data-cake-id="${cake.id}">View / Edit</button>
                <button class="delete-btn" data-cake-id="${cake.id}">Delete</button>
            </div>
        `;

        container.appendChild(article);

        // Add event listeners to buttons
        const editBtn = article.querySelector(".edit-btn");
        const deleteBtn = article.querySelector(".delete-btn");

        editBtn.addEventListener("click", () => editCake(cake.id));
        deleteBtn.addEventListener("click", () => deleteCake(cake.id));
    });
}

async function editCake(cakeId) {
    // Navigate to the questionnaire page to edit the cake
    window.location.href = `../questionaire/questionnaire.html?edit=${cakeId}`;
}

async function deleteCake(cakeId) {
    const token = localStorage.getItem("accessToken");

    if (!token) {
        console.log("Not logged in");
        return;
    }

    if (!confirm("Möchtest du diese Kuchen wirklich löschen?")) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:3010/delete/cake`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id: cakeId })
        });

        if (!response.ok) {
            throw new Error("Failed to delete cake");
        }

        // Reload cakes after successful deletion
        loadCakes();
        console.log("Kuchen erfolgreich gelöscht");

    } catch (err) {
        console.error("Fehler beim Löschen:", err);
        alert("Fehler beim Löschen des Kuchens");
    }
}

loadCakes();