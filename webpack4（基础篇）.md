## 让webpack5再飞一会儿，夯实webpack4吧（基础篇）

## webpack是什么？

webpack是一种前端资源构建工具，一个静态模块打包器。在webpack看来，前端的所有资源文件都会作为模块处理。它将根据模块的依赖关系进行静态分析，打包生成对应的静态资源。

## webpack与gulp的区别是什么？

webpack与gulp最大的区别就是在于打包过程上有所不同

Grunt、Gulp 这类构建工具的打包过程是通过遍历源文件-->匹配规则-->打包，整个过程是基于文件流的打包方式且做不到按需加载。

webpack 是从入口文件开始，把相关模块引入通过加载模块-->解析模块-->打包，整个过程是基于模块化的打包方式且支持按需加载，同时还可以在执行过程中针对性的去做一些优化操作。

## webpack的五个核心概念

**1. 入口（Entry）：**

入口（Entry）表示webpack以哪个文件为入口起点开始打包，构建内部依赖

**2. 输出（Output）：**

输出（Output）表示webpack打包后的资源bundles输出到哪儿去，以及如何命名

**3. 加载器（Loader）：**

Loader让webpack能够去处理那些非JavaScript文件的资源（webpack自身只理解JavaScript）

**4. 插件（Plugins）:**

插件（Plugins）可以用于执行范围更广的任务，插件的范围包括，从打包优化和压缩一直到重新定义环境中的变量等。

**5. 模式（Mode）:**

模式（Mode）表示webpack使用相应模式的配置

## webpack开发环境搭建！

### 1.安装nodejs

webpack 是基于 Node.js 的打包工具

### 2.初始化一个webpack项目

**1. 初始化项目**

```
npm init
```

**2. 安装webpack**

全局安装：通过 webpack 运行

项目维度安装：通过 npx webpack 运行

这里推荐以项目维度安装，可根据不同项目的实际业务场景采用不同的webpack版本进行打包配置

```
npm i webpack webpack-cli -D
```

本篇文章`webpack`版本号`^4.41.6`, `webpack-cli`版本号`^3.3.11`。

## 基本使用

**1. 创建基本目录**

- 在根目录下新建一个`src`文件夹，里面新建一个`index.js`(入口文件)
- 在根目录下新建一个`dist`文件夹，里面新建一个`index.html`

分别在文件中写下一些测试代码

```
// index.js
function init(){
  console.log('hello webpack');
}
init();
// index.html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>webpack</title>
</head>
<body>
  <script src="main.js"></script>
</body>
</html>
```

现在我们来执行`npx webpack`打包命令

运行完毕后在`dist`文件夹下面便会多一个`main.js`，同时打开`index.html`文件，会看到控制台打印出了 “hello webpack” 字样。

可以看到，当我们在没有写任何配置的时候，webpack依然可以打包成功，不过这个时候是走的webpack会提供一套默认配置，多数情况下，这是远远不够的，我们还需要自定义配置文件，来满足我们不同的需求场景。

## 自定义配置文件

我们在项目根目录上新建一个`webpack.config.js`文件，并写下一些基本配置

前文提到，webpack至少包含了5个核心配置，所以，我们只需要按照这5个核心配置来依次填鸭即可

### webpack.config.js介绍

webpack.config.js是webpack的配置文件

通过设置配置文件，表示你需要让webpack做什么事情（当运行webpack指令时，会加载里面的配置）

所有的构建工具都是基于nodejs平台运行的，模块化默认采用commonjs

### 最基本的配置

```
// resolve用来拼接绝对路径的方法
const { resolve } = require('path')
module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: resolve(__dirname, 'dist')
   },
  /* 
    development：开发环境
    production：生产环境
  */
  // 模式的配置
  mode: 'development',
}
```

现在我们再次使用`npx webpack`来重新构建，打包完成之后，会看到效果是一样的，至此，我们便完成了一份最基本的`webpack.config.js`配置

### 使用npm命令

以上我们使用的`npx`是基于本地`webpack`来运行的，我们还可以设置一个快捷方式，在`package.json`中添加一个`npm`脚本如：

```
npm run build
```

配置也很简单，只需要在`package.json`文件的`scripts`中新加了一个配置`"build: "webpack"`即可

### 常用的资源管理loader

前文提到`webpack`自身只理解`JavaScript`，那么像css、图片、字体等资源应该如何处理呢？

重点来了，`webpack`可以通过`loader`去处理那些非`JavaScript`文件的资源

