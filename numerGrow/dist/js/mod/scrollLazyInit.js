define(function (require, exports, module) {
    var $ = require('jquery'),
        throttle = require('mod/util').throttle,
        isFunc = function (f) {
            return Object.prototype.toString.call(f) === '[object Function]';
        };

    return function (options) {
        options = options || {};

        var ns = options.ns || '', //命名空间
            delay = options.delay || 10, //滚动的回调执行间隔
            callbacks = [];

        return {
            add: function (elem, init) {
                if (!isFunc(init) || !elem) return;

                var _proxy = $.proxy(function () {
                    var rect = this.getBoundingClientRect(),
                        docH = document.documentElement.clientHeight;

                    if (rect.top >= 0 && rect.bottom <= docH) {
                        init.call(elem);

                        _proxy.called = true;
                    }
                }, elem);

                callbacks.push(_proxy);
            },
            start: function () {
                var _scroll = function () {
                    var called = 0;
                    callbacks.forEach(function (c) {
                        if (c.called) {
                            called++;
                        } else {
                            c();
                        }
                    });

                    //destroy
                    if (called === callbacks.length) {
                        $(window).off('scroll' + ns);
                        callbacks = undefined;
                        options = undefined;
                        ns = undefined;
                        delay = undefined;
                    }
                };

                $(window).on('scroll' + ns, throttle(_scroll, delay));

                _scroll();
            }
        }
    }
});