seajs.config({
    base: '/blog/form/dist/',
    paths: {
        'app': 'js/app',
        'mod': 'js/mod',
        'lib': 'js/lib'
    },
    //对应lib/中的12个文件
    alias: {
        'jquery': 'lib/jquery.js?v=20160518',
        'jquery.validate': 'lib/jquery.validate.js?v=20160518',
        'bootstrap-datepicker': 'lib/datepicker/bootstrap-datepicker.js?v=20160518',
        'bootstrap-datepicker.zh-CN': 'lib/datepicker/bootstrap-datepicker.zh-CN.js?v=20160518',
        'bootstrap': 'lib/bootstrap.js?v=20160518'
    }
});