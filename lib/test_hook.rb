class PuzzleTestHook < Mumukit::Templates::FileHook
  def run!(req)
    points = parse_points req
    if !points || points_relatively_equal(points, JSON.parse(req.content))
      ['', :passed]
    else
      ['', :failed]
    end
  end

  def compile(req)
    req
  end

  def parse_points(req)
    (req.test =~ /Muzzle\.expect\((.*)\)/) && (JSON.parse($1) rescue nil)
  end

  def points_relatively_equal(expected, actual)
    x_offset = actual.first.first - (100 * expected.first.first)
    y_offset = actual.first[1]  - (100 * expected.first[1])
    actual.flat_map { |x, y| [x - x_offset, y - y_offset] } == expected.flatten.map { |it| it * 100 }
  end
end


