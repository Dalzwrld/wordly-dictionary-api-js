let favorites = JSON.parse(localStorage.getItem("fav-words"));

const API_KEY = `https://api.dictionaryapi.dev/api/v2/entries/en/<word>`;

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
    resultContainer.innerHTML = "";

    try {
        
    } catch (error) {
        
    }
}