define(function (require, exports, module) {

    var $ = require('jquery'),
        Ajax = require('mod/ajax'),
        PageView = require('mod/pageView');

    var api = {
        list: './api/pageView.json',
    };

    var getBlogItemHtml = function (row) {
            return ['<li class="blog-entry">',
                '    <a href="#" class="diggit">',
                '        <span class="diggit-num">',
                row.like,
                '</span>',
                '        <span class="diggit-text">推荐</span>',
                '    </a>',
                '    <div class="cell pl15">',
                '        <h3 class="f14 mb5 lh18"><a href="#" class="blog-title">',
                row.title,
                '</a></h3>',
                '        <p class="pt5 mb5 lh24 g3 fix">',
                '            <img src="',
                row.avatar,
                '" alt="" class="bdc p1 w50 h50 l mr5">',
                row.content,
                '</p>',
                '        <p class="mt10 lh20"><a href="#" class="blog-author">',
                row.author,
                '</a><span class="dib ml15 mr15">发布于 ',
                row.publish_time,
                '</span><a',
                '                href="#" class="blog-stas">评论(',
                row.comment,
                ')</a><a href="#" class="blog-stas">阅读(',
                row.read,
                ')</a></p>',
                '    </div>',
                '</li>'].join('');
        },
        getData = function () {
            pageView.disable();
            Ajax.get(api.list, pageView.getParams())
                .done(function (res) {
                    if (res.code == 200) {
                        pageView.refresh(res.data.total);
                        var html = [];
                        res.data.rows.forEach(function (row, i) {
                            row.title = row.title + (pageView.data.start + i);
                            html.push(getBlogItemHtml(row, i));
                        });
                        $blog_list.html(html.join(''));
                    }
                }).always(function(){
                    pageView.enable();
                });
        },
        $blog_list = $('#blog_list'),
        pageView = new PageView('#page_view', {
            defaultSize: 3,
            onChange: getData
        });

    getData();
});