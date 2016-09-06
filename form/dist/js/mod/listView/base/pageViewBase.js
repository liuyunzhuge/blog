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
    };

    var PageViewBase = Class({
        instanceMembers: {
            init: function () {
                var args = Array.prototype.slice.call(arguments);
                var opts, $element;
                /**
                 * 有的分页可能没有跟某个DOM对象关联，比如滚动分页，所以这种分页组件
                 * 在定义的时候只有options没有element
                 */
                if (args.length == 1) {
                    opts = this.getOptions(args[0]);
                } else {
                    $element = this.$element = $(args[0]);
                    opts = this.getOptions(args[1]);
                }
                this.options = opts;

                //初始化，注册事件管理的功能：EventBase
                this.base($element);

                //模板方法，方便子类继承实现，在此处添加特有逻辑
                this.initStart();

                //设置数据属性名称命名空间名称
                this.dataAttr = this.constructor.dataAttr;
                this.namespace = '.' + this.dataAttr;

                //模板方法，方便子类继承实现，在此处添加特有逻辑
                this.initMiddle();

                this.reset();
                this.refresh(0);

                //enable跟disable的作用在于外部使用pageView的时候，通常是在ajax的场景里面
                //所以提供启用禁用的功能，方便外部控制pageView组件是否能响应用户的操作
                //尤其是用户有重复操作等行为时
                this.enable();

                //模板方法，方便子类继承实现，在此处添加特有逻辑
                this.beforeBindEvents();

                //子类可在这里面处理分页点击及分页大小改变的事件
                this.bindEvents();

                //模板方法，方便子类继承实现，在此处添加特有逻辑
                this.initEnd();

                $element && $element.data(this.dataAttr, this);
                this.trigger('pageViewInit' + this.namespace);
            },
            getOptions: function (options) {
                var defaults = this.getDefaults(),
                    _opts = $.extend({}, defaults, this.$element && this.$element.data() || {}, options),
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
                return this.constructor.DEFAULTS;
            },
            //以下四个为模板方法
            initStart: $.noop,
            initMiddle: $.noop,
            beforeBindEvents: $.noop,
            initEnd: $.noop,
            bindEvents: function () {
                var opts = this.options;

                if (typeof(opts.onChange) === 'function') {
                    this.on('pageViewChange' + this.namespace, $.proxy(opts.onChange, this));
                }

                if (typeof(opts.onInit) === 'function') {
                    this.on('pageViewInit' + this.namespace, $.proxy(opts.onInit, this));
                }

            },
            //私有方法，设置分页信息对象
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

            },
            //启用
            enable: function () {
                this.disabled = false;
                this.$element && this.$element.removeClass('disabled');
            },
            //禁用
            disable: function () {
                this.disabled = true;
                this.$element && this.$element.addClass('disabled');
            }
        },
        extend: EventBase,
        staticMembers: {
            DEFAULTS: DEFAULTS,
            dataAttr: 'pageView'
        }
    });

    return PageViewBase;
});