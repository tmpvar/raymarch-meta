module.exports = function define(obj, name, getter) {
  if (typeof getter === 'function') {
    Object.defineProperty(obj, name, { get: getter });
  } else {
    Object.defineProperty(obj, name, { value: getter });
  }
};
