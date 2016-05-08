define(function () {
    return function (func) {
        var ret;
        return function () {
            return ret || (ret = func.apply(this, arguments));
        }
    }
});