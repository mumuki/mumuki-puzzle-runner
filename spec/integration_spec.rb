require 'mumukit/bridge'
require 'active_support/all'

describe 'runner' do
  let(:bridge) { Mumukit::Bridge::Runner.new('http://localhost:4569') }

  before(:all) do
    @pid = Process.spawn 'rackup -p 4569', err: '/dev/null'
    sleep 3
  end
  after(:all) { Process.kill 'TERM', @pid }

  it 'with passed client result' do
    response = bridge.run_tests!(test: "Muzzle.match(['foo.png'], ['bar.png'])\n",
                                 extra: '',
                                 content: '{"positions": [[100, 200], [100, 300]]}',
                                 client_result: {status: :passed, test_results: []},
                                 expectations: [])

    expect(response).to eq(response_type: :unstructured,
                           test_results: [],
                           status: :passed,
                           feedback: '',
                           expectation_results: [],
                           result: '')
  end

  it 'with failed client result' do
    response = bridge.run_tests!(test: "Muzzle.match(['foo.png'], ['bar.png'])\n",
                                 extra: '',
                                 content: '{"positions": [[100, 200], [100, 300]]}',
                                 client_result: {status: :failed, test_results: []},
                                 expectations: [])

    expect(response).to eq(response_type: :unstructured,
                           test_results: [],
                           status: :failed,
                           feedback: '',
                           expectation_results: [],
                           result: '')
  end


  it 'right exact positions' do
    response = bridge.run_tests!(test: "Muzzle.expect([[1, 2], [1, 3]])\nMuzzle.basic(1, 2, 'an_image.png')\n",
                                 extra: '',
                                 content: '{"positions": [[100, 200], [100, 300]]}',
                                 expectations: [])

    expect(response).to eq(response_type: :unstructured,
                           test_results: [],
                           status: :passed,
                           feedback: '',
                           expectation_results: [],
                           result: '')
  end

  it 'wrong exact positions' do
    response = bridge.run_tests!(test: "Muzzle.expect([[1, 2], [1, 3]])\nMuzzle.basic(1, 2, 'an_image.png')\n",
                                 extra: '',
                                 content: '{"positions": [[100, 200], [100, 400]]}',
                                 expectations: [])

    expect(response).to eq(response_type: :unstructured,
                           test_results: [],
                           status: :failed,
                           feedback: '',
                           expectation_results: [],
                           result: '')
  end


  it 'right relative positions' do
    response = bridge.run_tests!(test: "Muzzle.expect([[1, 2], [1, 3]])\nMuzzle.basic(1, 2, 'an_image.png')\n",
                                 extra: '',
                                 content: '{"positions": [[200, 300], [200, 400]]}',
                                 expectations: [])

    expect(response).to eq(response_type: :unstructured,
                           test_results: [],
                           status: :passed,
                           feedback: '',
                           expectation_results: [],
                           result: '')
  end

  it 'wrong relative positions' do
    response = bridge.run_tests!(test: "Muzzle.expect([[1, 2], [1, 3]])\nMuzzle.basic(1, 2, 'an_image.png')\n",
                                 extra: '',
                                 content: '{"positions": [[200, 300], [200, 450]]}',
                                 expectations: [])

    expect(response).to eq(response_type: :unstructured,
                           test_results: [],
                           status: :failed,
                           feedback: '',
                           expectation_results: [],
                           result: '')
  end



  it 'no positions' do
    response = bridge.run_tests!(test: "Muzzle.basic(1, 2, 'an_image.png')\n",
                                 extra: '',
                                 content: '{"positions": [[200, 300], [200, 400]]}',
                                 expectations: [])

    expect(response).to eq(response_type: :unstructured,
                           test_results: [],
                           status: :passed,
                           feedback: '',
                           expectation_results: [],
                           result: '')
  end

end
