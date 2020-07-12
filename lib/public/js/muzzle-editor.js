// @ts-nocheck
$(() => {
  // ================
  // Muzzle rendering
  // ================

  console.log('Registering Muzzle...')
  const $customEditorValue = $('#mu-custom-editor-value');
  Muzzle.previousSolutionJson = $customEditorValue.val();

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
  mumuki.submission.registerContentSyncer(() => {
    Muzzle.prepareSubmission();
    $customEditorValue.val(Muzzle.previousSolutionJson);
  });

  // Requiered to actually bind Muzzle's submit to
  // mumuki's solution processing
  const _onSubmit = Muzzle.onSubmit;
  Muzzle.onSubmit = (solutionJson, valid) => {
    console.log('submitting muzzle...')
    mumuki.submission.processSolution({solution: {content: solutionJson}});
    _onSubmit(solutionJson, valid);
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
    // nothing
    // no blocks scaling needed
  });

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
