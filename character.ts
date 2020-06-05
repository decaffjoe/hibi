const url = "https://graphql.anilist.co",
    fs = require('fs'),
    md = require('markdown-it')({ html: true, linkify: true }),
    MD5 = require('crypto-js/md5'),
    nodeFetch = require('node-fetch');

// WHAT DOES THIS FILE DO?
// Gets daily show & character info from API and writes to 'public/data.json', that's it!

main().then(data => {
    fs.writeFile('./public/data.json', JSON.stringify(data, null, 2), 'utf-8', (err: any) => {
        if (err) {
            console.log(err);
            throw err;
        }
        console.log('success');
    });
});

async function main() {
    try {
        // get top 100 shows - API FETCH
        const popShows = await getPopularShows();

        // pick a 'random' show according to today's date
        const targetShowId = selectDateId(popShows);

        // get list of characters from target show - API FETCH
        const targetShow = await getShowCharacters(targetShowId);

        // handle show titles (null or repeats)
        const targetShowNames = showNameValidator(targetShow.title);
        const targetShowLinks = targetShow.externalLinks;
        const targetShowArt = targetShow.coverImage;

        const targetShowChars = targetShow.characters.nodes;
        // pick a 'random' character from target show according to today's date
        const targetCharId = selectDateId(targetShowChars);

        // get character information - API FETCH
        const dailyChar = await getDailyCharacter(targetCharId);

        // handle character description (markdown or null)
        if (dailyChar.description) {
            dailyChar.description = md.render(dailyChar.description);
        } else {
            dailyChar.description = '(Oops, I guess this character is too cool to have a description!)';
        }
        // hande character names (null or repeats)
        const dailyCharNames = charNameValidator(dailyChar.name);
        return {
            showLinks: targetShowLinks,
            showArt: targetShowArt,
            showTitles: targetShowNames,
            charNames: dailyCharNames,
            character: dailyChar,
        };
    } catch (err) {
        console.log(err);
    }
}

// Get daily character
async function getDailyCharacter(id: number): Promise<dailyCharacter> {
    try {
        let res: any = await nodeFetch(url, {
            method: "POST",
            headers: {
                "Content-Type": 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
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
        // await res.headers.forEach(header => console.log(header));
        res = await res.json();
        res = res.data.Character;
        console.log('Character ID: ' + id);
        return res;
    } catch (err) {
        console.log(err);
        return err;
    }
}

// Get target show information
async function getShowCharacters(id: number): Promise<showCharacters> {
    try {
        let res: any = await nodeFetch(url, {
            method: "POST",
            headers: {
                "Content-Type": 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
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
            })
        });
        res = await res.json();
        res = res.data.Media;
        console.log('Show ID: ' + id);
        return res;
    } catch (err) {
        console.log(err);
        return err;
    }
}

// Get most popular shows
async function getPopularShows(): Promise<popularShows[]> {
    try {
        let res: any = await nodeFetch(url, {
            method: "POST",
            headers: {
                "Content-Type": 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
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
            })
        });
        // await res.headers.forEach(header => console.log(header));
        res = await res.json();
        // join the first and second query alias results
        res = [...res.data.firstSet.media, ...res.data.secondSet.media];
        return res;
    } catch (err) {
        console.log(err);
        return [];
    }
}

// Pick date-dependent value from array of objects w/ id
function selectDateId(arr: any[]): number {
    const len = arr.length;

    let d: any = new Date();
    d = d.toLocaleDateString('en-US', { timeZone: "America/Chicago" });
    d = d.split('/').join('');

    const index = Math.floor(Math.random() * len);

    return arr[index].id;
}

// Try to get random index within length of array from the current date MMDDYYYY
function dateAlgo(date: string, arrLen: number): number {
    let hash = MD5(date).words[0];
    return Math.abs(hash) % arrLen;
}

// Avoid printing missing or duplicate show names
function showNameValidator(titles: showTitles): string[] {

    // get rid of titles that are null or undefined
    let realTitles: { [key: string]: string } = {};
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
    const deDuped: string[] = [];
    Object.values(realTitles).forEach(x => {
        if (!deDuped.includes(x)) {
            deDuped.push(x)
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

function charNameValidator(names: any): string[] {
    // if native is null or is the same as full
    if (!names.native || names.full === names.native || names.full.toLowerCase() === names.native || names.full.toUpperCase() === names.native) {
        return [names.full];
    }
    return [names.full, names.native];
}

function isEnglish(char: string) {
    let code = char.charCodeAt(0);
    if (!(code > 31 && code < 128)) {
        return false;
    }
    return true;
}

function pushIfNonEmpty(arr: any[], str: string): any[] {
    if (str.length > 0) {
        return arr.concat(str);
    }
    return arr;
}

// match getShowNames fetch query
interface popularShows {
    id: number
}

interface showTitles {
    english: string | null,
    romaji: string | null,
    native: string | null,
}

interface showCharacters {
    title: {
        english: string | null,
        romaji: string | null,
        native: string | null,
    },
    characters: {
        nodes: [
            {
                id: number
            }
        ]
    },
    externalLinks: [{
        id: number,
        url: string,
        site: string
    }],
    coverImage: {
        extraLarge: string | null,
        large: string | null,
        medium: string | null,
        color: string | null,
    }
}

interface dailyCharacter {
    name: {
        first: string | null,
        last: string | null,
        full: string | null,
        native: string | null
    },
    description: string | null,
    image: {
        large: string | null,
        medium: string | null
    }
}