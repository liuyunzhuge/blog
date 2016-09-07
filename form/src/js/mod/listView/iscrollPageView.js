define(function (require, exports, module) {
    var $ = require('jquery'),
        PageViewBase = require('mod/listView/base/pageViewBase'),
        Class = require('mod/class');

    var DEFAULTS = $.extend({}, PageViewBase.DEFAULTS, {
        $loadMore: null,
        $element: null,
        scrollPage: true,
        offset: -100,
        throttle: 100,
    });

    function pageIndexChange(pageIndex, that) {
        if (that.disabled) return;

        that.pageIndex = pageIndex;

        that.trigger('pageViewChange');
    }

    function getComputedValue(element, prop) {
        var computedStyle = window.getComputedStyle(element, null);
        if (!computedStyle) return null;
        if (computedStyle.getPropertyValue) {
            return computedStyle.getPropertyValue(prop);
        } else if (computedStyle.getAttribute) {
            return computedStyle.getAttribute(prop);
        } else if (computedStyle[prop]) {
            return computedStyle[prop];
        }
    }

    function throttle(func, interval) {
        var last = Date.now();
        return function () {
            var now = Date.now();
            if ((now - last) > interval) {
                func.apply(this, arguments);
                last = now;
            }
        }
    }

    var ScrollPageView = Class({
        instanceMembers: {
            bindEvents: function () {
                //子类在实现bindEvents时，必须先调用父类的同名方法
                this.base();

                var that = this,
                    opts = this.options;

                //按钮加载更多
                opts.$loadMore && opts.$loadMore.on('click', function (e) {
                    e.preventDefault();
                    pageIndexChange(that.pageIndex + 1, that);
                });
            },
            setScroller: function (scroller) {
                this.scroller = scroller;

                var that = this,
                    opts = this.options,
                    $target = opts.$element.parent();

                this.scrollCallback = throttle(function () {
                    if (that.disabled) return;

                    var targetHeight = $target[0].clientHeight,
                        targetRect = $target[0].getBoundingClientRect(),
                        targetBorderTop = parseInt(getComputedValue($target[0], 'border-top-width')),
                        elemRect = opts.$element[0].getBoundingClientRect(),
                        bottom = elemRect.bottom - targetRect.top - (isNaN(targetBorderTop) ? 0 : targetBorderTop);

                    if ((bottom + opts.offset) < targetHeight) {
                        pageIndexChange(that.pageIndex + 1, that);
                    }
                }, opts.throttle);
            },
            enableScrollPage: function () {
                var opts = this.options;

                if (!opts.scrollPage) return;
                if (!opts.$element) return;
                if (!this.scroller) return;

                //滚动加载更多
                this.scroller.on('scroll', this.scrollCallback);
            },
            disableScrollPage: function () {
                var opts = this.options;

                if (!opts.scrollPage) return;
                if (!opts.$element) return;
                if (!this.scroller) return;

                this.scroller.off('scroll',this.scrollCallback);
            },
            enable: function () {
                this.base();
                this.enableScrollPage();
            },
            disable: function () {
                this.base();
                this.disableScrollPage();
            }
        },
        extend: PageViewBase,
        staticMembers: {
            DEFAULTS: DEFAULTS,
            dataAttr: 'iscrollPageView'
        }
    });

    return ScrollPageView;
});