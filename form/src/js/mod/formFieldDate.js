define(function (require, exports, module) {
    var $ = require('jquery'),
        FormCtrlBase = require('mod/formFieldBase'),
        hasOwn = Object.prototype.hasOwnProperty,
        Class = require('mod/class');

    //引入picker组件
    require('mod/datepicker');

    var DEFAULTS = $.extend({}, FormCtrlBase.DEFAULTS),
        DATEPICKER_DEFAULTS = $.extend($.fn.datepicker.defaults, {
            autoclose: true,
            language: 'zh-CN',
            format: 'yyyy-mm-dd',
            todayHighlight: true
        });

    function getPickerOptions(options) {
        var opts = {};
        for (var i in DATEPICKER_DEFAULTS) {
            if (hasOwn.call(DATEPICKER_DEFAULTS, i) && (i in options)) {
                opts[i] = options[i];
            }
        }
        return opts;
    }

    var FormFieldDate = Class({
        instanceMembers: {
            init: function (element, options) {
                //通过this.base调用父类FormCtrlBase的init方法
                this.base(element, options);
                //设置初始值
                this.reset();

                //pickerOptions是datepick组件需要的
                this.pickerOptions = getPickerOptions(this.options);

                var that = this,
                    $element = this.$element;

                //监听input元素的change事件，并最终通过beforeChange和afterChange来管理
                $element.on('change', function (e) {
                    var val = that.getValue(), event;

                    if(val === that.lastValue) return;

                    that.trigger((event = $.Event('beforeChange')), val);
                    //判断beforeChange事件有没有被阻止默认行为
                    //如果有则把input的值还原成最后一次修改的值
                    if (event.isDefaultPrevented()) {
                        that.setFieldValue(that.lastValue);
                        return;
                    }

                    //记录最新的input的值
                    that.lastValue = val;
                    that.trigger('afterChange', val);
                });

                //初始化datepicker组件
                $element.datepicker(this.pickerOptions);

                this.triggerInit();
            },
            getDefaults: function () {
                return DEFAULTS;
            },
            _setValue: function (value, trigger) {
                //只要trigger不等于false，调用setValue的时候都要触发change事件
                trigger !== false && this.$element.trigger('change');
            },
            setFieldValue: function (value) {
                this.$element.val(value).datepicker('update').blur();
            },
            getValue: function () {
                return this.$element.val();
            },
            disable: function () {
                //datapicker组件没有disable的方法
                //所以禁用和启用只能通过destroy后重新初始化来实现
                this.$element.addClass('disabled').prop('readonly', true).datepicker('destroy');
            },
            enable: function () {
                this.$element.removeClass('disabled').prop('readonly', false).datepicker(this.pickerOptions);
            },
            reset: function () {
                this.setFieldValue(this.initValue);
                this.lastValue = this.initValue;
            }
        },
        extend: FormCtrlBase,
        staticMembers: {
            DEFAULTS: DEFAULTS
        }
    });

    return FormFieldDate;
});