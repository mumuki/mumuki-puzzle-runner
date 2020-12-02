/**
 * @typedef {number[]} Point
 */

/**
 * @typedef {object} Solution
 * @property {Point[]} positions list of points
 */


class MuzzlePainter extends headbreaker.painters.Konva {
  _newLine(options) {

    const line = super._newLine(options);
    line.strokeScaleEnabled(false);
    return line;
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
     * The `x:y` aspect ratio of the piece. Set null for automatic
     * aspectRatio
     *
     * @type {number}
     */
    this.aspectRatio = null;

    /**
     * If the images should be adjusted vertically instead of horizontally
     * to puzzle dimensions.
     *
     * Set null for automatic fit.
     *
     * @type {boolean}
     */
    this.fitImagesVertically = null;

    /**
     * Wether the scaling should ignore the scaler
     * rise events
     */
    this.manualScale = false;

    /**
     * The canvas shuffler.
     *
     * Set it null to automatic shuffling algorithm selection.
     */
    this.shuffler = null;

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
     * basic and match puzzles will be considered non-simple.
     *
     * @type {boolean}
     */
    this.simple = null;

    this.spiky = false;

    /**
     * The reference insert axis, used at rounded outline to compute insert internal and external diameters
     *
     * Set null for default computation of axis - no axis reference for basic boards
     * and vertical axis for match
     *
     * @type {Axis}
     * */
    this.referenceInsertAxis = null;

    this.cornersConfig = null;

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

    /**
     * @private
     */
    this._ready = false;
  }

  get painter() {
    return new MuzzlePainter();
  }

  /**
   */
  get baseConfig() {
    return Object.assign({
      preventOffstageDrag: true,
      width: this.canvasWidth,
      height: this.canvasHeight,
      pieceSize: this.adjustedPieceSize,
      proximity: Math.min(this.adjustedPieceSize.x, this.adjustedPieceSize.y) / 5,
      strokeWidth: this.strokeWidth,
      lineSoftness: 0.18,
      painter: this.painter
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
        outline: this.roundedOutine
      }
    }
  }

  /** @type {Outline} */
  get roundedOutine() {
    return new headbreaker.outline.Rounded({
      ...this.cornersConfig,
      insertDepth: 3/5,
      referenceInsertAxis: this.referenceInsertAxis
    });
  }

  /**
   * The piece size, adjusted to the aspect ratio
   *
   * @returns {Vector}
   */
  get adjustedPieceSize() {
    if (!this._adjustedPieceSize) {
      const aspectRatio = this.effectiveAspectRatio;
      this._adjustedPieceSize = headbreaker.vector(this.pieceSize * aspectRatio, this.pieceSize);
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
   * The configured aspect ratio, or 1
   *
   * @type {number}
   */
  get effectiveAspectRatio() {
    return this.aspectRatio || 1;
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
   * Prefer `this.currentCanvas.redraw()` when performing
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
    this._config('cornersConfig', { bezelize: true, bezelDepth: 9/10 });
    this._config('aspectRatio', y / x);
    this._config('simple', true);
    this._config('shuffler', Muzzle.Shuffler.grid);

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
   * Creates a choose puzzle, where a single right piece must match the single left piece,
   * choosing the latter from a bunch of other left odd pieces. By default, `Muzzle.Shuffler.line` shuffling is used.
   *
   * This is a particular case of a match puzzle with line
   *
   * @param {string} leftUrl the url of the left piece
   * @param {string} rightUrl the url of the right piece
   * @param {string[]} leftOddUrls the urls of the off left urls
   * @param {number} [rightAspectRatio] the `x:y` ratio of the right pieces, that override the general `aspectRatio` of the puzzle.
   *                                    Use null to have the same aspect ratio as left pieces
   *
   * @returns {Promise<Canvas>} the promise of the built canvas
   */
  async choose(leftUrl, rightUrl, leftOddUrls, rightAspectRatio = null) {
    this._config('shuffler', Muzzle.Shuffler.line);
    return this.match([leftUrl], [rightUrl], {leftOddUrls, rightAspectRatio});
  }

  /**
   * Creates a match puzzle, where left pieces are matched against right pieces,
   * with optional odd left and right pieces that don't match. By default, `Muzzle.Shuffler.columns`
   * shuffling is used.
   *
   * @param {string[]} leftUrls
   * @param {string[]} rightUrls must be of the same size of lefts
   * @param {object} [options]
   * @param {string[]} [options.leftOddUrls]
   * @param {string[]} [options.rightOddUrls]
   * @param {number?} [options.rightAspectRatio] the aspect ratio of the right pieces. Use null to have the same aspect ratio as left pieces
   * @returns {Promise<Canvas>} the promise of the built canvas
   */
  async match(leftUrls, rightUrls, {leftOddUrls = [], rightOddUrls = [], rightAspectRatio = this.effectiveAspectRatio} = {}) {
    const rightWidthRatio = rightAspectRatio / this.effectiveAspectRatio;
    const minSize = headbreaker.Vector.multiply(
      this.adjustedPieceSize,
      headbreaker.vector(1, Math.min(this.effectiveAspectRatio, rightAspectRatio)));

    this._config('simple', false);
    this._config('shuffler', Muzzle.Shuffler.columns);
    this._config('fitImagesVertically', rightWidthRatio > 1);
    this._config('referenceInsertAxis', headbreaker.Vertical);
    this._config('cornersConfig', { bezelize: true, bezelRadio: this.roundedOutine.coefficients(minSize).b });

    /** @private @type {(Promise<Template>)[]} */
    const templatePromises = [];

    const rightSize = headbreaker.diameter(
      headbreaker.Vector.multiply(this.adjustedPieceSize, headbreaker.vector(rightWidthRatio, 1)));

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
    /** @type {Canvas} */
    const canvas = this._createCanvas({ maxPiecesCount: {x: 2, y: leftUrls.length} });
    canvas.adjustImagesToPiece(this.imageAdjustmentAxis);
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
   * @private
   * @param {Canvas} canvas
   */
  _configCanvas(canvas) {
    this._canvas = canvas;
    this._canvas.shuffleWith(0.8, this.shuffler);
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
        console.debug("Scaler event fired:", event);
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

    console.debug("Scaling:", {width, height})
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

      return headbreaker.vector(maxX - minX, maxY - minY);
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
    this._ready = true;
    this.onReady();
  }

  isReady() {
    return this._ready;
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

  /**
   * @param {string} key
   * @param {any} value
   */
  _config(key, value) {
    const current = this[key];
    console.debug("Setting config: ", [key, value])

    if (current === null) {
      this[key] = value;
    }
  }

  // ==============
  // Event handling
  // ==============


  /**
   * Registers an event handler
   *
   * @param {string} event
   * @param {(...args: any) => void} callback
   */
  register(event, callback) {
    const _event = this[event];
    this[event] = (...args) => {
      callback(...args);
      _event(...args);
    }
  }

  /**
   * Runs the given action if muzzle is ready,
   * queueing it otherwise
   * @param {() => void} callback
   */
  run(callback) {
    if (this.isReady()) {
      callback();
    } else {
      this.register('onReady', callback);
    }
  }
}

const Muzzle = new class extends MuzzleCanvas {
  constructor() {
    super();
    this.aux = {};

    this.Shuffler = headbreaker.Shuffler;
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
