const builder = require('./index');
const linkFactory = require('./link');

describe('pipeline factory', () => {
  it('should not allow duplicated items', () => {
    const element = builder.element('filesink');
    const pp = builder.pipeline(element);
    expect(() => {
      pp.next(element);
    }).toThrow();
  });

  it('should only allow items of type link or element', () => {
    expect(() => {
      builder.pipeline({});
    }).toThrow();
    expect(() => {
      builder.pipeline(builder.element());
      builder.pipeline(linkFactory(builder.element()));
    }).not.toThrow();
  });

  it('should not found item in pipeline', () => {
    expect(() => {
      const pp = builder.pipeline();
      pp.link('notfound');
    }).toThrow();
  });

  it('should create a new link', () => {
    const element = builder.element('encoder');
    const pp = builder.pipeline(element);
    const link = pp.link(element, 'video_0');

    expect(link.instance).toEqual('link');
  });

  it('should serialize simple pipeline as array', () => {
    const pipeline = builder.pipeline();
    expect(
      pipeline
        .next(builder.element('test'))
        .next(builder.element('test1'))
        .asArray(),
    ).toEqual(['test', '!', 'test1']);
  });

  it('should serialize pipeline and sub pipeline as array', () => {
    const decodebin = builder.element('decodebin');
    const entry = builder
      .pipeline(builder.element('filesrc', { location: '/test.mkv' }))
      .next(decodebin)
      .next(builder.element('progressreport', { 'update-freq': 1 }));

    const decodeAudio0 = entry
      .fork(entry.link(decodebin))
      .next(builder.element('audioconvert'))
      .next(builder.element('faac', { birate: 64 }))
      .next(builder.element('tee', { name: 'audio0' }));

    const decodeAudio1 = entry
      .fork(entry.link(decodebin))
      .next(builder.caps('audio/x-raw'))
      .next(builder.element('audioconvert'))
      .next(builder.element('faac', { birate: 64 }))
      .next(builder.element('tee', { name: 'audio1' }));

    const fileout = entry
      .fork(builder.element('mp4mux', { name: 'video320' }))
      .next(builder.element('filesink', { location: 'video320.mp4' }));

    entry
      .fork(decodeAudio0.link('audio0'))
      .next(builder.element('queue'))
      .next(fileout.link('video320'));

    entry
      .fork(decodeAudio1.link('audio1', 'paddou'))
      .next(builder.element('queue'))
      .next(fileout.link('video320'));

    expect(entry.asArray()).toMatchSnapshot();
  });

  it('should execute gst launch', async () => {
    const pp = builder.pipeline();
    pp.next(builder.element('fakesrc', { 'num-buffers': 10 }))
      .next(builder.caps('video/x-raw', { width: [640, 'int'], height: 220 }))
      .next(builder.element('fakesink'));
    const gstProcess = pp.execute();

    return new Promise((resolve, reject) => {
      gstProcess.on('exit', code => {
        if (code !== 0) {
          reject(new Error(`Invalid exit code ${code}`));
          return;
        }
        resolve();
      });
    });
  });

  it('should validate sample 1', async () => {
    const entryPipe = builder
      .pipeline(builder.element('fakesrc', { 'num-buffers': 10 }))
      .next(
        builder.element('progressreport', {
          name: 'myProgress',
          'update-freq': 1,
        }),
      )
      .next(builder.element('tee', { name: 'buffers' }));

    // fork parameter is the first pipe item, empty parameters is allowed
    const output0 = entryPipe.fork(
      builder.element('fakesink', { name: 'output0' }),
    );
    const output1 = entryPipe.fork(
      builder.element('fakesink', { name: 'output1' }),
    );

    entryPipe
      .fork(entryPipe.link('buffers'))
      .next(builder.element('queue'))
      .next(output0.link('output0'));
    entryPipe
      .fork(entryPipe.link('buffers'))
      .next(builder.element('queue'))
      .next(output1.link('output1'));

    const gstProcess = entryPipe.execute();

    return new Promise((resolve, reject) => {
      gstProcess.on('exit', code => {
        if (code !== 0) {
          reject(new Error(`Invalid exit code ${code}`));
          return;
        }
        resolve();
      });
    });
  });
});
