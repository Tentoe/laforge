module.exports = {
    getCelsius: function() {
        return Promise.resolve(12.34);
    },
    setHeating: function(on) {
        console.log("turned heating " + on);
        return Promise.resolve(on);
    }
}
