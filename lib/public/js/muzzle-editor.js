// @ts-nocheck
$(() => {
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
  const _onSubmit = Muzzle.onSubmit;
  Muzzle.onSubmit = (submission) => {
    mumuki.submission.processSolution(submission);
    _onSubmit(submission);
  }

  // ===========
  // Kids config
  // ===========

  // Required to make scaler work
  mumuki.kids.registerStateScaler(($state, fullMargin, preferredWidth, preferredHeight) => {
    // nothing
    // no state scaling needed
  });
  mumuki.kids.registerBlocksAreaScaler(($blocks) => {
    const maxSize = $('.mu-kids-exercise').height() - $('.mu-kids-exercise-description').height();
    Muzzle.scale($blocks.width(), Math.min($blocks.height(), maxSize));
  });

  Muzzle.manualScale = true;

  // ==============
  // Assets loading
  // ==============

  const _onReady = Muzzle.onReady;
  Muzzle.onReady = () => {
    mumuki.assetsLoadedFor('editor');
    // although layout assets
    // are actually loaded before this script, puzzle runner is not aimed
    // to be used without a custom editor
    mumuki.assetsLoadedFor('layout');
    _onReady();
  };
});
