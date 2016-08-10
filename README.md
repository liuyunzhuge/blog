##animation
这个文件存放一些css3 animation相关的demo。

(1) 该文件夹内的demo运行方法：

1. 前提：安装node.js git gulp

2. 安装：npm install --save

3. 运行：gulp -sw

(2) 该文件夹内容的相关介绍：

1. [animation-fill-mode的一些思考](http://www.cnblogs.com/lyzg/p/5738860.html)

##backbone_ajax
这个文件夹提供了一个简单的自定义ajax模块，覆盖了Backbone原有的ajax模块的实现，使得我们可以在用Backbone
完成异步请求时，完全跟传统的异步方式保持一致，代码很简单，相关的测试页面如下：

[backbone_ajax的测试地址](http://liuyunzhuge.github.io/blog/backbone_ajax/index.html)

但是该地址中大部分测试代码都无法获取期望的结果，因为是在gh-pages分支上发布的，github不允许静态页面内发送post请求，所以要想看到测试效果，最好是clone到本地预览了。

该文件夹内容的也在下面这篇文章中的第3部分有说明：

[我对Backbone.js的一些认识](http://www.cnblogs.com/lyzg/p/5634565.html)

##css_name
(1) 该文件夹内容的相关介绍：

1. [面向属性的CSS命名](http://www.cnblogs.com/lyzg/p/5561001.html)

##form
(1) 该文件夹内的demo运行方法：

1. 前提：安装node.js git gulp

2. 安装：npm install --save

3. 运行：gulp -sw

(2) 该文件夹内容的相关介绍：

1. [简洁易用的表单数据设置和收集管理组件](http://www.cnblogs.com/lyzg/p/5467691.html)

2. [进一步丰富和简化表单管理的组件：form.js](http://www.cnblogs.com/lyzg/p/5476478.html)

3. [利用jquery.validate以及bootstrap的tooltip开发气泡式的表单校验组件](http://www.cnblogs.com/lyzg/p/5679408.html)

##h5_demo

该文件夹存放我做的一些h5活动页面的demo，现在放的还比较少，将来会放地更多，对h5活动页面制作感兴趣的话欢迎关注这个文件夹的内容。

另外该文件夹里的东西，也包含一个比较全的gulp配置方案，可以做压缩，合并，以及资源的内联处理等，通过研究里面的gulpfile.js就能明白。

该文件夹内的demo运行方法：

1. 前提：安装node.js git gulp

2. 安装：npm install --save

3. 运行：gulp -sw

##mouse_direction

该文件夹内容的相关介绍：

1. [判断鼠标移入移出元素时的方向](http://www.cnblogs.com/lyzg/p/5689761.html)

##numerGrow
原本应该把这个文件夹命名为numberGrow，结果弄错了，懒得改了...

(1) 该文件夹内的demo运行方法：

1. 前提：安装node.js git gulp

2. 安装：npm install --save

3. 运行：gulp -sw

(2) 该文件夹内容的相关介绍：

1. [数字限时增长效果实现：numberGrow.js](http://www.cnblogs.com/lyzg/p/5517190.html)

##quick_layout
这个文件夹里面的内容是对[zxx.lib.css](https://github.com/zhangxinxu/zxx.lib.css)的一个整理，将这些代码利用less进行了整合，同时扩充了更多的属性。

里面提供有mixin，来快速对单个属性，进行等差序列的扩充。详情请研究里面的less代码，相对简单，所以没有写专门的博客介绍。针对zxx.lib.css提供的一些快速布局的

类（如.inline_two,.inline_three这种），做了一个demo，演示它里面一些类的具体作用。你可以通过下面的方法来查看demo，并了解那些类的用法。

(1) 该文件夹内的demo运行方法：

1. 前提：安装node.js git gulp

2. 安装：npm install --save

3. 运行：gulp -sw

##seajs

(1) 该文件夹内的demo运行方法：

1. 前提：安装node.js git gulp

2. 安装：npm install --save

3. 运行：gulp -sw

(2) 该文件夹内容的相关介绍：

1. [介绍一种基于gulp对seajs的模块做合并压缩的方式](http://www.cnblogs.com/lyzg/p/5581961.html)

##todos
这个文件夹提供多个版本的todos这个经典应用的实现。里面的子文件夹名分别代表它的实现方式。暂时只想用jquery和
backbone两个库来分别实现。目的是为了对比传统面向对象开发方法与MVVM开发方法的区别。

[jquery版本的预览地址（我实现的）](http://liuyunzhuge.github.io/blog/todos/jquery/index.html)

[backbone版本的预览地址（我实现的），跟官方版本不同的是，这个版本带交互效果，而且更接近真实的开发场景](http://liuyunzhuge.github.io/blog/todos/backbone/index.html)

[jquery版本的其它实现（可通过chrome的开发者工具查看源码）](http://todomvc.com/examples/jquery/#/all)

[backbone版本的官方实现（可通过chrome的开发者工具查看源码）](http://backbonejs.org/examples/todos/index.html)

[原生js的实现（可通过chrome的开发者工具查看源码）](http://www.todolist.cn/)

该文件夹内容的相关介绍：

[我对Backbone.js的一些认识](http://www.cnblogs.com/lyzg/p/5634565.html)
