const elementFactory = require('./element');

describe('element factory', () => {
  const type = 'x265enc';
  const name = 'encoder';
  const props = {
    bitrate: 42,
    'log-level': 1,
  };

  it('should have a type', () => {
    const element = elementFactory(type);
    expect(element.type()).toBe(type);
  });

  it('should have props', () => {
    const element = elementFactory(type, props);
    expect(element.props()).toEqual(props);
  });

  it('should set name props if not defined', () => {
    const element = elementFactory(type, props);
    expect(element.name()).toBeDefined();
  });

  it('should set name props if not defined', () => {
    const element = elementFactory(type, props);
    element.name(name);
    expect(element.name()).toBe(name);
  });

  it('should serialize as array', () => {
    const element = elementFactory(type, props);
    expect(element.asArray()).toEqual([
      type,
      `bitrate=${props.bitrate}`,
      `log-level=${props['log-level']}`,
    ]);
  });
});
