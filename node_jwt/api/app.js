var
    express = require('express'),
    bodyParser = require('body-parser'),
    Authentication = require('./authentication'),
    users = require('./users'),
    app = express();

//请求参数解析配置
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//认证管理的组件实例
var auth = new Authentication({
    getCredentials: function (req) {
        return {
            username: req.body.username || req.query.username,
            password: req.body.password || req.query.password
        }
    },
    verifyIdentity: function (formData) {
        return users.getUser(formData.username, formData.password);
    }
});

//设置跨域访问
app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:2000");
    res.header("Access-Control-Allow-Headers", "X-Requested-With,Authorization");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE");
    res.header("X-Powered-By", '3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

//获取token
app.get('/api/auth', function (req, res) {
    res.json({
        code: 200,
        token: auth.generateToken(req)
    });
});

app.use(/^\/api\/.+/g, function (req, res, next) {
    //如果是认证的请求，直接跳过
    if (/^\/api\/auth/g.test(res.pathname)) {
        console.log('客户端请求认证...');
        next();
        return;
    }

    //其它请求验证用户是否登录
    if (!auth.verify(req)) {
        console.log('客户端token无效...');
        res.json({
            code: 304
        });
    } else {
        next();
    }
});

//拉取用户信息的接口
app.get('/api/getUser', function (req, res) {
    var data = auth.getIdentity(req);
    //刷新token
    var token = auth.refreshToken(req);
    res.json({
        code: 200,
        data: data,
        token: token
    });
});

//启动服务
var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});
