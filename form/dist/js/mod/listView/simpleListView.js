define(function (require) {
    var $ = require('jquery'),
        MustacheTpl = require('mod/listView/mustacheTpl'),
        SimplePageView = require('mod/listView/simplePageView'),
        SimpleSortView = require('mod/listView/simpleSortView'),
        ListViewBase = require('mod/listView/base/listViewBase'),
        Class = require('mod/class');

    var DEFAULTS = $.extend({}, ListViewBase.DEFAULTS, {
        //列表容器的选择器
        dataListSelector: '.data_list',
        //分页组件选择器
        pageViewSelector: '.page_view',
        //排序组件选择器
        sortViewSelector: '.sort_view'
    });

    var SimpleListView = Class({
        instanceMembers: {
            initMiddle: function () {
                var opts = this.options,
                    $element = this.$element;

                //缓存核心的jq对象
                this.$data_list = $element.find(opts.dataListSelector);
            },
            createPageView: function () {
                var pageView,
                    opts = this.options;

                if (opts.pageView) {
                    //初始化分页组件
                    delete opts.pageView.onChange;
                    this.$element.append(SimplePageView.create());
                    pageView = new SimplePageView(this.$element.find(opts.pageViewSelector), opts.pageView);
                }
                return pageView;
            },
            createSortView: function () {
                var sortView,
                    opts = this.options;

                if (opts.sortView) {
                    //初始化分页组件
                    delete opts.sortView.onChange;
                    sortView = new SimpleSortView(this.$element.find(opts.sortViewSelector), opts.sortView);
                }
                return sortView;
            },
            createTplEngine: function () {
                return new MustacheTpl(this.options.tpl);
            },
            querySuccess: function (html, args) {
                this.$data_list.html(html);
            }
        },
        extend: ListViewBase,
        staticMembers: {
            DEFAULTS: DEFAULTS,
            dataAttr: 'simpleList'
        }
    });

    return SimpleListView;
});