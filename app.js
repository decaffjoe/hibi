"use strict";
const tooltip = "UwwwuuUu it's " + new Date().toLocaleTimeString(), char = {}, url = "https://graphql.anilist.co", body = document.body, charImage = document.querySelector('#charDay div'), charH1 = document.querySelector('#charDay h1'), charH2 = document.querySelector('#charDay h2'), charP = document.querySelector('#charDay p'), charTitles = document.querySelector('#charDay ul'), inputSearch = document.querySelector('input'), showResults = document.querySelector('#show-results');
// Tooltip for character of the day header
charH1.title = tooltip;
// DAILY CHARACTER
main();
async function main() {
    try {
        const popShows = await getPopularShows();
        const targetShowId = await selectDateId(popShows);
        const targetShow = await getShowCharacters(targetShowId);
        const targetShowNames = showNameValidator(targetShow.title);
        // Populate show titles on page (up to 3 unique titles from { romaji, english, native })
        for (let i = 0; i < 3; ++i) {
            charTitles.children[i].textContent = targetShowNames[i];
        }
        const targetShowChars = targetShow.characters.nodes;
        const targetCharId = await selectDateId(targetShowChars);
        const dailyChar = await getDailyCharacter(targetCharId);
        charImage.style.backgroundImage = `url("${dailyChar.image.large}")`;
        charH2.textContent = dailyChar.name.full;
        charP.innerHTML = dailyChar.description;
    }
    catch (err) {
        console.log(err);
    }
}
// Get daily character
async function getDailyCharacter(id) {
    try {
        let res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                // match ShowData type
                query: `
                query getDailyCharacter {
                    Character(id: ${id}) {
                      name {
                        first
                        last
                        full
                        native
                      }
                      description
                      image {
                        large
                        medium
                      }
                    }
                }
                `,
            })
        });
        res = await res.json();
        res = res.data.Character;
        return res;
    }
    catch (err) {
        console.log(err);
        return err;
    }
}
// Avoid printing duplicate show names from { romaji, english, native }
function showNameValidator(titles) {
    const results = Object.values(titles);
    // get rid of identical titles
    const deDuped = [];
    results.forEach(x => {
        if (!deDuped.includes(x)) {
            deDuped.push(x);
        }
    });
    // get rid of lowercase titles (if non-lowercase title exists)
    const deLowered = deDuped.filter(x => x !== x.toLowerCase());
    if (deLowered.length > 0) {
        // get rid of uppercase titles (if non-uppercase title exists)
        const deCased = deLowered.filter(x => x !== x.toUpperCase());
        if (deCased.length > 0) {
            return deCased;
        }
        return deLowered;
    }
    return deDuped;
}
// Get target show information
async function getShowCharacters(id) {
    try {
        let res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                // match ShowData type
                query: `
                query getShowCharacters {
                    Media(id: ${id}) {
                      title {
                        romaji
                        english
                        native
                      }
                      characters(sort: FAVOURITES_DESC) {
                        nodes {
                          id
                        }
                      }
                    }
                  }
                `,
            })
        });
        res = await res.json();
        res = res.data.Media;
        return res;
    }
    catch (err) {
        console.log(err);
        return err;
    }
}
// Pick date-dependent value from array of objects w/ id
function selectDateId(arr) {
    const len = arr.length;
    // const index = Math.floor(Math.random() * len);
    let d = new Date();
    d = d.toLocaleDateString();
    d = parseInt(d.split('/').join(''));
    const index = dateAlgo(d, len);
    return arr[index].id;
}
// Try to get random index within length of array from the current date MMDDYYYY
function dateAlgo(date, arrLen) {
    if (date.toString().length === 7) {
        return (((date % arrLen) + parseInt(date.toString().slice(0, 3))) % arrLen);
    }
    else {
        return (((date % arrLen) + parseInt(date.toString().slice(1, 4))) % arrLen);
    }
}
// Get most popular shows
async function getPopularShows() {
    try {
        let res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                // match ShowData type
                query: `
        query getPopularShows {
            firstSet: Page(page: 1, perPage: 50) {
              media(sort: POPULARITY_DESC) {
                id
              }
            }
            secondSet: Page(page: 2, perPage: 3) {
              media(sort: POPULARITY_DESC) {
                  id
              }
            }
          }
        `,
            })
        });
        res = await res.json();
        // join the first and second query alias results
        res = [...res.data.firstSet.media, ...res.data.secondSet.media];
        return res;
    }
    catch (err) {
        console.log(err);
        return [];
    }
}
// Create random rgb color and apply to property 'field' of event target's style
function randRGBEventStyler(e, field) {
    let rand = [1, 1, 1];
    rand = rand.map(x => Math.random() * 255);
    let bgRand = `rgb(${rand[0]}, ${rand[1]}, ${rand[2]})`;
    e.target.style = `${field}: ${bgRand};`;
}
;
