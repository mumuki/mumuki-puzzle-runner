 /**
  * @typedef {string|MuzzleImage|MuzzleAnimation} Background
  */

/**
 * @typedef {number[]} Point
 */

/**
 * @typedef {object} Solution
 * @property {Point[]} positions list of points
 */


class MuzzleImage {
  /**
   * @param {String} imageUrl
   */
  constructor(imageUrl) {
    this.imageUrl = imageUrl;
  }

  /**
   * @param {MuzzleCanvas} _muzzle
   * @returns {Promise<HTMLCanvasElement | HTMLImageElement>}
   */
  load(_muzzle) {
    const image = new Image();
    image.src = this.imageUrl;
    return new Promise((resolve, reject) => image.onload = () => resolve(image));
  }
}

class MuzzleAnimation {

  /**
   * @param {string} patchUrl
   * @param {number} animationInterval
   * @param {number} patchWidth
   * @param {number} patchHeight
   */
  constructor(patchUrl, animationInterval, patchWidth, patchHeight) {
    this.patchUrl = patchUrl;
    this.animationInterval = animationInterval;
    this.patchWidth = patchWidth;
    this.patchHeight = patchHeight;
    this.xOffset = 0;
    this.yOffset = 0;
  }

  /**
   * @param {MuzzleCanvas} muzzle
   * @returns {Promise<HTMLCanvasElement | HTMLImageElement>}
   */
  load(muzzle) {
    return new Promise((resolve, reject) => {
      this.initAnimationContext();

      let first = true;
      let img = new Image();
      img.src = this.patchUrl;
      img.onload = () => {
        this.initDimmensions(img);
        setInterval(() => {
          if (muzzle.canvas && (first || muzzle.canvas.puzzle.valid)) {
            first = false;
            this.updateFrame(img, muzzle.canvas);
            this.updateOffset();
          }
        }, this.animationInterval);
        resolve(this.animationCanvas);
      }
    });
  }

  initAnimationContext() {
    this.animationCanvas = document.createElement('canvas');
    this.animationContext = this.animationCanvas.getContext('2d');
  }

  updateOffset() {
    this.xOffset++;
    if (this.xOffset === this.patchWidth) {
      this.xOffset = 0;
      this.yOffset++;
      if (this.yOffset === this.patchHeight) this.yOffset = 0;
    }
  }

  /**
   * @param {HTMLImageElement} img
   * @param {Canvas} canvas
   */
  updateFrame(img, canvas) {
    this.animationContext.drawImage(img,
      this.xOffset * -this.animationCanvas.width,
      this.yOffset * -this.animationCanvas.height);
    canvas.refill();
    canvas.redraw();
  }

  /**
   * @param {HTMLImageElement} img
   */
  initDimmensions(img) {
    this.animationCanvas.width = img.width / this.patchWidth;
    this.animationCanvas.height = img.height / this.patchHeight;
  }
}

/**
 * Facade for referencing and creating a global puzzle canvas,
 * handling solutions persistence and submitting them
 */
class MuzzleCanvas {

  // =============
  // Global canvas
  // =============

