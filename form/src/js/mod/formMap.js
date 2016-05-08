define(function (require, exports, module) {

    var $ = require('jquery'),
        FormFieldMap = require('mod/formFieldMap'),
        Class = require('mod/class'),
        hasOwn = Object.prototype.hasOwnProperty,
        toString = Object.prototype.toString,
        DEFAULTS = {
            mode: 1, //跟FormFieldBase一致
            fieldSelector: '.form-field', //用来获取要初始化的表单元素
            fieldOptions: {} //表单组件的option
        };

    var FormMap = Class({
        instanceMembers: {
            init: function (element, options) {
                var $element = this.$element = $(element),
                    opts = this.options = this.getOptions(options);

                //存储所有的组件实例
                this.cache = {};

                var that = this;
                //初始化所有需要被FormMap管理的组件
                $element.find(opts.fieldSelector).each(function () {
                    var $field = $(this);

                    //要求各个表单元素必须得有name或者data-name属性，否则fieldOptions起不到作用
                    that.add($field, $.extend({
                        mode: opts.mode
                    }, opts.fieldOptions[$field.attr('name') || $field.data('name')] || {}));
                });
            },
            getOptions: function (options) {
                var defaults = this.getDefaults(),
                    _opts = $.extend({}, defaults, this.$element.data() || {}, options),
                    opts = {};

                //保证返回的对象内容项始终与当前类定义的DEFAULTS的内容项保持一致
                for (var i in defaults) {
                    if (hasOwn.call(defaults, i)) {
                        opts[i] = _opts[i];
                    }
                }

                return opts;
            },
            getDefaults: function () {
                return DEFAULTS;
            },
            add: function ($field, fieldOption) {
                //要求要被FormMap管理的组件必须有data-type属性
                var type = $field.data('type');

                if (!(type in FormFieldMap)) return;

                var formField = new FormFieldMap[type]($field, fieldOption || {});

                this.cache[formField.name] = {
                    formField: formField,
                    fieldName: formField.name
                };
            },
            get: function (name) {
                var field = this.cache[$.trim(name)];
                return field && field.formField;
            },
            remove: function (name) {
                var formField = this.get(name);
                if (formField) {
                    delete this.cache[name];
                    formField.destroy();
                }
            },
            reset: function () {
                var cache = this.cache;
                for (var i in cache) {
                    if (hasOwn.call(cache, i)) {
                        cache[i].formField.reset();
                    }
                }
            },
            getData: function () {
                var cache = this.cache,
                    data = {};

                for (var i in cache) {
                    if (hasOwn.call(cache, i)) {
                        data[cache[i].fieldName] = cache[i].formField.getValue();
                    }
                }

                return data;
            },
            setData: function (data, trigger) {
                if (Object.prototype.toString.call(data) !== '[object Object]') return;

                var cache = this.cache;

                for (var i in cache) {
                    if (hasOwn.call(cache, i) && (i in data)) {
                        cache[i].formField.setValue(data[i], trigger);
                    }
                }
            }
        },
        staticMembers: {
            DEFAULTS: DEFAULTS,
            format: function () {
                var argsLength = arguments.length, dest = false, data, prefix = 'model';
                if(argsLength === 1) {
                    //如果只传递了一个参数，认为传递的是data参数
                    data = arguments[0];
                } else if(argsLength === 2) {
                    //如果传递了两个参数
                    data = arguments[0];
                    if(data === true || data === false) {
                        //如果第一个是一个布尔的值，则把第一个参数赋给dest
                        //第二个参数用来传递data
                        dest = data;
                        data = arguments[1];
                    } else {
                        //如果第一个不是布尔值
                        //那么第一个参数还是作为data，第二个参数作为prefix
                        prefix = arguments[1];
                    }
                } else {
                    //如果是三个参数，就与前面的一一对应
                    dest = !!arguments[0];
                    data = arguments[1];
                    prefix = arguments[2];
                }

                if (toString.call(data) != '[object Object]') return;

                //深度拷贝，防止返回的对象在外部修改导致formData意外改变
                data = $.extend(dest, {}, data);

                var ret = {};
                for (var i  in data) {
                    if (hasOwn.call(data, i)) {
                        ret[prefix + '[' + i + ']'] = data[i];
                    }
                }

                return ret;
            }
        }
    });

    return FormMap;
});