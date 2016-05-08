define(function (require, exports, module) {
    var $ = require('jquery'),
        FormCtrlBase = require('mod/formFieldBase'),
        Class = require('mod/class');

    var DEFAULTS = $.extend({}, FormCtrlBase.DEFAULTS);

    var FormFieldText = Class({
        instanceMembers: {
            init: function (element, options) {
                //通过this.base调用父类FormCtrlBase的init方法
                this.base(element, options);
                //设置初始值
                this.reset();

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
                        $element.focus().select();
                        return;
                    }

                    //记录最新的input的值
                    that.lastValue = val;
                    that.trigger('afterChange', val);
                });

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
                var $element = this.$element,
                    elementDom = this.$element[0];
                if (elementDom.tagName.toUpperCase() === 'TEXTAREA') {
                    var v = ' ' + value;
                    elementDom.value = v;
                    elementDom.value = v.substring(1);
                } else {
                    $element.val(value);
                }
            },
            getValue: function () {
                return this.$element.val();
            },
            disable: function () {
                this.$element.addClass('disabled').prop('readonly', true);
            },
            enable: function () {
                this.$element.removeClass('disabled').prop('readonly', false);
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

    return FormFieldText;
});