  constructor(id = 'muzzle-canvas') {

    /**
     * @private
     * @type {Canvas}
     **/
    this._canvas = null;

    /**
     * The id of the HTML element that will contain the canvas
     * Override it you are going to place in a non-standard way
     *
     * @type {string}
     */
    this.canvasId = id;

    /**
     * An optional list of refs that, if set, will be used to validate
     * this puzzle both on client and server side
     *
     * @private
     * @type {Point[]}
     * */
    this._expectedRefs = null;

    /**
     * Wether expected refs shall be ignored by Muzzle.
     *
     * They will still be evaluated server-side.
     *
     * @type {boolean}
     */
    this.expectedRefsAreOnlyDescriptive = false;

    /**
     * Width of canvas
     *
     * @type {number}
     */
    this.canvasWidth = 600;

    /**
     * Height of canvas
     *
     * @type {number}
     */
    this.canvasHeight = 600;

    /**
     * Wether canvas shoud **not** be resized.
     * Default is `false`
     *
     * @type {boolean}
     */
    this.fixedDimensions = false;

    /**
     * Size of fill. Set null for perfect-match
     *
     * @type {number}
     */
    this.borderFill = null;

    /**
     * Canvas line width
     *
     * @type {number}
     */
    this.strokeWidth = 3;

    /**
     * Piece size
     *
     * @type {number}
     */
    this.pieceSize = 100;

    /**
     * The x:y aspect ratio of the piece. Set null for automatic
     * aspectRatio
     *
     * @type {number}
     */
    this.aspectRatio = null;

    /**
     * If the images should be adjusted vertically instead of horizontally
     * to puzzle dimensions. `false` by default
     *
     * @type {boolean}
     */
    this.fitImagesVertically = false;

    this.manualScale = false;

    /**
     * Callback that will be executed
     * when muzzle has fully loaded and rendered its first
     * canvas.
     *
     * It does nothing by default but you can override this
     * property with any code you need the be called here
     */
    this.onReady = () => {};

    /**
     * The previous solution to the current puzzle in a past session,
     * if any
     *
     * @type {string}
     */
    this.previousSolutionContent = null;

    /**
     * Whether the current puzzle can be solved in very few tries.
     *
     * Set null for automatic configuration of this property. Basic puzzles will be considered
     * basic and match puzzles will be considered non-basic.
     *
     * @type {boolean}
     */
    this.simple = null;

    this.spiky = false;

    /**
     * The reference insert axis, used at rounded outline to compute insert internal and external diameters
     * Set null for default computation of axis - no axis reference for basic boards
     * and vertical axis for match
     *
     * @type {Axis}
     * */
    this.referenceInsertAxis = null;

    /**
     * Callback to be executed when submitting puzzle.
     *
     * Does nothing by default but you can
     * override it to perform additional actions
     *
     * @param {{solution: {content: string}, client_result: {status: "passed" | "failed"}}} submission
     */
    this.onSubmit = (submission) => {};

     /**
     * Callback that will be executed
     * when muzzle's puzzle becomes valid
     *
     * It does nothing by default but you can override this
     * property with any code you need the be called here
     */
    this.onValid = () => {};
  }



  /**
   */
  get baseConfig() {
    return Object.assign({
      width: this.canvasWidth,
      height: this.canvasHeight,
      pieceSize: this.adjustedPieceSize,
      proximity: Math.min(this.adjustedPieceSize.x, this.adjustedPieceSize.y) / 5,
      strokeWidth: this.strokeWidth,
      lineSoftness: 0.18
    }, this.outlineConfig);
  }

  /**
   */
  get outlineConfig() {
    if (this.spiky) {
      return {
        borderFill: this.borderFill === null ? headbreaker.Vector.divide(this.adjustedPieceSize, 10) : this.borderFill,
      }
    } else {
      return {
        borderFill: 0,
        outline: new headbreaker.outline.Rounded({
          bezelize: true,
          insertDepth: 3/5,
          bezelDepth: 9/10,
          referenceInsertAxis: this.referenceInsertAxis
        }),
      }
    }
  }

  /**
   * The piece size, adjusted to the aspect ratio
   *
   * @returns {Vector}
   */
  get adjustedPieceSize() {
    if (!this._adjustedPieceSize) {
      const aspectRatio = this.aspectRatio || 1;
      this._adjustedPieceSize = headbreaker.vector(this.pieceSize / aspectRatio, this.pieceSize);
    }
    return this._adjustedPieceSize;
  }

  /**
   * @type {Axis}
   */
  get imageAdjustmentAxis() {
    return this.fitImagesVertically ? headbreaker.Vertical : headbreaker.Horizontal;
  }

  /**
   * The currently active canvas, or null if
   * it has not yet initialized
   *
   * @returns {Canvas}
   */
  get canvas() {
    return this._canvas;
  }

  /**
   * Draws the - previusly built - current canvas.
   *
   * Prefer {@code this.currentCanvas.redraw()} when performing
   * small updates to the pieces.
   */
  draw() {
    this.canvas.draw();
  }

