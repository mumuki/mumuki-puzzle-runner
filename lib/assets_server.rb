class Mumukit::Server::App < Sinatra::Base
  include Mumukit::Server::WithAssets

  get_local_asset 'headbreaker.js', 'lib/public/vendor/headbreaker.js', 'application/javascript'

  get_local_asset 'muzzle.js', 'lib/public/js/muzzle.js', 'application/javascript'
  get_local_asset 'muzzle.css', 'lib/public/css/muzzle.css', 'text/css'

  get_local_asset 'muzzle-editor.js', 'lib/public/js/muzzle-editor.js', 'application/javascript'
  get_local_asset 'muzzle-editor.css', 'lib/public/css/muzzle-editor.css', 'text/css'
end
