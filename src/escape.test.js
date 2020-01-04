const escape = require('./escape');

describe('escape', () => {
  it('should escape " and \\', () => {
    expect(escape('A"B\\C')).toBe('A\\"B\\\\C');
  });
});
