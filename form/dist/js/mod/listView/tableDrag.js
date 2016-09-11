define(function (require, exports, module) {
    var $ = require('jquery'),
        EventBase = require('mod/eventBase'),
        Class = require('mod/class');

    var $body = $(document.body),
        $document = $(document);

    function preventSelectStart(type) {
        $document.on('selectstart' + type, function (e) {
            e.preventDefault();
        });
    }

    function restoreSelectStart(type) {
        $document.off('selectstart' + type);
    }

    var TableDrag = Class({
        instanceMembers: {
            init: function (tableView) {
                this.tableView = tableView;
                this.$tableHdColgroup = tableView.$tableHd.children('colgroup');
                this.$tableBdColgroup = tableView.$tableBd.children('colgroup');
                this.namespace = this.tableView.namespace + '.' + this.tableView.namespace_rnd;

                this.createDraggers();
                tableView.$element.on('mousedown.' + this.namespace, '.table_view_dragger', $.proxy(this.startDrag, this));
            },
            createDraggers: function () {
                var $tableHd = this.tableView.$tableHd;

                $tableHd.find('>thead>tr>th,>thead>tr>td').each(function () {
                    $(this).append('<span class="table_view_dragger"></span>')
                });
            },
            startDrag: function (e) {
                e.stopPropagation();

                $body.addClass('table_dragging');
                this.tableView.$element.addClass('table_dragging');

                this.moveable = true;
                this.startPos = {
                    left: e.pageX,
                    top: e.pageY
                };

                var $td = $(e.currentTarget).parent();
                this.curTdIndex = $td.index();
                this.curTdWidth = $td.outerWidth();

                $document.off(this.namespace)
                    .on('mousemove' + this.namespace, $.proxy(this.dragging, this))
                    .on('mouseup' + this.namespace, $.proxy(this.stopDrag, this));

                preventSelectStart(this.namespace);
            },
            dragging: function (e) {e.stopPropagation();
                var movePos, offset;
                if (!this.moveable) return;

                movePos = {
                    left: e.pageX,
                    top: e.pageY
                };

                var startPos = this.startPos;
                var curTdIndex = this.curTdIndex;
                var curTdWidth = this.curTdWidth;

                offset = movePos.left - startPos.left;
                var finalWidth = curTdWidth + offset;

                this.$tableHdColgroup.children('col').eq(curTdIndex).attr('width', finalWidth);
                this.$tableBdColgroup.children('col').eq(curTdIndex).attr('width', finalWidth);
            },
            stopDrag: function (e) {
                $body.removeClass('table_dragging');
                this.tableView.$element.removeClass('table_dragging');
                this.moveable = false;
                $document.off(this.namespace);
                restoreSelectStart(this.namespace);
            }
        },
        extend: EventBase
    });

    return TableDrag;
});