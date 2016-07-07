define(function (require, exports, module) {

    //引入依赖的组件
    var $ = require('jquery'),
        bootstrap = require('bootstrap'),
        Form = require('mod/form'),
        Validation = require('mod/formValidation'),
        Url = require('mod/url');

    //定义常量及组件初始化
    var API = {
            save: 'api/user/save'
        },
        BUTTONS = {
            SAVE: $('#btn-save')
        },
        appForm = window.f = new Form('#appForm', {
            mode: Url.getParam('mode'),
            fieldOptions: {
                name: {
                    onBeforeChange: function(e, val) {
                        if(val == "1"){
                            e.preventDefault();
                        }
                    }
                }
            }
        }),
        validation = window.v = new Validation(appForm.$element, {
            rules: {
                name: {
                    required: true
                },
                birthday: {
                    required: true
                },
                hobby: {
                    required: true
                },
                gender: {
                    required: true
                },
                work: {
                    required: true
                },
                industry: {
                    required: true
                },
                desc: {
                    required: true,
                    minlength: 10,
                    maxlength: 20
                },
                detailDesc: {
                    required: true
                }
            },
            messages: {
                name: {
                    required: '请输入姓名'
                },
                birthday: {
                    required: '请选择生日'
                },
                hobby: {
                    required: '请勾选兴趣爱好'
                },
                gender: {
                    required: '请勾选性别'
                },
                work: {
                    required: '请选择职业'
                },
                industry: {
                    required: '请选择行业'
                },
                desc: {
                    required: '请输入简介',
                    minLength: Validation.validator.format("请至少输入{0}个字符!"),
                    maxLength: Validation.validator.format("您输入不能超过{0}个字符!")
                },
                detailDesc: {
                    required: '请输入详细描述',
                }
            },
            fieldTypeConfig: {
                all: {
                    fvTipTarget: function ($field) {
                        return $field.parent();
                    }
                }
            }
        });

    //业务逻辑
    BUTTONS.SAVE.click(function () {
        validation.form();
    });
});