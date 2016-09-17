define(function (require, exports, module) {
    var $ = require('jquery'),
        EventBase = require('mod/eventBase'),
        SortFields = require('mod/listView/base/sortFields'),
        Class = require('mod/class');

    var DEFAULTS = {
        config: [],//排序字段的配置
        sortParamName: 'sort_fields',//排序参数名称
        onChange: $.noop,//排序改变时的回调
        onInit: $.noop,//初始化完毕的回调
    };

    var SortViewBase = Class({
        instanceMembers: {
            init: function () {
                var args = Array.prototype.slice.call(arguments);
                var opts, $element, that = this;
                /**
                 * 有的排序管理对象可能没有跟某个DOM对象关联，所以在定义的时候只有options没有element
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

                //初始化一个内部的排序管理组件SortFields的实例
                var _render = $.proxy(this.render, this);
                this.sortFields = new SortFields({
                    config: opts.config,
                    onReset: _render,
                    onStateChange: _render,
                    onSortChange: function (e) {
                        that.trigger('sortViewChange' + that.namespace);
                    }
                });
                this.render();

                //模板方法，方便子类继承实现，在此处添加特有逻辑
                this.beforeBindEvents();

                //子类可在这里面处理分页点击及分页大小改变的事件
                this.bindEvents();

                //模板方法，方便子类继承实现，在此处添加特有逻辑
                this.initEnd();

                $element && $element.data(this.dataAttr, this);
                this.trigger('sortViewInit' + this.namespace);
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
                    this.on('sortViewChange' + this.namespace, $.proxy(opts.onChange, this));
                }

                if (typeof(opts.onInit) === 'function') {
                    this.on('sortViewInit' + this.namespace, $.proxy(opts.onInit, this));
                }

            },
            //待子类实现
            render: function () {

            },
            reset: function () {
                this.sortFields.reset();
            },
            //获取排序参数
            getParams: function () {
                var p = {};
                p[this.options.sortParamName] = JSON.stringify(this.sortFields.getValue());
                return p;
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
            dataAttr: 'sortView'
        }
    });

    return SortViewBase;
});