const headerH1 = document.querySelector("#header h1");
const headerH3 = document.querySelector("#header h3");
const charImage = document.querySelector("#charDay div#photo");
const charDesc = document.querySelector("#charDay div#description");
const charNames = document.querySelector("#charDay ul#names");
const charTitles = document.querySelector("#charDay ul#titles");
const scriptData = document.querySelector("script#data");
// Parse JSON in script tag
const DATA = JSON.parse(scriptData.textContent);
// Fluff for the headers
headerH1.title =
    "UwwwuuUu it's a beautiful day for a new character!!";
headerH3.textContent = DATA.date;
// Populate character names
for (let i = 0; i < 2; ++i) {
    charNames.children[i].textContent = DATA.charNames[i];
}
// Populate show titles on page (up to 3 unique titles from { romaji, english, native })
for (let i = 0; i < 3; ++i) {
    charTitles.children[i].textContent = DATA.showTitles[i];
}
charImage.style.backgroundImage = `url("${DATA.character.image.large}")`;
charDesc.innerHTML = `<p id="spoiler-info">*click on spoilers to view*</p>${DATA.character.description}`;
// Limit and add scrollbar for large descriptions >400px
if (charDesc.clientHeight > 400) {
    charDesc.classList.add("condensed");
}
// Toggle spoilers
const spoilers = document.querySelectorAll("span.spoiler");
for (let i = 0; i < spoilers.length; ++i) {
    spoilers[i].addEventListener("click", () => {
        spoilers[i].classList.toggle("show-spoiler");
    });
}
// Show cover art on official site link
const showArt = DATA.showArt;
const officialImg = document.querySelector("#official-link img");
officialImg.setAttribute("src", showArt["medium"]);
// Show links
const links = DATA.showLinks;
const official = document.querySelector("#official-link");
const netflix = document.querySelector("#netflix-link");
const crunchyroll = document.querySelector("#crunchyroll-link");
const tubi = document.querySelector("#tubi-link");
const funimation = document.querySelector("#funimation-link");
const hulu = document.querySelector("#hulu-link");
const amazon = document.querySelector("#amazon-link");
const hbomax = document.querySelector("#hbomax-link");
const animelab = document.querySelector("#animelab-link");
const hidive = document.querySelector("#hidive-link");
const vrv = document.querySelector("#vrv-link");
const viz = document.querySelector("#viz-link");
const twitter = document.querySelector("#twitter-link");
const watchLinks = {
    Netflix: netflix,
    Crunchyroll: crunchyroll,
    "Tubi TV": tubi,
    Funimation: funimation,
    Hulu: hulu,
    Amazon: amazon,
    "HBO Max": hbomax,
    AnimeLab: animelab,
    Hidive: hidive,
    VRV: vrv,
    Viz: viz,
};
const connectLinks = {
    Twitter: twitter,
    "Official Site": official,
};
const watchHeader = document.querySelector("#watch-links h1");
const connectHeader = document.querySelector("#connect-links h1");
// Iterate over all links returned from API
for (let link of links) {
    if (connectLinks[link["site"]]) {
        // show link and set attributes
        connectLinks[link["site"]].href = link["url"];
        connectLinks[link["site"]].classList.remove("hidden");
        connectLinks[link["site"]].title = link["site"];
        // show section header (hidden if section is empty)
        connectHeader.classList.remove("hidden");
    }
    else if (watchLinks[link["site"]]) {
        // show link and set attributes
        watchLinks[link["site"]].href = link["url"];
        watchLinks[link["site"]].classList.remove("hidden");
        watchLinks[link["site"]].title = link["site"];
        // show section header (hidden if section is empty)
        watchHeader.classList.remove("hidden");
    }
}
// Mobile only: reposition #showLinks and #hibianime to be below description
if (window.screen.width <= 600) {
    const charDay = document.querySelector("#charDay");
    const showLinks = document.querySelector("#showLinks");
    const socialBots = document.querySelector("#social-bots");
    let charBoundary = charDay.getBoundingClientRect().bottom + 25;
    showLinks.style.top = `${charBoundary}px`;
    charBoundary = showLinks?.getBoundingClientRect().bottom + 5;
    socialBots.style.top = `${charBoundary}px`;
}
