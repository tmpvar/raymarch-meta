module.exports = function define(obj, name, getter) {
  if (typeof getter === 'function') {
    Object.defineProperty(obj, name, {
      enumerable: true,
      get: function propertyGetter() {
        return getter;
      },
      set: function propertySetter(v) {
        getter(v);
      }
    });
  } else {
    Object.defineProperty(obj, name, {
      enumerable: true,
      writable: true,
      value: getter
    });
  }
};
