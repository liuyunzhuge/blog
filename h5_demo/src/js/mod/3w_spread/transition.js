define(function (require) {

    var $ = require('proj/3w_spread/zepto');

    var transition = $.transitionEnd = {
        end: (function () {
            var el = document.createElement('transitionEnd'),
                transEndEventNames = {
                    WebkitTransition: 'webkitTransitionEnd',
                    MozTransition: 'transitionend',
                    OTransition: 'oTransitionEnd otransitionend',
                    transition: 'transitionend'
                };

            for (var name in transEndEventNames) {
                if (el.style[name] !== undefined) {
                    return transEndEventNames[name];
                }
            }
            return false;
        })()
    };

    $.fn.emulateTransitionEnd = function (duration) {
        var called = false,
            _this = this,
            callback = function () {
                if (!called) $(_this).trigger(transition.end);
            };

        $(this).one(transition.end, function () {
            called = true;
        });

        setTimeout(callback, duration);
        return this;
    };
});