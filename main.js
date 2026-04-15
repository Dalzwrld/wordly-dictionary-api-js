let favorites = JSON.parse(localStorage.getItem("fav-words"));

const API = `https://api.dictionaryapi.dev/api/v2/entries/en/<word>`;

const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const resultCard = document.getElementById("result-card");
const savedContainer = document.getElementById("fav-panel");
const searchContainer = document.getElementById("search-panel");
const favContainer = document.getElementById("fav-panel");

let currentWord = null;
let currentAudio = null;

function showTabs(tab) {
    document.getElementById("search-panel").style.display = tab === "";
    document.getElementById("");
    document.getElementById("");
    document.getElementById("");
}

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
            showError(`No results were found for <strong>"${query}"</strong>. Please try again`)
            return;
        }

        setTimeout(() => {
            renderWord(data[0]);
        }, 1000);
    } catch (error) {
        console.error("Error fetching your animal:", error);
        showError("Something went wrong. Please try again later.")
    }
}

function renderWord(word) {
    currentWord = word;

    const phoneticObj = (word.phonetics || []).find(p => p.text) || {};
    const audioObj = (word.phonetics || []).find(p => p.audio && p.audio.trim()) || {};
    const phonetic = word.phonetics || "";
    const audioUrl = audioObj.audio || "";
    currentAudio = audioUrl ? new Audio(audioUrl) : null;

    const favoriteWord = favorites.some(fav => fav.word === word.word);

    const meaningsObj = word.meanings || [];

    let meaningsItems = "";

    meaningsObj.forEach(mean => {
        const defs = mean.definitions.slice(0, 4);
        const defsItems = defs.map((def, i) => `
            <li class="def-item">
                <span class="def-num">${i + 1}.</span>
                <div class="def-body">
                    <div class="def-text">${def.definition}</div>
                    ${def.example ? `<div class="def-example">"${def.example}"</div>` : ""}
                </div>
            </li>`).join("");

        const synonyms = (mean.synonyms || []).slice(0, 6);
        const synItems = synonyms.length ? `
            <div class="word-tags">
                <span class="tag-label">syn.</span>
                ${synonyms.map(syn => `<span class="tag" onclick="searchTag("${syn}")">${syn}</span>`).join("")}
            </div>
        ` : "";

        const antonyms = (mean.antonyms || []).slice(0, 6);
        const antItems = antonyms.length ? `
            <div class="word-tags">
                <span class="tag-label">ant.</span>
                ${synonyms.map(ant => `<span class="tag" onclick="searchTag("${ant}")">${ant}</span>`).join("")}
            </div>
        ` : "";

        meaningsItems += `
            <div class="meaning-panel">
                <span class="speech-part">${mean.partOfSpeech}</span>
                <ul class="definitions-list">${defsItems}</ul>
                ${synItems}${antItems}
            </div>
        `;
    });

    // const sourceUrl = (word.sourceUrls || [])[0] || "";
    // const sourceItems = sourceUrl ? `
    //     <section class="section-divider">
    //         <svg></svg>
    //         Source: <a href="${sourceUrl} target="_blank">${sourceUrl}</a>
    //     </section>
    // ` : "";

    resultCard.innerHTML = `
        <div class="word-header">
            <div class="word-main">
                <div class="word-title">${word.word}</div>
                <div class="word-phonetic">
                    ${phonetic ? `<span class="phonetic-text">${phonetic}</span>` : ""}
                    ${phonetic ? `<button class="play-btn" onclick="playAudio()">
                        <svg></svg>
                        Pronounce
                    </button>` : ""}
                </div>
            </div>

            <div class="word-actions">
                <button class="icon-btn ${favoriteWord ? "liked" : ""}" id="favBtn" onclick="switchToFav()" title="${favoriteWord ? "Remove from saved" : "Save word"}">
                    <svg><svg/>
                </button>
            </div>
        </div>

        <div class="meanings-list">${meaningsItems}</div>
        ${sourceItems}
    `;

    updateFavBadge();
}

function playAudio() {
    if (currentAudio) {
        currentAudio.currentTime = 0;
        currentAudio.play().catch(() => toast("Audio unavailable"));
    }
}

function switchToFav() {
    if(!currentWord) return;
    const index = favorites.findIndex(fav => fav.word === currentWord.word);

    if (index > -1) {
        favorites.splice(index, 1);
        toast("Removed from saved words");
    } else {
        const phonetic = (currentWord.phonetics || []).find(phone => phone.text) || {};
        const firstPOS = (currentWord.meanings || [])[0]?.partOfSpeech || "";
        favorites.unshift({ word: currentWord.word, phonetic: phonetic.text || "", partOfSpeech :firstPOS});

        toast("Saved to your word list");
    }

    localStorage.setItem("wordly_favs", JSON.stringify(favorites));
    updateFavBadge();

    const favBtn = document.getElementById("fav-btn");

    if (favBtn) {
        const favoriteWord = favorites.some(fav => fav.word === currentWord.word);
        favBtn.classList.toggle("liked", favoriteWord);
        favBtn.innerHTML = `
            <svg></svg>
        `;
    }
}

function updateFavBadge() {
    const favBadge = document.getElementById("fav-badge");
    favBadge.textContent = favorites.length ? `(${favorites.length})` : "";
}

function renderFavWords() {
    const list = document.getElementById("fav-list");
    const count = document.getElementById("fav-count-label");
    count.textContent = favorites.length === 1 ? "1 word" : `${favorites.length} words`;

    if (!favorites.length) {
        list.innerHTML = `<div class="fav-empty">No saved words yet.<br>Search for a word and tap on the heart to save it.</div>`;
        return;
    } else {
        list.innerHTML =  `<div class="fav-grid></div>` + favorites.map((fav, i)`
            <div class="fav-item" onclick="searchFav(${fav.phonetic})">
                <div>
                    <div class="fav-item-word">${fav.word}</div>
                    ${fav.phonetic ? `<div class="fav-item-phonetic">${fav.phonetic}</div>` : ""}
                </div>

                ${fav.partOfSpeech ? `<span class="fav-item-pos">${fav.partOfSpeech}</span>` : ""}
                <button class="fav-remove" onclick="removeFav(event, ${i})" title="Remove">x</button>
            </div>
        `).join("") ;
    }
}

function removeFav(event, i) {
    event.stopPropagation();
    favorites.splice(i, 1);
    localStorage.setItem("wordly-favs", JSON.stringify(favorites));
    updateFavBadge();
    renderFavWords();
}

function searchFav(word) {
    document.getElementById("search-input").value = word;
    
    searchWord();
}

function searchTag(word) {
    document.getElementById("search-input").value = word;
    searchWord();
}