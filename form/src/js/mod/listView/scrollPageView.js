define(function (require, exports, module) {
    var $ = require('jquery'),
        PageViewBase = require('mod/listView/base/pageViewBase'),
        Class = require('mod/class');

    var DEFAULTS = $.extend({}, PageViewBase.DEFAULTS, {
        $loadMore: '',
        $element: '',
        offset: 100
    });

    var ScrollPageView = Class({
        instanceMembers: {
            bindEvents: function () {
                //子类在实现bindEvents时，必须先调用父类的同名方法
                this.base();

                var that = this,
                    opts = this.options;

                function pageIndexChange(pageIndex) {
                    if (that.disabled) return;

                    that.pageIndex = pageIndex;

                    that.trigger('pageViewChange');
                }

                //按钮加载更多
                opts.$loadMore && opts.$loadMore.on('click', function (e) {
                    e.preventDefault();
                    pageIndexChange(that.pageIndex + 1);
                });

                //滚动加载更多
                opts.$element && setTimeout(function () {
                    $(window).on('scroll' + that.namespace, function () {
                        var docHeight = document.documentElement.clientHeight,
                            rect = opts.$element[0].getBoundingClientRect();

                        if ((rect.bottom + opts.offset) < docHeight) {
                            pageIndexChange(that.pageIndex + 1);
                        }
                    });
                }, 100);
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