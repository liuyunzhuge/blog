seajs.config({
    base: '/blog/seajs/dist/',
    paths: {
        'app': 'js/app',
        'mod': 'js/mod',
        'lib': 'js/lib',
        'proj': 'js/proj'
    },
    //对应lib/中的12个文件
    alias: {
        'jquery': 'lib/jquery.js?v=20160518',
        'bootstrap': 'lib/bootstrap.js?v=20160518',
        'jquery.validate': 'lib/jquery.validate.js?v=20160518'
    }
});