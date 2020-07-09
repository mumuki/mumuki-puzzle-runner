const Muzzle = {

  canvasBaseConfig: {
    width: 800,
    height: 650,
    pieceSize: 100,
    proximity: 20,
    borderFill: 10,
    strokeWidth: 1.5,
    lineSoftness: 0.18
  },

  canvasId: 'muzzle-canvas',

  basic(x, y, imagePath) {
    // validate solved after a few seconds,
    // take all container size
    let image = new Image();
    image.src = imagePath;
    return new Promise((resolve) => {
      image.onload = () => {
        const canvas = new headbreaker.Canvas(this.canvasId, this._canvasConfig(image));
        this._currentCanvas = canvas;

        canvas.autogenerate({ horizontalPiecesCount: x, verticalPiecesCount: y });
        canvas.attachSolvedValidator();
        canvas.onValid(() => this.submit());

        this.importSolutionFromDom();

        canvas.draw();
        resolve(canvas);
      }
    })
  },

  multi(configs) {

  },

  match(lefts, rights, extra) {

  },

  _canvasConfig(image) {
    return Object.assign({image}, this.canvasBaseConfig);
  },

  exportSolution() {
    return {positions: this.currentCanvas.puzzle.points}
  },

  importSolution(solution) {
    this.currentCanvas.puzzle.relocateTo(solution.positions);
  },

  importSolutionFromDom() {
    const json = $('#mu-custom-editor-value').val();
    if (json) {
      try {
        this.importSolution(JSON.parse(json));
      } catch(e) {
        console.warn("Ignoring unparseabe editor value");
      }
    }
  },

  get currentCanvas() {
    return this._currentCanvas;
  },

  /**
   * Submits the puzzle to the bridge,
   * validating it if necessary
   */
  submit() {
    this.currentCanvas.puzzle.validate();
    mumuki.bridge._submitSolution(this.exportSolution());
  }
}
