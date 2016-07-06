define(function (require, exports, module) {
    var $ = require('jquery'),
        Class = require('mod/class'),
        hasOwn = Object.prototype.hasOwnProperty,
        isFunc = function (f) {
            return Object.prototype.toString.call(f) === '[object Function]';
        };

    require('jquery.validate');
    require('bootstrap');
    //require('additional-methods');

    /**
     * hidden 元素不会自动触发jq validation插件的校验
     * 必须通过外部的api主动调用
     * jq validation提供了element方法，可以对单个元素进行校验
     */

    $.extend($.validator.messages, {
        required: "请输入必填字段.",
        remote: "请重新输入该字段.",
        email: "请输入合法的邮箱.",
        url: "请输入合法的网址.",
        date: "请输入合法的日期.",
        dateISO: "请输入合法的日期( ISO ).",
        number: "请输入合法的数字.",
        digits: "请输入整数.",
        equalTo: "请再次输入相同的内容.",
        maxlength: $.validator.format("您最多可输入{0}个字符."),
        minlength: $.validator.format("您至少要输入{0}个字符."),
        rangelength: $.validator.format("请输入{0}-{1}个字符."),
        range: $.validator.format("请输入{0}-{1}之间的值."),
        max: $.validator.format("请输入小于等于{0}的值."),
        min: $.validator.format("请输入大于等于{0}的值."),
        step: $.validator.format("Please enter a multiple of {0}.")
    });

    var CUSTOM_ERROR_ELEMENT = function ($target, opts) {
            !$target.hasClass(opts.errorClass) && $target.removeClass(opts.validClass)
                .addClass('fv-valid-container ' + opts.errorClass);

            //fv-valid-container这个class很关键，在validation reset方法中
            //将根据它来进行部分重置逻辑
        },
        CUSTOM_VALID_ELEMENT = function ($target, opts) {
            !$target.hasClass(opts.validClass) && $target.removeClass(opts.errorClass)
                .addClass(opts.validClass);
        },
        DEFAULTS = {
            tipPlacement: 'right',
            tipDuration: 2000,
            config: {},
            debug: true,
            submitHandler: $.noop,
            ignore: '[type="hidden"]:not(.fv-yes),[disabled]:not(.fv-yes),.fv-no',
            errorElement: 'i',
            errorClass: 'fv-error',
            validClass: 'fv-valid',
            customValidateEvent: {
                //checkbox radio hidden都不会在change事件发生的时候主动触发校验
                //所以通过注册下面这些事件来手动触发
                checkbox: function ($field) {
                    var that = this;
                    $field.closest('[data-type="checkbox"]').on('afterChange.validate', function () {
                        that.validateField($field[0]);
                    });
                },
                radio: function ($field) {
                    var that = this;
                    $field.closest('[data-type="radio"]').on('afterChange.validate', function () {
                        that.validateField($field[0]);
                    });
                },
                //只有hidden才会用下面的
                hidden: function ($field) {
                    var that = this;
                    $field.on('afterChange.validate', function () {
                        that.validateField($field[0]);
                    });
                },
                ueditor: function ($field) {
                    var that = this;
                    $field.on('afterChange.validate', function () {
                        that.validateField($field[0]);
                    });
                },
                date: function ($field) {
                    var that = this;
                    $field.on('afterChange.validate', function () {
                        that.validateField($field[0]);
                    });
                }
            },
            customErrorElement: {
                checkbox: function ($field) {
                    //这个代码比较死
                    //跟formFieldCheckbox 和 formFieldRadio的实现机制有强耦合
                    //但是对于整体框架而言，这是没问题的
                    //之所以要加下面这段处理，是因为checkbox或radio通常有多个input元素
                    //但是jq validation这个插件默认情况下只给第一个input添加相关的校验样式
                    //而且系统里用到的checkbox和radio都做过自定义样式
                    //所以把这些校验相关的class加在它们的父元素上更方便些
                    CUSTOM_ERROR_ELEMENT($field.closest('[data-type="checkbox"]')
                        .find('.checkbox'), this.options);
                },
                radio: function ($field) {
                    CUSTOM_ERROR_ELEMENT($field.closest('[data-type="radio"]')
                        .find('.radio'), this.options);
                },
                imageUploadView: function ($field) {
                    CUSTOM_ERROR_ELEMENT($field.parent().children('.image-upload-view'), this.options);
                }
            },
            customValidElement: {
                checkbox: function ($field) {
                    CUSTOM_VALID_ELEMENT($field.closest('[data-type="checkbox"]')
                        .find('.checkbox'), this.options);
                },
                radio: function ($field) {
                    CUSTOM_VALID_ELEMENT($field.closest('[data-type="radio"]')
                        .find('.radio'), this.options);
                },
                imageUploadView: function ($field) {
                    CUSTOM_VALID_ELEMENT($field.parent().children('.image-upload-view'), this.options);
                }
            }
        };

    var Validation = Class({
        instanceMembers: {
            init: function (element, options) {
                var $element = this.$element = $(element),
                    opts = this.options = this.getOptions(options);
                this._inited = false;

                var that = this;
                $element.on('formInit', function () {
                    that._inited = true;
                    $element.validate($.extend(opts, {
                        errorPlacement: function (error, element) {
                        },
                        showErrors: function (errorMap, errorList) {
                            var successList = this.successList,
                                config = opts.config;

                            if ($.isArray(errorList)) {
                                errorList.forEach(function (item) {
                                    var $field = $(item.element),
                                        msg = item.message,
                                        name = $field.attr('name') || $field.data('name'),
                                        $tipTarget = $field,
                                        type = $field.data('fvType') || $field.attr('type'),
                                        tipPlacement = opts.tipPlacement,
                                        tooltipClass = '';

                                    if (name in config) {
                                        if (isFunc(config[name].fvTipTarget)) {
                                            //$tipTarget是用来显示校验提示的元素
                                            //默认是字段元素本身
                                            //但是对于部分场景下，可能用父元素来显示提示更合适
                                            //所以通过fvTipTarget由外部来指定
                                            $tipTarget = config[name].fvTipTarget($field);
                                        }

                                        //让每个字段都支持自定义校验提示的显示位置
                                        if (config[name].tipPlacement) {
                                            tipPlacement = config[name].tipPlacement;
                                        }

                                        //每个字段需要额外添加到tooltip的class
                                        if (config[name].tooltipClass) {
                                            tooltipClass = config[name].tooltipClass || '';
                                        }
                                    }

                                    if (type in opts.customErrorElement) {
                                        opts.customErrorElement[type].call(that, $field);
                                    }

                                    var tooltip = $tipTarget.data('bs.tooltip');
                                    if (!tooltip) {
                                        //初始化tooltip的组件
                                        $tipTarget.tooltip({
                                            placement: tipPlacement,
                                            trigger: 'manual',
                                            container: 'body',
                                            viewport: '',
                                            template: '<div class="tooltip fv-error ' + tooltipClass + '" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
                                        });
                                    }

                                    tooltip = $tipTarget.data('bs.tooltip');
                                    tooltip.options.title = msg;

                                    if (tooltip.$tip && tooltip.$tip.hasClass('in')) {
                                        //如果tooltip本身已经显示那么只要改变其内容即可
                                        //不能再调用一次show方法
                                        //否则会出现闪烁的效果
                                        tooltip.$tip.find('.tooltip-inner').text(msg);
                                    } else {
                                        tooltip.show();
                                    }

                                    //durationTimeout这个定时器是用来自动隐藏tooltip的
                                    if (tooltip.durationTimeout) {
                                        clearTimeout(tooltip.durationTimeout);
                                        tooltip.durationTimeout = undefined;
                                    }

                                    //由于tooltip会自动隐藏
                                    //所以为了在修改表单的时候还能看到校验提示
                                    //添加了mouseenter mouseleave的监听
                                    $tipTarget.off('.fv');

                                    $tipTarget.on('mouseenter.fv', function () {
                                        if (tooltip && tooltip.durationTimeout) {
                                            clearTimeout(tooltip.durationTimeout);
                                            tooltip.durationTimeout = undefined;
                                        }

                                        if (!(tooltip && tooltip.$tip && tooltip.$tip.hasClass('in'))) {
                                            tooltip.show();
                                        }
                                    }).on('mouseleave.fv', function () {
                                        if (tooltip && tooltip.durationTimeout) {
                                            clearTimeout(tooltip.durationTimeout);
                                            tooltip.durationTimeout = undefined;
                                        }

                                        if (tooltip && tooltip.$tip && tooltip.$tip.hasClass('in')) {
                                            tooltip.hide();
                                        }
                                    });

                                    //默认3s后自动隐藏tooltip
                                    tooltip.durationTimeout = setTimeout(function () {
                                        tooltip.hide();
                                        tooltip.durationTimeout = undefined;
                                    }, opts.tipDuration);

                                    //fv-tip-target方便在reset的时候找到这些元素，移除相关的事件
                                    !$tipTarget.hasClass('fv-tip-target') && $tipTarget.addClass('fv-tip-target');
                                });
                            }

                            if ($.isArray(successList)) {
                                successList.forEach(function (item) {
                                    var $field = $(item),
                                        name = $field.attr('name') || $field.data('name'),
                                        $tipTarget = $field,
                                        type = $field.data('fvType') || $field.attr('type');

                                    if (name in config) {
                                        if (isFunc(config[name].fvTipTarget)) {
                                            $tipTarget = config[name].fvTipTarget($field);
                                        }
                                    }

                                    if (type in opts.customValidElement) {
                                        opts.customValidElement[type].call(that, $field);
                                    }

                                    var tooltip = $tipTarget.data('bs.tooltip');

                                    $tipTarget.off('.fv');

                                    if (tooltip) {
                                        tooltip.hide();
                                        if (tooltip.durationTimeout) {
                                            clearTimeout(tooltip.durationTimeout);
                                            tooltip.durationTimeout = undefined;
                                        }
                                        tooltip.destroy();
                                    }
                                });
                            }

                            this.defaultShowErrors();
                        }
                    }));
                    that._validator = $element.data('validator');

                    var customEventFields = {};
                    //因为checkbox radio hidden textarea[data-type="ueditor"]在默认情况下，change事件触发的时候不会引发校验
                    //所以针对这类字段，主动添加一个监听，调用validation的validateField来引发校验
                    $element.find('input[type="checkbox"],input[type="radio"],input[type="hidden"],textarea[data-type="ueditor"],input[data-type="date"]').each(function () {
                        var $input = $(this),
                            name = $input.data('name') || $input.attr('name');

                        if (!customEventFields[name]) {
                            customEventFields[name] = $input;
                        }
                    });

                    for (var i in customEventFields) {
                        if (hasOwn.call(customEventFields, i)) {
                            var $field = customEventFields[i],
                                eventFieldType = $field.data('type') || $field.attr('type');

                            if ($field.attr('type') === 'hidden') {
                                eventFieldType = 'hidden';
                            }

                            if (eventFieldType in opts.customValidateEvent) {
                                opts.customValidateEvent[eventFieldType].call(that, $field);
                            }
                        }
                    }
                });

                $element.data('validation', this);
            },
            getOptions: function (options) {
                var defaults = this.getDefaults();
                return $.extend({}, defaults, this.$element.data() || {}, options);
            },
            getDefaults: function () {
                return DEFAULTS;
            },
            ifInited: function () {
                return this._inited;
            },
            validate: function () {
                if (!this.ifInited()) return false;
                var $element = this.$element;

                $element.validate();

                return $element.valid();
            },
            validateField: function (element) {
                if (!this.ifInited()) return false;
                return this._validator.element(element);
            },
            reset: function () {
                if (!this.ifInited()) return false;

                var $element = this.$element,
                    opts = this.options;

                $element.find('.fv-tip-target').each(function () {
                    var tooltip = $(this).data('bs.tooltip');
                    if (tooltip && tooltip.$tip && tooltip.$tip.hasClass('in')) {
                        tooltip.hide();
                    }
                }).off('.fv');

                $element.find('.fv-valid-container').removeClass(opts.validClass + ' ' + opts.errorClass);

                this._validator.resetForm();
            }
        }
    });

    return Validation;
});