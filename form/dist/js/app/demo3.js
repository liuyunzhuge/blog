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
        appForm = new Form('#appForm', {
            mode: Url.getParam('mode')
        }),
        validation = window.v = new Validation(appForm.$element, {
            rules: {
                name: {
                    required: true
                }
            },
            errorPlacementConfig: {
                all: function(error,element){
                    element.parent().parent().append(error)
                }
            }
        });

    //业务逻辑
    BUTTONS.SAVE.click(function () {

        alert('表单校验' + (validation.validate() ? '成功' : '失败') + '！');
    });
});