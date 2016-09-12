define(function (require, exports, module) {
    var hasOwn = Object.prototype.hasOwnProperty;

    return function (state, callback) {
        state = state || {};

        var checkState = function () {
            var r = true;
            for (var i in state) {
                if (hasOwn.call(state, i) && !state[i]) {
                    r = false;
                    break;
                }
            }

            return r;
        };

        return {
            'set': function (prop) {

                if (!(prop in state)) return;
                state[prop] = true;

                if (checkState()) {
                    callback && callback();
                }
            }
        }
    }
});