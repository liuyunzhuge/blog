define(function (require, exports, module) {
    var $ = require('jquery'),
        PageViewBase = require('mod/listView/base/pageViewBase'),
        Class = require('mod/class');

    var DEFAULTS = $.extend({}, PageViewBase.DEFAULTS, {
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
    });

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

    var SimplePageView = Class({
        instanceMembers: {
            bindEvents: function () {
                //子类在实现bindEvents时，必须先调用父类的同名方法
                this.base();

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
            }
        },
        extend: PageViewBase,
        staticMembers: {
            DEFAULTS: DEFAULTS,
            dataAttr: 'simplePageView',
            create: function(){
                return $('<div class="page_wrapper"><ul class="page_view"></ul></div>');
            }
        }
    });

    return SimplePageView;
});