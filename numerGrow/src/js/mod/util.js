define(function (require, exports, module) {

    return {
        throttle: function(func, wait) {
            var timer = null;
            return function () {
                var self = this, args = arguments;
                if (timer) clearTimeout(timer);
                timer = setTimeout(function () {
                    return typeof func === 'function' && func.apply(self, args);
                }, wait || 10);
            }
        }
    }
});