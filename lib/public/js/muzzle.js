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
     */
    this.expectedRefsAreOnlyDescriptive = false;

    /**
     * Width of canvas
     */
    this.canvasWidth = 800;

    /**
     * Height of canvas
     */
    this.canvasHeight = 800;

    /**
     * Size of fill. Set null for perfect-match
     */
    this.borderFill = null;

    /**
     * Piece size
     */
    this.pieceSize = 100;

    /**
     * * Whether image's width should be scaled to piece
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
     * The previous solution to the current puzzle in this or a past session,
     * if any
     *
     * @type {string}
     */
    this.previousSolutionJson = null

    /**
     * Callback to be executed when submitting puzzle.
     *
     * Does nothing by default but you can
     * override it to perform additional actions
     *
     * @param {string} solutionJson the solution, as a JSON
     * @param {boolean} valid whether this puzzle is valid or nor
     */
    this.onSubmit = (solutionJson, valid) => {};

    this.onValid = () => {};
  }

  get baseConfig() {
    return {
      width: this.canvasWidth,
      height: this.canvasHeight,
      pieceSize: this.pieceSize,
      proximity: this.pieceSize / 5,
      borderFill: this.borderFill === null ? this.pieceSize / 10 : this.borderFill,
      strokeWidth: 1.5,
      lineSoftness: 0.18
    };
  }

  /**
   * The currently active canvas, or null if
   * it has not yet initialized
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
    const canvas = new headbreaker.Canvas(this.canvasId, this._canvasConfig(image));
    canvas.autogenerate({ horizontalPiecesCount: x, verticalPiecesCount: y });
    this._attachBasicValidator(canvas);
    canvas.onValid(() => {
      this.onValid();
      setTimeout(() => {
        if (canvas.puzzle.isValid) {
          this.submit();
        }
      }, 1500);
    });
    this._configInitialCanvas(canvas);
    return canvas;
  }

  /**
   * @param {any} configs
   * @returns {Promise<Canvas>} the promise of the built canvas
   */
  multi(configs) {
    return Promise.reject("not implemented yet");
  }

  /**
   * @param {PieceConfig[]} lefts
   * @param {PieceConfig[]} rights must be of the same size of lefts
   * @param {PieceConfig[]} leftOdds
   * @param {PieceConfig[]} rightOdds
   * @returns {Promise<Canvas>} the promise of the built canvas
   */
  async match(lefts, rights, leftOdds = [], rightOdds = []) {
    /** @type {(Promise<Template>)[]} */
    const templatePromises = [];
    const last = lefts.length - 1;
    for (let i = 0; i <= last; i++) {
      const leftId = `l${i}`;
      const rightId = `r${i}`;

      templatePromises.push(this._buildTemplate(lefts[i], {id: leftId, left: true, rightTargetId: rightId}));
      templatePromises.push(this._buildTemplate(rights[i], {id: rightId}));
    }

    leftOdds.forEach((it, i) => {
      templatePromises.push(this._buildTemplate(it, {id: `lo${i}`, left: true, odd: true}));
    })

    rightOdds.forEach((it, i) => {
      templatePromises.push(this._buildTemplate(it, {id: `ro${i}`, odd: true}));
    })

    const templates = await Promise.all(templatePromises);
    /** @type {Canvas} */
    const canvas = new headbreaker.Canvas(this.canvasId, this._canvasConfig(null));
    templates.forEach(it => canvas.sketchPiece(it));
    this._attachMatchValidator(canvas);
    canvas.onValid(() => this.onValid())
    this._configInitialCanvas(canvas);
    return canvas;
  }

  /**
   * @param {Canvas} canvas
   * @returns {Promise<Canvas>} the promise of the built canvas
   */
  custom(canvas) {
    this._configInitialCanvas(canvas);
    return Promise.resolve(canvas);
  }

  /**
   * @private
   * @param {HTMLImageElement} image
   */
  _canvasConfig(image) {
    return Object.assign({ image }, this.baseConfig);
  }

  /**
   * @private
   * @param {Canvas} canvas
   */
  _attachBasicValidator(canvas) {
    if (!this.expectedRefsAreOnlyDescriptive && this._expectedRefs) {
      canvas.attachValidator(
        new headbreaker.PuzzleValidator(
          headbreaker.PuzzleValidator.relativeRefs(this._expectedRefs)));
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
   * @param {*} config
   * @param {object} options
   * @returns {Promise<object>}
   */
  _buildTemplate(config, {id, left = false, rightTargetId = null, odd = false}) {
    const structure = left ? 'T-N-' : `N-S-`;

    return this._loadImage(config.imagePath).then((image) => {
      const scale = this._imageScale(image);
      const offset = this.baseConfig.borderFill / scale;
      return {
        structure: config.structure || structure,
        metadata: {
          id,
          left,
          odd,
          rightTargetId,
          image: {
            content: image,
            scale: scale,
            offset: { x: offset, y: offset }
          }
        }
      }
    });
  }

    /**
   * @private
   * @param {HTMLImageElement} image
   */
  _imageScale(image) {
    return this.scaleImageWidthToFit ? this.pieceSize / image.width  : 1;
  }

  /**
   * @param {Canvas} canvas
   */
  _configInitialCanvas(canvas) {
    this._canvas = canvas;
    this.ready();
  }

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
   * @param {Solution} solution
   */
  loadSolution(solution) {
    this.canvas.puzzle.relocateTo(solution.positions);
  }

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
    } else {
      this.canvas.shuffle(0.8);
    }
  }

  prepareSubmission() {
    this.canvas.puzzle.validate();
    this.previousSolutionJson = this._solutionJson;
  }

  // ==========
  // Submitting
  // ==========

  /**
   * Submits the puzzle to the bridge,
   * validating it if necessary
   */
  submit() {
    this.prepareSubmission();
    this.onSubmit(this._solutionJson, this.canvas.puzzle.valid);
  }

  /**
   * The current solution, expressed as a JSON string
   */
  get _solutionJson() {
    return JSON.stringify(this.solution);
  }
}


const Muzzle = new MuzzleCanvas();

Muzzle.aux = {};
Muzzle.another = (id) => {
  const muzzle = new MuzzleCanvas(id);
  Muzzle.aux[id] = muzzle
  return muzzle;
}
