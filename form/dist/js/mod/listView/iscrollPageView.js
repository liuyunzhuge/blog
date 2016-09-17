define(function (require, exports, module) {
    var $ = require('jquery'),
        PageViewBase = require('mod/listView/base/pageViewBase'),
        Class = require('mod/class');

    var DEFAULTS = $.extend({}, PageViewBase.DEFAULTS, {
        //加载更多的按钮
        $loadMore: null,
        //滚动元素
        $element: null,
        //是否启用滚动翻页
        scrollPage: true,
        //滚动元素底边跟滚动可视区域底边的距离，它是滚动翻页的临界点
        offset: -100,
        //滚动事件的节流间隔
        throttle: 100,
    });

    function pageIndexChange(pageIndex, that) {
        if (that.disabled) return;

        that.pageIndex = pageIndex;

        that.trigger('pageViewChange');
    }

    //用来获取css某个属性经过浏览器重绘之后的值
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

    //简单函数节流
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
            //本类的实例并不会管理iscroll的实例，所以提供这个方法，由外部传入已经实例化好的iscroll实例
            setScroller: function (scroller) {
                this.scroller = scroller;

                var that = this,
                    opts = this.options;

                if (!opts.scrollPage) return;
                if (!opts.$element) return;

                //将滚动元素的父元素作为滚动区域的目标元素，因为iscroll是不可能针对window进行滚动
                var $target = opts.$element.parent();
                this.scrollCallback = throttle(function () {
                    if (that.disabled) return;

                    //目标元素的clientHeight作为滚动区域的高度
                    //bottom：滚动元素的底边到滚动区域顶边的距离，由于都是采用boundingClientRect来计算的，所以要减去目标元素顶部边框的宽度，这样才不会有误差

                    var targetHeight = $target[0].clientHeight,
                        targetRect = $target[0].getBoundingClientRect(),
                        targetBorderTop = parseInt(getComputedValue($target[0], 'border-top-width')),
                        elemRect = opts.$element[0].getBoundingClientRect(),
                        bottom = elemRect.bottom - targetRect.top - (isNaN(targetBorderTop) ? 0 : targetBorderTop);

                    //bottom+ opts.offset等于一条临界线
                    //如果opts.offset小于0，那么这条临界线就位于滚动元素底边再往上opts.offsets的距离的位置
                    //如果Opts.offset大于0，那么这条临界线就位于滚动元素底边再往下|opts.offsets|的绝对距离的位置
                    //翻页触发的条件是：这条临界线刚好出现在滚动区域里面的时候
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

                this.scroller.off('scroll', this.scrollCallback);
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