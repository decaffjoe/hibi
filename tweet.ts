const Twitter = require('twitter-lite'),
    nodeFetch = require('node-fetch');

async function main() {
    // get credentials from aws lambda
    const res = await nodeFetch('https://hotwu4uar1.execute-api.us-east-2.amazonaws.com/default/hibi-twitter-bot-auth');
    if (res.status === 200) {
        const { consumer_key, consumer_secret, access_token_key, access_token_secret } = await res.json();
        const client = new Twitter({
            consumer_key,
            consumer_secret,
            access_token_key,
            access_token_secret
        });
        // retrieve tweet data from data.json

        // post the tweet
        // await client.post("statuses/update", {
        //     status,
        //     media_ids
        // });
    } else {
        console.log(`aws failure: received code ${res.status}`);
    }

}

main().catch(err => console.log(err));
