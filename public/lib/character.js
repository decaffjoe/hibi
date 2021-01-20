"use strict";
// WHAT DOES THIS FILE DO?
// Gets daily show & character info from API and writes to 'public/data.json', that's it!
const url = "https://graphql.anilist.co", fs = require("fs"), md = require("markdown-it")({ html: true, linkify: true }), MD5 = require("crypto-js/md5"), nodeFetch = require("node-fetch");
main()
    .then(data => {
    fs.writeFile("../data.json", JSON.stringify(data, null, 2), "utf-8", (err) => {
        if (err) {
            console.log(err);
            throw err;
        }
        console.log("success");
    });
})
    .catch(err => console.log(err));
async function main() {
    try {
        // get top 100 shows - API FETCH
        const popularShows = await getPopularShows();
        // pick a 'random' show according to today's date
        const showId = selectRandomId(popularShows);
        // get list of characters from target show - API FETCH
        const showCharacters = await getShowCharacters(showId);
        // handle show titles (null or repeats)
        const showNames = showNameValidator(showCharacters.title);
        const showLinks = showCharacters.externalLinks;
        const showArt = showCharacters.coverImage;
        const showCharacterIds = showCharacters.characters.nodes;
        // pick a 'random' character from target show according to today's date
        const characterId = selectRandomId(showCharacterIds);
        // get character information - API FETCH
        const dailyCharacter = await getDailyCharacter(characterId);
        // handle character description (markdown or null)
        if (dailyCharacter.description) {
            dailyCharacter.description = md.render(dailyCharacter.description);
        }
        else {
            dailyCharacter.description =
                "(Oops, I guess this character is too cool to have a description!)";
        }
        // hande character names (null or repeats)
        const dailyCharacterNames = characterNameValidator(dailyCharacter.name);
        // get date (set static)
        const date = new Date().toDateString();
        return {
            showLinks: showLinks,
            showArt: showArt,
            showTitles: showNames,
            charNames: dailyCharacterNames,
            character: dailyCharacter,
            date,
        };
    }
    catch (err) {
        console.log(err);
    }
}
// Get daily character
async function getDailyCharacter(id) {
    try {
        let res = await nodeFetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                // GraphQL query
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
            }),
        });
        // await res.headers.forEach(header => console.log(header));
        let res_json = await res.json();
        let data = res_json.data.Character;
        console.log("Character ID: " + id);
        return data;
    }
    catch (err) {
        console.log(err);
        return err;
    }
}
// Get target show information
async function getShowCharacters(id) {
    try {
        let res = await nodeFetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                // GraphQL query
                query: `
                query getShowCharacters {
                    Media(id: ${id}) {
                        title {
                            english
                            romaji
                            native
                        }
                        characters(sort: FAVOURITES_DESC) {
                            nodes {
                                id
                            }
                        }
                        externalLinks {
                            id
                            url
                            site
                        }
                        coverImage {
                            extraLarge
                            large
                            medium
                            color
                        }
                    }
                }
                `,
            }),
        });
        let res_json = await res.json();
        let data = res_json.data.Media;
        console.log("Show ID: " + id);
        return data;
    }
    catch (err) {
        console.log(err);
        return err;
    }
}
// Get most popular shows
async function getPopularShows() {
    try {
        let res = await nodeFetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                // GraphQL query
                query: `
                query getPopularShows {
                    firstSet: Page(page: 1, perPage: 50) {
                        media(sort: POPULARITY_DESC) {
                            id
                        }
                    }
                    secondSet: Page(page: 2, perPage: 50) {
                        media(sort: POPULARITY_DESC) {
                            id
                        }
                    }
                }
                `,
            }),
        });
        // await res.headers.forEach(header => console.log(header));
        let res_json = await res.json();
        // join the first and second query alias results
        let data = [
            ...res_json.data.firstSet.media,
            ...res_json.data.secondSet.media,
        ];
        return data;
    }
    catch (err) {
        console.log(err);
        return [];
    }
}
function selectRandomId(arr) {
    return Math.floor(Math.random() * arr.length);
}
// Pick date-dependent value from array of objects w/ id
function selectDateId(arr) {
    const len = arr.length;
    let d = new Date();
    d = d.toLocaleDateString("en-US", { timeZone: "America/Chicago" });
    d = d.split("/").join("");
    const index = dateAlgo(d, len);
    return arr[index].id;
}
// Try to get random index within length of array from the current date MMDDYYYY
function dateAlgo(date, arrLen) {
    let hash = MD5(date).words[0];
    return Math.abs(hash) % arrLen;
}
// Avoid printing missing or duplicate show names
function showNameValidator(titles) {
    // get rid of titles that are null or undefined
    let realTitles = {};
    for (let [key, value] of Object.entries(titles)) {
        if (!(value === null || value === undefined)) {
            realTitles[key] = value;
        }
    }
    let japanese = "";
    // check if native is fully english, if not, segregate and do not compare with others
    // avoids deleting because of casing checks (japanese is one case)
    if (realTitles.native) {
        let onlyEnglish = true;
        // check if each letter is non-english
        for (let letter of realTitles.native) {
            if (!isEnglish(letter)) {
                onlyEnglish = false;
            }
        }
        if (!onlyEnglish) {
            japanese = realTitles.native;
            delete realTitles.native;
        }
    }
    // get rid of identical titles
    const deDuped = [];
    Object.values(realTitles).forEach(x => {
        if (!deDuped.includes(x)) {
            deDuped.push(x);
        }
    });
    // get rid of equivalent titles in lowercase (if a non-lowercase title exists)
    const deLowered = deDuped.filter(x => x !== x.toLowerCase());
    if (deLowered.length > 0) {
        // get rid of equivalent titles in uppercase (if a non-uppercase title exists)
        const deCased = deLowered.filter(x => x !== x.toUpperCase());
        if (deCased.length > 0) {
            return pushIfNonEmpty(deCased, japanese);
        }
        return pushIfNonEmpty(deLowered, japanese);
    }
    return pushIfNonEmpty(deDuped, japanese);
}
function characterNameValidator(names) {
    // if native is null or is the same as full
    if (!names.native ||
        names.full === names.native ||
        names.full.toLowerCase() === names.native ||
        names.full.toUpperCase() === names.native) {
        return [names.full];
    }
    return [names.full, names.native];
}
function isEnglish(char) {
    let code = char.charCodeAt(0);
    if (!(code > 31 && code < 128)) {
        return false;
    }
    return true;
}
function pushIfNonEmpty(arr, str) {
    if (str.length > 0) {
        return arr.concat(str);
    }
    return arr;
}
