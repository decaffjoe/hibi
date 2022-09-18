#!/usr/bin/bash
cd public/lib/
node character.js

export DATA_FILEPATH='../data.json'
export NEWINDEX_FILEPATH='../indexNEW.html'
export INDEX_FILEPATH='../index.html'
python update_static.py