`loader`相关的配置我们需要写在`module`里面如：

```
module: {
  rules: [
  // 这里面是详细的loader配置
  ]
}
```

#### 处理css资源

我们在src目录下面新建一个index.css文件，并随便写点测试代码

```
html,body{
  background-color: #f5f5f5;
}
```

并在入口文件将样式文件引入

```
// index.js
import '../css/index.css';
```

加载css我们需要引入style-loader和css-loader

```
npm i -D style-loader css-loader
```

在`module.rules`中写下对应的配置

```
{
  // 匹配哪些文件
  test: /\.css$/,
  // 使用哪些loader来进行处理
  use: ["style-loader", "css-loader"],
},
```

配置完毕，此时我们可以重新打包

```
npm run build
```

打包完成后打开页面，发现背景色已经变化，证明css加载成功。

#### 处理图片资源

我们在index.css文件下面随便你写点测试代码

```
.box1{
  width: 100px;
  height: 100px;
  background: url('../images/掘金首图.jpg') no-repeat;
  background-size: 100% 100%;
}
```

在dist/index.html里面写上一个空的div

```
<div class="box1"></div>
```

加载图片我们需要引入url-loader

```
$ npm i -D url-loader
```

在`module.rules`中写下对应的配置

```
{
  test: /\.(jpg|png|gif)$/,
  loader: 'url-loader',
},
```

重新打包，便可以看到页面上有图片呈现了。

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)图片

细心的朋友会发现图片这时候被重命名了

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

打包后的文件是会以hash值来重命名，这时候我们可以在`url-loader`的其它参数上进行配置如：

```
{
  test: /\.(jpg|png|gif)$/,
  loader: 'url-loader',
  options: {
    // 图片大小小于8kb，就会被处理成为base64
    // 优点：减少请求数量，减轻服务器压力
    // 缺点：图片体积会更大，文件请求速度会更慢
    limit: 8 * 1024,
    // 控制命名字符长度
    name:'[hash:10].[ext]',
  },
},
```

#### 处理字体图标资源

相信来到这一步，小伙伴们可能已经稍微摸透了`webpack`配置`loader`的套路了吧

其实就是需要啥资源，我们就下载不同的资源包，并且按照对应的npm地址，学习包的配置使用而已

那么对于**字体图标**资源应该如何配置呢？这个相对步骤要繁琐一点，咱们一点一点来

咱们先在`src`下面新建一个`media`文件夹用来存放字体图标资源，然后再去阿里巴巴图标图下载字体传送门🚀🚀🚀

下载好的字体包解压之后如下

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)图片

我们将相关字体复制到项目中去

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

将`iconfont.css`复制到项目中，并在入口文件引入

在`index.html`写下`span`标签，并带上对应的图标类名

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

接着就剩最后一步了，写入webpack配置

这时候我们需要引入`file-loader`

```
$ npm i -D file-loader
```

写入配置

```
{
  // exclude排除资源
  exclude: /\.(css|js|html|less|json|jpg|png|gif)$/,
  loader: 'file-loader',
  options: {
    name:'[hash:10].[ext]'
  },
},
```

再次运行，页面上如愿以偿的出现了图标

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)图片

### 输出单页

如上配置我们需要在`dist`文件中手动创建一个`index.html`文件，然后将输出的`main.js`手动引入。非常麻烦，并且真实开发中，我们也不可能这样去控制。所以，`index.html`也是通过配置自动生成哒。

这里我们需要引入一个插件`html-webpack-plugin`

```
npm i -D html-webpack-plugin
```

调整配置文件代码

```
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: {
    ...
  },
  output: {
    ...
  },
  module:{
    ...
  },
  plugins: [
    // plugins的详细配置
    new HtmlWebpackPlugin({
      // 等于说就是复制这个./src/index.html，并自动引入打包输出的所有资源
      template: './src/index.html'
    }),
  ],
  mode: 'development',
}
```

删除`dist`，重新打包，会发现`dist`里面多了一个`index.html`文件，并且自动帮我们引入了`main.js`

#### 清理dist文件夹

我们在每次打包后, 生成的dist文件夹不会清理掉历史遗留下来的文件，造成最终的打包文件“不干净”

所以我们可以在每次打包的时候都去清理一遍dist，这里需要引入一个插件`clean-webpack-plugin`

```
npm i -D clean-webpack-plugin
```

写入配置

```
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
...
plugins:[
new CleanWebpackPlugin({
  cleanAfterEveryBuildPatterns: ["dist"],
}),
]
...
```

