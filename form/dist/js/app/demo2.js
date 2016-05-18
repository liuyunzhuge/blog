define(function (require, exports, module) {

    //引入依赖的组件
    var $ = require('jquery'),
        bootstrap = require('bootstrap'),
        Form = require('mod/form'),
        Url = require('mod/url');

    //定义常量及组件初始化
    var API = {
            save: './api/user/save.json',
            query: './api/user/1.json'
        },
        BUTTONS = {
            SAVE: $('#btn-save')
        },
        appForm = new Form('#appForm', {
            ajaxMethod: 'get',//为了demo才把表单请求的方法改成get，实际工作中应该使用post!!
            mode: Url.getParam('mode'),
            postUrl: API.save,
            putUrl: API.save,
            queryUrl: API.query,
            defaultData: {
                id: "",
                name: "这是新增模式为name字段设置的初始值，后面的也是",
                birthday: "1991-06-21",
                hobby: "电影",
                gender: "男",
                work: "前端开发",
                industry: "互联网",
                desc: "这是新增模式为desc字段设置的初始值",
                detailDesc: "这是新增模式为detailDesc字段设置的初始值"
            },
            key: Url.getParam('id'),
            keyName: 'id',
            parseData: function(data){
                //假设后台男女存的分别是1,2，前端需要的是男女，就可通过这个来解析
                if(data.gender) {
                    data.gender = data.gender == 1 ? '男' : '女';
                }
            },
            onInit: function() {
                alert('Form组件实例的init事件触发了!');
            },
            onBeforeSave: function(e, formData) {
                if(formData.name == '这是新增模式为name字段设置的初始值，后面的也是') {
                    alert('这是通过onBeforeSave添加的校验，名字没有发生改变，不允许保存！');
                    e.preventDefault();
                }
            }
        });

    alert('Form组件调用完了，但是它的init事件还没有触发！');

    //业务逻辑
    BUTTONS.SAVE.click(function () {
            var _a = appForm.save();
            _a && _a.done(function(res){
                if(res.code == 200) {
                    alert('保存成功！');
                }
            });
        }
    );
});