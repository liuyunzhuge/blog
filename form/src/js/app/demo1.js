define(function (require, exports, module) {

    //引入依赖的组件
    var $ = require('jquery'),
        bootstrap = require('lib/bootstrap'),
        Form = require('mod/formMap'),
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
        });

    //业务逻辑
    BUTTONS.SAVE.click(function () {
        alert(JSON.stringify(appForm.getData()))
    });
});