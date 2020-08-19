const Twitter = require('twitter-lite'),
    fetch = require('node-fetch');

async function main() {
    // get credentials from aws lambda
    let res, client, upload_client;
    res = await fetch('https://hotwu4uar1.execute-api.us-east-2.amazonaws.com/default/hibi-twitter-bot-auth');
    if (res.status === 200) {
        // authenticate to twitter API
        const { consumer_key, consumer_secret, access_token_key, access_token_secret } = await res.json();
        client = new Twitter({
            subdomain: "api",
            consumer_key,
            consumer_secret,
            access_token_key,
            access_token_secret
        });
        upload_client = new Twitter({
            subdomain: "upload",
            consumer_key,
            consumer_secret,
            access_token_key,
            access_token_secret
        });
    } else console.log(`aws failure: received code ${res.status}`);

    // retrieve tweet data from data.json (assume data up-to-date)
    const data = require('./public/data.json');
    const character = data['character'];
    const name = character['name']['full'];
    // description = character['description'];

    // get image url
    let imgLink, imgBuffer;
    if (character['image']) imgLink = character['image']['medium'] || character['image']['large'] || character['image']['small'];
    // download image to buffer
    if (imgLink) {
        res = await fetch(imgLink);
        imgBuffer = await res.buffer();
    }
    // upload image to twitter, get media_id (UNSUPPORTED BY TWITTER-LITE????)
    try {
        res = await upload_client.post("media/upload", {
            media: imgBuffer
            // media_data: Buffer.from(imgBuffer).toString('base64')
        });
        res = await res.json();
    } catch(err) { console.log('upload image error: '); console.error(err['errors']); }
    let media_id =  res['media_id_string'];

    // post the tweet
    try {
        await client.post("statuses/update", {
            status: `Here is ${name}`,
            media_ids: media_id
        });
    } catch(err) { console.log('tweet error: '); console.error(err['errors']); }
}

main().catch(err => console.log(err));
