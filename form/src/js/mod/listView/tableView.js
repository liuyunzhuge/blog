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
        multipleSelect: false,
        selectedClass: 'selected',
        allCheckboxClass: 'table_check_all',
        rowCheckboxClass: 'table_check_row',
        plugins: [],//{plugin: TableDrag, options: {...}}
    });

    var $window = $(window);

    function isFunc(func) {
        return Object.prototype.toString.call(func) === '[object Function]';
    }

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

                this.setUpTableSelect();

                var that = this;
                this.plugins = {};
                opts.plugins.forEach(function (config) {
                    that.addPlugin(config);
                });
            },
            setRowSelected: function ($tr) {
                var opts = this.options,
                    $tableBd = this.$tableBd;

                if (opts.multipleSelect) {
                    //多选
                    $tr.toggleClass(opts.selectedClass).find(class2Selector(opts.rowCheckboxClass)).each(function () {
                        this.checked = $tr.hasClass(opts.selectedClass);
                    });

                    this.$checkAll[0].checked = ($tableBd.find('>tbody>tr:not(' + class2Selector(opts.selectedClass) + ')').length) ?
                        false : true;
                } else {
                    //单选
                    $tableBd.find('>tbody>tr' + class2Selector(opts.selectedClass)).removeClass(opts.selectedClass);
                    $tr.addClass(opts.selectedClass);
                }
            },
            setUpTableSelect: function () {
                var opts = this.options,
                    $tableBd = this.$tableBd,
                    that = this;

                $tableBd.on('click' + this.namespace, '>tbody>tr', function (e) {
                    that.setRowSelected($(this))
                });

                if (opts.multipleSelect) {
                    //全选
                    var $checkAll = this.$checkAll = this.$element.find(class2Selector(opts.allCheckboxClass));

                    $checkAll.on('change' + this.namespace, function (e) {
                        var method = this.checked ? 'addClass' : 'removeClass';

                        $tableBd.find('>tbody>tr').each(function () {
                            var $this = $(this)[method](opts.selectedClass);

                            $this.find(class2Selector(opts.rowCheckboxClass)).each(function () {
                                this.checked = $this.hasClass(opts.selectedClass);
                            });
                        });
                    });
                }
            },
            registClickAction: function(selector, callback){
                var that = this;

                if(!isFunc(callback)) return;

                this.$tableBd.on('click', selector, function(e){
                    e.stopPropagation();

                    var $tr = $(this).closest(class2Selector(that.options.tableBdClass) + ' > tbody > tr');
                    that.setRowSelected($tr);
                    callback.apply(this, [e, $tr]);
                });
            },
            getSelectedTrs: function(){
                return this.$tableBd.find('>tbody>tr' + class2Selector(this.options.selectedClass));
            },
            getSelectedIndexs: function(){
                return $.map(this.getSelectedTrs(), function(tr){
                    return $(tr).index()
                });
            },
            _getRowData: function(dataSource,index){
                if(!this[dataSource]) return;
                return this[dataSource][index];
            },
            getRowData: function(index){
                return this._getRowData('parsedRows', index);
            },
            getOriginalRowData: function(index){
                return this._getRowData('originalRows', index);
            },
            _getFields: function(dataSource, fieldName){
                var that = this, ret = [];

                if(!this[dataSource]) return ret;

                this.getSelectedIndexs().forEach(function(i){
                    var d = that[dataSource][i];
                    if(d && (fieldName in d)) {
                        ret.push(d[fieldName]);
                    }
                });

                return ret;
            },
            getFields: function(fieldName){
                return this._getFields('parsedRows', fieldName);
            },
            getOriginalFields: function(fieldName){
                return this._getFields('originalRows', fieldName);
            },
            getPlugin: function (name) {
                return this.plugins[name];
            },
            removePlugin: function (name, args) {
                var plugin = this.getPlugin(name);
                if (!plugin) return;

                if (isFunc(plugin.destroy)) {
                    plugin.destroy.apply(plugin, args);
                }

                delete this.plugins[name];
            },
            addPlugin: function (config) {
                if (!config.name) {
                    throw "plugin config must have [name] option";
                }
                if (!config.plugin) {
                    throw "plugin config must have [plugin] option";
                }
                if (!isFunc(config.plugin)) {
                    throw "plugin config 's [plugin] options must be a constructor";
                }

                this.removePlugin(name);
                this.plugins[config.name] = new config.plugin(this, config.options);
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