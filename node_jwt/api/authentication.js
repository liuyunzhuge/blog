var jwt = require('jsonwebtoken'),
    extend = require('extend'),
    fs = require('fs');

module.exports = function (options) {

    var opts = extend({}, {
        pub_cert_file: 'rsa_public_key.pem',
        pri_cert_file: 'rsa_private_key.pem',
        query_name: 'token',
        getFormData: function () {
            return {};
        },
        checkIdentity: function () {
            return true;
        }
    }, options);

    //公钥
    var pub_cert = fs.readFileSync(opts.pub_cert_file);
    //私钥
    var pri_cert = fs.readFileSync(opts.pri_cert_file);

    return {
        //生成token
        createToken: function (req) {
            var data = opts.checkIdentity(opts.getFormData(req));

            if (!data) {
                return '';
            }

            return jwt.sign({data: data}, pri_cert, {
                expiresIn: '30s',
                algorithm: 'RS256',
                noTimestamp: true
            });
        },
        refreshToken: function (req) {
            var payload = this.verify(req);

            if (payload) {
                return jwt.sign({data: payload}, pri_cert, {
                    expiresIn: '30s',
                    algorithm: 'RS256'
                });
            }

            return '';
        },
        //验证token并得到其中的payload
        verify: function (req) {
            var token = '';

            //获取token
            if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
                token = req.headers.authorization.split(' ')[1];
            } else if (req.query && req.query[opts.query_name]) {
                token = req.query[opts.query_name];
            }

            if (!token) return false;

            var payload = null;

            try {
                payload = jwt.verify(token, pub_cert, {algorithms: 'RS256'});
            } catch (err) {
                console.log(err);
            }

            console.log(JSON.stringify(payload));

            return payload;
        },
        //获得身份信息
        getIdentity: function (req) {
            var payload = this.verify(req);
            return payload && payload.data;
        }
    }
};
