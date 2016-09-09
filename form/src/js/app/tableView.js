define(function (require) {

    var $ = require('jquery'),
        ListView = require('mod/listView/tableView'),
        api = {
            list: './api/tableView.json',
        };

    var list = new ListView('#table_view', {
        url: api.list,
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