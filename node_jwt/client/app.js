var express = require('express');
var app = express();
var cons = require('consolidate');

//设置模板引擎及模板文件目录
app.engine('html', cons.mustache);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

//设置静态文件目录
app.use(express.static('static'));

app.get('/', function (req, res) {
    res.render('index', {
        title: '基于JWT的api认证'
    });
});

var server = app.listen(2000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});
