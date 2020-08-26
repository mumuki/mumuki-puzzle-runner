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

# Updating the docs

> You will need instaling jsdoc-to-markdown first
>
> ```bash
> npm install --global jsdoc-to-markdown
> ```

```bash
jsdoc2md lib/public/js/muzzle.js 2>&1
```

# Live examples

You can see live examples [here](https://mumuki.github.io/mumuki-puzzle-runner/docs/) :confetti_ball:

# Test format

## Basic puzzle

```javascript
Muzzle.basic(3, 2, 'https://flbulgarelli.github.io/headbreaker/static/berni.jpg');
```

## Match-pairs puzzle

```javascript
const baseUrl = 'https://raw.githubusercontent.com/MumukiProject/mumuki-guia-gobstones-alternativa-kids/master/assets/attires/';

// with left and right pieces
Muzzle.match([
  `${baseUrl}/va_vacio.png`,
  `${baseUrl}/cu_vacio.png`,
  `${baseUrl}/chips_poco.png`
], [
  `${baseUrl}/va_fru.png`,
  `${baseUrl}/cu_vai.png`,
  `${baseUrl}/chips_mucho.png`,
]);

// with left and right pieces, and left odd pieces
Muzzle.match([
  `${baseUrl}/va_vacio.png`,
  `${baseUrl}/cu_vacio.png`,
  `${baseUrl}/chips_poco.png`
], [
  `${baseUrl}/va_fru.png`,
  `${baseUrl}/cu_vai.png`,
  `${baseUrl}/chips_mucho.png`,
], [
  `${baseUrl}/choc_mitad_vacio2.png`
]);

// with left and right pieces, and right odd pieces
Muzzle.match([
  `${baseUrl}/va_vacio.png`,
  `${baseUrl}/cu_vacio.png`,
  `${baseUrl}/chips_poco.png`
], [
  `${baseUrl}/va_fru.png`,
  `${baseUrl}/cu_vai.png`,
  `${baseUrl}/chips_mucho.png`,
],
[], [
  `${baseUrl}/choc_mitad_vacio2.png`
]);
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

## Classes

<dl>
<dt><a href="#MuzzleCanvas">MuzzleCanvas</a></dt>
<dd><p>Facade for referencing and creating a global puzzle canvas,
handling solutions persistence and submitting them</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#another">another(id)</a> ⇒ <code><a href="#MuzzleCanvas">MuzzleCanvas</a></code></dt>
<dd><p>Creates a suplementary canvas at the element
of the given id</p>
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

<a name="MuzzleCanvas"></a>

## MuzzleCanvas
Facade for referencing and creating a global puzzle canvas,
handling solutions persistence and submitting them

**Kind**: global class

* [MuzzleCanvas](#MuzzleCanvas)
    * [.canvasId](#MuzzleCanvas+canvasId) : <code>string</code>
    * [.expectedRefsAreOnlyDescriptive](#MuzzleCanvas+expectedRefsAreOnlyDescriptive) : <code>boolean</code>
    * [.canvasWidth](#MuzzleCanvas+canvasWidth) : <code>number</code>
    * [.canvasHeight](#MuzzleCanvas+canvasHeight) : <code>number</code>
    * [.borderFill](#MuzzleCanvas+borderFill) : <code>number</code>
    * [.strokeWidth](#MuzzleCanvas+strokeWidth) : <code>number</code>
    * [.pieceSize](#MuzzleCanvas+pieceSize) : <code>number</code>
    * [.aspectRatio](#MuzzleCanvas+aspectRatio) : <code>number</code>
    * [.fitImagesVertically](#MuzzleCanvas+fitImagesVertically) : <code>boolean</code>
    * [.previousSolutionContent](#MuzzleCanvas+previousSolutionContent) : <code>string</code>
    * [.baseConfig](#MuzzleCanvas+baseConfig)
    * [.imageAdjustmentAxis](#MuzzleCanvas+imageAdjustmentAxis) : <code>Axis</code>
    * [.canvas](#MuzzleCanvas+canvas) ⇒ <code>Canvas</code>
    * [.solution](#MuzzleCanvas+solution) ⇒ [<code>Solution</code>](#Solution)
    * [.solutionContent](#MuzzleCanvas+solutionContent)
    * [.clientResultStatus](#MuzzleCanvas+clientResultStatus) ⇒ <code>&quot;passed&quot;</code> \| <code>&quot;failed&quot;</code>
    * [.onReady()](#MuzzleCanvas+onReady)
    * [.onSubmit(submission)](#MuzzleCanvas+onSubmit)
    * [.onValid()](#MuzzleCanvas+onValid)
    * [.draw()](#MuzzleCanvas+draw)
    * [.expect(refs)](#MuzzleCanvas+expect)
    * [.basic(x, y, imagePath)](#MuzzleCanvas+basic) ⇒ <code>Promise.&lt;Canvas&gt;</code>
    * [.multi(x, y, [imagePaths])](#MuzzleCanvas+multi) ⇒ <code>Promise.&lt;Canvas&gt;</code>
    * [.match(leftUrls, rightUrls, leftOddUrls, rightOddUrls)](#MuzzleCanvas+match) ⇒ <code>Promise.&lt;Canvas&gt;</code>
    * [.custom(canvas)](#MuzzleCanvas+custom) ⇒ <code>Promise.&lt;Canvas&gt;</code>
    * [.ready()](#MuzzleCanvas+ready)
    * [.loadSolution(solution)](#MuzzleCanvas+loadSolution)
    * [.loadPreviousSolution()](#MuzzleCanvas+loadPreviousSolution)
    * [.submit()](#MuzzleCanvas+submit)

<a name="MuzzleCanvas+canvasId"></a>

### muzzleCanvas.canvasId : <code>string</code>
The id of the HTML element that will contain the canvas
Override it you are going to place in a non-standard way

**Kind**: instance property of [<code>MuzzleCanvas</code>](#MuzzleCanvas)
<a name="MuzzleCanvas+expectedRefsAreOnlyDescriptive"></a>

### muzzleCanvas.expectedRefsAreOnlyDescriptive : <code>boolean</code>
Wether expected refs shall be ignored by Muzzle.

They will still be evaluated server-side.

**Kind**: instance property of [<code>MuzzleCanvas</code>](#MuzzleCanvas)
<a name="MuzzleCanvas+canvasWidth"></a>

### muzzleCanvas.canvasWidth : <code>number</code>
Width of canvas

**Kind**: instance property of [<code>MuzzleCanvas</code>](#MuzzleCanvas)
<a name="MuzzleCanvas+canvasHeight"></a>

### muzzleCanvas.canvasHeight : <code>number</code>
Height of canvas

**Kind**: instance property of [<code>MuzzleCanvas</code>](#MuzzleCanvas)
<a name="MuzzleCanvas+borderFill"></a>

### muzzleCanvas.borderFill : <code>number</code>
Size of fill. Set null for perfect-match

**Kind**: instance property of [<code>MuzzleCanvas</code>](#MuzzleCanvas)
<a name="MuzzleCanvas+strokeWidth"></a>

### muzzleCanvas.strokeWidth : <code>number</code>
Canvas line width

**Kind**: instance property of [<code>MuzzleCanvas</code>](#MuzzleCanvas)
<a name="MuzzleCanvas+pieceSize"></a>

### muzzleCanvas.pieceSize : <code>number</code>
Piece size

**Kind**: instance property of [<code>MuzzleCanvas</code>](#MuzzleCanvas)
<a name="MuzzleCanvas+aspectRatio"></a>

### muzzleCanvas.aspectRatio : <code>number</code>
The x:y aspect ratio of the piece. Set null for automatic
aspectRatio

**Kind**: instance property of [<code>MuzzleCanvas</code>](#MuzzleCanvas)
<a name="MuzzleCanvas+fitImagesVertically"></a>

### muzzleCanvas.fitImagesVertically : <code>boolean</code>
If the images should be adjusted vertically instead of horizontally
to puzzle dimensions. `false` by default

**Kind**: instance property of [<code>MuzzleCanvas</code>](#MuzzleCanvas)
<a name="MuzzleCanvas+previousSolutionContent"></a>

### muzzleCanvas.previousSolutionContent : <code>string</code>
The previous solution to the current puzzle in a past session,
if any

**Kind**: instance property of [<code>MuzzleCanvas</code>](#MuzzleCanvas)
<a name="MuzzleCanvas+baseConfig"></a>

### muzzleCanvas.baseConfig
**Kind**: instance property of [<code>MuzzleCanvas</code>](#MuzzleCanvas)
<a name="MuzzleCanvas+imageAdjustmentAxis"></a>

### muzzleCanvas.imageAdjustmentAxis : <code>Axis</code>
**Kind**: instance property of [<code>MuzzleCanvas</code>](#MuzzleCanvas)
<a name="MuzzleCanvas+canvas"></a>

### muzzleCanvas.canvas ⇒ <code>Canvas</code>
The currently active canvas, or null if
it has not yet initialized

**Kind**: instance property of [<code>MuzzleCanvas</code>](#MuzzleCanvas)
<a name="MuzzleCanvas+solution"></a>

### muzzleCanvas.solution ⇒ [<code>Solution</code>](#Solution)
The state of the current puzzle
expressed as a Solution object

**Kind**: instance property of [<code>MuzzleCanvas</code>](#MuzzleCanvas)
<a name="MuzzleCanvas+solutionContent"></a>

### muzzleCanvas.solutionContent
The current solution, expressed as a JSON string

**Kind**: instance property of [<code>MuzzleCanvas</code>](#MuzzleCanvas)
<a name="MuzzleCanvas+clientResultStatus"></a>

### muzzleCanvas.clientResultStatus ⇒ <code>&quot;passed&quot;</code> \| <code>&quot;failed&quot;</code>
The solution validation status

**Kind**: instance property of [<code>MuzzleCanvas</code>](#MuzzleCanvas)
<a name="MuzzleCanvas+onReady"></a>

### muzzleCanvas.onReady()
Callback that will be executed
when muzzle has fully loaded and rendered its first
canvas.

It does nothing by default but you can override this
property with any code you need the be called here

**Kind**: instance method of [<code>MuzzleCanvas</code>](#MuzzleCanvas)
<a name="MuzzleCanvas+onSubmit"></a>

### muzzleCanvas.onSubmit(submission)
Callback to be executed when submitting puzzle.

Does nothing by default but you can
override it to perform additional actions

**Kind**: instance method of [<code>MuzzleCanvas</code>](#MuzzleCanvas)

| Param | Type |
| --- | --- |
| submission | <code>Object</code> |

<a name="MuzzleCanvas+onValid"></a>

### muzzleCanvas.onValid()
Callback that will be executed
when muzzle's puzzle becomes valid

It does nothing by default but you can override this
property with any code you need the be called here

**Kind**: instance method of [<code>MuzzleCanvas</code>](#MuzzleCanvas)
<a name="MuzzleCanvas+draw"></a>

### muzzleCanvas.draw()
Draws the - previusly built - current canvas.

Prefer {@code this.currentCanvas.redraw()} when performing
small updates to the pieces.

**Kind**: instance method of [<code>MuzzleCanvas</code>](#MuzzleCanvas)
<a name="MuzzleCanvas+expect"></a>

### muzzleCanvas.expect(refs)
**Kind**: instance method of [<code>MuzzleCanvas</code>](#MuzzleCanvas)

| Param | Type |
| --- | --- |
| refs | [<code>Array.&lt;Point&gt;</code>](#Point) |

<a name="MuzzleCanvas+basic"></a>

### muzzleCanvas.basic(x, y, imagePath) ⇒ <code>Promise.&lt;Canvas&gt;</code>
Creates a basic puzzle canvas with a rectangular shape
and a background image, that is automatically
submitted when solved

**Kind**: instance method of [<code>MuzzleCanvas</code>](#MuzzleCanvas)
**Returns**: <code>Promise.&lt;Canvas&gt;</code> - the promise of the built canvas

| Param | Type | Description |
| --- | --- | --- |
| x | <code>number</code> | the number of horizontal pieces |
| y | <code>number</code> | the number of vertical pieces |
| imagePath | <code>string</code> |  |

<a name="MuzzleCanvas+multi"></a>

### muzzleCanvas.multi(x, y, [imagePaths]) ⇒ <code>Promise.&lt;Canvas&gt;</code>
**Kind**: instance method of [<code>MuzzleCanvas</code>](#MuzzleCanvas)
**Returns**: <code>Promise.&lt;Canvas&gt;</code> - the promise of the built canvas

| Param | Type |
| --- | --- |
| x | <code>number</code> |
| y | <code>number</code> |
| [imagePaths] | <code>Array.&lt;string&gt;</code> |

<a name="MuzzleCanvas+match"></a>

### muzzleCanvas.match(leftUrls, rightUrls, leftOddUrls, rightOddUrls) ⇒ <code>Promise.&lt;Canvas&gt;</code>
Craates a match puzzle, where left pieces are matched against right pieces,
with optional odd left and right pieces that don't match

**Kind**: instance method of [<code>MuzzleCanvas</code>](#MuzzleCanvas)
**Returns**: <code>Promise.&lt;Canvas&gt;</code> - the promise of the built canvas

| Param | Type | Description |
| --- | --- | --- |
| leftUrls | <code>Array.&lt;string&gt;</code> |  |
| rightUrls | <code>Array.&lt;string&gt;</code> | must be of the same size of lefts |
| leftOddUrls | <code>Array.&lt;string&gt;</code> |  |
| rightOddUrls | <code>Array.&lt;string&gt;</code> |  |

<a name="MuzzleCanvas+custom"></a>

### muzzleCanvas.custom(canvas) ⇒ <code>Promise.&lt;Canvas&gt;</code>
**Kind**: instance method of [<code>MuzzleCanvas</code>](#MuzzleCanvas)
**Returns**: <code>Promise.&lt;Canvas&gt;</code> - the promise of the built canvas

| Param | Type |
| --- | --- |
| canvas | <code>Canvas</code> |

<a name="MuzzleCanvas+ready"></a>

### muzzleCanvas.ready()
Mark Muzzle as ready, loading previous solution
and drawing the canvas

**Kind**: instance method of [<code>MuzzleCanvas</code>](#MuzzleCanvas)
<a name="MuzzleCanvas+loadSolution"></a>

### muzzleCanvas.loadSolution(solution)
Loads - but does not draw - a solution into the canvas.

**Kind**: instance method of [<code>MuzzleCanvas</code>](#MuzzleCanvas)

| Param | Type |
| --- | --- |
| solution | [<code>Solution</code>](#Solution) |

<a name="MuzzleCanvas+loadPreviousSolution"></a>

### muzzleCanvas.loadPreviousSolution()
Loads - but does not draw - the current canvas with the previous solution, if available.

**Kind**: instance method of [<code>MuzzleCanvas</code>](#MuzzleCanvas)
<a name="MuzzleCanvas+submit"></a>

### muzzleCanvas.submit()
Submits the puzzle to the bridge,
validating it if necessary

**Kind**: instance method of [<code>MuzzleCanvas</code>](#MuzzleCanvas)
<a name="another"></a>

## another(id) ⇒ [<code>MuzzleCanvas</code>](#MuzzleCanvas)
Creates a suplementary canvas at the element
of the given id

**Kind**: global function

| Param | Type |
| --- | --- |
| id | <code>string</code> |

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
| positions | [<code>Array.&lt;Point&gt;</code>](#Point) | list of points |
