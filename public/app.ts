const tooltip = "UwwwuuUu it's " + new Date().toLocaleTimeString(),
    headerH1 = document.querySelector('#header h1'),
    headerH3 = document.querySelector('#header h3'),
    charImage = document.querySelector('#charDay div#photo'),
    charDesc = document.querySelector('#charDay div#description'),
    charNames = document.querySelector('#charDay ul#names'),
    charTitles = document.querySelector('#charDay ul#titles'),
    scriptData = document.querySelector('script#data');

// Parse JSON in script tag
const DATA = JSON.parse(scriptData.textContent);

// Fluff for the headers
headerH1.title = tooltip;
headerH3.textContent = new Date().toDateString();

// Populate character names
for (let i = 0; i < 2; ++i) {
    charNames.children[i].textContent = DATA.charNames[i];
}

// Populate show titles on page (up to 3 unique titles from { romaji, english, native })
for (let i = 0; i < 3; ++i) {
    charTitles.children[i].textContent = DATA.showTitles[i];
}

charImage.style.backgroundImage = `url("${DATA.character.image.large}")`;
charDesc.innerHTML = '<p id="spoiler-info">*click on spoilers to view*</p>' + DATA.character.description;

// Limit and add scrollbar for large descriptions >400px
if (charDesc.clientHeight > 400) {
    charDesc.classList.add('condensed');
}

// Toggle spoilers
const spoilers = document.querySelectorAll('span.spoiler');
for (let i = 0; i < spoilers.length; ++i) {
    spoilers[i].addEventListener('click', () => {
        spoilers[i].classList.toggle('show-spoiler');
    });
}

// Show cover art on official site link
const showArt = DATA.showArt;
const officialImg = document.querySelector('#official-link img');
officialImg.setAttribute('src', showArt['medium']);

// Show links
const links = DATA.showLinks;
const official = document.querySelector('#official-link');
const netflix = document.querySelector('#netflix-link');
const crunchyroll = document.querySelector('#crunchyroll-link');
const tubi = document.querySelector('#tubi-link');
const funimation = document.querySelector('#funimation-link');
const hulu = document.querySelector('#hulu-link');
const amazon = document.querySelector('#amazon-link');
const hbomax = document.querySelector('#hbomax-link');
const animelab = document.querySelector('#animelab-link');
const hidive = document.querySelector('#hidive-link');
const vrv = document.querySelector('#vrv-link');
const viz = document.querySelector('#viz-link');
const twitter = document.querySelector('#twitter-link');
const linkDirectory = {
    'Twitter': twitter,
    'Netflix': netflix,
    'Crunchyroll': crunchyroll,
    'Tubi TV': tubi,
    'Funimation': funimation,
    'Hulu': hulu,
    'Amazon': amazon,
    'HBO Max': hbomax,
    'AnimeLab': animelab,
    'Hidive': hidive,
    'VRV': vrv,
    'Viz': viz,
    'Official Site': official,
};
console.log(links);

for (let link of links) {
    if (linkDirectory[link['site']]) {
        linkDirectory[link['site']].href = link['url'];
        linkDirectory[link['site']].classList.remove('hidden');
    } else {
        console.log('ayyy lmao');
    }
}
