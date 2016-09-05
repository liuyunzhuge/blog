define(function (require) {

    var $ = require('jquery'),
        ListView = require('mod/listView/scrollListView'),
        api = {
            list: './api/pageView.json',
        };

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
        parseData: function (data) {/*
            var start = list.pageView.data.start;

            data.forEach(function (d) {
                d.index = start;
                start = start + 1;
            });*/

            return {
                rows: data
            }
        }
    });

    list.query();
});