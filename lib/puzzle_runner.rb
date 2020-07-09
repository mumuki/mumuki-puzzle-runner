require 'mumukit'

Mumukit.runner_name = 'puzzle'
Mumukit.configure do |config|
end

require_relative './assets_server'
require_relative './version_hook'
require_relative './metadata_hook'
require_relative './test_hook'
