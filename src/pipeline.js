const { spawn } = require('child_process');

const linkFactory = require('./link');
const elementFactory = require('./element');
const capsFactory = require('./caps');

const allowedInstances = [
  elementFactory.instanceName,
  linkFactory.instanceName,
  capsFactory.instanceName,
];

const searchItem = itemSearched => {
  if (typeof itemSearched === 'string') {
    return item =>
      item.instance === elementFactory.instanceName &&
      item.prop('name') === itemSearched;
  }
  return item => item === itemSearched;
};

const instanceName = 'pipeline';

module.exports = function pipeline(firstItem) {
  const _items = [];
  const _sub = [];

  const object = {
    instance: instanceName,
    next(item) {
      if (_items.indexOf(item) !== -1) {
        throw new Error('Item already present in pipeline');
      }
      if (!allowedInstances.includes(item.instance)) {
        throw new Error(
          `Invalid element type, it must be of type ${allowedInstances.join(
            ', ',
          )}`,
        );
      }
      _items.push(item);
      return this;
    },
    link(item, pad) {
      const idx = _items.findIndex(searchItem(item));
      if (idx === -1) {
        throw new Error('Cannot found item in pipeline');
      }
      return linkFactory(_items[idx], pad);
    },
    fork(item) {
      const pipe = pipeline(item);
      _sub.push(pipe);
      return pipe;
    },
    asArray() {
      const output = _items.reduce((prev, item, i) => {
        const result = [...prev, ...item.asArray()];
        if (i < _items.length - 1) {
          result.push('!');
        }
        return result;
      }, []);

      return [
        ...output,
        ..._sub.reduce((prev, pipe) => [...prev, ...pipe.asArray()], []),
      ];
    },
    execute({ debug = false, args = [], spawnOptions = {} } = {}) {
      if (debug) {
        /* eslint-disable-next-line */
        console.log(
          `gst-launch-1.0 -e ${args.join(' ')} ${this.asArray().join(' ')}`,
        );
      }
      return spawn(
        'gst-launch-1.0',
        ['-e', ...args, ...this.asArray()],
        spawnOptions,
      );
    },
  };

  if (firstItem) {
    object.next(firstItem);
  }

  return object;
};

module.exports.instanceName = instanceName;
