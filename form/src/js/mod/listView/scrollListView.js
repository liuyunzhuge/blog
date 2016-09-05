define(function (require) {
    var $ = require('jquery'),
        MustacheTpl = require('mod/listView/MustacheTpl'),
        SimplePageView = require('mod/listView/simplePageView'),
        ListViewBase = require('mod/listView/base/listViewBase'),
        Class = require('mod/class');

    var DEFAULTS = $.extend({}, ListViewBase.DEFAULTS, {
        pageView: false,
        //列表容器的选择器
        dataListSelector: '.data_list',
        //加载更多的选择器
        loadMoreSelector: '.btn_load_more',
        //没有结果的选择器
        noContentSelector: '.no_content',
        //顶部加载状态的选择器
        loadingTopSelector: '.loading_top',
        //底部加载状态的选择器
        loadingBottomSelector: '.loading_bottom',
        //没有更多的选贼器
        noMoreSelector: '.no_more'
    });

    var ScrollListView = Class({
        instanceMembers: {
            initMiddle: function () {
                var opts = this.options,
                    $element = this.$element,
                    $data_list = this.$data_list = $element.find(opts.dataListSelector),
                    $load_more = $element.find(opts.loadMoreSelector),
                    $no_content = $element.find(opts.noContentSelector),
                    $loading_top = $element.find(opts.loadingTopSelector),
                    $loading_bottom = $element.find(opts.loadingBottomSelector),
                    $no_more = $element.find(opts.noMoreSelector);

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
                    'get': function () {
                        return this.curState;
                    },
                    isNomore: function () {
                        return this.curState == 'no_more';
                    }
                };

                states.set('init');
            },
            createTplEngine: function () {
                return new MustacheTpl(this.options.tpl);
            },
            beforeQuery: function () {
                var states = this.states;
                if (this.states.isNomore()) return;

                states.set('loading_top');
            },
            querySuccess: function (html, rows, total) {


                var page = 1;
                var page_size = 3;

                if (rows.length == 0 && page == 1) {
                    this.states.set('no_content');
                    return;
                } else if (rows.length < page_size) {
                    this.states.set('no_more');
                    this.$data_list.append(html);
                    return;
                }
                this.states.set('loaded');
                this.$data_list.append(html);
            },
            queryError: function(){
                this.states.set('loaded');
            }
        },
        extend: ListViewBase,
        staticMembers: {
            DEFAULTS: DEFAULTS,
            dataAttr: 'simpleList'
        }
    });

    return ScrollListView;
});