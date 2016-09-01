define(function (require, exports, module) {

    var $ = require('jquery'),
        ListView = require('mod/listView/simpleListView'),
        SortFields = window.SF = require('mod/listView/sortFields');

    var api = {
        list: './api/pageView.json',
    };


    (function () {
        var $document = $(document),
            multiple = false,
            $sort_view = $('#sort_view'),
            sortFields = new SortFields([
                {field: 'name', value: ''},
                {field: 'sales', value: 'desc', order: 2, type: 'int'},
                {field: 'time', value: 'asc', order: 1, type: 'datetime'}
            ]);

        $sort_view.on('click', 'button', function(){
            var $this = $(this);

            if(!multiple) {
                sortFields.startSort();
            }

            sortFields.nextState($this.data('name'));

            if(!multiple) {
                sortFields.endSort();
            }
        });

        $document.on('keydown', function (e) {
            if (e.which == 16) {
                multiple = true;
                sortFields.startSort();
            }
        }).on('keyup', function (e) {
            if (e.which == 16 && multiple) {
                multiple = false;
                sortFields.endSort();
            }
        });
    })();

    var list = new ListView('#blog_list', {
        url: api.list,
        tpl: ['{{#rows}}<li class="blog-entry">',
            '    <a href="#" class="diggit">',
            '        <span class="diggit-num">{{like}}</span>',
            '        <span class="diggit-text">推荐</span>',
            '    </a>',
            '    <div class="cell pl15">',
            '        <h3 class="f14 mb5 lh18"><a href="#" class="blog-title">{{title}}</a></h3>',
            '        <p class="pt5 mb5 lh24 g3 fix">',
            '            <img src="{{avatar}}" alt="" class="bdc p1 w50 h50 l mr5">{{content}}</p>',
            '        <p class="mt10 lh20"><a href="#" class="blog-author">{{author}}</a><span class="dib ml15 mr15">发布于 {{publish_time}}</span><a',
            '                href="#" class="blog-stas">评论({{comment}})</a><a href="#" class="blog-stas">阅读({{read}})</a></p>',
            '    </div>',
            '</li>{{/rows}}'].join(''),
        parseData: function (data) {
            return {
                rows: data
            }
        }
    });

    list.query();
});