define(function (require, exports, module) {
    var $ = require('jquery'),
        FormCtrlBase = require('mod/formFieldBase'),
        Class = require('mod/class');

    var DEFAULTS = $.extend({}, FormCtrlBase.DEFAULTS),
        INPUT_SELECTOR = 'input[type=radio]';

    var FormFieldRadio = Class({
        instanceMembers: {
            init: function (element, options) {
                //通过this.base调用父类FormCtrlBase的init方法
                this.base(element, options);

                var that = this,
                    $element = this.$element;

                //获取所有的input元素
                var $inputs = this.$inputs = $element.find(INPUT_SELECTOR);
                //设置它们的name属性，以便能够呈现复选的效果
                $inputs.prop('name', this.name);

                //设置初始值
                this.reset();

                //监听input元素的change事件，并最终通过$element的beforeChange和afterChange来管理
                $element.on('change', INPUT_SELECTOR, function (e) {
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

                this.triggerInit();
            },
            getDefaults: function () {
                return DEFAULTS;
            },
            _setValue: function (value, trigger) {
                //只要trigger不等于false，调用setValue的时候都要触发change事件
                trigger !== false && this.$inputs.eq(0).trigger('change');
            },
            setFieldValue: function (value) {
                if (value !== '') {
                    this.$inputs.filter('[value="' + value + '"]').prop('checked', true);
                } else {
                    this.$inputs.filter(':checked').each(function () {
                        this.checked = false;
                    });
                }
            },
            getValue: function () {
                return this.$inputs.filter(':checked').val();
            },
            disable: function () {
                this.$element.addClass('disabled');
                this.$inputs.prop('disabled', true);
            },
            enable: function () {
                this.$element.removeClass('disabled');
                this.$inputs.prop('disabled', false);
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

    return FormFieldRadio;
});