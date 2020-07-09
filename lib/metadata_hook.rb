class PuzzleMetadataHook < Mumukit::Hook
  def metadata
    {
      language: {
        name: 'muzzle',
        version: '1.0.0',
        extension: 'js',
        ace_mode: 'javascript'
      },
      test_framework: {
          name: 'muzzle',
          version: '1.0.0',
          test_extension: 'js'
      },
      layout_assets_urls: {
        js: [
          'assets/headbreaker.js',
          'assets/muzzle.js'
        ],
        css: [
          'assets/muzzle.css'
        ]
      },
      editor_assets_urls: {
        js: [
          'assets/muzzle-editor.js'
        ],
        css: [
          'assets/muzzle-editor.css'
        ],
        shows_loading_content: true
      }
    }
  end
end
