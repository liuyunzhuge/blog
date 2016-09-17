define(function (require, exports, module) {
    var $ = require('jquery'),
        PageViewBase = require('mod/listView/base/pageViewBase'),
        Class = require('mod/class');

    var DEFAULTS = $.extend({}, PageViewBase.DEFAULTS, {
        //加载更多的按钮
        $loadMore: null,
        //滚动元素
        $element: null,
        //滚动区域的目标元素，如果没有传，默认就是window对象，用来注册scroll事件
        $target: null,
        //是否启用滚动翻页
        scrollPage: true,
        //滚动元素底边跟滚动可视区域底边的距离，它是滚动翻页的临界点
        offset: -100,
        //滚动事件的绑定时的延迟时间
        scrollBindDelay: 0,
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
            initMiddle: function () {
                this.namespace_rnd = Math.round(Math.random() * 10000);
            },
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

                setTimeout($.proxy(this.enableScrollPage, this), opts.scrollBindDelay);
            },
            enableScrollPage: function () {
                var that = this,
                    opts = this.options;

                if(!opts.scrollPage) return;

                //滚动加载更多
                opts.$element && setTimeout(function () {
                    (opts.$target ? opts.$target : $(window)).on('scroll' + that.namespace + '.' + that.namespace_rnd,
                        throttle(function () {
                            if (that.disabled) return;

                            var targetHeight, bottom;

                            //目标元素的clientHeight作为滚动区域的高度
                            //bottom：滚动元素的底边到滚动区域顶边的距离

                            if (!opts.$target) {
                                targetHeight = document.documentElement.clientHeight;
                                bottom = opts.$element[0].getBoundingClientRect().bottom;
                            } else {
                                targetHeight = opts.$target[0].clientHeight;

                                var targetRect = opts.$target[0].getBoundingClientRect(),
                                    targetBorderTop = parseInt(getComputedValue(opts.$target[0], 'border-top-width')),
                                    elemRect = opts.$element[0].getBoundingClientRect();

                                //如果target是其它的html元素，由于都是采用boundingClientRect来计算的，所以要减去目标元素顶部边框的宽度，这样才不会有误差
                                bottom = elemRect.bottom - targetRect.top - (isNaN(targetBorderTop) ? 0 : targetBorderTop);
                            }

                            //bottom+ opts.offset等于一条临界线
                            //如果opts.offset小于0，那么这条临界线就位于滚动元素底边再往上opts.offsets的距离的位置
                            //如果Opts.offset大于0，那么这条临界线就位于滚动元素底边再往下|opts.offsets|的绝对距离的位置
                            //翻页触发的条件是：这条临界线刚好出现在滚动区域里面的时候
                            if ((bottom + opts.offset) < targetHeight) {
                                pageIndexChange(that.pageIndex + 1, that);
                            }
                        }, opts.throttle));
                }, opts.scrollBindDelay);
            },
            disableScrollPage: function () {
                var opts = this.options;

                if(!opts.scrollPage) return;

                opts.$element && (opts.$target ? opts.$target : $(window)).off('scroll' + this.namespace + '.' + this.namespace_rnd);
            },
            enable: function(){
                this.base();
                this.enableScrollPage();
            },
            disable: function(){
                this.base();
                this.disableScrollPage();
            }
        },
        extend: PageViewBase,
        staticMembers: {
            DEFAULTS: DEFAULTS,
            dataAttr: 'scrollPageView'
        }
    });

    return ScrollPageView;
});