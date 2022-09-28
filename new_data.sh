#!/usr/bin/bash
export HIBI_DATA_FILEPATH="$HOME/code/hibi/public/data.json"
export HIBI_NEWINDEX_FILEPATH="$HOME/code/hibi/public/indexNEW.html"
export HIBI_INDEX_FILEPATH="$HOME/code/hibi/public/index.html"

cd ./public/lib/ || return 1
node character.js
python update_static.py

mv "$HIBI_NEWINDEX_FILEPATH" "$HIBI_INDEX_FILEPATH"
