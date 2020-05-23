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