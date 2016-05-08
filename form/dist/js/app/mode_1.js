define(function (require, exports, module) {

    //引入依赖的组件
    var $ = require('jquery'),
        bootstrap = require('lib/bootstrap'),
        Form = require('mod/formMap'),
        Ajax = require('mod/ajax');

    //定义常量及组件初始化
    var API = {
            save: '/api/user/save'
        },
        BUTTONS = {
            SAVE: $('#btn-save')
        },
        appForm = new Form('#appForm');

    //业务逻辑
    BUTTONS.SAVE.click(function(){
        BUTTONS.SAVE.button('loading');
        Ajax.post(API.save,appForm.getData()).done(function(res){
            if(res.code == 200) {
                alert('保存成功！');
            } else {
                alert('保存失败！');
            }
        }).fail(function(){
            alert('保存失败！');
        }).always(function(){
            BUTTONS.SAVE.button('reset');
        });
    })
});