  // ========
  // Building
  // ========

  /**
   * @param {Point[]} refs
   */
  expect(refs) {
    this._expectedRefs = refs;
  }

  /**
   * Creates a basic puzzle canvas with a rectangular shape
   * and a background image, that is automatically
   * submitted when solved
   *
   * @param {number} x the number of horizontal pieces
   * @param {number} y the number of vertical pieces
   * @param {Background} background the background, expressed as a path or a background object
   * @returns {Promise<Canvas>} the promise of the built canvas
   */
  async basic(x, y, background) {
    if (!this.aspectRatio) {
      this.aspectRatio = x / y;
    }

    if (this.simple === null) {
      this.simple = true;
    }

    /**
     * @todo take all container size
     **/
    const image = await this._loadImage(background);
    this._startNewCanvasConfig({ image: image });

    this.canvas.adjustImagesToPuzzle(this.imageAdjustmentAxis);
    this.canvas.autogenerate({ horizontalPiecesCount: x, verticalPiecesCount: y });

    this._attachBasicValidator(this.canvas);
    this.canvas.shuffleGrid(0.8);
    this._finishCanvasConfig();
    this.canvas.onValid(() => {
      setTimeout(() => {
        if (this.canvas.valid) {
          this.submit();
        }
      }, 1500);
    });
    return this.canvas;
  }

