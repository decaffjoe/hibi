import os
from mastodon import Mastodon, MastodonAPIError
from format_post import main, shorten_status

# Import formatted data
data = main('mastodon')
image = data['image']
image_mime_type = data['image_mime_type']
status = data['status']
ending = data['ending']
limit = data['limit']

# Authenticate to mastodon
mastodon = Mastodon(
    # Get credential from gitlab ci env var ('M_...' for Mastodon)
    access_token=os.environ.get('M_ACCESS_TOKEN'),
    api_base_url='https://botsin.space'
)

# Upload media and get media_id
r = mastodon.media_post(image, image_mime_type)
media_ids = []
media_ids.append(r['id'])

# Post toot
while True:
    try:
        mastodon.status_post(status, None, media_ids)
        break
    except MastodonAPIError as e:
        # If character limit exceeded (code 422) shorten and try again
        if '422' in e.__str__():
            limit -= 2
            status = shorten_status(status, ending, limit)
            continue
    except Exception as e:
        print('Toot post error: ')
        print(e)
        break
