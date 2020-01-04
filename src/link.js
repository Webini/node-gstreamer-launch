const instanceName = 'link';

module.exports = function link(element, pad) {
  // this will assert a name creation for element
  element.name();

  return {
    instance: instanceName,
    element() {
      return element;
    },
    pad() {
      return pad;
    },
    asArray() {
      return [`${element.name()}.${pad || ''}`];
    },
  };
};

module.exports.instanceName = instanceName;
