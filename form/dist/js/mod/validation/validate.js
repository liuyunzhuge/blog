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
        useTooltip: false,//配置是否启用气泡提示来显示校验失败的信息，默认启用
        tooltipConfig: {},//配置气泡提示的位置以及气泡提示关联的DOM元素等

        errorPlacementConfig: {},//配置校验失败信息生成的元素在DOM中的插入位置

        /*以上都是新添加的option，以下都是jquery.validate提供的option，下面是对该插件默认方式的覆盖*/

        debug: true,//防止校验成功后表单自动提交
        submitHandler: $.noop,//屏蔽表单校验成功后的表单提交功能，由外部的Form组件负责提交
        ignore: '[type="hidden"]:not(.fv-yes),[disabled]:not(.fv-yes),.fv-no',//用于过滤不参与校验的元素
        errorElement: 'i',//使用<i>元素来包裹校验失败的信息
        errorClass: 'fv-error',//校验失败时相应的class
        validClass: 'fv-valid'//校验成功时相应的class
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

                this._validator.resetForm();
            }
        }
    });

    return Validation;
});