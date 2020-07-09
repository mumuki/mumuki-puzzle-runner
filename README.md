[![Stories in Ready](https://badge.waffle.io/mumuki/mumuki-puzzle-runner.png?label=ready&title=Ready)](https://waffle.io/mumuki/mumuki-puzzle-runner)
[![Build Status](https://travis-ci.org/mumuki/mumuki-puzzle-runner.svg?branch=master)](https://travis-ci.org/mumuki/mumuki-puzzle-runner)
[![Code Climate](https://codeclimate.com/github/mumuki/mumuki-puzzle-runner/badges/gpa.svg)](https://codeclimate.com/github/mumuki/mumuki-puzzle-runner)
[![Test Coverage](https://codeclimate.com/github/mumuki/mumuki-puzzle-runner/badges/coverage.svg)](https://codeclimate.com/github/mumuki/mumuki-puzzle-runner)

> mumuki-puzzle-runner

# Install the server

```bash
bundle install
```

# Run the server

```bash
RACK_ENV=development rackup -p 4567
```

# Test format

```javascript
Muzzle.basic(10, 20, "kibi.png");
```

# Solution format

The solution accepted by this runner is a JSON string with the following format:

```json
{
  "positions": [
    [10, 20],
    [15, 20],
    [20, 20],
    [10, 25],
    [15, 25],
    [20, 25]
  ]
}:
```

# Muzzle API :muscle:

## `Muzzle.basic`

## `Muzzle.submit`
