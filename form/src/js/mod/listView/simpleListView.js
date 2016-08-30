define(function (require) {
    var $ = require('jquery'),
        MustacheEngine = require('mod/listView/mustacheEngine'),
        PageView = require('mod/pageView'),
        ListViewBase = require('mod/listView/listViewBase'),
        Class = require('mod/class');

    var DEFAULTS = $.extend({}, ListViewBase.DEFAULTS, {
        //列表容器的选择器
        dataListSelector: '.data_list',
        //分页组件选择器
        pageViewSelector: '.page_view'
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
                    pageView = new PageView(this.$element.find(opts.pageViewSelector), $.extend(opts.pageView));
                }
                return pageView;
            },
            createTplEngine: MustacheEngine,
            querySuccess: function (html, rows, total) {
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