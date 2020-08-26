class PuzzleTestHook < Mumukit::Templates::FileHook
  def run!(req)
    if req.client_result
      ['', (req.client_result['status'].passed? ? :passed : :failed)]
    elsif !req.expected || positions_relatively_equal(req.expected, req.actual)
      ['', :passed]
    else
      ['', :failed]
    end
  end

  def compile(req)
    if req.client_result
      req
    else
      {
        expected: parse_positions(req),
        actual: JSON.parse(req.content)['positions']
      }.to_struct
    end
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


