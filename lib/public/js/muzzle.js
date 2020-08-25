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
    this.canvasWidth = 800;

    /**
     * Height of canvas
     *
     * @type {number}
     */
    this.canvasHeight = 800;

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
     * * Whether image's width should be scaled to piece
     *
     * @type {boolean}
     */
    this.scaleImageWidthToFit = true;

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
    return {
      width: this.canvasWidth,
      height: this.canvasHeight,
      pieceSize: this.pieceSize,
      proximity: this.pieceSize / 5,
      borderFill: this.borderFill === null ? this.pieceSize / 10 : this.borderFill,
      strokeWidth: this.strokeWidth,
      lineSoftness: 0.18
    };
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
    /**
     * @todo take all container size
     **/
    const image = await this._loadImage(imagePath);
    /** @type {Canvas} */
    // @ts-ignore
    const canvas = this._createCanvas(this._basicCanvasConfig(image, x));
    canvas.autogenerate({ horizontalPiecesCount: x, verticalPiecesCount: y });
    this._attachBasicValidator(canvas);
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

      pushTemplate(leftUrls[i], {id: leftId, left: true, rightTargetId: rightId});
      pushTemplate(rightUrls[i], {id: rightId});
    }

    leftOddUrls.forEach((it, i) =>  pushTemplate(it, {id: `lo${i}`, left: true, odd: true}));
    rightOddUrls.forEach((it, i) => pushTemplate(it, {id: `ro${i}`, odd: true}));

    const templates = await Promise.all(templatePromises);
    /** @type {Canvas} */
    const canvas = this._createCanvas();
    templates.forEach(it => canvas.sketchPiece(it));
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
  _createCanvas(config = this.baseConfig) {
    return new headbreaker.Canvas(this.canvasId, config);
  }

  /**
   * @private
   * @param {HTMLImageElement} image
   * @param {number} horizontalPiecesCount
   */
  _basicCanvasConfig(image, horizontalPiecesCount) {
    return Object.assign({ image: this._puzzleImage(image, horizontalPiecesCount) }, this.baseConfig);
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
  _createMatchTemplate(imagePath, {id, left = false, rightTargetId = null, odd = false}) {
    const structure = left ? 'T-N-' : `N-S-`;

    return this._loadImage(imagePath).then((image) => {
      return {
        structure,
        metadata: {
          id,
          left,
          odd,
          rightTargetId,
          image: this._pieceImage(image)
        }
      }
    });
  }

  /**
   * @private
   * @param {HTMLImageElement} image
   */
  _pieceImage(image) {
    const scale = this.scaleImageWidthToFit ? this.pieceSize / image.width  : 1;
    const offset = this.baseConfig.borderFill;
    return { content: image, scale, offset };
  }

  /**
   * @private
   * @param {HTMLImageElement} image
   */
  _puzzleImage(image, horizontalPiecesCount) {
    const scale = this.scaleImageWidthToFit ? this.pieceSize * horizontalPiecesCount / image.width  : 1;
    const offset = this.baseConfig.borderFill - this.pieceSize;
    return { content: image, scale, offset };
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
    this.ready();
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
    } else {
      this.canvas.shuffle(0.8);
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
