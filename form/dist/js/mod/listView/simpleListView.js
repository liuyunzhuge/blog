define(function (require, exports, module) {
    var $ = require('jquery'),
        ms = require('mustache'),
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
            initStart: $.noop,
            initMiddle: function () {
                var opts = this.options,
                    $element = this.$element;

                //缓存核心的jq对象
                this.$data_list = $element.find(opts.dataListSelector);
                this.$page_view = $element.find(opts.pageViewSelector);
            },
            initEnd: $.noop,
            createPageView: function () {
                var pageView,
                    that = this,
                    opts = this.options;

                if (opts.pageView) {
                    //初始化分页组件
                    pageView = new PageView(this.$page_view, $.extend(opts.pageView, {
                        onChange: function () {
                            that.refresh();
                        }
                    }));
                }
                return pageView;
            },
            createTplEngine: function () {
                var tpl;
                return {
                    compile: function (_tpl) {
                        ms.parse(_tpl);
                        tpl = _tpl;
                    },
                    render: function (source) {
                        return ms.render(tpl, source);
                    }
                }
            },
            bindEvents: function () {
                var opts = this.options;

                this.base();
            },
            querySuccess: function (html, rows, total) {
                console.log(html);
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