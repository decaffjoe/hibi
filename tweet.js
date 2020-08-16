"use strict";
const Twitter = require('twitter-lite'), fetch = require('node-fetch');
async function main() {
    // get credentials from aws lambda
    let res;
    res = await fetch('https://hotwu4uar1.execute-api.us-east-2.amazonaws.com/default/hibi-twitter-bot-auth');
    if (res.status === 200) {
        // authenticate to twitter API
        const { consumer_key, consumer_secret, access_token_key, access_token_secret } = await res.json();
        const client = new Twitter({
            consumer_key,
            consumer_secret,
            access_token_key,
            access_token_secret
        });
    }
    else
        console.log(`aws failure: received code ${res.status}`);
    // retrieve tweet data from data.json (assume data up-to-date)
    const data = require('./public/data.json');
    const character = data['character'];
    // get image url
    let imageLink;
    if (character['image'])
        imageLink = character['image']['medium'] || character['image']['large'] || character['image']['small'];
    // download image to buffer
    if (imageLink) {
        res = await fetch(imageLink);
        let imgBuffer = await res.buffer();
        console.log('image buffer:');
        console.log(imgBuffer);
    }
    // upload image to twitter, get media_id
    res = await fetch('https://upload.twitter.com/1.1/media/upload.json', {
        method: "POST",
        body: {
            media: imgBuffer,
        },
    });
    // format tweet status (character name & description)
    const name = character['name']['full'], description = character['description'];
    // post the tweet
    // await client.post("statuses/update", {
    //     status,
    //     media_ids
    // });
}
main().catch(err => console.log(err));
