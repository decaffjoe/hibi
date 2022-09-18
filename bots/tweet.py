import os
from TwitterAPI import TwitterAPI
from format_post import main, shorten_status


def send_tweet(tweet, img):
    r = api.request('statuses/update', {'status': tweet, 'media_ids': img})
    return {'status_code': r.status_code, 'json': r.json()}


# Import formatted data
data = main('twitter')
image = data['image']
status = data['status']
ending = data['ending']
limit = data['limit']

# Get credentials from gitlab ci env variables ('T_...' for Twitter)
creds = {}
env_vars = ['T_CONSUMER_KEY', 'T_CONSUMER_SECRET',
            'T_ACCESS_TOKEN_KEY', 'T_ACCESS_TOKEN_SECRET']
for key in env_vars:
    creds[key] = os.environ.get(key)

# Authenticate to twitter as user
api = TwitterAPI(creds['T_CONSUMER_KEY'], creds['T_CONSUMER_SECRET'],
                 creds['T_ACCESS_TOKEN_KEY'], creds['T_ACCESS_TOKEN_SECRET'])

# Upload media and get media_id
r = api.request('media/upload', None, {'media': image})
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
            status = shorten_status(status, ending, limit)
            r = send_tweet(status, media_id)
            retry = True
            break
    if retry == True:
        continue
    else:
        print('Tweet post error')
        print(r['json'])
        break
