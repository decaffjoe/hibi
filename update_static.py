import os

# Update index.html with fresh data.json data
with open('./public/data.json') as data, open('./public/indexNEW.html', 'w') as new, open('./public/index.html', 'r') as old:
    skip = False
    for line in old:
        if not skip:
            new.write(line)
        # Start of JSON
        if '<script id="data" type="application/json">' in line:
            for json in data:
                new.write(json)
            new.write('\n')
            # Skip old JSON until end of JSON script tag
            skip = True
        if line.strip() == '</script>':
            new.write(line)
            skip = False

os.remove('./public/index.html')
os.rename('./public/indexNEW.html', './public/index.html')