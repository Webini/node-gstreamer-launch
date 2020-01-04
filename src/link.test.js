const linkFactory = require('./link');
const elementFactory = require('./element');

describe('link factory', () => {
  const element = elementFactory('encoder');
  const pad = 'audio_0';

  it('should have all setted', () => {
    const link = linkFactory(element, pad);
    expect(link.element()).toBe(element);
    expect(link.pad()).toBe(pad);
  });

  it('should have setted element name', () => {
    const link = linkFactory(element, pad);
    expect(link.element().prop('name')).toBeDefined();
  });

  it('should serialize as array', () => {
    const testElement = elementFactory('encoder', { name: 'test' });
    const link = linkFactory(testElement, pad);
    expect(link.asArray()).toEqual([`test.${pad}`]);
  });
});
