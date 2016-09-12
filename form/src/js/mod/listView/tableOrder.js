define(function (require, exports, module) {
    var $ = require('jquery'),
        Class = require('mod/class');

    var DEFAULTS = {
            orderTextClass: 'table_view_order'
        };

    function class2Selector(classStr) {
        return ('.' + $.trim(classStr)).replace(/\s+/g, '.');
    }

    var TableOrder = Class({
        instanceMembers: {
            init: function (tableView, options) {
                var opts= $.extend({}, DEFAULTS, options),
                    $tableBd = tableView.$tableBd,
                    pageView = tableView.pageView;

                if(!pageView) return;

                this.tableView = tableView;
                this.onSuccess = function(){
                    var start = pageView.data.start;
                    $tableBd.find('>tbody>tr>td ' + class2Selector(opts.orderTextClass)).each(function(i,e){
                        $(this).text(start + i);
                    });
                };

                tableView.$element.on('success.' + tableView.namespace, this.onSuccess);
            },
            destroy: function(){
                this.tableView.$element.off('success.' + this.tableView.namespace, this.onSuccess);
                this.onSuccess = undefined;
            }
        }
    });

    return TableOrder;
});