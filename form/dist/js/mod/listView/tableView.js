define(function (require) {
    var $ = require('jquery'),
        MustacheTpl = require('mod/listView/MustacheTpl'),
        SimplePageView = require('mod/listView/simplePageView'),
        ListViewBase = require('mod/listView/base/listViewBase'),
        SimpleSortView = require('mod/listView/simpleSortView'),
        Class = require('mod/class');

    var DEFAULTS = $.extend({}, ListViewBase.DEFAULTS, {
        heightFixed: false,
        colgroup: '',
        tableHd: '',
        tableViewInitClass: 'table_view_init',
        tableViewHdClass: 'table_view_hd',
        tableHdClass: 'table_hd',
        tableViewBdClass: 'table_view_bd',
        tableBdClass: 'table_bd',
        tableFtViewClass: 'table_ft_view',
        dataListClass: 'data_list',
        pageViewClass: 'table_page_view',
        adjustLayout: $.noop,
        plugins: [],//{plugin: TableDrag, options: {...}}
    });

    var $window = $(window);

    //todo 序号列，单选，多选，滚动，拖拽，获取字段值

    function class2Selector(classStr) {
        return ('.' + $.trim(classStr)).replace(/\s+/g, '.');
    }

    function isOverflowX(elem) {
        return elem.clientWidth < elem.scrollWidth;
    }

    function isOverflowY(elem) {
        return elem.clientHeight < elem.scrollHeight;
    }

    function scrollbarWidth() {
        var body = document.body,
            e = document.createElement('div');

        e.style.cssText = 'position: absolute; top: -9999px; width: 50px; height: 50px; overflow: scroll;';

        body.appendChild(e);
        var _scrollbarWidth = e.offsetWidth - e.clientWidth
        body.removeChild(e);
        return _scrollbarWidth;
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

                this.namespace_rnd = Math.round(Math.random() * 10000);

                this.setHeightFixed(opts.heightFixed);
            },
            initEnd: function () {
                var opts = this.options;

                this.$element.addClass(opts.tableViewInitClass);

                this.adjustLayout();

                var that = this;
                opts.plugins.forEach(function (config) {
                    new config.plugin(that, config.options)
                });
            },
            bindEvents: function () {
                var opts = this.options,
                    that = this;

                this.base();

                $window.on('resize' + this.namespace + '.' + this.namespace_rnd, function () {
                    that.adjustLayout();
                });

                if (typeof(opts.adjustLayout) === 'function') {
                    this.on('adjustLayout' + this.namespace, $.proxy(opts.adjustLayout, this));
                }
            },
            //调整布局
            adjustLayout: function () {
                this.adjustPaddingTop();
                this.adjustTableHdViewPos();
                this.adjustTableBdViewHeight();
                this.checkTableBdScrollState();

                this.trigger('adjustLayout' + this.namespace);
            },
            adjustPaddingTop: function () {
                this.$element.css('padding-top', this.$tableHdView.outerHeight() + 'px')
            },
            adjustTableHdViewPos: function () {
                this.$tableHd.css('left', -1 * this.$tableBdView.scrollLeft() + 'px');
            },
            adjustTableBdViewHeight: function () {
                if (this.heightFixed) {
                    this.$tableBdView.css('height', ( this.$element.outerHeight() - this.$tableHdView.outerHeight()) + 'px');
                    if (!isOverflowY(this.$tableBdView[0])) {
                        this.$tableBdView.css('height', '');
                    }
                } else {
                    this.$tableBdView.css('height', '');
                }
            },
            checkTableBdScrollState: function () {
                var scrollState = this.tableBdScrollState,
                    opts = this.options,
                    that = this;

                if (scrollState) {
                    if (scrollState.scrollX) {
                        this.$tableBdView.off('scroll' + this.namespace);
                    }

                    if (scrollState.scrollY) {
                        this.$tableHdView.css('padding-right', '');
                    }
                }

                scrollState = this.tableBdScrollState = {
                    scrollX: false,
                    scrollY: false
                };

                if (isOverflowX(this.$tableBdView[0])) {
                    scrollState.scrollX = true;
                }

                if (isOverflowY(this.$tableBdView[0])) {
                    scrollState.scrollY = true;
                }

                if (scrollState.scrollX) {
                    this.$tableBdView.on('scroll' + this.namespace, function () {
                        that.adjustTableHdViewPos();
                    });
                }

                if (scrollState.scrollY) {
                    this.$tableHdView.css('padding-right', scrollbarWidth() + 'px');
                }
            },
            setHeightFixed: function (heightFixed) {
                this.heightFixed = heightFixed;
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
                this.adjustLayout();
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