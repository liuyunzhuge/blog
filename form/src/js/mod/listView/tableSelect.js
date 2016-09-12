define(function (require, exports, module) {
    var $ = require('jquery'),
        Class = require('mod/class');

    var DEFAULTS = {
    };

    function class2Selector(classStr) {
        return ('.' + $.trim(classStr)).replace(/\s+/g, '.');
    }

    var TableSelect = Class({
        instanceMembers: {
            init: function (tableView, options) {
                var opts = $.extend({}, DEFAULTS, options),
                    $tableBd = tableView.$tableBd;

                this.tableView = tableView;
                this.namespace = tableView.namespace + '.' + tableView.namespace_rnd;

                $tableBd.on('click' + this.namespace, '>tbody>tr', function (e) {
                    if (opts.multipleSelect) {
                        //多选
                        var $this = $(this).toggleClass(opts.selectedClass);

                        $this.find(class2Selector(opts.rowCheckboxClass)).each(function () {
                            this.checked = $this.hasClass(opts.selectedClass);
                        });

                        $checkAll[0].checked = ($tableBd.find('>tbody>tr:not(' + class2Selector(opts.selectedClass) + ')').length) ?
                            false : true;
                    } else {
                        //单选
                        $tableBd.find('>tbody>tr' + class2Selector(opts.selectedClass)).removeClass(opts.selectedClass);
                        $(this).addClass(opts.selectedClass);
                    }
                });

                if (opts.multipleSelect) {
                    //全选
                    var $checkAll = tableView.$element.find(class2Selector(opts.allCheckboxClass));

                    $checkAll.on('change' + this.namespace, function (e) {
                        var method = this.checked ? 'addClass' : 'removeClass';

                        $tableBd.find('>tbody>tr').each(function () {
                            var $this = $(this)[method](opts.selectedClass);

                            $this.find(class2Selector(opts.rowCheckboxClass)).each(function () {
                                this.checked = $this.hasClass(opts.selectedClass);
                            });
                        });
                    });
                }
            },
            destroy: function () {

            }
        }
    });

    return TableSelect;
});