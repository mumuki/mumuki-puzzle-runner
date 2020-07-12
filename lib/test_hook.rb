class PuzzleTestHook < Mumukit::Templates::FileHook
  def run!(request)
    ['', :passed]
  end

  def compile(req)
    puts req
    req
  end

end


