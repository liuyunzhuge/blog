define(function (require, exports, module) {
    var $ = require('jquery'),
        Class = require('mod/class'),
        hasOwn = Object.prototype.hasOwnProperty,
        isFunc = function (f) {
            return Object.prototype.toString.call(f) === '[object Function]';
        };

    //这个模块依赖jquery.validate来完成表单验证以及bootstrap的tooltip.js来完成气泡提示
    require('jquery.validate');
    require('bootstrap');
    require('mod/validation/validator');

    var DEFAULTS = {
        useTooltip: true,//配置是否启用气泡提示来显示校验失败的信息，默认启用
        tooltipConfig: {},//配置气泡提示的位置以及气泡提示关联的DOM元素等
        tipPlacement: 'right',//全局的气泡提示的位置
        tooltipDuration: 2500,//多久自动隐藏tooltip

        errorPlacementConfig: {},//配置校验失败信息生成的元素在DOM中的插入位置

        /*以上都是新添加的option，以下都是jquery.validate提供的option，下面是对该插件默认方式的覆盖*/

        debug: true,//防止校验成功后表单自动提交
        submitHandler: $.noop,//屏蔽表单校验成功后的表单提交功能，由外部的Form组件负责提交
        ignore: '[type="hidden"]:not(.fv-yes),[disabled]:not(.fv-yes),.fv-no',//用于过滤不参与校验的元素
        errorElement: 'i',//使用<i>元素来包裹校验失败的信息
        errorClass: 'fv-error',//校验失败时相应的class
        validClass: 'fv-valid'//校验成功时相应的class
    };

    function checkHideTimeout(tooltip) {
        if (tooltip.hideTimeout) {
            clearTimeout(tooltip.hideTimeout);
            tooltip.hideTimeout = undefined;
        }
    }

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
                            if (opts.useTooltip) {
                                //如果采用气泡提示来做校验信息的展示，那么这个errorPlacement就什么都不用处理了
                                return;
                            }

                            //jquery.validate组件默认的校验方式是：
                            //当一个元素校验失败后，就在该元素后面插入校验失败的信息
                            //当一个元素校验成功后，移除该元素后面可能有的校验失败信息

                            //通过errorPlacementConfig配置不同类型的元素校验失败信息的插入规则
                            //如果要自定义所有元素的默认插入规则，可在errorPlacementConfig内
                            //配置一个all: function(error,element){...}的选项

                            var type = element.data('fvType') || element.data('type') || element.attr('type'),
                                errorPlacementConfig = opts.errorPlacementConfig;

                            if (type in errorPlacementConfig) {
                                errorPlacementConfig[type](error, element);
                            } else if ('all' in errorPlacementConfig) {
                                errorPlacementConfig['all'](error, element);
                            } else {
                                error.insertAfter(element);
                            }
                        },
                        showErrors: function (errorMap, errorList) {
                            //覆盖这个方法以便在校验失败的时候显示tooltip

                            //不启用tooltip的时候按默认的方式显示失败信息
                            if (!opts.useTooltip) {
                                this.defaultShowErrors();
                                return;
                            }

                            var successList = this.successList,
                                tooltipConfig = opts.tooltipConfig;

                            function getFieldName($field) {
                                return $field.attr('name') || $field.data('name');
                            }

                            function getValdationType($field) {
                                return $field.data('fvType') || element.data('type') || $field.attr('type');
                            }

                            //处理本次校验失败的字段
                            if ($.isArray(errorList)) {
                                errorList.forEach(function (item) {
                                    var $field = $(item.element),
                                        msg = item.message,
                                        name = getFieldName($field),
                                        type = getValdationType($field),
                                        $tipTarget = $field,
                                        tipPlacement = opts.tipPlacement,
                                        tooltipClass = '';

                                    //name用于一些按字段配置的config中查找规则
                                    //type用于一些按类型配置的config中查找规则

                                    //tooltipConfig中按字段来配置气泡提示的位置及关联的DOM元素
                                    //如： title: {
                                    //       fvTipTarget: function($field){
                                    //           return $field.parent();
                                    //       },
                                    //       tipPlacement: 'top'
                                    //     }
                                    if (name in tooltipConfig) {
                                        if (isFunc(tooltipConfig[name].fvTipTarget)) {
                                            //$tipTarget是用来显示校验提示的元素
                                            //默认是字段元素本身
                                            //但是对于部分场景下，可能用父元素来显示提示更合适
                                            //所以通过fvTipTarget由外部来指定
                                            $tipTarget = tooltipConfig[name].fvTipTarget($field);
                                        }

                                        //让每个字段都支持自定义校验提示的显示位置
                                        if (tooltipConfig[name].tipPlacement) {
                                            tipPlacement = tooltipConfig[name].tipPlacement;
                                        }

                                        //每个字段需要额外添加到tooltip的class
                                        if (tooltipConfig[name].tooltipClass) {
                                            tooltipClass = tooltipConfig[name].tooltipClass || '';
                                        }
                                    }

                                    /* if (type in opts.customErrorElement) {
                                     opts.customErrorElement[type].call(that, $field);
                                     }*/

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
                                });
                            }

                            if ($.isArray(successList)) {
                                successList.forEach(function (item) {
                                    var $field = $(item.element),
                                        name = getFieldName($field),
                                        type = getValdationType($field),
                                        $tipTarget = $field;

                                    if (name in tooltipConfig) {
                                        if (isFunc(tooltipConfig[name].fvTipTarget)) {
                                            $tipTarget = tooltipConfig[name].fvTipTarget($field);
                                        }
                                    }

                                    /*if (type in opts.customValidElement) {
                                     opts.customValidElement[type].call(that, $field);
                                     }*/

                                    var tooltip = $tipTarget.data('bs.tooltip');

                                    $tipTarget.off('.fv');

                                    if (tooltip) {
                                        tooltip.hide();
                                        checkHideTimeout(tooltip);
                                        tooltip.destroy();
                                    }
                                });
                            }

                            this.defaultShowErrors();
                        }
                    }));
                    that._validator = $element.data('validator');
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

                //清除掉tooltip组件及绑定的事件
                if (!opts.useTooltip) {
                    $element.find('.fv-tip-target').each(function () {
                        var tooltip = $(this).data('bs.tooltip');
                        checkHideTimeout(tooltip);
                        tooltip && tooltip.destroy();
                    }).off('.fv');
                }

                this._validator.resetForm();
            }
        }
    });

    return Validation;
});