define(function (require, exports, module) {

    var $ = require('jquery'),
        ListView = require('mod/listView/simpleListView');

    var api = {
        list: './api/pageView.json',
    };


    var l = window.l = new ListView('#blog_list', {
        url: api.list,
        tpl: '{{#rows}}{{title}},{{/rows}}',
        parseData: function (data) {
            console.log('parseData');
            return {
                rows: data
            }
        },
        //ajax请求之前的事件回调
        beforeAjax: function (data) {
            console.log('beforeAjax');
        },
        //ajax请求之后的事件回调
        afterAjax: function (data) {
            console.log('afterAjax');
        },
        //ajax请求成功的事件回调
        success: function (data) {
            console.log('success');
        },
        //ajax请求失败的事件回调
        error: function (data) {
            console.log('error');
        },
        //列表每次渲染后的事件回调
        ready: function (data) {
            console.log('ready')
        }
    });
});