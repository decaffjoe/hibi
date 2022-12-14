# What does this file do?
# Takes the data from data.json, sanitizes it & injects it into index.html

import os


def tagSpoilers(line):
    if '"description": "' in line:
        line = line.replace(
            "~!", "<span class='spoiler' title='live dangerously'>").replace("!~", "</span>")
    return line


# Update index.html with fresh data.json data
with open(os.environ['HIBI_DATA_FILEPATH']) as data, open(os.environ['HIBI_NEWINDEX_FILEPATH'], 'w') as new, open(os.environ['HIBI_INDEX_FILEPATH'], 'r') as old:
    skip = False
    for line in old:
        if not skip:
            new.write(line)
        # Start of JSON destination
        if line.strip() == '<script id="data" type="application/json">':
            for json in data:
                new.write(tagSpoilers(json))
            new.write('\n')
            # Don't copy the old JSON!
            skip = True
        # This is the end of the old JSON
        if line.strip() == '</script>':
            new.write(line)
            skip = False

