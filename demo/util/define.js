module.exports = function define(obj, name, getter) {
  if (typeof getter === 'function') {
    Object.defineProperty(obj, name, {
      get: function propertyGetter() {
        return getter;
      },
      set: function propertySetter(v) {
        getter(v);
      }
    });
  } else {
    Object.defineProperty(obj, name, { value: getter });
  }
};
