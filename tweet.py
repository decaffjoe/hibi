import requests, json, re, os
from TwitterAPI import TwitterAPI

def regex_sub(pattern, new_text, body):
    regex = re.compile(pattern)
    return re.sub(regex, new_text, body)

def shorten_tweet(tweet, tweet_closing, tweet_limit):
    if len(tweet) > tweet_limit:
        tweet = tweet[:(tweet_limit - len(tweet_closing))] + tweet_closing
    return tweet

def send_tweet(tweet, img):
    r = api.request('statuses/update', { 'status': tweet, 'media_ids': img })
    return { 'status_code': r.status_code, 'json': r.json() }

# Get credentials from gitlab ci env variables
creds = {}
env_vars = ['CONSUMER_KEY', 'CONSUMER_SECRET', 'ACCESS_TOKEN_KEY', 'ACCESS_TOKEN_SECRET']
for key in env_vars:
    creds[key] = os.environ[key]

# Authenticate to twitter as user
api = TwitterAPI(creds['CONSUMER_KEY'], creds['CONSUMER_SECRET'], creds['ACCESS_TOKEN_KEY'], creds['ACCESS_TOKEN_SECRET'])

# Retrieve character data (assume data.json up-to-date)
data = json.load(open('./public/data.json', mode='r'))
char = data['character']
char_name = char['name']['full']
char_desc = char['description']
# Get first name, if it exists
char_short_name = char_name.lower()
if char['name']['first']:
    char_short_name = char['name']['first'].lower()

# Cleanup description (todo: do less...)
# Replace (a) line breaks with end of sentence
char_desc = regex_sub('(\r\n)+|\r+|\n+|\t+|\\n+', '.', char_desc)
# Remove (a) html tags/codes e.g. '<p>' or '&quot;' and (b) spoilers e.g. '~!she dies in an avalance!~'
char_desc = regex_sub('<.*?>|&([a-z0-9]+|#[0-9]{1,6}|#x[0-9a-f]{1,6});|~!.*?!~', '', char_desc)
# Replace all periods with a period and space
char_desc = regex_sub('(\r\n)+|\r+|\n+|\t+|\\n+', '. ', char_desc)
# Make all spacing one-space-wide
char_desc = regex_sub(' +', ' ', char_desc)
# Get rid of any ' . ' remnants
char_desc = regex_sub(' \. ', '', char_desc)

# Spell out show name but overwrite with twitter handle if show has an account
show = data['showTitles'][0]
for link in data['showLinks']:
    if link['site'] == 'Twitter':
        show = '@' + link['url'].split('/')[-1]
        break
# Put together status
smiley = u'\U0001f604'
status = f"The character of the day is {char_name} from {show} {smiley}\n{char_desc}"
ending = "..."
# ending = f" ...sorry {char_short_name} we're out of space, くそ!"
# twitter 280 character limit per tweet & emoji counts as 2 chars (already have a smiley)
limit = 278
status = shorten_tweet(status, ending, limit)

# Get character image
if char['image']['large']:
    char_image_link = char['image']['large']
elif char['image']['medium']:
    char_image_link = char['image']['medium']
else:
    char_image_link = char['image']['small']
# Get image binary
r = requests.get(char_image_link)
if r.status_code != 200:
    print('Image download error')
    print(r.json())
image = r.content

# Upload media and get media_id
r = api.request('media/upload', None, { 'media': image })
if r.status_code != 200:
    print('Media upload error')
media_id = r.json()['media_id']

# Post tweet
r = send_tweet(status, media_id)
while r['status_code'] != 200:
    retry = False
    for error in r['json']['errors']:
        # If tweet was too long, shorten description and try again
        if error['code'] == 186:
            limit -= 2
            status = shorten_tweet(status, ending, limit)
            r = send_tweet(status, media_id)
            retry = True
            break
    if retry == True:
        continue
    else:
        print('Tweet post error')
        print(r['json'])
        break
