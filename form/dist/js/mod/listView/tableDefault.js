define(function (require, exports, module) {

    //定义tableView组件的一些通用配置

    var TableDrag = require('mod/listView/tableDrag'),
        TableOrder = require('mod/listView/tableOrder');

    return {
        plugins: [
            {
                plugin: TableDrag,
                name: 'tableDrag'
            },
            {
                plugin: TableOrder,
                name: 'tableOrder'
            }
        ]
    }
});