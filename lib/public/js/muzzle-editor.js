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

  // Required to actually bind Muzzle's submit to
  // mumuki's solution processing
  Muzzle.register('onSubmit', (submission) => {
    mumuki.submission.processSolution(submission);
  });

  // ===========
  // Kids config
  // ===========

  mumuki.kids.registerStateScaler(($state, fullMargin) => {
    const $image = $state.find('img');
    if (!$image.length) return;

    $image.css('transform', 'scale(1)');
    const width = ($state.width() - fullMargin) / $image.width();
    const height = ($state.height() - fullMargin) / $image.height();
    $image.css('transform', 'scale(' + Math.min(width, height) + ')');
  });

  mumuki.kids.registerBlocksAreaScaler(($blocks) => {
    console.debug("Scaler fired");
    const maxHeight = $('.mu-kids-exercise').height() - $('.mu-kids-exercise-description').height();
    Muzzle.run(() => Muzzle.scale($blocks.width(), Math.min($blocks.height(), maxHeight)));
  });

  Muzzle.manualScale = true;

  // ====================
  // Submit button hiding
  // ====================

  Muzzle.register('onReady', () => {
    if (Muzzle.simple) {
      $('.mu-kids-exercise-workspace').addClass('mu-submitless-exercise');
    }
  });

  // ==============
  // Assets loading
  // ==============

  Muzzle.register('onReady', () => {
    console.debug("Muzzle is ready");

    mumuki.assetsLoadedFor('editor');
    // although layout assets
    // are actually loaded before this script, puzzle runner is not aimed
    // to be used without a custom editor
    mumuki.assetsLoadedFor('layout');

    mumuki.I18n.register({
      'es': {
        'kindergarten_passed': '¡Muy bien! Armaste el rompecabezas'
      },
      'es-CL': {
        'kindergarten_passed': '¡Muy bien! Armaste el rompecabezas'
      },
      'en': {
        'kindergarten_passed': 'Very well! You solve the puzzle'
      },
      'pt': {
        'kindergarten_passed': 'Muito bom! Você mentou o quebra-cabeça'
      },
    });
  });
});
