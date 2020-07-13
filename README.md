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

## Constants

<dl>
<dt><a href="#Muzzle">Muzzle</a></dt>
<dd><p>Facade for referencing and creating a global puzzle canvas,
handling solutions persistence and submitting them</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#PieceConfig">PieceConfig</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#Point">Point</a> : <code>Array.&lt;number&gt;</code></dt>
<dd></dd>
<dt><a href="#Solution">Solution</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="Muzzle"></a>

## Muzzle
Facade for referencing and creating a global puzzle canvas,
handling solutions persistence and submitting them

**Kind**: global constant

* [Muzzle](#Muzzle)
    * [.canvas](#Muzzle.canvas)
    * [.canvasId](#Muzzle.canvasId)
    * [.expectedRefsAreOnlyDescriptive](#Muzzle.expectedRefsAreOnlyDescriptive)
    * [.previousSolutionJson](#Muzzle.previousSolutionJson) : <code>string</code>
    * [.solution](#Muzzle.solution) ⇒ [<code>Solution</code>](#Solution)
    * [._solutionJson](#Muzzle._solutionJson)
    * [.draw()](#Muzzle.draw)
    * [.expect(refs)](#Muzzle.expect)
    * [.basic(x, y, imagePath)](#Muzzle.basic) ⇒ <code>Promise.&lt;Canvas&gt;</code>
        * [~image](#Muzzle.basic..image)
        * [~canvas](#Muzzle.basic..canvas) : <code>Canvas</code>
    * [.multi(configs)](#Muzzle.multi) ⇒ <code>Promise.&lt;Canvas&gt;</code>
    * [.match(lefts, rights)](#Muzzle.match) ⇒ <code>Promise.&lt;Canvas&gt;</code>
        * [~canvas](#Muzzle.match..canvas) : <code>Canvas</code>
    * [.custom(canvas)](#Muzzle.custom) ⇒ <code>Promise.&lt;Canvas&gt;</code>
    * [.onReady()](#Muzzle.onReady)
    * [._configInitialCanvas(canvas)](#Muzzle._configInitialCanvas)
    * [.loadSolution(solution)](#Muzzle.loadSolution)
    * [.loadPreviousSolution()](#Muzzle.loadPreviousSolution)
    * [.onSubmit(solutionJson, valid)](#Muzzle.onSubmit)
    * [.submit()](#Muzzle.submit)

<a name="Muzzle.canvas"></a>

### Muzzle.canvas
The currently active canvas, or null if
it has not yet initialized

**Kind**: static property of [<code>Muzzle</code>](#Muzzle)
<a name="Muzzle.canvasId"></a>

### Muzzle.canvasId
The id of the HTML element that will contain the canvas
Override it you are going to place in a non-standard way

**Kind**: static property of [<code>Muzzle</code>](#Muzzle)
<a name="Muzzle.expectedRefsAreOnlyDescriptive"></a>

### Muzzle.expectedRefsAreOnlyDescriptive
Wether expected refs shall be ignored by Muzzle.

They will still be evaluated server-side.

**Kind**: static property of [<code>Muzzle</code>](#Muzzle)
<a name="Muzzle.previousSolutionJson"></a>

### Muzzle.previousSolutionJson : <code>string</code>
The previous solution to the current puzzle in this or a past session,
if any

**Kind**: static property of [<code>Muzzle</code>](#Muzzle)
<a name="Muzzle.solution"></a>

### Muzzle.solution ⇒ [<code>Solution</code>](#Solution)
The state of the current puzzle
expressed as a Solution object

**Kind**: static property of [<code>Muzzle</code>](#Muzzle)
<a name="Muzzle._solutionJson"></a>

### Muzzle.\_solutionJson
The current solution, expressed as a JSON string

**Kind**: static property of [<code>Muzzle</code>](#Muzzle)
<a name="Muzzle.draw"></a>

### Muzzle.draw()
Draws the - previusly built - current canvas.

Prefer {@code this.currentCanvas.redraw()} when performing
small updates to the pieces.

**Kind**: static method of [<code>Muzzle</code>](#Muzzle)
<a name="Muzzle.expect"></a>

### Muzzle.expect(refs)
**Kind**: static method of [<code>Muzzle</code>](#Muzzle)

| Param | Type |
| --- | --- |
| refs | [<code>Array.&lt;Point&gt;</code>](#Point) |

<a name="Muzzle.basic"></a>

### Muzzle.basic(x, y, imagePath) ⇒ <code>Promise.&lt;Canvas&gt;</code>
Creates a basic puzzle canvas with a rectangular shape
and a background image, that is automatically
submitted when solved

**Kind**: static method of [<code>Muzzle</code>](#Muzzle)
**Returns**: <code>Promise.&lt;Canvas&gt;</code> - the promise of the built canvas

| Param | Type | Description |
| --- | --- | --- |
| x | <code>number</code> | the number of horizontal pieces |
| y | <code>number</code> | the number of vertical pieces |
| imagePath | <code>string</code> |  |


* [.basic(x, y, imagePath)](#Muzzle.basic) ⇒ <code>Promise.&lt;Canvas&gt;</code>
    * [~image](#Muzzle.basic..image)
    * [~canvas](#Muzzle.basic..canvas) : <code>Canvas</code>

<a name="Muzzle.basic..image"></a>

#### basic~image
**Kind**: inner constant of [<code>basic</code>](#Muzzle.basic)
**Todo**

- [ ] take all container size

<a name="Muzzle.basic..canvas"></a>

#### basic~canvas : <code>Canvas</code>
**Kind**: inner constant of [<code>basic</code>](#Muzzle.basic)
<a name="Muzzle.multi"></a>

### Muzzle.multi(configs) ⇒ <code>Promise.&lt;Canvas&gt;</code>
**Kind**: static method of [<code>Muzzle</code>](#Muzzle)
**Returns**: <code>Promise.&lt;Canvas&gt;</code> - the promise of the built canvas

| Param | Type |
| --- | --- |
| configs | <code>any</code> |

<a name="Muzzle.match"></a>

### Muzzle.match(lefts, rights) ⇒ <code>Promise.&lt;Canvas&gt;</code>
**Kind**: static method of [<code>Muzzle</code>](#Muzzle)
**Returns**: <code>Promise.&lt;Canvas&gt;</code> - the promise of the built canvas

| Param | Type |
| --- | --- |
| lefts | [<code>Array.&lt;PieceConfig&gt;</code>](#PieceConfig) |
| rights | [<code>Array.&lt;PieceConfig&gt;</code>](#PieceConfig) |

<a name="Muzzle.match..canvas"></a>

#### match~canvas : <code>Canvas</code>
**Kind**: inner constant of [<code>match</code>](#Muzzle.match)
<a name="Muzzle.custom"></a>

### Muzzle.custom(canvas) ⇒ <code>Promise.&lt;Canvas&gt;</code>
**Kind**: static method of [<code>Muzzle</code>](#Muzzle)
**Returns**: <code>Promise.&lt;Canvas&gt;</code> - the promise of the built canvas

| Param | Type |
| --- | --- |
| canvas | <code>Canvas</code> |

<a name="Muzzle.onReady"></a>

### Muzzle.onReady()
Callback that will be executed
when muzzle has fully loaded and rendered its first
canvas.

It does nothing by default but you can override this
property with any code you need the be called here

**Kind**: static method of [<code>Muzzle</code>](#Muzzle)
<a name="Muzzle._configInitialCanvas"></a>

### Muzzle.\_configInitialCanvas(canvas)
**Kind**: static method of [<code>Muzzle</code>](#Muzzle)

| Param | Type |
| --- | --- |
| canvas | <code>Canvas</code> |

<a name="Muzzle.loadSolution"></a>

### Muzzle.loadSolution(solution)
**Kind**: static method of [<code>Muzzle</code>](#Muzzle)

| Param | Type |
| --- | --- |
| solution | [<code>Solution</code>](#Solution) |

<a name="Muzzle.loadPreviousSolution"></a>

### Muzzle.loadPreviousSolution()
Loads the current canvas with the

**Kind**: static method of [<code>Muzzle</code>](#Muzzle)
<a name="Muzzle.onSubmit"></a>

### Muzzle.onSubmit(solutionJson, valid)
Callback to be executed when submitting puzzle.

Does nothing by default but you can
override it to perform additional actions

**Kind**: static method of [<code>Muzzle</code>](#Muzzle)

| Param | Type | Description |
| --- | --- | --- |
| solutionJson | <code>string</code> | the solution, as a JSON |
| valid | <code>boolean</code> | whether this puzzle is valid or nor |

<a name="Muzzle.submit"></a>

### Muzzle.submit()
Submits the puzzle to the bridge,
validating it if necessary

**Kind**: static method of [<code>Muzzle</code>](#Muzzle)
<a name="PieceConfig"></a>

## PieceConfig : <code>object</code>
**Kind**: global typedef
**Properties**

| Name | Type |
| --- | --- |
| imagePath | <code>string</code> |
| structure | <code>string</code> |

<a name="Point"></a>

## Point : <code>Array.&lt;number&gt;</code>
**Kind**: global typedef
<a name="Solution"></a>

## Solution : <code>object</code>
**Kind**: global typedef
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| positons | [<code>Array.&lt;Point&gt;</code>](#Point) | list of points |
