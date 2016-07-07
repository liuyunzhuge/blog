define(function (require, exports, module) {
    var $ = require('jquery'),
        Class = require('mod/class'),
        isFunc = function (f) {
            return Object.prototype.toString.call(f) === '[object Function]';
        };

    //这个模块依赖jquery.validate来完成表单验证以及bootstrap的tooltip.js来完成气泡提示
    require('jquery.validate');
    require('bootstrap');

    var Validation = require('mod/validation/validate');

    var DEFAULTS = {
        useTooltip: true,//配置是否启用气泡提示来显示校验失败的信息，默认启用
        tipPlacement: 'right',//全局的气泡提示的位置
        tooltipDuration: 2500,//多久自动隐藏tooltip
        fieldConfig: {},//按字段名称配置一些东西，如：
        /**
         * {
         *   title: {
         *      fvTipTarget: function($field){ return $field.closest(...);}, //配置气泡提示关联的DOM元素
         *      tipPlacement: 'top', //配置气泡提示的显示位置：上下左右
         *      tooltipClass: 'tooltip-name', //配置气泡提示组件需要添加的css类
         *      errorPlacement: function(error,element){}, //配置字段错误信息的插入位置
         *      fvRelatedTarget: function($field){return ...}, //配置校验时关联影响的DOM元素
         *   }
         * }
         *
         * 其中fvTipTarget fvRelatedTarget可以是function和jQuery对象两种形式
         */
        fieldTypeConfig: {},//按字段类型配置一些东西，如：
        /**
         * {
         *   date: {
         *      fvTipTarget: function($field){ return $field.closest(...);}, //配置date类型的字段校验失败时气泡提示关联的DOM元素
         *      errorPlacement: function(error,element){}, //配置date类型的字段的错误信息的插入位置
         *      fvRelatedTarget: function($field){return ...}, //配置date类型的字段时校验时关联影响的DOM元素
         *   }
         * }
         * 如果要为所有的类型定义一个配置，可把类型名称设置为all，如all: {errorPlacement: function(){..}}
         * 优先级：
         * fieldConfig > fieldTypeConfig<type> > Validation.defaultFieldTypeConfig > fieldTypeConfig<all>
         */

        manualClass: 'select,input[type="checkbox"],input[type="radio"],input[type="hidden"],textarea[data-type="ueditor"],input[data-type="date"]',//用来找出那些需要手工校验的字段元素
        manualEvent: 'change.validation',//跟manualClass配合使用，form元素将会注册manualEvent指定的事件监听，并主动触发manualClass的元素进行校验

        /*以上都是新添加的option，以下都是jquery.validate提供的option，下面是对该插件一些option默认值的覆盖*/

        debug: true,//防止校验成功后表单自动提交
        submitHandler: $.noop,//屏蔽表单校验成功后的表单提交功能，由外部的Form组件负责提交
        ignore: '[type="hidden"]:not(.fv-yes),[disabled]:not(.fv-yes),.fv-no',//用于过滤不参与校验的元素
        errorElement: 'i',//使用<i>元素来包裹校验失败的信息
        errorClass: 'fv-error',//校验失败时相应的class
        validClass: 'fv-valid'//校验成功时相应的class
    };

    //清理tooltip用到的定时器
    function checkHideTimeout(tooltip) {
        if (tooltip && tooltip.hideTimeout) {
            clearTimeout(tooltip.hideTimeout);
            tooltip.hideTimeout = undefined;
        }
    }

    //获取到字段的名称
    function getFieldName($field) {
        return $field.attr('name') || $field.data('name');
    }

    //获取到字段的类型
    function getValdationType($field) {
        return $field.data('fvType') || $field.data('type') || $field.attr('type');
    }

    //根据优先级获取fieldConfig及fieldTypeConfig中的配置内容
    function getCommonConfig(option, $field, opts) {
        var type = getValdationType($field),
            name = getFieldName($field),
            fieldConfig = opts.fieldConfig,
            fieldTypeConfig = opts.fieldTypeConfig,
            targetOption,
            STATIC_FIELDTYPE_CONFIG = Validation.defaultFieldTypeConfig;

        if (name in fieldConfig) {
            targetOption = fieldConfig[name][option];
        } else if (type in fieldTypeConfig) {
            targetOption = fieldTypeConfig[type][option];
        } else if (STATIC_FIELDTYPE_CONFIG[option] && (type in STATIC_FIELDTYPE_CONFIG[option])) {
            targetOption = STATIC_FIELDTYPE_CONFIG[option][type];
        } else if ('all' in fieldTypeConfig) {
            targetOption = fieldTypeConfig['all'][option];
        }

        return targetOption;
    }

    //设置关联影响的DOM元素的样式
    function setRelatedTargetStyle(element, opts, isError) {
        var $field = $(element), $fvRelatedTarget;

        $fvRelatedTarget = getCommonConfig('fvRelatedTarget', $field, opts);
        if (isFunc($fvRelatedTarget)) {
            $fvRelatedTarget = $fvRelatedTarget($field);
        }
        if (!$fvRelatedTarget) return;

        //$fvRelatedTarget: 表示需要关联影响的DOM元素
        //关联影响：在字段校验成功的时候，给$fvRelatedTarget加上options.validClass；
        //         在字段校验失败的时候，给$fvRelatedTarget加上options.errorClass

        if (isError) {
            !$fvRelatedTarget.hasClass(opts.errorClass) && $fvRelatedTarget.removeClass(opts.validClass)
                .addClass('fv-related-target ' + opts.errorClass);

            //fv-related-target用来在resetForm的时候找到所有的$fvRelatedTarget，以便清除它们的这个样式
        } else {
            !$fvRelatedTarget.hasClass(opts.validClass) && $fvRelatedTarget.removeClass(opts.errorClass)
                .addClass(opts.validClass);
        }
    }

    //校验失败的元素会调用这个来显示tooltip
    function showErrorItem(item, opts, that) {
        var $field = $(item.element),
            msg = item.message,
            name = getFieldName($field),
            tipPlacement = opts.tipPlacement,
            fieldConfig = opts.fieldConfig,
            tooltipClass = '',
            $tipTarget;


        $tipTarget = getCommonConfig('fvTipTarget', $field, opts);
        if (isFunc($tipTarget)) {
            $tipTarget = $tipTarget($field);
        }
        if (!$tipTarget) {
            $tipTarget = $field;
        }

        if (name in fieldConfig) {
            //让每个字段都支持自定义校验提示的显示位置
            if (fieldConfig[name].tipPlacement) {
                tipPlacement = fieldConfig[name].tipPlacement;
            }

            //每个字段需要额外添加到tooltip的class
            if (fieldConfig[name].tooltipClass) {
                tooltipClass = fieldConfig[name].tooltipClass || '';
            }
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
            //如果tooltip已经显示那么只要改变其内容即可
            //不能再调用一次show方法
            //否则会出现闪烁的效果
            tooltip.$tip.find('.tooltip-inner').text(msg);
        }
        tooltip.show();

        checkHideTimeout(tooltip);

        //由于tooltip会自动隐藏
        //所以为了在修改表单的时候还能看到校验提示
        //添加了mouseenter mouseleave的监听
        $tipTarget.off('.fv');

        $tipTarget.on('mouseenter.fv', function () {
            checkHideTimeout(tooltip);

            if (!(tooltip && tooltip.$tip && tooltip.$tip.hasClass('in'))) {
                tooltip.show();
            }
        }).on('mouseleave.fv', function () {
            checkHideTimeout(tooltip);

            if (tooltip && tooltip.$tip && tooltip.$tip.hasClass('in')) {
                tooltip.hide();
            }
        });

        //经过tooltipDuration时间后自动隐藏tooltip
        tooltip.hideTimeout = setTimeout(function () {
            tooltip.hide();
            tooltip.hideTimeout = undefined;
        }, opts.tooltipDuration);

        //fv-tip-target方便在reset的时候找到这些元素，移除相关的tooltip组件及事件
        !$tipTarget.hasClass('fv-tip-target') && $tipTarget.addClass('fv-tip-target');
    }

    //校验成功的元素会调用这个来销毁tooltip
    function showSuccessItem(element, opts, that) {
        var $field = $(element),
            $tipTarget;

        $tipTarget = getCommonConfig('fvTipTarget', $field, opts);
        if (isFunc($tipTarget)) {
            $tipTarget = $tipTarget($field);
        }
        if (!$tipTarget) {
            $tipTarget = $field;
        }

        var tooltip = $tipTarget.data('bs.tooltip');

        $tipTarget.off('.fv');

        if (tooltip) {
            tooltip.hide();
            checkHideTimeout(tooltip);
            tooltip.destroy();
        }
    }

    var Validation = Class({
        instanceMembers: {
            init: function (element, options) {
                var $element = this.$element = $(element);
                this.options = this.getOptions(options);
                $element.on('formInit', $.proxy(this._onFormInit, this));
                $element.data('validation', this);
            },
            getOptions: function (options) {
                var defaults = this.getDefaults();
                return $.extend({}, defaults, this.$element.data() || {}, options);
            },
            getDefaults: function () {
                return DEFAULTS;
            },
            _onFormInit: function () {
                var $element = this.$element,
                    opts = this.options,
                    that = this;

                $element.validate($.extend(opts, {
                    errorPlacement: function (error, element) {
                        if (opts.useTooltip) {
                            return;
                        }

                        //jquery.validate组件默认的校验失败信息的插入方式是：在该元素后面插入校验失败的信息
                        //我们可以按字段及字段类型通过fieldConfig与fieldTypeConfig来自定义插入的方式

                        var _errorPlacement = getCommonConfig('errorPlacement', element, opts);

                        if (!isFunc(_errorPlacement)) {
                            _errorPlacement = function () {
                                error.insertAfter(element);
                            }
                        }

                        _errorPlacement(error, element);
                    },
                    showErrors: function (errorMap, errorList) {

                        //覆盖这个方法以便在校验失败的时候显示tooltip
                        //不启用tooltip的时候按默认的方式显示失败信息

                        var successList = this.successList;

                        //处理本次校验失败的字段
                        if ($.isArray(errorList)) {
                            errorList.forEach(function (item) {
                                setRelatedTargetStyle(item.element, opts, true);
                                if (opts.useTooltip) {
                                    //显示失败的tooltip
                                    showErrorItem(item, opts, that);
                                }
                            });
                        }

                        if ($.isArray(successList)) {
                            successList.forEach(function (element) {
                                setRelatedTargetStyle(element, opts, false);
                                if (opts.useTooltip) {
                                    //移除原先可能失败导致的tooltip
                                    showSuccessItem(element, opts, that);
                                }
                            });
                        }

                        this.defaultShowErrors();
                    }
                }));

                //因为checkbox radio hidden textarea[data-type="ueditor"]在jquery.validate插件的机制里面，change事件触发的时候不会引发校验
                //所以针对这类字段，添加一个change事件监听，并在change事件触发时主动触发校验
                $element.on(opts.manualEvent, opts.manualClass, function (e) {
                    that.element(e.currentTarget);
                });

                this._validator = $element.data('validator');

                //将jquery.validate的api方法代理到自身
                for (var i in this._validator) {
                    if (!(i in this) && isFunc(this._validator[i])) {
                        this[i] = (function (context, func) {
                            return function () {
                                return func.apply(context, arguments);
                            }
                        })(this._validator, this._validator[i]);
                    }
                }
            },
            resetForm: function () {
                var $element = this.$element,
                    opts = this.options;

                //清除掉tooltip组件及绑定的事件
                if (opts.useTooltip) {
                    $element.find('.fv-tip-target').each(function () {
                        var tooltip = $(this).data('bs.tooltip');
                        checkHideTimeout(tooltip);
                        tooltip && tooltip.destroy();
                    }).off('.fv');
                }

                $element.find('.fv-related-target').removeClass(opts.validClass + ' fv-related-target ' + opts.errorClass);

                this._validator.resetForm();
            }
        },
        staticMembers: {
            DEFAULTS: DEFAULTS,
            defaultFieldTypeConfig: {
                fvRelatedTarget: {
                    checkbox: function ($field) {
                        var $target = $field.closest('[data-type="checkbox"]');
                        if ($target.hasClass('checkbox')) return $target;
                        return $target.find('.checkbox');
                    },
                    radio: function ($field) {
                        var $target = $field.closest('[data-type="radio"]');
                        if ($target.hasClass('radio')) return $target;
                        return $target.find('.radio');
                    }
                },
                fvTipTarget: {
                    checkbox: function ($field) {
                        return $field.closest('[data-type="checkbox"]');
                    },
                    radio: function ($field) {
                        return $field.closest('[data-type="radio"]');
                    }
                }
            },
            extendFieldTypeConfig: function (option, config) {
                if (!(option in Validation.defaultFieldTypeConfig)) return;
                $.extend(Validation.defaultFieldTypeConfig[option], config || {});
            },
            validator: $.validator
        }
    });

    //内置的required验证器有bug，在select为multiple的时候，判断的方式有瑕疵
    $.validator.addMethod("required", function (value, element, param) {
        // Check if dependency is met
        if (!this.depend(param, element)) {
            return "dependency-mismatch";
        }
        if (element.nodeName.toLowerCase() === "select") {

            // 当select为multiple的时候，val是一个数组
            var val = $(element).val();
            if (Object.prototype.toString.call(val) === '[object Array]') {
                val = val.join('');
            }

            return val && val.length > 0;
        }
        if (this.checkable(element)) {
            return this.getLength(value, element) > 0;
        }
        return value.length > 0;
    }, $.validator.messages["required"]);

    return Validation;
});