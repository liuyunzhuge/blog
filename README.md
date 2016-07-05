##css_name
(1) 该文件夹内容的相关介绍：

1. [面向属性的CSS命名](http://www.cnblogs.com/lyzg/p/5561001.html)

##form
(1) 该文件夹内的demo运行方法：

1. 前提：安装node.js git

2. 安装：npm install --save

3. 运行：gulp -sw

(2) 该文件夹内容的相关介绍：

1. [简洁易用的表单数据设置和收集管理组件](http://www.cnblogs.com/lyzg/p/5467691.html)

2. [进一步丰富和简化表单管理的组件：form.js](http://www.cnblogs.com/lyzg/p/5476478.html)

##numerGrow
原本应该把这个文件夹命名为numberGrow，结果弄错了，懒得改了...

(1) 该文件夹内的demo运行方法：

1. 前提：安装node.js git

2. 安装：npm install --save

3. 运行：gulp -sw

(2) 该文件夹内容的相关介绍：

1. [数字限时增长效果实现：numberGrow.js](http://www.cnblogs.com/lyzg/p/5517190.html)

##seajs

(1) 该文件夹内的demo运行方法：

1. 前提：安装node.js git

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

##backbone_ajax
这个文件夹提供了一个简单的自定义ajax模块，覆盖了Backbone原有的ajax模块的实现，使得我们可以在用Backbone
完成异步请求时，完全跟传统的异步方式保持一致，代码很简单，相关的测试页面如下：

[backbone_ajax的测试地址](http://liuyunzhuge.github.io/blog/backbone_ajax/index.html)

但是该地址中大部分测试代码都无法获取期望的结果，因为是在gh-pages分支上发布的，github不允许静态页面内发送post请求，所以要想看到测试效果，最好是clone到本地预览了。