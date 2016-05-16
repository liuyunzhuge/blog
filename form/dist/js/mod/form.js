define(function (require, exports, module) {
    var $ = require('jquery'),
        FormMap = require('mod/formMap'),
        EventBase = require('mod/eventBase'),
        Class = require('mod/class'),
        Ajax = require('mod/ajax'),
        hasOwn = Object.prototype.hasOwnProperty;

    var DEFAULTS = {
        mode: 1, //同FormFieldBase的mod
        postUrl: '',//编辑时保存的url
        putUrl: '',//新增时保存的url
        queryUrl: '',//编辑模式时查询初始值的url
        key: '',//编辑模式时使用它作为主键的值，跟在queryUrl后面传递到后台查询数据
        keyName: '',//编辑模式时使用它作为主键的名称，跟在queryUrl后面传递到后台查询数据
        defaultData: {},//新增模式时的默认值，可以是一个object，也可以是一个字符串，是字符串的时候表示一个后台查询的接口地址
        ajaxMethod: 'post',//发ajax请求的时候用的方法
        fieldOptions: {},//各个字段的选项
        parseData: $.noop,//获取初始化数据时，通过这个回调来解析初始化数据
        parseSubmitData: function (data) {
            //保存提交数据到后台之前，可以通过这个回调对要提交的数据做些额外的处理
            return data;
        },
        parseInitResponse: function (res) {
            //使用这个回调来解析获取初始化数据时ajax返回的响应
            if (res.code == 200) {
                return res.data;
            } else {
                return {};
            }
        },
        onInit: $.noop,//表单初始化完成后的事件回调
        onBeforeSave: $.noop//表单保存接口调用前触发的回调
    };

    var Form = Class({
        instanceMembers: {
            init: function (element, options) {
                var $element = this.$element = $(element),
                    opts = this.options = this.getOptions(options);

                this.base($element);
                this.mode = ~~opts.mode;
                delete opts.mode;

                var that = this;

                if (typeof(opts.onInit) === 'function') {
                    this.on('formInit', $.proxy(opts.onInit, this));
                }

                if (typeof(opts.onBeforeSave) === 'function') {
                    this.on('beforeSave', $.proxy(opts.onBeforeSave, this));
                }

                //设置初始值
                this.setInitData().always(function (data) {
                    opts.parseData(data);

                    var fields = {};
                    for (var i in data) {
                        if (hasOwn.call(data, i)) {
                            fields[i] = '';
                        }
                    }

                    for (var i in opts.fieldOptions) {
                        if (hasOwn.call(opts.fieldOptions, i)) {
                            fields[i] = '';
                        }
                    }

                    //解析字段的初始值
                    var fieldOptions = {};
                    for (var i in fields) {
                        if (hasOwn.call(fields, i)) {
                            fieldOptions[i] = (i in opts.fieldOptions) && opts.fieldOptions[i] || {};
                            (i in data ) && (fieldOptions[i][that.mode == 1 ? 'defaultValue' : 'value'] = data[i]);
                        }
                    }

                    //初始值可能是异步获取的，所以必须在初始数据获取完毕之后再初始化formMap组件
                    that.formMap = new FormMap($element, {
                        mode: that.mode,
                        fieldOptions: fieldOptions
                    });

                    //告诉外部初始化完成
                    that.trigger('formInit');
                });

                $element.data('form', this);
            },
            getMode: function () {
                return this.mode;
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
            //设置初始值
            //方法名起的不好...
            //因为这是一个带返回值的设置型函数
            //而且为了将初始化数据的设置统一成异步任务
            //用到了$.Deferred()
            setInitData: function () {
                var $defer = $.Deferred(),
                    initData = this.getInitData(),
                    opts = this.options;

                if (!initData.valid) {
                    setTimeout(function () {
                        $defer.resolve({});
                    }, 0);
                } else if (initData.ajax) {
                    initData.data.done(function (res) {
                        var data = opts.parseInitResponse(res);
                        $defer.resolve(data);
                    }).fail(function () {
                        $defer.resolve({});
                    });
                } else {
                    setTimeout(function () {
                        $defer.resolve(initData.data);
                    }, 0);
                }

                return $.when($defer);
            },
            //获取表单初始化数据
            getInitData: function () {
                var opts = this.options,
                    mode = this.mode;

                //这个函数返回的格式，包含三个参数，各个参数的含义如下：
                //valid: true表示有效，false表示无效
                //ajax: true表示data返回的是jquery创建的ajax对象，false表示不是
                //data: 当ajax为true的时候返回jquery创建的ajax对象，否则直接返回一个object实例表示初始化数据

                //新增模式，通过defaultData来获取初始值
                if (mode == 1) {
                    var defaultData = opts.defaultData;
                    //如果defaultData是一个字符串，表示它需要从后台加载
                    if (typeof(defaultData) == 'string') {
                        return {
                            valid: true,
                            ajax: true,
                            data: Ajax.get(defaultData)
                        };
                    } else {
                        return {
                            valid: true,
                            ajax: false,
                            data: defaultData
                        };
                    }
                } else {
                    //非新增模式，通过queryUrl来获取初始值
                    //此模式下必须跟后台传递keyName跟key值
                    //否则后台无法查询到要编辑的数据给前端返回
                    var url = $.trim(opts.queryUrl),
                        keyName = $.trim(opts.keyName),
                        key = $.trim(opts.key);

                    if (!url || !key || !keyName) {
                        //url key keyName 为falsy值时均返回valid：false，表示初始值无效
                        return {
                            valid: false
                        };
                    } else {
                        var params = {};
                        params[keyName] = key;
                        return {
                            valid: true,
                            ajax: true,
                            data: Ajax.get(url, params)
                        }
                    }
                }
            },
            //表单保存逻辑
            save: function () {
                if (this.mode > 2) return false;

                var opts = this.options,
                    formData = this.getData(),
                    event;

                //触发beforeSave事件
                this.trigger((event = $.Event('beforeSave')), formData);

                //方便外部对formData进行一些额外的处理
                formData = opts.parseSubmitData(formData);

                //如果beforeSave事件默认行为被阻止，则直接返回
                if (event.isDefaultPrevented()) {
                    return false;
                }

                var url = this.getSaveUrl();

                //发ajax请求保存，同时把Ajax组件创建的实例返回
                //方便外部根据实际情况添加自己的回调
                return Ajax[opts.ajaxMethod](url, formData);
            },
            //代理formMap的reset方法，方便直接通过form实例来重置表单元素的组件
            reset: function () {
                this.formMap && this.formMap.reset();
            },
            //代理formMap的getData方法，方便直接通过form实例来获取表单要提交的数据
            getData: function () {
                return this.formMap && this.formMap.getData();
            },
            //获取表单保存时调用的接口地址
            getSaveUrl: function () {
                var url = '',
                    opts = this.options,
                    mode = this.mode;

                //mode=1时用postUrl
                if (opts.postUrl && mode == 1) {
                    url = opts.postUrl;
                }

                //mode!=1时用putUrl
                if (opts.putUrl && mode != 1) {
                    url = opts.putUrl;
                }

                return url;
            }
        },
        extend: EventBase
    });

    return Form;
});