import requests
import json
from TwitterAPI import TwitterAPI

# Get credentials from aws lambda
res = requests.get('https://hotwu4uar1.execute-api.us-east-2.amazonaws.com/default/hibi-twitter-bot-auth')
if res.status_code != 200:
    print('uh oh')
creds = res.json()

# Authenticate to twitter as user
api = TwitterAPI(creds['consumer_key'], creds['consumer_secret'], creds['access_token_key'], creds['access_token_secret'])

# Retrieve and format tweet data (assume data.json up-to-date)
data = json.load(open('./public/data.json', mode='r'))
char = data['character']
char_name = char['name']['full']
char_desc = char['description']
if char['image']['large']:
    char_image_link = char['image']['large']
elif char['image']['medium']:
    char_image_link = char['image']['medium']
else:
    char_image_link = char['image']['small']
# Get image binary
r = requests.get(char_image_link)
image = r.content

# Upload media and post tweet
r = api.request('media/upload', None, { 'media': image })
media_id = r.json()['media_id']
r = api.request('statuses/update', { 'status': f"Here's {char_name}!", 'media_ids': media_id })
