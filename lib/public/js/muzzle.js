/**
 * @typedef {{ imagePath: string, structure: string }} PieceConfig
 */

/**
 * @typedef {{ positions: [[number, number]]; }} Solution
 */

/**
 * Facade for creating puzzle canvas,
 * handling solutions persistence and submitting them
 */
const Muzzle = {

  /**
   * The currently active canvas, or null if
   * it has not yet initialized
   */
  get currentCanvas() {
    return this._currentCanvas;
  },

  /** @type {Canvas} */
  _currentCanvas: null,

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
        this._registerCanvas(canvas);
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
    this._registerCanvas(canvas);
    return Promise.resolve(canvas);
  },

  /**
   * @param {HTMLImageElement} image
   */
  _canvasConfig(image) {
    return Object.assign({ image }, this.canvasBaseConfig);
  },

  /**
   * @param {Canvas} canvas
   */
  _registerCanvas(canvas) {
    this._currentCanvas = canvas;
    this.importSolutionFromDom();
    canvas.draw();
  },

  // ===========
  // Persistence
  // ===========

  /**
   * @returns {Solution}
   */
  exportSolution() {
    return { positions: this.currentCanvas.puzzle.points }
  },

  /**
   * @param {Solution} solution
   */
  importSolution(solution) {
    this.currentCanvas.puzzle.relocateTo(solution.positions);
  },

  importSolutionFromDom() {
    /** @type {string} */
    // @ts-ignore
    const json = $('#mu-custom-editor-value').val();
    if (json) {
      try {
        this.importSolution(JSON.parse(json));
      } catch (e) {
        console.warn("Ignoring unparseabe editor value");
      }
    }
  },

  // ==========
  // Submitting
  // ==========


  /**
   * Submits the puzzle to the bridge,
   * validating it if necessary
   */
  submit() {
    this.currentCanvas.puzzle.validate();
    // @ts-ignore
    new mumuki.bridge.Laboratory()._submitSolution({
      solution: JSON.stringify(this.exportSolution()),
      /**@todo result: this.currentCanvas.isValid()*/
    });
  }
}
