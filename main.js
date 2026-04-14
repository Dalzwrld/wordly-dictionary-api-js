let favorites = JSON.parse(localStorage.getItem("fav-words"));

const API_KEY = `https://api.dictionaryapi.dev/api/v2/entries/en/<word>`;

const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const searchContainer = document.getElementById("search-result");

async function searchWord() {
    const word = document.getElementById("search-input").value.trim();
}