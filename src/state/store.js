const _state = {};
const _subscribers = {};

const store = {
  get(key) {
    return _state[key];
  },

  set(key, value) {
    _state[key] = value;
    if (_subscribers[key]) {
      _subscribers[key].forEach(cb => cb(value));
    }
  },

  subscribe(key, callback) {
    if (!_subscribers[key]) _subscribers[key] = [];
    _subscribers[key].push(callback);
    return () => {
      _subscribers[key] = _subscribers[key].filter(cb => cb !== callback);
    };
  }
};

export default store;
