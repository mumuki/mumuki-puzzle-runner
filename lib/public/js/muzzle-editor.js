$(() => {
  console.log('Registering Muzzle...')
  $('#mu-puzzle-custom-editor').append(`
    <div id="muzzle-canvas">
    </div>
    <script>
      ${$('#mu-custom-editor-test').val()}
    </script>
  `);

  const $customEditorValue = $('#mu-custom-editor-value');
  // @ts-ignore
  Muzzle.previousSolutionJson = $customEditorValue.val();
  // @ts-ignore
  mumuki.submission.contentSyncer = () => {
    Muzzle.dumpPreviousSolution();
    $customEditorValue.val(Muzzle.previousSolutionJson);
  };
});
