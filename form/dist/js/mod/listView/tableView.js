define(function (require) {
    var $ = require('jquery'),
        MustacheTpl = require('mod/listView/mustacheTpl'),
        SimplePageView = require('mod/listView/simplePageView'),
        ListViewBase = require('mod/listView/base/listViewBase'),
        SimpleSortView = require('mod/listView/simpleSortView'),
        Class = require('mod/class');

    var DEFAULTS = $.extend({}, ListViewBase.DEFAULTS, {
        //是否固定高度，如果固定高度，将会在合适的时候添加纵向滚动条
        heightFixed: false,
        //colgroup的html
        colgroup: '',
        //用来作为标题行的html
        tableHd: '',
        tableViewInitClass: 'table_view_init',
        tableViewHdClass: 'table_view_hd',
        tableHdClass: 'table_hd',
        tableViewBdClass: 'table_view_bd',
        tableBdClass: 'table_bd',
        tableFtViewClass: 'table_ft_view',
        dataListClass: 'data_list',
        pageViewClass: 'table_page_view',
        //布局改变时的回调
        adjustLayout: $.noop,
        //是否进行多列选择
        multipleSelect: false,
        //行选中时添加的css类
        selectedClass: 'selected',
        //全选的checkbox的l类名
        allCheckboxClass: 'table_check_all',
        //单选的checkbox类名
        rowCheckboxClass: 'table_check_row',
        //插件列表
        plugins: [],//{plugin: TableDrag, options: {...}}
    });

    var $window = $(window);

    function isFunc(func) {
        return Object.prototype.toString.call(func) === '[object Function]';
    }

    //类名转换成选择器，如 table_init table_tss => .table_init.table_tss
    function class2Selector(classStr) {
        return ('.' + $.trim(classStr)).replace(/\s+/g, '.');
    }

    //判断是否横向溢出
    function isOverflowX(elem) {
        return elem.clientWidth < elem.scrollWidth;
    }

    //判断是否纵向溢出
    function isOverflowY(elem) {
        return elem.clientHeight < elem.scrollHeight;
    }

    //计算浏览器滚动条的宽度
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

                //设置布局
                this.adjustLayout();

                //初始化行选择的功能
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
            //注册行里面一些元素的click事件，只有click事件需要通过这个方法来注册，其它事件不需要
            //通过这个方法注册的原因是因为，在这些行的子元素点击事件之前，必须先做行选中的操作
            //否则它们的事件回调里面讲无法通过tableView提供的方法获取选择行的一些数据信息
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
            //获取选中的行的jq对象
            getSelectedTrs: function(){
                return this.$tableBd.find('>tbody>tr' + class2Selector(this.options.selectedClass));
            },
            //获取选中的行的索引
            getSelectedIndexs: function(){
                return $.map(this.getSelectedTrs(), function(tr){
                    return $(tr).index()
                });
            },
            _getRowData: function(dataSource,index){
                if(!this[dataSource]) return;
                return this[dataSource][index];
            },
            //从经过opts.parsedData函数解析后的数据里面，获取某一行对应的数据
            getRowData: function(index){
                return this._getRowData('parsedRows', index);
            },
            //从原始的ajax返回的数据里面，获取某一行对应的数据
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
            //从经过opts.parsedData函数解析后的数据里面，获取某个字段的值
            getFields: function(fieldName){
                return this._getFields('parsedRows', fieldName);
            },
            //从经过opts.parsedData函数解析后的数据里面，获取某个字段的值
            getOriginalFields: function(fieldName){
                return this._getFields('originalRows', fieldName);
            },
            getPlugin: function (name) {
                return this.plugins[name];
            },
            //移除插件
            removePlugin: function (name, args) {
                var plugin = this.getPlugin(name);
                if (!plugin) return;

                //插件必须定义destroy方法，才能有效的回收内存
                if (isFunc(plugin.destroy)) {
                    plugin.destroy.apply(plugin, args);
                }

                delete this.plugins[name];
            },
            //添加插件
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
            //调整布局，这个方法tableView结构的核心，任何DOM的变化，或者用户操作，以及浏览器窗口大小改变等都有可能影响tableView的UI
            //所以需要这个方法来统一设置tableView的布局
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
                //DOM改变，调用adjustLayout
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