class PuzzleMetadataHook < Mumukit::Hook
  def metadata
    {
      language: {
        name: 'muzzle',
        version: PuzzleVersionHook::VERSION,
        extension: 'js',
        ace_mode: 'javascript'
      },
      test_framework: {
          name: 'muzzle',
          version: PuzzleVersionHook::VERSION,
          test_extension: 'js',
          template: "// see more examples at https://github.com/mumuki/mumuki-puzzle-runner\nMuzzle.basic(3, 2, 'https://flbulgarelli.github.io/headbreaker/static/berni.jpg');"
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
