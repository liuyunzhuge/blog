define(function (require) {
    var $ = require('jquery'),
        MustacheTpl = require('mod/listView/MustacheTpl'),
        SimplePageView = require('mod/listView/simplePageView'),
        ListViewBase = require('mod/listView/base/listViewBase'),
        SimpleSortView = require('mod/listView/simpleSortView'),
        Class = require('mod/class');

    var DEFAULTS = $.extend({}, ListViewBase.DEFAULTS, {
        colgroup: '',
        tableHd: '',
        tableViewHdClass: 'table_view_hd',
        tableHdClass: 'table_hd',
        tableViewBdClass: 'table_view_bd',
        tableBdClass: 'table_bd',
        tableFtViewClass: 'table_ft_view',
        dataListClass: 'data_list',
        pageViewClass: 'table_page_view'
    });

    //todo 序号列，单选，多选，滚动，拖拽，获取字段值

    function class2Selector(classStr) {
        return ('.' + $.trim(classStr)).replace(/\s+/g,'.');
    }

    var TableView = Class({
        instanceMembers: {
            initMiddle: function () {
                var opts = this.options,
                    $element = this.$element;

                //缓存核心的jq对象

                this.$tableHdView = $(['<div class="',
                    opts.tableViewHdClass,
                    '"></div>'].join('')).appendTo($element);

                this.$tableBdView = $(['<div class="',
                    opts.tableViewBdClass,
                    '"></div>'].join('')).appendTo($element);

                this.$tableHd = $(['<table class="',
                    opts.tableHdClass,
                    '">',
                    opts.colgroup || '',
                    '<thead>',
                    opts.tableHd || '',
                    '</thead>',
                    '</table>'].join("")).appendTo(this.$tableHdView);

                this.$tableBd = $(['<table class="',
                    opts.tableBdClass,
                    '">',
                    opts.colgroup || '',
                    '    <tbody class="',
                    opts.dataListClass,
                    '">',
                    '    </tbody>',
                    '</table>'].join("")).appendTo(this.$tableBdView);

                this.$data_list = this.$tableBd.children(class2Selector(opts.dataListClass));
            },
            initEnd: function(){
                this.$element.show();
            },
            createPageView: function () {
                var pageView,
                    opts = this.options;

                if (opts.pageView) {
                    //初始化分页组件
                    delete opts.pageView.onChange;

                    this.$tableFtView = $(['<div class="',
                        opts.tableFtViewClass,
                        '"><ul class="',
                        opts.pageViewClass,
                        '"></ul></div>'].join('')).appendTo(this.$element);

                    pageView = new SimplePageView(this.$tableFtView.children(class2Selector(opts.pageViewClass)), opts.pageView);
                }
                return pageView;
            },
            createSortView: function () {
                var sortView,
                    opts = this.options;

                if (opts.sortView) {
                    //初始化分页组件
                    delete opts.sortView.onChange;
                    sortView = new SimpleSortView(this.$tableHd, opts.sortView);
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
            dataAttr: 'tableView'
        }
    });

    return TableView;
});