  /**
   * @param {Background} background
   * @private
   */
  _loadImage(background) {
    return (typeof(background) === 'string' ? new MuzzleImage(background) : background).load(this);
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {Background[]} backgrounds the backgrounds, expressed as a list of paths or a background objects
   * @returns {Promise<Canvas>} the promise of the built canvas
   */
  async multi(x, y, backgrounds) {
    const count = backgrounds.length;
    const images = await Promise.all(backgrounds.map(imagePath => this._loadImage(imagePath)));

    this._startNewCanvasConfig();
    this.canvas.autogenerate({ horizontalPiecesCount: x, verticalPiecesCount: y * count });

    // todo validate
    // todo set images

    this._finishCanvasConfig();
    return this.canvas;
  }

  /**
   * Craates a match puzzle, where left pieces are matched against right pieces,
   * with optional odd left and right pieces that don't match
   *
   * @param {string[]} leftUrls
   * @param {string[]} rightUrls must be of the same size of lefts
   * @param {string[]} leftOddUrls
   * @param {string[]} rightOddUrls
   * @param {number?} rightWidthRatio a multiplicator to apply to the right piece's width
   * @returns {Promise<Canvas>} the promise of the built canvas
   */
  async match(leftUrls, rightUrls, leftOddUrls = [], rightOddUrls = [], rightWidthRatio = 1) {
    if (!this.referenceInsertAxis) {
      this.referenceInsertAxis = headbreaker.Vertical;
    }

    /** @private @type {(Promise<Template>)[]} */
    const templatePromises = [];

    const rightSize = headbreaker.diameter(headbreaker.Vector.multiply(this.adjustedPieceSize, headbreaker.vector(rightWidthRatio, 1)));

    const pushTemplate = (path, options) =>
      templatePromises.push(this._createMatchTemplate(path, options));

    const pushLeftTemplate = (index, path, options) =>
      pushTemplate(path, {
        left: true,
        targetPosition: headbreaker.Vector.multiply(this.pieceSize, headbreaker.vector(1, index)),
        ...options
      });

    const pushRightTemplate = (index, path, options) =>
      pushTemplate(path, {
        size: rightSize,
        targetPosition: headbreaker.Vector.multiply(this.pieceSize, headbreaker.vector(2, index)),
        ...options
      });

    const last = leftUrls.length - 1;
    for (let i = 0; i <= last; i++) {
      const leftId = `l${i}`;
      const rightId = `r${i}`;

      pushLeftTemplate(i + 1, leftUrls[i], {
        id: leftId,
        rightTargetId: rightId
      });
      pushRightTemplate(i + 1, rightUrls[i], {
        id: rightId
      });
    }

    leftOddUrls.forEach((it, i) =>
      pushLeftTemplate(i + leftUrls.length, it, {
        id: `lo${i}`,
        odd: true
      })
    );
    rightOddUrls.forEach((it, i) =>
      pushRightTemplate(i + rightUrls.length, it, {
        id: `ro${i}`,
        odd: true
      })
    );

    //  + Math.max(leftOddUrls.length, rightOddUrls.length)
    const templates = await Promise.all(templatePromises);
    this._startNewCanvasConfig({ maxPiecesCount: {x: 2, y: leftUrls.length} });
    this.canvas.adjustImagesToPiece(this.imageAdjustmentAxis);
    templates.forEach(it => this.canvas.sketchPiece(it));
    this.canvas.shuffleColumns(0.8);
    this._attachMatchValidator(this.canvas);
    this._finishCanvasConfig();
    return this.canvas;
  }

  /**
   * @param {Canvas} canvas
   * @returns {Promise<Canvas>} the promise of the built canvas
   */
  custom(canvas) {
    this._startCanvasConfig(canvas);
    this._finishCanvasConfig();
    return Promise.resolve(this.canvas);
  }

  /**
   * @private
   * @param {Canvas} canvas
   */
  _attachBasicValidator(canvas) {
    if (!this.expectedRefsAreOnlyDescriptive && this._expectedRefs) {
      canvas.attachRelativeRefsValidator(this._expectedRefs);
    } else {
      canvas.attachSolvedValidator();
    }
  }

  /**
   * @private
   * @param {Canvas} canvas
   */
  _attachMatchValidator(canvas) {
    canvas.attachValidator(new headbreaker.PuzzleValidator(
      puzzle => puzzle.pieces
                  .filter(it => !it.metadata.odd && it.metadata.left)
                  .every(it => it.rightConnection && it.rightConnection.id === it.metadata.rightTargetId)
    ));
  }

  /**
   * @private
   * @param {string} imagePath
   * @param {object} options
   * @returns {Promise<object>}
   */
  _createMatchTemplate(imagePath, {id, left = false, targetPosition = null, rightTargetId = null, odd = false, size = null}) {
    const structure = left ? 'T-N-' : `N-S-`;
    return this._loadImage(imagePath).then((image) => {
      return {
        ...(size ? {size} : {}),
        structure,
        metadata: { id, left, odd, rightTargetId, image, targetPosition }
      }
    });
  }

  /**
   * @param {any} config
   * @private
   */
  _startNewCanvasConfig(config = {}) {
    this._startCanvasConfig(new headbreaker.Canvas(this.canvasId, Object.assign(config, this.baseConfig)));
  }

  /**
   * @param {Canvas} canvas
   * @private
   */
  _startCanvasConfig(canvas) {
    this._canvas = canvas;
  }

  /**
   * @private
   */
  _finishCanvasConfig(canvas) {
    this._canvas.onValid(() => {
      setTimeout(() => this.onValid(), 0);
    });
    this._setUpScaler();
    this.ready();
  }

  _setUpScaler() {
    if (this.manualScale) return;

    ['resize', 'load'].forEach((event) => {
      window.addEventListener(event, () => {
        var container = document.getElementById(this.canvasId);
        this.scale(container.offsetWidth, container.scrollHeight);
      });
    });
  }

  /**
   * Scales the canvas to the given width and height
   *
   * @param {number} width
   * @param {number} height
   */
  scale(width, height) {
    if (this.fixedDimensions || !this.canvas) return;
    const factor = this.optimalScaleFactor(width, height);
    this.canvas.resize(width, height);
    this.canvas.scale(factor);
    this.canvas.redraw();
    this.focus();
  }

  /**
   * Focuses the stage around the canvas center
   */
  focus() {
    const stage = this.canvas['__konvaLayer__'].getStage();

    const area = headbreaker.Vector.divide(headbreaker.vector(stage.width(), stage.height()), stage.scaleX());
    const realDiameter = (() => {
      const [xs, ys] = this.coordinates;

      const minX = Math.min(...xs);
      const minY = Math.min(...ys);

      const maxX = Math.max(...xs);
      const maxY = Math.max(...ys);

      return headbreaker.Vector.plus(headbreaker.vector(maxX - minX, maxY - minY), this.canvas.puzzle.pieceDiameter);
    })();
    const diff = headbreaker.Vector.minus(area, realDiameter);
    const semi = headbreaker.Vector.divide(diff, -2);

    stage.setOffset(semi);
    stage.draw();
  }

  /**
   * @private
   */
  get coordinates() {
    const points = this.canvas.puzzle.points;
    return [points.map(([x, _y]) => x), points.map(([_x, y]) => y)];
  }

  /**
   * @private
   * @param {number} width
   * @param {number} height
   */
  optimalScaleFactor(width, height) {
    const factors = headbreaker.Vector.divide(headbreaker.vector(width, height), this.canvas.puzzleDiameter);
    return Math.min(factors.x, factors.y) / 1.75;
  }

  /**
   * Mark Muzzle as ready, loading previous solution
   * and drawing the canvas
   */
  ready() {
    this.loadPreviousSolution();
    this.resetCoordinates();
    this.draw();
    this.onReady();
  }

  // ===========
  // Persistence
  // ===========

  /**
   * The state of the current puzzle
   * expressed as a Solution object
   *
   * @returns {Solution}
   */
  get solution() {
    return { positions: this.canvas.puzzle.points }
  }

  /**
   * Loads - but does not draw - a solution into the canvas.
   *
   * @param {Solution} solution
   */
  loadSolution(solution) {
    this.canvas.puzzle.relocateTo(solution.positions);
    this.canvas.puzzle.autoconnect();
  }

  /**
   * Loads - but does not draw - the current canvas with the previous solution, if available.
   *
   */
  loadPreviousSolution() {
    if (this.previousSolutionContent) {
      try {
        this.loadSolution(JSON.parse(this.previousSolutionContent));
      } catch (e) {
        console.warn("Ignoring unparseabe editor value");
      }
    }
  }

  /**
   * Translates the pieces so that
   * they start at canvas' coordinates origin
   */
  resetCoordinates() {
    const [xs, ys] = this.coordinates;
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    this.canvas.puzzle.translate(-minX, -minY);
  }

  // ==========
  // Submitting
  // ==========

  /**
   * Submits the puzzle to the bridge,
   * validating it if necessary
   */
  submit() {
    this.onSubmit(this._prepareSubmission());
  }

  /**
   * The current solution, expressed as a JSON string
   */
  get solutionContent() {
    return JSON.stringify(this.solution);
  }

  /**
   * The solution validation status
   *
   * @returns {"passed" | "failed"}
   */
  get clientResultStatus() {
    return this.canvas.valid ? 'passed' : 'failed';
  }

  _prepareSubmission() {
    return {
      solution: {
        content: this.solutionContent
      },
      client_result: {
        status: this.clientResultStatus
      }
    };
  }
}

const Muzzle = new class extends MuzzleCanvas {
  constructor() {
    super();
    this.aux = {};
  }

  /**
   * Creates a suplementary canvas at the element
   * of the given id
   *
   * @param {string} id
   * @returns {MuzzleCanvas}
   */
  another(id) {
    const muzzle = new MuzzleCanvas(id);
    Muzzle.aux[id] = muzzle
    return muzzle;
  }

  /**
   * Creates an animation object that can be used as background
   * in puzzles
   *
   * @param {string} patchUrl
   * @param {number} [animationInterval]
   * @param {number} [patchWidth]
   * @param {number} [patchHeight]
   *
   * @returns {MuzzleAnimation}
   */
  animation(patchUrl, animationInterval = 100, patchWidth = 4, patchHeight = 4) {
    return new MuzzleAnimation(patchUrl, animationInterval, patchWidth, patchHeight);
  }

  /**
   * Creates an image object that can be used as background
   * in puzzles
   *
   * @param {string} imageUrl
   *
   * @returns {MuzzleImage}
   */
  image(imageUrl) {
    return new MuzzleImage(imageUrl);
  }
}

window['Muzzle'] = Muzzle;
