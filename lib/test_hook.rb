class PuzzleTestHook < Mumukit::Templates::FileHook
  def run!(positions)
    if !positions.expected || positions_relatively_equal(positions.expected, positions.actual)
      ['', :passed]
    else
      ['', :failed]
    end
  end

  def compile(req)
    {
      expected: parse_positions(req),
      actual: JSON.parse(req.content)['positions']
    }.to_struct
  end

  def parse_positions(req)
    (req.test =~ /Muzzle\.expect\((.+?)\)/m) && (JSON.parse($1) rescue nil)
  end

  def positions_relatively_equal(expected, actual)
    x_offset = actual.first.first - (100 * expected.first.first)
    y_offset = actual.first[1]  - (100 * expected.first[1])
    actual.flat_map { |x, y| [x - x_offset, y - y_offset] } == expected.flatten.map { |it| it * 100 }
  end
end


