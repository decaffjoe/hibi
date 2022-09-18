#!/usr/bin/bash
cd public/lib/
node character.js

DATA_FILEPATH='../data.json'
NEWINDEX_FILEPATH='../indexNEW.html'
INDEX_FILEPATH='../index.html'
python update_static.py
