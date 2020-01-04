const capsFactory = require('./caps');

describe('caps factory', () => {
  const mimetype = 'video/raw';
  const width = 42;
  const height = 51;
  const props = {
    height: [height, 'int'],
    width,
  };

  it('should have mimetype', () => {
    const caps = capsFactory(mimetype);
    expect(caps.mimetype()).toBe(mimetype);
  });

  it('should have props', () => {
    const caps = capsFactory(mimetype, props);
    expect(caps.props()).toEqual({
      width: [width, undefined],
      height: [height, 'int'],
    });
  });

  it('should serialize as array', () => {
    const caps = capsFactory(mimetype, props);
    expect(caps.asArray()).toEqual([
      `${mimetype},height=(int)${height},width=${width}`,
    ]);
  });
});
