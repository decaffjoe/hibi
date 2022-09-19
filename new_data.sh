#!/usr/bin/bash
cd public/lib/
node character.js

export DATA_FILEPATH='/home/sponge/code/hibi/public/data.json'
export NEWINDEX_FILEPATH='/home/sponge/code/hibi/public/indexNEW.html'
export INDEX_FILEPATH='/home/sponge/code/hibi/public/index.html'
python update_static.py

cat $NEWINDEX_FILEPATH
mv $NEWINDEX_FILEPATH $INDEX_FILEPATH
cat $INDEX_FILEPATH
