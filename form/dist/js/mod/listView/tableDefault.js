define(function (require, exports, module) {

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