const instanceName = 'caps';

module.exports = function caps(sMimetype, oProps = {}) {
  let _mimetype = sMimetype;

  const _props = Object.entries(oProps).reduce((prev, [name, values]) => {
    if (Array.isArray(values)) {
      return { ...prev, [name]: values };
    }
    return { ...prev, [name]: [values, undefined] };
  }, {});

  return {
    instance: instanceName,
    mimetype(mimetype) {
      if (arguments.length === 0) {
        return _mimetype;
      }

      _mimetype = mimetype;
      return this;
    },

    prop(name, value, type) {
      if (arguments.length === 1) {
        return _props[name];
      }
      _props[name] = [value, type];
      return this;
    },

    props() {
      return _props;
    },

    asArray() {
      return [
        [
          _mimetype,
          Object.entries(_props)
            .map(
              ([name, [value, type]]) =>
                `${name}=${type ? `(${type})` : ''}${value}`,
            )
            .join(','),
        ]
          .filter(Boolean)
          .join(','),
      ];
    },
  };
};

module.exports.instanceName = instanceName;
