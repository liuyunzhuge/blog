define(function (require, exports, module) {
    var $ = require('jquery'),
        FormCtrlBase = require('mod/formFieldBase'),
        Class = require('mod/class'),
        Ajax = require('mod/ajax');

    var DEFAULTS = $.extend({}, FormCtrlBase.DEFAULTS, {
        url: '',
        textField: 'text',
        valueField: 'value',
        autoAddEmptyOption: true,
        emptyOptionText: '&nbsp;',
        parseAjax: function (res) {
            if (res.code == 1) {
                return res.data || [];
            } else {
                return [];
            }
        }
    });

    var FormFieldSelect = Class({
        instanceMembers: {
            init: function (element, options) {
                //通过this.base调用父类FormCtrlBase的init方法
                this.base(element, options);

                var opts = this.options, _ajax;
                if (!opts.url) {
                    //设置初始值
                    this.reset();
                } else {
                    _ajax = Ajax.get(opts.url);
                }

                var that = this,
                    $element = this.$element;

                //监听input元素的change事件，并最终通过beforeChange和afterChange来管理
                $element.on('change', function (e) {
                    var val = that.getValue(), event;

                    if (val === that.lastValue) return;

                    that.trigger((event = $.Event('beforeChange')), val);
                    //判断beforeChange事件有没有被阻止默认行为
                    //如果有则把input的值还原成最后一次修改的值
                    if (event.isDefaultPrevented()) {
                        that.setFieldValue(that.lastValue);
                        $element.focus();
                        return;
                    }

                    //记录最新的input的值
                    that.lastValue = val;
                    that.trigger('afterChange', val);
                });

                if (!_ajax) {
                    this.triggerInit();
                } else {
                    _ajax.done(function (res) {
                        var data = opts.parseAjax(res);
                        that.render(data);
                        that.reset();
                        that.triggerInit();
                    })
                }
            },
            getDefaults: function () {
                return DEFAULTS;
            },
            _setValue: function (value, trigger) {
                //只要trigger不等于false，调用setValue的时候都要触发change事件
                trigger !== false && this.$element.trigger('change');
            },
            render: function (data, clear) {
                if (Object.prototype.toString.call(data) != '[object Array]') {
                    data = [];
                }

                var opts = this.options,
                    textField = opts.textField,
                    valueField = opts.valueField,
                    l = data.length,
                    $element = this.$element;

                if(clear === true){
                    $element.html('');
                    this.lastValue = '';
                }

                if (opts.autoAddEmptyOption) {
                    var o = {};
                    o[textField] = opts.emptyOptionText;
                    o[valueField] = '';
                    //other fileds ?
                    l = data.unshift(o);
                }

                var html = [];
                for (var i = 0; i < l; i++) {
                    html.push(['<option value="',
                        data[i][valueField],
                        '">',
                        data[i][textField],
                        '</option>'].join(''));
                }

                l && $element.append(html.join(''));
            },
            setFieldValue: function (value) {
                this.$element.val(value.split(','));
            },
            getValue: function () {
                var value = this.$element.val();
                if (Object.prototype.toString.call(value) === '[object Array]') {
                    return value.join(',');
                }
                return value === null ? '' : value;
            },
            disable: function () {
                this.$element.addClass('disabled').prop('disabled', true);
            },
            enable: function () {
                this.$element.removeClass('disabled').prop('disabled', false);
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

    return FormFieldSelect;
});