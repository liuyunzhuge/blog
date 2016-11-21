var
    express = require('express'),
    bodyParser = require('body-parser'),
    cons = require('consolidate'),
    cookieSession = require('cookie-session'),
    app = express();

//设置模板引擎及模板文件目录
app.engine('html', cons.mustache);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

//请求参数解析配置
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//设置静态文件目录
app.use(express.static('static'));

//添加cookie-based认证的中间件
app.use(cookieSession({
    name: 'session',
    keys: ['sign', 'verfiy'],
    maxAge: 60 * 60 * 1000 // 1 hours
}));

app.get('/', function (req, res) {
    res.render('index', {
        title: 'Cookie-based认证'
    });
});

app.post('/api/login', function (req, res) {
    if (req.body.username == 'jim' && req.body.password == 'jim') {
        req.session.user = req.body;
        res.json({
            code: 200
        });
    } else {
        res.json({
            code: 401
        });
    }
});

app.get('/api/getUserInfo', function (req, res) {
    if (req.session.user) {
        res.json({
            code: 200,
            data: req.session.user
        });
    } else {
        res.json({
            code: 401
        });
    }
});

app.get('/api/logout', function (req, res) {
    req.session = null;
    res.json({
        code: 200
    });
});

//启动服务
var server = app.listen(2000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});
