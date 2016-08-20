define(function (require, exports, module) {
    var $ = require('jquery'),
        EventBase = require('mod/eventBase'),
        Class = require('mod/class');

    var DEFAULTS = {
        defaultIndex: 1,//默认页
        defaultSize: 10,//默认分页大小
        pageIndexName: 'page',//分页参数名称
        pageSizeName: 'page_size',//分页大小参数名称
        onChange: $.noop,//分页改变或分页大小改变时的回调
        onInit: $.noop,//初始化完毕的回调
        allowActiveClick: true,//控制当前页是否允许重复点击刷新
        middlePageItems: 4,//中间连续部分显示的分页项
        frontPageItems: 3,//分页起始部分最多显示3个分页项，否则就会出现省略分页项
        backPageItems: 2,//分页结束部分最多显示2个分页项，否则就会出现省略分页项
        ellipseText: '...',//中间省略部分的文本
        prevText: '上一页',
        nextText: '下一页',
        prevDisplay: true,//是否显示上一页按钮
        nextDisplay: true,//是否显示下一页按钮
        firstText: '首页',
        lastText: '尾页',
        firstDisplay: false,//是否显示首页按钮
        lastDisplay: false,//是否显示尾页按钮
    };

    /**
     * 获取连续部分的起止索引
     */
    function getInterval(data, opts) {
        var ne_half = Math.ceil(opts.middlePageItems / 2);
        var np = data.pages;
        var upper_limit = np - opts.middlePageItems;
        var start = data.pageIndex > ne_half ? Math.max(Math.min(data.pageIndex - ne_half, upper_limit), 0) : 0;
        var end = data.pageIndex > ne_half ? Math.min(data.pageIndex + ne_half, np) : Math.min(opts.middlePageItems, np);
        return [start, end];
    }

    var PageView = Class({
        instanceMembers: {
            init: function (element, options) {
                var $element = this.$element = $(element);
                var opts = this.options = this.getOptions(options);

                //初始化
                this.base($element);
                this.reset();
                this.refresh(0);

                //enable跟disable的作用在于外部使用pageView的时候，通常是在ajax的场景里面
                //所以提供启用禁用的功能，方便外部控制pageView组件是否能响应用户的操作
                //尤其是用户有重复操作等行为时
                this.enable();

                if (typeof(opts.onChange) === 'function') {
                    this.on('pageViewChange', $.proxy(opts.onChange, this));
                }

                if (typeof(opts.onInit) === 'function') {
                    this.on('pageViewInit', $.proxy(opts.onInit, this));
                }

                //子类可在这里面处理分页点击及分页大小改变的事件
                this.bindEvents();

                $element.data('pageView', this);

                this.trigger('pageViewInit');
            },
            getOptions: function (options) {
                var defaults = this.getDefaults(),
                    _opts = $.extend({}, defaults, this.$element.data() || {}, options),
                    opts = {};

                //保证返回的对象内容项始终与当前类定义的DEFAULTS的内容项保持一致
                for (var i in defaults) {
                    if (Object.prototype.hasOwnProperty.call(defaults, i)) {
                        opts[i] = _opts[i];
                    }
                }

                return opts;
            },
            getDefaults: function () {
                return DEFAULTS;
            },
            bindEvents: function () {
                var that = this,
                    opts = this.options,
                    $element = this.$element;

                function pageIndexChange(pageIndex) {
                    if (that.disabled) return;

                    that.pageIndex = pageIndex;

                    that.trigger('pageViewChange');
                }

                //首页
                opts.firstDisplay && $element.on('click', '.first:not(.disabled) a', function (e) {
                    e.preventDefault();
                    pageIndexChange(1);
                });

                //末页
                opts.lastDisplay && $element.on('click', '.last:not(.disabled) a', function (e) {
                    e.preventDefault();
                    pageIndexChange(that.data.pages);
                });

                //上一页
                opts.prevDisplay && $element.on('click', '.prev:not(.disabled) a', function (e) {
                    e.preventDefault();
                    pageIndexChange(that.pageIndex - 1);
                });

                //下一页
                opts.nextDisplay && $element.on('click', '.next:not(.disabled) a', function (e) {
                    e.preventDefault();
                    pageIndexChange(that.pageIndex + 1);
                });

                //具体页
                $element.on('click', '.page a', function (e) {
                    e.preventDefault();

                    var $this = $(this),
                        callback = true;

                    if ($this.parent().hasClass('active') && !opts.allowActiveClick) {
                        callback = false;
                    }

                    callback && pageIndexChange(parseInt($.trim($this.text())), $this);
                });
            },
            _setup: function (total) {
                //分页信息对象，可用于渲染UI
                var data = this.data = {};

                //当前页
                var pageIndex = data.pageIndex = this.pageIndex;
                //分页大小
                var pageSize = data.pageSize = this.pageSize;
                //总记录数
                data.total = total;
                //总页数
                var pages = data.pages = parseInt(Math.floor(total == 0 ? 1 : ((total % pageSize) == 0 ? total / pageSize : (total / pageSize + 1))));

                //当前页的记录范围
                data.start = total == 0 ? 0 : ((pageIndex - 1) * pageSize + 1);
                data.end = total == 0 ? 0 : (pageIndex == pages) ? total : pageSize * pageIndex;

                //是否为第一页，是否为最后一页
                data.first = pageIndex == 1;
                data.last = pageIndex == pages;
            },
            reset: function () {
                this.pageIndex = this.options.defaultIndex;
                this.pageSize = this.options.defaultSize;
            },
            //获取分页参数
            getParams: function () {
                var p = {};
                p[this.options.pageIndexName] = this.pageIndex;
                p[this.options.pageSizeName] = this.pageSize;
                return p;
            },
            //传递一个记录总数来刷新分页状态
            refresh: function (total) {
                this._setup(total);
                this.render();
            },
            //子类需覆盖此方法，呈现分页UI
            render: function () {
                var data = this.data,
                    opts = this.options;

                var html = [];

                //首页
                opts.firstDisplay && html.push([
                    '<li class="first ',
                    data.first ? 'disabled' : '',
                    '"><a href="javascript:;">',
                    opts.firstText,
                    '</a></li>'
                ].join(''));

                //上一页
                opts.prevDisplay && html.push([
                    '<li class="prev ',
                    data.first ? 'disabled' : '',
                    '"><a href="javascript:;">',
                    opts.prevText,
                    '</a></li>'
                ].join(''));

                function appendItem(page) {
                    page = page + 1;

                    html.push([
                        '<li class="page ',
                        page == data.pageIndex ? 'active' : '',
                        '"><a href="javascript:;">',
                        page,
                        '</a></li>',
                    ].join(''));
                }

                function appendEllItem() {
                    html.push([
                        '<li class="page page_ell',
                        '"><span>',
                        opts.ellipseText,
                        '</span></li>',
                    ].join(''));
                }

                var interval = getInterval(data, opts);

                // 产生起始点
                if (interval[0] > 0 && opts.frontPageItems > 0) {
                    var end = Math.min(opts.frontPageItems, interval[0]);
                    for (var i = 0; i < end; i++) {
                        appendItem(i);
                    }
                    if (opts.frontPageItems < interval[0] && opts.ellipseText) {
                        appendEllItem();
                    }
                }

                // 产生内部的些链接
                for (var i = interval[0]; i < interval[1]; i++) {
                    appendItem(i);
                }

                // 产生结束点
                if (interval[1] < data.pages && opts.backPageItems > 0) {
                    if (data.pages - opts.backPageItems > interval[1] && opts.ellipseText) {
                        appendEllItem();
                    }
                    var begin = Math.max(data.pages - opts.backPageItems, interval[1]);
                    for (var i = begin; i < data.pages; i++) {
                        appendItem(i);
                    }
                }

                //下一页
                opts.nextDisplay && html.push([
                    '<li class="next ',
                    data.last ? 'disabled' : '',
                    '"><a href="javascript:;">',
                    opts.nextText,
                    '</a></li>'
                ].join(''));

                //尾页
                opts.lastDisplay && html.push([
                    '<li class="last ',
                    data.last ? 'disabled' : '',
                    '"><a href="javascript:;">',
                    opts.lastText,
                    '</a></li>'
                ].join(''));

                this.$element.html(html.join(''));
            },
            //启用
            enable: function () {
                this.disabled = false;
                this.$element.removeClass('disabled');
            },
            //禁用
            disable: function () {
                this.disabled = true;
                this.$element.addClass('disabled');
            }
        },
        extend: EventBase,
        staticMembers: {
            DEFAULTS: DEFAULTS,
            createElement: function () {
                return $('<ul class="page_view"></ul>');
            }
        }
    });

    return PageView;
});