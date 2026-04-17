let favorites = JSON.parse(localStorage.getItem("fav-words") || "[]");

const API = "https://api.dictionaryapi.dev/api/v2/entries/en/";

const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const resultCard = document.getElementById("result-card");

let currentWord = null;
let currentAudio = null;

searchBtn.addEventListener("click", () => searchWord());

searchInput.addEventListener("keydown", e => {
    if (e.key === "Enter") searchWord();
});

async function searchWord() {
    const query = searchInput.value.trim();

    if (!query) return;

    clearError();
    resultCard.innerHTML = `Searching for ${query}`;

    resultCard.style.display = "none";

    try {
        const response = await fetch(API + encodeURIComponent(query), {
            method: "GET"
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (!data || data.length === 0) {
            showError(`No results were found for <strong>"${query}"</strong>. Please try again`);
            return;
        }

        setTimeout(() => {
            renderWord(data[0]);
        }, 1000);
    } catch (error) {
        console.error("Error fetching your word:", error);
        showError("Something went wrong. Please try again later.")
    }
}

function renderWord(entry) {
    const card = document.getElementById("result-card");
    card.style.display = "block";
    currentWord = entry;

    const phoneticObj = (entry.phonetics || []).find(p => p.text) || {};
    const audioObj = (entry.phonetics || []).find(p => p.audio && p.audio.trim()) || {};
    const phonetic = phoneticObj.text || "";
    let audioUrl = audioObj.audio || "";

    if (audioUrl.startsWith("//")) audioUrl = "https:" + audioUrl;
    currentAudio = audioUrl ? new Audio(audioUrl) : null;

    const favoriteWord = favorites.some(fav => fav.word === entry.word);

    const meaningsObj = entry.meanings || [];

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
                ${synonyms.map(syn => `<span class="tag" data-lookup="${syn}">${syn}</span>`).join("")}
            </div>
        ` : "";

        const antonyms = (mean.antonyms || []).slice(0, 6);
        const antItems = antonyms.length ? `
            <div class="word-tags">
                <span class="tag-label">ant.</span>
                ${antonyms.map(ant => `<span class="tag" data-lookup="${ant}">${ant}</span>`).join("")}
            </div>
        ` : "";

        meaningsItems += `
            <div class="meaning-block">
                <span class="pos-badge">${mean.partOfSpeech}</span>
                <ul class="definitions-list">${defsItems}</ul>
                ${synItems}${antItems}
            </div>
        `;
    });

    const sourceUrl = (entry.sourceUrls || [])[0] || "";
    const sourceItems = sourceUrl ? `
        <section class="section-divider"></section>
        <div class="source-row">
            <img src="images/icons8-link-26.png" alt="Link icon">
            Source: <a href="${sourceUrl}" target="_blank">${sourceUrl}</a>
        </div>
    ` : "";

    card.innerHTML = `
        <div class="word-header">
            <div class="word-main">
                <div class="word-title">${entry.word}</div>
                <div class="word-phonetic">
                    ${phonetic ? `<span class="phonetic-text">${phonetic}</span>` : ""}
                    ${audioUrl ? `<button class="play-btn" id="play-btn">
                        <img src="images/icons8-speaker-48.png" alt="Speaker icon">
                        Pronounce
                    </button>` : ""}
                </div>
            </div>

            <div class="word-actions">
                <button class="icon-btn ${favoriteWord ? "liked" : ""}" id="fav-btn" title="${favoriteWord ? "Remove from saved" : "Save word"}">
                    <img src="images/icons8-star-48.png" alt="Star icon">
                </button>
            </div>
        </div>

        <div class="meanings-list">${meaningsItems}</div>
        ${sourceItems}
    `;

    updateFavBadge();

    document.getElementById("fav-btn").addEventListener("click", () => {
        toggleFav();
    })

    const playBtn = document.getElementById("play-btn");
    if (playBtn) playBtn.addEventListener("click", () => {
        playAudio();
    })

    card.querySelectorAll(".tag[data-lookup]").forEach(tag => {
        tag.addEventListener("click", () => searchTag(tag.dataset.lookup));
    });
}

function playAudio() {
    if (currentAudio) {
        currentAudio.currentTime = 0;
        currentAudio.play().catch(() => toast("Audio unavailable"));
    }
}

function toggleFav() {
    if(!currentWord) return;
    const idx = favorites.findIndex(fav => fav.word === currentWord.word);

    if (idx > -1) {
        favorites.splice(idx, 1);
        toast("Removed from saved words");
    } else {
        const phonetic = (currentWord.phonetics || []).find(phone => phone.text) || {};
        const firstPOS = (currentWord.meanings || [])[0]?.partOfSpeech || "";
        favorites.unshift({ word: currentWord.word, phonetic: phonetic.text || "", pos :firstPOS});

        toast("Saved to your word list");
    }

    localStorage.setItem("fav-words", JSON.stringify(favorites));
    updateFavBadge();
    renderFavWords();

    const favBtn = document.getElementById("fav-btn");

    if (favBtn) {
        const favoriteWord = favorites.some(fav => fav.word === currentWord.word);
        favBtn.classList.toggle("liked", favoriteWord);
    }
}

function updateFavBadge() {
    const count = favorites.length;
    const favBadge = document.getElementById("fav-badge");
    const pill = document.getElementById("fav-badge-pill");
    const panel = document.getElementById("fav-panel");

    favBadge.textContent = count;
    pill.classList.toggle("visible", count > 0);
    panel.classList.toggle("has-items", count > 0);
}

function renderFavWords() {
    const list = document.getElementById("fav-list");
    const count = document.getElementById("fav-count-label");
    count.textContent = favorites.length === 1 ? "1 word" : `${favorites.length} words`;

    if (!favorites.length) {
        list.innerHTML = '<div class="fav-empty">No saved words yet.<br>Search for a word and tap on the heart to save it.</div>';
        return;
    } 
        
    list.innerHTML =  `<div class="fav-grid>` + favorites.map((fav, i) =>`
        <div class="fav-item" data-word="${fav.word}">
            <div>
                <div class="fav-item-word">${fav.word}</div>
                ${fav.phonetic ? `<div class="fav-item-phonetic">${fav.phonetic}</div>` : ""}
            </div>

            ${fav.pos ? `<span class="fav-item-pos">${fav.pos}</span>` : ""}
            <button class="fav-remove" data-idx="${i}" title="Remove">x</button>
        </div>
    `).join("") + `</div>`;

    list.querySelectorAll(".fav-item").forEach(item => {
        item.addEventListener("click", () => {
            searchFav(item.dataset.word)
        });
    })

    list.querySelectorAll(".fav-remove").forEach(btn => {
        btn.addEventListener("click", event => {
            event.stopPropagation();
            removeFav(parseInt(btn.dataset.idx));
        });
    })
}

function removeFav(i) {
    favorites.splice(i, 1);
    localStorage.setItem("fav-words", JSON.stringify(favorites));
    updateFavBadge();
    renderFavWords();
}

function searchFav(word) {
    document.getElementById("search-input").value = word;
    window.scrollTo({ top: 0, behavior: "smooth" });
    searchWord();
}

function searchTag(word) {
    document.getElementById("search-input").value = word;
    searchWord();
}

function showError(msg) {
    resultCard.style.display = "block";
    resultCard.innerHTML = `<p style=" color: var(--muted-text-color); font-size: 14px; text-align: center; padding: 2rem 0;">${msg}</p>`;
}

function clearError() {
    resultCard.innerHTML = "";
    resultCard.style.display = "none";
}

function toast(msg) {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => 
        el.classList.remove("show")
    , 2400);
}

updateFavBadge();
renderFavWords();