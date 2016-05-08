define(function (require, exports, module) {
    var $ = require('jquery'),
        EventBase = require('mod/eventBase'),
        Class = require('mod/class');

    var DEFAULTS = {
        name: '',//字段名称
        type: '',//字段类型：text checkbox radio date number select ueditor等
        value: '',//在mode为2,3时显示的值
        defaultValue: '',//在mode为1时显示的值
        mode: 1,//可选值有1,2,3，分别代表字段属于新增，编辑和查看模式
        onBeforeChange: $.noop,//在字段相关表单元素的value的值发生改变前触发，这个回调可以对字段的值做一些校验
        onAfterChange: $.noop,//在字段相关表单元素的value的值发生改变后触发
        onInit: $.noop//在字段初始化完毕之后调用
    };

    function parseValue(value) {
        //特殊情况处理：当initValue是一个函数或者对象时
        typeof(value) == 'function' && (value = value());
        typeof(value) == 'object' && (value = JSON.stringify(value));
        return $.trim(value);
    }

    var FormFieldBase = Class({
        instanceMembers: {
            init: function (element, options) {
                var $element = this.$element = $(element);
                //通过this.base调用父类EventBase的init方法
                this.base($element);

                var opts = this.options = this.getOptions(options), that = this;
                //获取field的name
                //name有三种来源：opts.name,data-name属性以及name属性
                this.name = opts.name || $element.attr('name');
                //获取field的mode值：1,2,3分别代表新增，编辑和查看模式
                this.mode = ~~opts.mode;
                //获取field的初始值
                this.initValue = (function () {
                    var initValue;
                    if (that.mode === 1) {
                        //新增模式时使用defaultValue作为初始值
                        initValue = opts.defaultValue;
                    } else {
                        //非新增模式时一般情况下用value作为初始值
                        //如果value值为空，判断字段对应的元素有没有val的jquery方法
                        //有的话通过该方法再获取一次值
                        initValue = $.trim(opts.value) == '' ?
                            (('val' in $element) && $element.val()) :
                            opts.value;
                    }

                    return parseValue(initValue);
                })();
                //获取field的类型
                this.type = opts.type;

                delete opts.value;
                delete opts.defaultValue;
                delete opts.mode;
                delete opts.name;
                delete opts.type;

                //注册两个基本事件的监听
                if (typeof(opts.onAfterChange) === 'function') {
                    this.on('afterChange', $.proxy(opts.onAfterChange, this));
                }

                if (typeof(opts.onBeforeChange) === 'function') {
                    this.on('beforeChange', $.proxy(opts.onBeforeChange, this));
                }

                if (typeof(opts.onInit) === 'function') {
                    this.on('formFieldInit', $.proxy(opts.onInit, this));
                    this.on('formFieldInit', $.proxy(function(){
                        if(this.mode === 3) {
                            this.disable();
                        }
                    }, this));
                }

                $element.data('formField', this);
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
            triggerInit: function () {
                this.trigger('formFieldInit');
            },
            destroy: function () {
                this.base();
                this.$element.data('formField', null);
                this.options = undefined;
                this.$element = undefined;
                this.name = undefined;
                this.initValue = undefined;
                this.mode = undefined;
                this.type = undefined;
            },
            setValue: function (value, trigger) {
                value = $.trim(parseValue(value));

                //如果跟原来的值相同则不处理
                if (value === $.trim(this.getValue())) return;

                //将input的值设置成value
                this.setFieldValue(value);

                this._setValue(value, trigger);
            },
            //子类实现这个
            _setValue: $.noop,
            setFieldValue: $.noop,
            getValue: $.noop,
            enable: $.noop,
            disable: $.noop,
            reset: $.noop
        },
        extend: EventBase,
        staticMembers: {
            DEFAULTS: DEFAULTS
        }
    });

    return FormFieldBase;
});