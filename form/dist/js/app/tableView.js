define(function (require) {

    var $ = require('jquery'),
        ListView = require('mod/listView/tableView'),
        api = {
            list: './api/tableView.json',
        };

    var list = new ListView('#table_view', {
        url: api.list,
        tableHd: ['<tr>',
            '    <th>序号</th>',
            '    <th data-field="name" class="sort_item">姓名 <i class="sort_icon"></i></th>',
            '    <th data-field="contact" class="sort_item">联系方式 <i class="sort_icon"></i></th>',
            '    <th data-field="email" class="sort_item">邮箱 <i class="sort_icon"></i></th>',
            '    <th>昵称</th>',
            '    <th>备注</th>',
            '</tr>'].join(""),
        colgroup: ['<colgroup>',
            '    <col width="70">',
            '    <col width="80">',
            '    <col width="90">',
            '    <col width="100">',
            '    <col width="120">',
            '    <col>',
            '</colgroup>'].join(""),
        tpl: ['{{#rows}}<tr>',
            '<td>{{index}}</td>',
            '<td>{{name}}</td>',
            '<td>{{contact}}</td>',
            '<td>{{email}}</td>',
            '<td>{{nickname}}</td>',
            '<td>{{remark}}</td>',
            '</tr>{{/rows}}'].join(''),
        parseData: function (data) {
            var start = list.pageView.data.start;

            data.forEach(function (d) {
                d.index = start;
                start = start + 1;
            });

            return {
                rows: data
            }
        },
        sortView: {
            config: [
                {field: 'name', value: ''},
                {field: 'contact', value: 'desc', order: 2, type: 'int'},
                {field: 'email', value: 'asc', order: 1, type: 'datetime'}
            ]
        },
        pageView: {
            defaultSize: 3
        },
    });

    list.query();
});