let favorites = JSON.parse(localStorage.getItem("fav-words"));

const API = `https://api.dictionaryapi.dev/api/v2/entries/en/<word>`;

const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const resultCard = document.getElementById("result-card");
const savedContainer = document.getElementById("fav-panel");
const searchContainer = document.getElementById("search-panel");
const favContainer = document.getElementById("fav-panel");

searchInput.addEventListener("keydown", e => {
    if (e.key === "Enter") searchWord;
});

async function searchWord() {
    const query = searchInput.value.trim();

    if (!query) {
        showError("Please enter a word.")
    }

    clearError();
    resultCard.innerHTML = "";

    try {
        const response = await fetch(API + encodeURIComponent(query), 
            {
                method: "GET"
        })

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (!data || data.length === 0) {
            showError(`No results were found for "${query}". Please try again`)
            return;
        }
    } catch (error) {
        
    }
}