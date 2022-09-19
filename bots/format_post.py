import os
import re
import json
import requests


def regex_sub(pattern, new_text, string):
    regex = re.compile(pattern)
    return re.sub(regex, new_text, string)


def clean_description(desc):
    # Remove (a) html tags/codes e.g. '<p>' or '&quot;' and (b) spoilers e.g. '~!she dies in an avalance!~'
    def remove_html_spoilers(string):
        return regex_sub('<.*?>|&([a-z0-9]+|#[0-9]{1,6}|#x[0-9a-f]{1,6});|~!.*?!~', '', string)

    # Replace all line breaks & end-of-sentences with a period and space
    def replace_with_sentence(string):
        return regex_sub('(\r\n)+|\r+|\n+|\t+|\\n+|\.', '. ', string)

    # Make all spacing one-space-wide
    def normalize_spacing(string):
        return regex_sub(' +', ' ', string)

    # Get rid of any ' . ' remnants
    def remove_stragglers(string):
        return regex_sub(' \. ', '', string)

    return remove_stragglers(normalize_spacing(replace_with_sentence(remove_html_spoilers(desc))))


def shorten_status(status, status_closing, status_limit):
    if len(status) > status_limit:
        status = status[:(status_limit - len(status_closing))] + status_closing
    return status


def image_mime(extension):
    mimes = {
        'image/bmp': ['.bmp'],
        'image/gif': ['.gif'],
        'image/png': ['.png'],
        'image/svg+xml': ['.svg'],
        'image/vnd.microsoft.icon': ['.ico'],
        'image/tiff': ['.tif', '.tiff'],
        'image/webp': ['.webp'],
        'image/jpeg': ['.jpg', '.jpeg']
    }
    for mime in mimes:
        for ext in mimes[mime]:
            if ext == extension:
                return mime
    raise ValueError('Unsupported image type')


def main(service):
    # Retrieve character data (assume data.json up-to-date)
    data = json.load(open(os.environ['HIBI_DATA_FILEPATH'], mode='r'))
    char = data['character']
    char_name = char['name']['full']
    if char['description']:
        char_desc = char['description']
    else:
        char_desc = f"({char['name']['first']} doesn't have a description. That's ok, we'll celebrate them anyways!)"

    # Get rid of html tags, spoilers and weird spacing
    char_desc = clean_description(char_desc)

    # Pick character image
    if char['image']['large']:
        char_image_link = char['image']['large']
    elif char['image']['medium']:
        char_image_link = char['image']['medium']
    elif char['image']['small']:
        char_image_link = char['image']['small']
    else:
        raise KeyError("char['image'] contains no links")

    # Save image mime type
    image_mime_type = image_mime('.' + char_image_link.split('.')[-1])

    # Download image binary to buffer
    r = requests.get(char_image_link)
    if r.status_code != 200:
        print('Image download error')
        raise Exception(r.json())
    image = r.content

    # Get show name in english (first title listed)
    show = data['showTitles'][0]

    # Twitter:
    if service == 'twitter':
        # Overwrite show name with username if show has an account
        for link in data['showLinks']:
            if link['site'] == 'Twitter':
                show = '@' + link['url'].split('/')[-1]
                break
        # 280 character limit per tweet & emoji counts as 2 chars (already have a smiley)
        limit = 278

    # Mastodon:
    elif service == 'mastodon':
        # 500 character limit per toot & emoji counts as 2 chars (already have a smiley)
        limit = 498
    else:
        raise ValueError("Please specify 'twitter' or 'mastodon'")

    # Put together status
    smiley = u'\U0001f604'
    status = f"The #anime character of the day is {char_name} from {show} {smiley}\n{char_desc}"
    ending = "..."
    status = shorten_status(status, ending, limit)

    return {'image': image, 'image_mime_type': image_mime_type, 'status': status, 'ending': ending, 'limit': limit}
