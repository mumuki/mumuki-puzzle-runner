// @ts-nocheck
$(() => {
  function register(event, callback) {
    const _event = Muzzle[event];
    Muzzle[event] = (...args) => {
      callback(...args);
      _event(...args);
    }
  }

  // ================
  // Muzzle rendering
  // ================

  Muzzle.previousSolutionContent = $('#mu-custom-editor-value').val();

  $('#mu-puzzle-custom-editor').append(`
    <div id="muzzle-canvas">
    </div>
    <script>
      ${$('#mu-custom-editor-test').val()}
    </script>
  `);

  // =================
  // Submission config
  // =================


  // Required to sync state before submitting
  mumuki.CustomEditor.addSource({
    getContent() { return { name: "solution[content]", value: Muzzle.solutionContent }; }
  });
  mumuki.CustomEditor.addSource({
    getContent() { return { name: "client_result[status]", value: Muzzle.clientResultStatus }; }
  })

  // Requiered to actually bind Muzzle's submit to
  // mumuki's solution processing
  register('onSubmit', (submission) => {
    mumuki.submission.processSolution(submission);
  });

  // ===========
  // Kids config
  // ===========
  function optimalSize($root) {
    const maxHeight = $('.mu-kids-exercise').height() - $('.mu-kids-exercise-description').height();
    return [$root.width(), Math.min($root.height(), maxHeight)]
  }

  mumuki.kids.registerStateScaler(($state, fullMargin, preferredWidth, preferredHeight) => {
    const [width, height] = optimalSize($state);
    $state.width(width);
    $state.height(height);
  });

  mumuki.kids.registerBlocksAreaScaler(($blocks) => {
    Muzzle.scale(...optimalSize($blocks));
  });

  Muzzle.manualScale = true;

  // ====================
  // Submit button hiding
  // ====================

  register('onReady', () => {
    if (Muzzle.simple) {
      $('.mu-kids-exercise-workspace').addClass('muzzle-simple');
    }
  });

  // ==============
  // Assets loading
  // ==============

  register('onReady', () => {
    mumuki.assetsLoadedFor('editor');
    // although layout assets
    // are actually loaded before this script, puzzle runner is not aimed
    // to be used without a custom editor
    mumuki.assetsLoadedFor('layout');
  });
});
