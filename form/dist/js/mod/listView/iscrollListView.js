define(function (require) {
    var $ = require('jquery'),
        IScrollPageView = require('mod/listView/iscrollPageView'),
        IScroll = require('iscroll'),
        ScrollListView = require('mod/listView/scrollListView'),
        Class = require('mod/class');

    var DEFAULTS = $.extend({}, ScrollListView.DEFAULTS, {
        //iscroll相关的option
        iscroll: {
            probeType: 3,
            click: true
        }
    });

    var IScrollListView = Class({
        instanceMembers: {
            updateScroller: function () {
                if (!this.scroller) {
                    this.scroller = new IScroll(this.$element.parent()[0], this.options.iscroll);
                    this.pageView.setScroller(this.scroller);
                } else {
                    this.scroller.refresh();
                }
            },
            createPageView: function () {
                var pageView,
                    opts = this.options;

                if (opts.pageView) {
                    //初始化分页组件
                    delete opts.pageView.onChange;
                    pageView = new IScrollPageView($.extend(opts.pageView, {
                        $loadMore: this.$load_more,
                        $element: this.$element
                    }));
                }
                return pageView;
            },
            querySuccess: function (html, args) {
                this.base(html, args);
                //初始化iscroll
                this.updateScroller();
            }
        },
        extend: ScrollListView,
        staticMembers: {
            DEFAULTS: DEFAULTS,
            dataAttr: 'iscrollList'
        }
    });

    return IScrollListView;
});