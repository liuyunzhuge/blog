define(function (require, exports, module) {
    var $ = require('jquery'),
        FormCtrlBase = require('mod/formFieldBase'),
        Class = require('mod/class');

    var DEFAULTS = $.extend({
        height: 400,
        clearFormat: true,
        ueConfig: {}
    }, FormCtrlBase.DEFAULTS);

    var FormFieldUeditor = Class({
        instanceMembers: {
            init: function (element, options) {
                //通过this.base调用父类FormCtrlBase的init方法
                this.base(element, options);

                var that = this,
                    $element = this.$element,
                    opts = this.options;

                //监听input元素的change事件，并最终通过beforeChange和afterChange来管理
                $element.on('change', function (e) {
                    var val = that.getValue(), event;

                    if (val === that.lastValue) return;

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

                var editorId = this.name + '-editor',
                    editorName = this.name + '-editor-text',
                    ueScript = [
                        '<script id="'
                        , editorId
                        , '" name="'
                        , editorName
                        , '" type="text/plain" style="width:100%;height:'
                        , opts.height
                        , 'px;">'
                        , '</script>'
                    ].join('');

                this.$element.before(ueScript);

                //初始化UE组件
                this.ue = UE.getEditor(editorId, opts.ueConfig);

                this.ue && this.ue.ready(function () {
                    that._ueReady = true;

                    if (opts.clearFormat) {
                        //粘贴时只粘贴文本
                        that.ue.execCommand('pasteplain');

                        //粘贴后再次做格式清理
                        that.ue.addListener('afterpaste', function (t, arg) {
                            that.ue.execCommand('autotypeset');
                        });
                    }

                    //编辑器文本变化
                    that.subscribeUeContentChange();

                    //设置初始值
                    that.reset();

                    that.triggerInit();
                });

            },
            subscribeUeContentChange: function () {
                var editor = this.ue,
                    $element = this.$element;

                this._ueContentChange = function () {
                    $element.val(editor.getContent()).trigger('change');
                };

                editor.addListener('contentChange', this._ueContentChange);
            },
            offUeContentChange: function offUeContentChange() {
                var editor = this.ue;
                editor.removeListener('contentChange', this._ueContentChange);
                this._ueContentChange = undefined;
            },
            getDefaults: function () {
                return DEFAULTS;
            },
            _setValue: function (value, trigger) {
                //只要trigger不等于false，调用setValue的时候都要触发change事件
                trigger !== false && this.$element.trigger('change');
            },
            setFieldValue: function (value) {
                var elementDom = this.$element[0],
                    v = ' ' + value;

                elementDom.value = v;
                elementDom.value = v.substring(1);

                var ue = this.ue;
                if (ue && this._ueReady) {
                    this.offUeContentChange();
                    ue.setContent(value);
                    this.subscribeUeContentChange();
                }
            },
            getValue: function () {
                var ue = this.ue;
                if (ue && this._ueReady) {
                    return ue.getContent();
                }
                return this.$element.val();
            },
            disable: function () {
                this.ue && this._ueReady && this.ue.setDisabled();
            },
            enable: function () {
                this.ue && this._ueReady && this.ue.setDisabled();
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

    return FormFieldUeditor;
});