module.exports = function define(obj, name, getter) {
  console.log(name, typeof getter);
  if (typeof getter === 'function') {
    console.log('position', getter.position)
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
