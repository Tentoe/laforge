module.exports = {
  getCelsius() {
    return Promise.resolve(12.34);
  },
  setHeating(on) {
        // TODO  console.log("turned heating " + on);
    return Promise.resolve(on);
  },
};
