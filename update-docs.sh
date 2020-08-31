#!/bin/bash

echo "Updating docs..."
git stash
git checkout gh-pages
git checkout master docs/*
git checkout master lib/*
git add -A
git commit -m "Updating docs"
git push origin gh-pages
git checkout master
git stash apply

echo "Done!"
