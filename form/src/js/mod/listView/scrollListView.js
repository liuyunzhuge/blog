define(function (require) {
    var $ = require('jquery'),
        MustacheTpl = require('mod/listView/MustacheTpl'),
        ScrollPageView = require('mod/listView/scrollPageView'),
        ListViewBase = require('mod/listView/base/listViewBase'),
        Class = require('mod/class');

    var DEFAULTS = $.extend({}, ListViewBase.DEFAULTS, {
        //列表容器的选择器
        dataListSelector: '.data_list',
        //顶部加载中的html
        loadingTopHtml: '<div class="loading_top">加载中...</div>',
        //没有结果的html
        noContentHtml: '<div class="no_content">没有找到相关记录：(</div>',
        //底部加载中的html
        loadingBottomHtml: '<div class="loading_bottom">加载中...</div>',
        //没有更多的html
        noMoreHtml: '<div class="no_more">没有更多了</div>',
        //加载更多的html
        loadMoreHtml: '<a href="javascript:;" class="btn_load_more">加载更多</a>'
    });

    var ScrollListView = Class({
        instanceMembers: {
            initMiddle: function () {
                var opts = this.options,
                    $element = this.$element,
                    $data_list = this.$data_list = $element.find(opts.dataListSelector),
                    $load_more = this.$load_more = $(opts.loadMoreHtml).appendTo($element),
                    $no_content = $(opts.noContentHtml).appendTo($element),
                    $loading_top = $(opts.loadingTopHtml).prependTo($element),
                    $loading_bottom = $(opts.loadingBottomHtml).appendTo($element),
                    $no_more = $(opts.noMoreHtml).appendTo($element);

                $load_more.css('display', 'block');

                //状态管理：初始化完毕，顶部加载中，底部加载中，没有结果，没有更多，加载完毕
                var states = this.states = {
                    init: function () {
                        $data_list.show();
                        $load_more.hide();
                        $no_content.hide();
                        $loading_top.hide();
                        $loading_bottom.hide();
                        $no_more.hide();
                    },
                    loading_top: function () {
                        $data_list.show();
                        $load_more.hide();
                        $no_content.hide();
                        $loading_top.show();
                        $loading_bottom.hide();
                        $no_more.hide();
                    },
                    loading_bottom: function () {
                        $data_list.show();
                        $load_more.hide();
                        $no_content.hide();
                        $loading_top.hide();
                        $loading_bottom.show();
                        $no_more.hide();
                    },
                    no_content: function () {
                        $data_list.hide();
                        $load_more.hide();
                        $no_content.show();
                        $loading_top.hide();
                        $loading_bottom.hide();
                        $no_more.hide();
                    },
                    loaded: function () {
                        $data_list.show();
                        $load_more.show();
                        $no_content.hide();
                        $loading_top.hide();
                        $loading_bottom.hide();
                        $no_more.hide();
                    },
                    no_more: function () {
                        $data_list.show();
                        $load_more.hide();
                        $no_content.hide();
                        $loading_top.hide();
                        $loading_bottom.hide();
                        $no_more.show();
                    },
                    'set': function (action) {
                        this.curState = action;
                        this[action]();
                    },
                    isNomore: function () {
                        return this.curState == 'no_more';
                    },
                    isNoContent: function () {
                        return this.curState == 'no_content';
                    }
                };

                states.set('init');
            },
            createPageView: function () {
                var pageView,
                    opts = this.options;

                if (opts.pageView) {
                    //初始化分页组件
                    delete opts.pageView.onChange;
                    pageView = new ScrollPageView($.extend(opts.pageView, {
                        $loadMore: this.$load_more,
                        $element: this.$element
                    }));
                }
                return pageView;
            },
            createTplEngine: function () {
                return new MustacheTpl(this.options.tpl);
            },
            beforeQuery: function (clear) {
                //如果clear为true，则显示顶部的加载状态，表示正在进行新条件的列表查询
                //否则显示底部的加载状态，表示正在进行翻页查询
                this.states.set(clear ? 'loading_top' : 'loading_bottom');
            },
            querySuccess: function (html, args) {
                var pageView = this.pageView,
                    rows = args.rows,
                    method = args.clear ? 'html' : 'append';//根据查询类型，来决定要如何处理渲染新的数据

                //没有查到结果
                if (rows.length == 0 && pageView.pageIndex == 1) {
                    this.states.set('no_content');
                    return;
                }

                //没有更多
                if (rows.length < pageView.pageSize) {
                    this.states.set('no_more');
                    html.length && this.$data_list[method](html);
                    return;
                }

                //加载完毕
                this.states.set('loaded');
                this.$data_list[method](html);
            },
            queryError: function () {
                this.states.set('loaded');
            },
            afterQuery: function () {
                if (this.states.isNoContent() || this.states.isNomore()) {
                    this.pageView.disable();
                }
            }
        },
        extend: ListViewBase,
        staticMembers: {
            DEFAULTS: DEFAULTS,
            dataAttr: 'scrollList'
        }
    });

    return ScrollListView;
});