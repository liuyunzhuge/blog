define(function (require, exports, module) {
    var $ = require('jquery'),
        Class = require('mod/class');

    var DEFAULTS = {
            //拖动元素的css类
            draggerClass: 'table_view_dragger',
            //拖动时要追加给相关table元素和body元素的css类
            draggingClass: 'table_dragging',
            //默认的拖动最小宽度
            minWidth: 20,
            //默认的拖动最大宽度
            maxWidth: 0
        },
        $body = $(document.body),
        $document = $(document);

    function class2Selector(classStr) {
        return ('.' + $.trim(classStr)).replace(/\s+/g, '.');
    }

    function preventSelectStart(type) {
        $document.on('selectstart' + type, function (e) {
            e.preventDefault();
        });
    }

    function restoreSelectStart(type) {
        $document.off('selectstart' + type);
    }

    //给tableView的列添加拖动的功能
    var TableDrag = Class({
        instanceMembers: {
            init: function (tableView, options) {
                var opts = this.options = $.extend({}, DEFAULTS, options);

                this.tableView = tableView;
                this.$tableHdColgroup = tableView.$tableHd.children('colgroup');
                this.$tableBdColgroup = tableView.$tableBd.children('colgroup');
                this.namespace = this.tableView.namespace + '.' + this.tableView.namespace_rnd;

                this.createDraggers();
                tableView.$element.on('mousedown.' + this.namespace, class2Selector(opts.draggerClass), $.proxy(this.startDrag, this));

                var that = this;
                this.onAdjustLayout = function () {
                    var tdWidthMap = {}, total = 0, $tableHeadTds = tableView.$tableHd.find('>thead>tr>th,>thead>tr>td');
                    $tableHeadTds.each(function (i, td) {
                        var curWidth = $(td).outerWidth();

                        if (i == ($tableHeadTds.length - 1)) {
                            curWidth = tableView.$tableHd.outerWidth() - total;
                        } else {
                            total += curWidth;
                        }
                        tdWidthMap[i] = curWidth;
                    });

                    that.$tableHdColgroup.children('col').each(function (i, col) {
                        $(col).attr('width', tdWidthMap[i]);
                    });
                    that.$tableBdColgroup.children('col').each(function (i, col) {
                        $(col).attr('width', tdWidthMap[i]);
                    });
                };

                //在tableView触发adjustLayout事件的时候，必须重新计算所有col的宽度，保证拖拽的效果
                tableView.on('adjustLayout' + tableView.namespace, this.onAdjustLayout);
            },
            createDraggers: function () {
                var $tableHd = this.tableView.$tableHd;
                var opts = this.options;

                $tableHd.find('>thead>tr>th,>thead>tr>td').each(function () {
                    var $td = $(this);
                    //配置了data-drag="false"的列不能进行排序操作
                    if ($td.data('drag') !== false) {
                        $td.append('<span class="' + opts.draggerClass + '"></span>');
                    }
                });
            },
            disableSortView: function () {
                var sortView = this.tableView.sortView;
                if (sortView) {
                    sortView.disable();
                }
            },
            enableSortView: function () {
                var sortView = this.tableView.sortView;
                if (sortView) {
                    setTimeout(function () {
                        sortView.enable();
                    }, 0);
                }
            },
            startDrag: function (e) {
                e.stopPropagation();

                //因为拖拽的时候，利用到鼠标的三个事件,mousedown,mouseup,mousemove
                //所有有可能mouseup事件会在某些加了排序的列上进行触发，最终会导致意外的排序操作
                //所以在拖拽的时候，要禁用掉排序的功能
                this.disableSortView();

                var opts = this.options;

                $body.addClass(opts.draggingClass);
                this.tableView.$element.addClass(opts.draggingClass);

                this.moveable = true;
                this.startPos = {
                    left: e.pageX,
                    top: e.pageY
                };

                var $td = $(e.currentTarget).parent();
                this.curTdIndex = $td.index();
                this.curTdWidth = $td.outerWidth();

                //可通过data-drag-min 或data-drag-max来配置列单独的拖拽范围
                this.curMinWidth = $td.data('dragMin');
                this.curMaxWidth = $td.data('dragMax');

                if (this.curMinWidth > this.curTdWidth) {
                    this.curMinWidth = this.curTdWidth;
                }

                if (this.curMaxWidth < this.curTdWidth) {
                    this.curMaxWidth = this.curTdWidth;
                }

                $document.off(this.namespace)
                    .on('mousemove' + this.namespace, $.proxy(this.dragging, this))
                    .on('mouseup' + this.namespace, $.proxy(this.stopDrag, this));

                preventSelectStart(this.namespace);
            },
            dragging: function (e) {
                e.stopPropagation();
                var movePos, offset, opts = this.options;
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

                if (opts.minWidth && finalWidth < opts.minWidth) {
                    finalWidth = opts.minWidth;
                }

                if (this.curMinWidth && finalWidth < this.curMinWidth) {
                    finalWidth = this.curMinWidth;
                }

                if (opts.maxWidth && finalWidth > opts.maxWidth) {
                    finalWidth = opts.maxWidth;
                }

                if (this.curMaxWidth && finalWidth > this.curMaxWidth) {
                    finalWidth = this.curMaxWidth;
                }

                this.$tableHdColgroup.children('col').eq(curTdIndex).attr('width', finalWidth);
                this.$tableBdColgroup.children('col').eq(curTdIndex).attr('width', finalWidth);
            },
            stopDrag: function (e) {
                var opts = this.options;

                $body.removeClass(opts.draggingClass);
                this.tableView.$element.removeClass(opts.draggingClass);
                this.moveable = false;
                $document.off(this.namespace);
                restoreSelectStart(this.namespace);
                this.tableView.adjustLayout();

                this.enableSortView();
            },
            destroy: function () {

                var tableView = this.tableView,
                    opts = this.options;

                tableView.$tableHd.find('>thead>tr>th ' + class2Selector(opts.draggerClass) +
                    ',>thead>tr>td ' + class2Selector(opts.draggerClass)).remove();
                tableView.$element.off('mousedown.' + this.namespace);
                tableView.off('adjustLayout' + tableView.namespace, this.onAdjustLayout);
                $document.off(this.namespace);
            }
        }
    });

    return TableDrag;
});