class PuzzleTestHook < Mumukit::Templates::FileHook
  def run!(request)
    ['', :passed]
  end
end


