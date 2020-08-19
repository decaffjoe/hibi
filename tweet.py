import requests, json, re
from TwitterAPI import TwitterAPI

# Get credentials from aws lambda
r = requests.get('https://hotwu4uar1.execute-api.us-east-2.amazonaws.com/default/hibi-twitter-bot-auth')
if r.status_code != 200:
    print('AWS error')
    print(r.json())
creds = r.json()

# Authenticate to twitter as user
api = TwitterAPI(creds['consumer_key'], creds['consumer_secret'], creds['access_token_key'], creds['access_token_secret'])

# Retrieve character data (assume data.json up-to-date)
data = json.load(open('./public/data.json', mode='r'))
char = data['character']
char_name = char['name']['full']
char_desc = char['description']

# Cleanup description
# Replace (a) line breaks with end of sentence
cleanr = re.compile('(\r\n)+|\r+|\n+|\t+|\\n+')
char_desc = re.sub(cleanr, '.', char_desc)
# Remove (a) html tags/codes e.g. '<p>' or '&quot;' and (b) spoilers e.g. '~!she dies in an avalance!~'
cleanr = re.compile('<.*?>|&([a-z0-9]+|#[0-9]{1,6}|#x[0-9a-f]{1,6});|~!.*?!~')
char_desc = re.sub(cleanr, '', char_desc)
# Replace all periods with a period and space
cleanr = re.compile('\.')
char_desc = re.sub(cleanr, '. ', char_desc)
# Make all spacing one-space-wide
cleanr = re.compile(' +')
char_desc = re.sub(cleanr, ' ', char_desc)

# Spell out show name but overwrite with twitter handle if show has an account
show = data['showTitles'][0]
for link in data['showLinks']:
    if link['site'] == 'Twitter':
        show = '@' + link['url'].split('/')[-1]
        break
# Put together status
emoji = u'\U0001f604'
status = f"The character of the day is {char_name} from {show} {emoji}\n{char_desc}"
# twitter 280 character limit per tweet (emoji counts as 3 chars in a tweet?)
if len(status) > 277:
    ending = f"... sorry {char['name']['first'].lower()} we're out of space, くそ!"
    status = status[:(277 - len(ending))] + ending

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

# Upload media and post tweet
r = api.request('media/upload', None, { 'media': image })
if r.status_code != 200:
    print('Media upload error')
media_id = r.json()['media_id']
r = api.request('statuses/update', { 'status': status, 'media_ids': media_id })
if r.status_code != 200:
    print('Tweet post error')
    print(r.json())
