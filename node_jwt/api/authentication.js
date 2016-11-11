var jwt = require('jsonwebtoken'),
    extend = require('extend'),
    fs = require('fs');

module.exports = function (options) {

    var opts = extend({}, {
        pub_cert_file: 'rsa_public_key.pem',
        pri_cert_file: 'rsa_private_key.pem',
        query_name: 'token',
        data_name: 'data',
        //指定过期时间
        expiresIn: '1h',
        //用于从请求信息中获取登录凭证，用户名、密码...
        getCredentials: function () {
            return {};
        },
        //用于登录验证，根据用户名密码验证用户是否有效
        verifyIdentity: function () {
            return true;
        }
    }, options);

    //公钥
    var pub_cert = fs.readFileSync(opts.pub_cert_file);
    //私钥
    var pri_cert = fs.readFileSync(opts.pri_cert_file);

    return {
        _create: function (data) {
            var payload = {};
            payload[opts.data_name] = data;

            return jwt.sign(payload, pri_cert, {
                expiresIn: opts.expiresIn,
                algorithm: 'RS256',
                noTimestamp: true
            });
        },
        //第一次生成token
        generateToken: function (req) {
            var data = opts.verifyIdentity(opts.getCredentials(req));
            if (!data) return '';
            return this._create(data);
        },
        //刷新token
        refreshToken: function (req) {
            var payload = this.verify(req);
            if (payload) return this._create(payload[opts.data_name]);
            return '';
        },
        //从请求中获取token的字符串
        _getReqToken: function (req) {
            var token = '';

            //获取token
            if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
                token = req.headers.authorization.split(' ')[1];
            } else if (req.query && req.query[opts.query_name]) {
                token = req.query[opts.query_name];
            }

            return token;
        },
        //验证token并得到其中的payload
        verify: function (req) {
            var token = this._getReqToken(req);
            if (!token) return false;

            var payload = null;

            try {
                //验证token是否有效
                payload = jwt.verify(token, pub_cert, {algorithms: 'RS256'});
            } catch (err) {
                console.log(err);
            }

            return payload;
        },
        //token解码
        decode: function (token) {
            var decoded = null;

            try {
                decoded = jwt.decode(token, {complete: true, json: true});
            } catch (err) {
                console.log(err);
            }
            return decoded;
        },
        //获得身份信息
        getIdentity: function (req) {
            var payload = this.verify(req);
            return payload && payload[opts.data_name];
        }
    }
};
