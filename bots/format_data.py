import re, json, requests

def regex_sub(pattern, new_text, body):
    regex = re.compile(pattern)
    return re.sub(regex, new_text, body)

def clean_description(desc):
    # Replace (a) line breaks with end of sentence
    desc = regex_sub('(\r\n)+|\r+|\n+|\t+|\\n+', '.', desc)
    # Remove (a) html tags/codes e.g. '<p>' or '&quot;' and (b) spoilers e.g. '~!she dies in an avalance!~'
    desc = regex_sub('<.*?>|&([a-z0-9]+|#[0-9]{1,6}|#x[0-9a-f]{1,6});|~!.*?!~', '', desc)
    # Replace all periods with a period and space
    desc = regex_sub('(\r\n)+|\r+|\n+|\t+|\\n+', '. ', desc)
    # Make all spacing one-space-wide
    desc = regex_sub(' +', ' ', desc)
    # Get rid of any ' . ' remnants
    return regex_sub(' \. ', '', desc)

def shorten_status(status, status_closing, status_limit):
    if len(status) > status_limit:
        status = status[:(status_limit - len(status_closing))] + status_closing
    return status

def main(service):
    # Retrieve character data (assume data.json up-to-date)
    data = json.load(open('../public/data.json', mode='r'))
    char = data['character']
    char_name = char['name']['full']
    char_desc = char['description']

    # Get rid of html tags, spoilers and weird spacing
    char_desc = clean_description(char_desc)

    # Pick character image
    if char['image']['large']:
        char_image_link = char['image']['large']
    elif char['image']['medium']:
        char_image_link = char['image']['medium']
    else:
        char_image_link = char['image']['small']

    # Download image binary to buffer
    r = requests.get(char_image_link)
    if r.status_code != 200:
        print('Image download error')
        print(r.json())
    image = r.content

    # Get show name in english
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
    else:
        limit = 300

    # Put together status
    smiley = u'\U0001f604'
    status = f"The character of the day is {char_name} from {show} {smiley}\n{char_desc}"
    ending = "..."
    status = shorten_status(status, ending, limit)

    return { 'image': image, 'status': status, 'ending': ending, 'limit': limit }

