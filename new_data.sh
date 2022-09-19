#!/usr/bin/bash
export HIBI_DATA_FILEPATH='/home/sponge/code/hibi/public/data.json'
export HIBI_NEWINDEX_FILEPATH='/home/sponge/code/hibi/public/indexNEW.html'
export HIBI_INDEX_FILEPATH='/home/sponge/code/hibi/public/index.html'

cd public/lib/
node character.js
python update_static.py

mv $NEWINDEX_FILEPATH $INDEX_FILEPATH
