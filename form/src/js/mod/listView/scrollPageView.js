define(function (require, exports, module) {
    var $ = require('jquery'),
        PageViewBase = require('mod/listView/base/pageViewBase'),
        Class = require('mod/class');

    var DEFAULTS = $.extend({}, PageViewBase.DEFAULTS, {
        $loadMore: null,
        $element: null,
        $target: null,
        scrollPage: true,
        offset: -100
    });

    function pageIndexChange(pageIndex, that) {
        if (that.disabled) return;

        that.pageIndex = pageIndex;

        that.trigger('pageViewChange');
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

                opts.scrollPage && this.enableScrollPage();
            },
            enableScrollPage: function () {
                var that = this,
                    opts = this.options;

                //滚动加载更多
                opts.$element && setTimeout(function () {
                    (opts.$target ? opts.$target : $(window)).on('scroll' + that.namespace + '.' + that.namespace_rnd, function () {
                        if (that.disabled) return;

                        var targetHeight, bottom;

                        if(!opts.$target) {
                            targetHeight = document.documentElement.clientHeight;
                            bottom = opts.$element[0].getBoundingClientRect().bottom;
                        } else {
                            targetHeight = opts.$target[0].clientHeight;

                            var leftHeight = opts.$target[0].offsetHeight - targetHeight,
                                targetRect = opts.$target[0].getBoundingClientRect(),
                                targetBottom = targetRect.bottom,
                                elemRect = opts.$element[0].getBoundingClientRect(),
                                elemBottom = elemRect.bottom;

                            bottom = elemBottom - targetRect.top - (leftHeight - (targetBottom - elemBottom));
                        }

                        console.log(targetHeight)
                        console.log(bottom)

                        return;

                        if ((bottom + opts.offset) < targetHeight) {
                            pageIndexChange(that.pageIndex + 1, that);
                        }
                    });
                }, 100);
            },
            disabledScrollPage: function () {
                this.options.$element && $(window).on('scroll' + this.namespace + '.' + this.namespace_rnd);
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