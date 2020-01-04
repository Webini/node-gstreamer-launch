let counter = 0;
const instanceName = 'element';

module.exports = function element(sType, oProps = {}) {
  let _type = sType;
  const _props = { ...oProps };

  return {
    instance: instanceName,
    type(type) {
      if (arguments.length === 0) {
        return _type;
      }

      _type = type;
      return this;
    },

    name(name) {
      if (arguments.length === 0) {
        const currentName = this.prop('name');
        if (!currentName) {
          this.prop('name', `element_${counter++}`);
        }
        return this.prop('name');
      }
      return this.prop('name', name);
    },

    prop(name, value) {
      if (arguments.length === 1) {
        return _props[name];
      }
      _props[name] = value;
      return this;
    },

    props() {
      return _props;
    },

    asArray() {
      return [
        _type,
        ...Object.entries(_props).map(([name, value]) => `${name}=${value}`),
      ];
    },
  };
};

module.exports.instanceName = instanceName;
