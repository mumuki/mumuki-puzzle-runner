/**
 * @typedef {object} PieceConfig
 * @property {string} imagePath
 * @property {string} structure
 */

/**
 * @typedef {number[]} Point
 */

/**
 * @typedef {object} Solution
 * @property {Point[]} positions list of points
 */



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
    this.strokeWidth = 1.5;

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
    this.previousSolutionContent = null

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
    const aspectRatio = this.aspectRatio || 1;
    const pieceSize = headbreaker.vector(this.pieceSize / aspectRatio, this.pieceSize);
    return {
      width: this.canvasWidth,
      height: this.canvasHeight,
      pieceSize: pieceSize,
      proximity: pieceSize.x / 5,
      borderFill: this.borderFill === null ? headbreaker.Vector.divide(pieceSize, 10) : this.borderFill,
      strokeWidth: this.strokeWidth,
      lineSoftness: 0.18
    };
  }

  /**
   * @type {Axis}
   */
  get imageAdjustmentAxis() {
    console.log(this.fitImagesVertically)
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
   * @param {string} imagePath
   * @returns {Promise<Canvas>} the promise of the built canvas
   */
  async basic(x, y, imagePath) {
    if (!this.aspectRatio) {
      this.aspectRatio = x / y;
    }

    /**
     * @todo take all container size
     **/
    const image = await this._loadImage(imagePath);
    /** @type {Canvas} */
    // @ts-ignore
    const canvas = this._createCanvas({ image: image });
    canvas.adjustImagesToPuzzle(this.imageAdjustmentAxis);
    canvas.autogenerate({ horizontalPiecesCount: x, verticalPiecesCount: y });
    this._attachBasicValidator(canvas);
    canvas.shuffleGrid(0.8);
    this._configCanvas(canvas);
    canvas.onValid(() => {
      setTimeout(() => {
        if (canvas.valid) {
          this.submit();
        }
      }, 1500);
    });
    return canvas;
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {string[]} [imagePaths]
   * @returns {Promise<Canvas>} the promise of the built canvas
   */
  async multi(x, y, imagePaths) {
    const count = imagePaths.length;
    const images = await Promise.all(imagePaths.map(imagePath => this._loadImage(imagePath)));

    const canvas = this._createCanvas();
    canvas.autogenerate({ horizontalPiecesCount: x, verticalPiecesCount: y * count });

    // todo validate
    // todo set images

    this._configCanvas(canvas);
    return canvas;
  }

  /**
   * Craates a match puzzle, where left pieces are matched against right pieces,
   * with optional odd left and right pieces that don't match
   *
   * @param {string[]} leftUrls
   * @param {string[]} rightUrls must be of the same size of lefts
   * @param {string[]} leftOddUrls
   * @param {string[]} rightOddUrls
   * @returns {Promise<Canvas>} the promise of the built canvas
   */
  async match(leftUrls, rightUrls, leftOddUrls = [], rightOddUrls = []) {
    /** @private @type {(Promise<Template>)[]} */
    const templatePromises = [];
    const pushTemplate = (config, options) =>
      templatePromises.push(this._createMatchTemplate(config, options));

    const last = leftUrls.length - 1;
    for (let i = 0; i <= last; i++) {
      const leftId = `l${i}`;
      const rightId = `r${i}`;

      pushTemplate(leftUrls[i], {id: leftId, targetPosition: { x: this.pieceSize, y: this.pieceSize * (i + 1) }, left: true, rightTargetId: rightId});
      pushTemplate(rightUrls[i], {id: rightId, targetPosition: { x: 2 * this.pieceSize, y: this.pieceSize * (i + 1) }});
    }

    leftOddUrls.forEach((it, i) =>  pushTemplate(it, {id: `lo${i}`, left: true, odd: true, targetPosition: { x: this.pieceSize, y: this.pieceSize * (i + leftUrls.length) }, }));
    rightOddUrls.forEach((it, i) => pushTemplate(it, {id: `ro${i}`, odd: true, targetPosition: { x: 2 * this.pieceSize, y: this.pieceSize * (i + rightUrls.length) },}));

    //  + Math.max(leftOddUrls.length, rightOddUrls.length)
    const templates = await Promise.all(templatePromises);
    /** @type {Canvas} */
    const canvas = this._createCanvas({ maxPiecesCount: {x: 2, y: leftUrls.length} });
    canvas.adjustImagesToPiece(this.imageAdjustmentAxis);
    templates.forEach(it => canvas.sketchPiece(it));
    canvas.shuffleColumns(0.8);
    this._attachMatchValidator(canvas);
    this._configCanvas(canvas);
    return canvas;
  }

  /**
   * @param {Canvas} canvas
   * @returns {Promise<Canvas>} the promise of the built canvas
   */
  custom(canvas) {
    this._configCanvas(canvas);
    return Promise.resolve(canvas);
  }

  /**
   * @private
   * @param {any} config
   * @return {Canvas}
   */
  _createCanvas(config = {}) {
    return new headbreaker.Canvas(this.canvasId, Object.assign(config, this.baseConfig));
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
   * @param {string} path
   * @returns {Promise<HTMLImageElement>}
   */
  _loadImage(path) {
    const image = new Image();
    image.src = path;
    return new Promise((resolve, reject) => image.onload = () => resolve(image));
  }

  /**
   * @private
   * @param {string} imagePath
   * @param {object} options
   * @returns {Promise<object>}
   */
  _createMatchTemplate(imagePath, {id, left = false, targetPosition = null, rightTargetId = null, odd = false}) {
    const structure = left ? 'T-N-' : `N-S-`;

    return this._loadImage(imagePath).then((image) => {
      return {
        structure,
        metadata: { id, left, odd, rightTargetId, image, targetPosition }
      }
    });
  }

  /**
   * @private
   * @param {Canvas} canvas
   */
  _configCanvas(canvas) {
    this._canvas = canvas;
    this._canvas.onValid(() => {
      setTimeout(() => this.onValid(), 0);
    });
    this._setupScaler();
    this.ready();
  }

  _setupScaler() {
    if (this.manualScale) return;

    ['resize', 'load'].forEach((event) => {
      window.addEventListener(event, () => {
        var container = document.getElementById(this.canvasId);
        this.scale(container.offsetWidth, container.scrollHeight);
      });
    });
  }

  scale(width, height) {
    if (this.fixedDimensions || !this.canvas) return;
    this.canvas.resize(width, height);
    this.canvas.scale(this.optimalScaleFactor(width, height));
    this.canvas.redraw();
  }

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
}

window['Muzzle'] = Muzzle;
