#!/bin/bash

current=$(git rev-parse --abbrev-ref HEAD)

echo "Updating docs..."
git stash
git checkout gh-pages
git checkout $current docs/*
git checkout $current lib/*
git add -A
git commit -m "Updating docs"
git push origin gh-pages
git checkout $current
git stash apply

echo "Done!"
