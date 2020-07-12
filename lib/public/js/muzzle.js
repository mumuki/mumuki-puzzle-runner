/**
 * @typedef {{ imagePath: string, structure: string }} PieceConfig
 */

/**
 * @typedef {{ positions: [[number, number]]; }} Solution
 */

/**
 * Facade for referencing and creating a global puzzle canvas,
 * handling solutions persistence and submitting them
 */
const Muzzle = {

  // =============
  // Global canvas
  // =============

  /** @type {Canvas} */
  _canvas: null,

  /**
   * The currently active canvas, or null if
   * it has not yet initialized
   */
  get canvas() {
    return this._canvas;
  },

  /**
   * Draws the - previusly built - current canvas.
   *
   * Prefer {@code this.currentCanvas.redraw()} when performing
   * small updates to the pieces.
   */
  draw() {
    this.canvas.draw();
  },

  // ========
  // Building
  // ========

  canvasBaseConfig: {
    width: 800,
    height: 650,
    pieceSize: 100,
    proximity: 20,
    borderFill: 10,
    strokeWidth: 1.5,
    lineSoftness: 0.18
  },

  /**
   * The id of the HTML element that will contain the canvas
   * Override it you are going to place in a non-standard way
   */
  canvasId: 'muzzle-canvas',

  /**
   * @param {[[number, number]]} points
   */
  expect(points) {
    this._expectedPoints = points;
  },

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
  basic(x, y, imagePath) {
    /**
     * @todo validate solved after a few seconds
     * @todo take all container size
     **/
    let image = new Image();
    image.src = imagePath;
    return new Promise((resolve) => {
      image.onload = () => {
        /** @type {Canvas} */
        // @ts-ignore
        const canvas = new headbreaker.Canvas(this.canvasId, this._canvasConfig(image));
        canvas.autogenerate({ horizontalPiecesCount: x, verticalPiecesCount: y });
        canvas.attachSolvedValidator();
        canvas.onValid(() => this.submit());
        this._configInitialCanvas(canvas);
        resolve(canvas);
      }
    })
  },

  /**
   * @param {any} configs
   * @returns {Promise<Canvas>} the promise of the built canvas
   */
  multi(configs) {
    return Promise.reject("not implemented yet");
  },

  /**
   * @param {PieceConfig[]} lefts
   * @param {PieceConfig[]} rights
   * @param {PieceConfig[]} extra
   * @returns {Promise<Canvas>} the promise of the built canvas
   */
  match(lefts, rights, extra) {
    return Promise.reject("not implemented yet");
  },

  /**
   * @param {Canvas} canvas
   * @returns {Promise<Canvas>} the promise of the built canvas
   */
  custom(canvas) {
    this._configInitialCanvas(canvas);
    return Promise.resolve(canvas);
  },

  /**
   * @param {HTMLImageElement} image
   */
  _canvasConfig(image) {
    return Object.assign({ image }, this.canvasBaseConfig);
  },

  /**
   * Callback that will be executed
   * when muzzle has fully loaded and rendered its first
   * canvas.
   *
   * It does nothing by default but you can override this
   * property with any code you need the be called here
   */
  onReady: () => {},

  /**
   * @param {Canvas} canvas
   */
  _configInitialCanvas(canvas) {
    this._canvas = canvas;
    this.loadPreviousSolution();
    this.draw();
    this.onReady();
  },

  // ===========
  // Persistence
  // ===========

  /**
   * The previous solution to the current puzzle in this or a past session,
   * if any
   *
   * @type {string}
   */
  previousSolutionJson: null,

  /**
   * The state of the current puzzle
   * expressed as a Solution object
   *
   * @returns {Solution}
   */
  get solution() {
    return { positions: this.canvas.puzzle.points }
  },

  /**
   * @param {Solution} solution
   */
  loadSolution(solution) {
    this.canvas.puzzle.relocateTo(solution.positions);
  },

  /**
   * Loads the current canvas with the
   */
  loadPreviousSolution() {
    if (this.previousSolutionJson) {
      try {
        this.loadSolution(JSON.parse(this.previousSolutionJson));
      } catch (e) {
        console.warn("Ignoring unparseabe editor value");
      }
    }
  },

  prepareSubmission() {
    this.canvas.puzzle.validate();
    this.previousSolutionJson = this._solutionJson;
  },

  // ==========
  // Submitting
  // ==========

  /**
   * Callback to be executed when submitting puzzle.
   *
   * Does nothing by default but you can
   * override it to perform additional actions
   *
   * @param {string} solutionJson the solution, as a JSON
   * @param {boolean} valid whether this puzzle is valid or nor
   */
  onSubmit: (solutionJson, valid) => {},

  /**
   * Submits the puzzle to the bridge,
   * validating it if necessary
   */
  submit() {
    this.prepareSubmission();
    this.onSubmit(this._solutionJson, this.canvas.puzzle.valid);
  },

  /**
   * The current solution, expressed as a JSON string
   */
  get _solutionJson() {
    return JSON.stringify(this.solution);
  }
}
