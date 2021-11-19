# Webpack 的配置复习



webpack 是 JavaScript 的静态模块打包工具，它在内部从一个或多个入口点构建依赖图，然后将项目中所需的每一个模块组合成一个或多个`bundle`。

从定义可知：webpack 开箱只支持 JavaScript 文件类型，其实还包含 JSON 文件类型。其他静态资源需要通过 loader 来支持，后续会讲解。

## 概念

### 初始化项目

1. 新建文件夹。
2. `npm init -y` 生成 package.json 文件。
3. `npm i webpack webpack-cli --save-dev` 安装 webpack 依赖。

安装的 webpack 版本，版本不同可能会导致后续步骤出错（可在评论区交流 ~）。

webpack：`5.61.0`
webpack-cli：`4.9.1`
node: `14.15.0`

项目根目录新建`src`文件夹，再在文件夹下新建`index.js`和`util.js`。

```
// util.js
export function helloWebpack {
  return 'hello webpack'
}

// index.js
import { helloWebpack } from './utils'

document.write(helloworld())
复制代码
```

新建个`webpack.config.js`

```
const path = require('path')

module.exports = {
  entry: './src/index.js', // 入口文件
  output: {  // 出口文件
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  mode: 'production' // 当前构建环境
}
复制代码
```

在`package.json`中的`scripts`添加打包命令，执行`npm run build`。

```
"scripts": {
   "test": "echo \"Error: no test specified\" && exit 1",
+  "build": "webpack"
},
复制代码
```

打包完成，根目录下会多出一个`dist`文件夹 ~

**Tips：** npm script 可运行 webpack 原理是 package.json 文件可以读取 `node_modules/.bin` 目录下的命令，而命令是在模块局部安装时创建的软链接。

### 入口（entry）

初始化项目配置中的 `entry` 字段指定 webpack 打包入口，注意入口文件仅支持 JavaScript 文件（可参考官网的依赖图）。

entry 配置有两种情况：单页面 和 多页面。

单页面配置，entry 是一个字符串。

```
module.exports = {
  entry: './src/index.js'
}
复制代码
```

多页面配置下，entry 是一个对象。

```
module.exports = {
  entry： {
    app: './src/app.js',
    app2: './src/app2.js'
  }
}
复制代码
```

### 出口（output）

初始化项目配置中的 `output` 字段指定 webpack 文件打包出口，以及命名出口文件。

出口与入口配置一样具备两种配置情况：单页面 和 多页面。

在配置前先介绍下 path 库下两个常用 api 的用法。

> path.resolve：顺序从右往左，若字符以 / 开头，不拼接前面的路径；若以 ../ 开头，拼接前面的路径，且不包含最后一节的路径；若以 ./ 开头或者没有符号，则拼接前面的路径。
>
> path.join：顺序从右往左，只是拼接各个 path 片段。

单页面配置，output 配置如下。

```
const path = require('path')

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'dist')
  }
}
复制代码
```

多页面配置，`[name]`中 name 变量与 entry 对象的 key 对应。

```
const path = require('path')

module.exports = {
  entry: {
    app: './src/app.js'
    app2: './src/app2.js'
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: [name].js
  }
}
复制代码
```

### loader

因 webpack 只支持 JavaScript 和 JSON 文件类型，所以提供 loader 帮助 webpack 去处理其不支持的文件类型，并将它们转化为有效模块，以供应用程序使用，以及被添加到依赖图中。

常见的 loader 如下所示。

|          名称           |                       描述                       |
| :---------------------: | :----------------------------------------------: |
|      babel-loader       | 处理 es6+ 语法，将其编译为浏览器可执行的 js 语法 |
|       vue-loader        |            支持 .vue 文件的加载和解析            |
|      style-loader       |      把 css 以 style 标签插入到 html 文件中      |
|       css-loader        |             支持.css文件的加载和解析             |
| sass-loader/less-loader |             将sass/less文件转换成css             |
|       file-loader       |             图片、字体等静态资源打包             |
|       url-loader        |  类似于 file-loader，当文件低于限定值转 base64   |
|        ts-loader        |                 将 Ts 转换成 Js                  |
|       raw-loader        |             将文件以字符串的形式导入             |

loader 有两个属性：

test：正则匹配文件类型。
use：文件转换使用的 loader。

基本使用如下所示。

```
const path = require('path')

module.exports = {
  module: {
    rules: [{
      test: /\.txt$/,  // 匹配 txt 文件类型
      use: 'raw-loader' // 使用 raw-loader
    }]
  }
}
复制代码
```

### 插件（plugin）

插件用于扩展 webpack 的功能，可用于 bundle 文件的优化、资源管理和环境变量注入，运行可在打包的整个周期。

常见的 plugin 如下所示。

|            名称            |                             描述                             |
| :------------------------: | :----------------------------------------------------------: |
|     SplitChunksPlugin      | 从 v4 开始，移除了 CommonsChunkPlugin ，取而代之的是`optimization.splitChunks`。作用是提取公共模块，减小 bundle 体积，优化首屏渲染 |
|     CleanWebpackPlugin     |                         清理构建目录                         |
|     CopyWebpackPlugin      |             将文件或者文件夹拷贝到构建的输出目录             |
|    MiniCSSExtractPlugin    | 从 v4 开始，移除了 ExtractTextWebpackPlugin，取而代之的是 `MiniCSSExtractPlugin`。作用是将 css 从 bundle 文件里提取成一个独立的 css 文件，以 link 标签的形式注入 html 中 |
| CssMinimizerWebpackPlugin  |                        压缩 CSS 代码                         |
| HotModuleReplacementPlugin |                          模块热更新                          |
|     HtmlWebpackPlugin      |      创建 html 文件，并将静态文件插入到这个 html 文件中      |
|       UglifyjsPlugin       |               压缩 js，从 v4 开始，已经内置。                |
|    TerserWebpackPlugin     |               压缩 js，从 v5 开始，已经内置。                |

plugins 的使用比较简单，拿 HTMLWebpackPlugin 为例

```
const path = require('path')

module.exports = {
  plugins: [
    new HTMLWebpackPlugin({
      template: './src/index.html'
    })
  ]
}
复制代码
```

### 模式（mode）

区分当前构建环境是生产、还是开发，默认值是`production`。

值有 production、development、none 三种。

## 实践

webpack 基本的内容大概都了解了，现在我们开始实践部分 ~

### 创建 html 文件

src 目录下新建 html 模板文件，后续讲解案例会以 Vue 为中心，所以模板内容如下。

```
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>
复制代码
```

后续打包创建 html，并将静态资源文件插入到该 html 的都得益于 HtmlWebpackPlugin。

安装 `npm i html-webpack-plugin \-D`。

简单配置...

```
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './src/index.js', 
  output: { 
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  mode: 'production',
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html', // 模板 html 文件路径
      filename: 'index.html', // 指定打包文件名称
      inject: true, // 向 html 模板注入所有静态资源
    })
  ]
}
复制代码
```

详细配置参考 **HTMLWebpackPlugin 官方详细配置文档**[2]。

### 支持 ES6+

借助 babel 相关的库，将 ES6+ 的代码转换为 ES5，从而兼容更多的浏览器环境。

安装 babel 相关的库函数

```
npm i @babel/core @babel/preset-env babel-loader \--save-dev
```

webpack.config.js 文件中添加对 js 文件的解析。

```
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/, // 除去依赖部分
        use: 'babel-loader'
      }
   ]
  },
  mode: 'production',
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html', 
      filename: 'index.html', 
      inject: true, 
    })
  ]
}
复制代码
```

根目录下新建 .babelrc 配置文件，并安装依赖：`npm i core-js@3 \--save-dev`。

```
{
  "presets": [
    ["@babel/preset-env", {
      "useBuiltIns": "usage", // 在文件运用到新特性的位置单独按需引入
      "corejs": 3,  // corejs 核心库的版本
      "targets": "> 0.25%, not dead" // 浏览器支持的范围
    }]
  ]
}
复制代码
```

useBuiltIns 配置帮助我们处理 Promise、Map、Set、Symbol等新特性，core-js （@babel/polyfill 已在 7.4.0 中弃用）是处理新特性的依赖库。

更改 index.js 文件，`npm run build` 进行打包。

```
const a = () => Promise.resolve(1)
const getData = async () => {
  const res = await a()
  console.log(res)
}
getData()
复制代码
```

打包完成后，可访问 index.html，验证是否正确。

------

扩展下，经 **babel 官网**[3] Try it out 按上述配置将 index.js 代码转换。

```
"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var a = function a() {
  return Promise.resolve(1);
};

var getData = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    var res;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return a();

          case 2:
            res = _context.sent;
            console.log(res);

          case 4:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function getData() {
    return _ref.apply(this, arguments);
  };
}();

getData();
复制代码
```

可发现，转换 async function 时，babel 自定义了 asyncToGenerator 函数来辅助。由此，可知若项目文件过多，每个文件只要有 async function，那项目就会在每个最终打包文件重复定义当前函数。

优化一下 ~

安装`@babel/plugin-transform-runtime`以及`@babel/runtime-corejs3`。

更改 babel 相关配置，可添加`index.html`自行测试。

```
{
  "presets": [
    ["@babel/preset-env"]
  ],
  "plugins": [
    [
      "@babel/plugin-transform-runtime", { "corejs": 3 }
    ]
  ]
}
复制代码
```

Try it out 添加相关插件转换代码如下。

```
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

require("core-js/modules/es.object.to-string.js");

require("core-js/modules/es.promise.js");

var a = function a() {
  return Promise.resolve(1);
};

var getData = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
    var res;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return a();

          case 2:
            res = _context.sent;
            console.log(res);

          case 4:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function getData() {
    return _ref.apply(this, arguments);
  };
}();
复制代码
```

从转换代码看出，优化后，由原先的定义函数改为从一个统一的模块中引入。

### 支持 Vue

安装 Vue，`npm i vue \-S`。

安装相关插件，`npm i vue-loader vue-template-compiler \-D`。

注意 vue-template-compiler 需和 vue 版本需一致，我的实验版本为 `v2.6.14`。插件主要用于将 Vue 模板编译为渲染函数，避免运行时编译开销和 CSP 限制。

> CSP（Content Security Policy）网页安全政策，帮助检测和缓解某些类型的攻击，包括跨站脚本（XSS）和 数据注入等攻击。

新建 main.js 和 App.vue 文件。

```
// main.js
import Vue from 'vue'
import App from './App.vue'

export default new Vue({
  render: h => h(App)
}).$mount('#app')
复制代码
// App.vue
<template>
  <div id="app">{{ message }}</div>
</template>
<script>
export default {
  name: 'App',
  data() {
    return {
      message: 'Hello Vue'
    }
  }
}
</script>
复制代码
```

更改 `webpack.config.js`文件。

```
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
+ const { VueLoaderPlugin } = require('vue-loader')
module.exports = {
- entry: './src/index.js',
+ entry: './src/main.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
    {
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader'
      }
    },
+   {
+     test: /\.vue$/,
+     loader: 'vue-loader'
+   }
   ]
 },
 mode: 'production',
+ plugins: [
+   new VueLoaderPlugin(),
   new HtmlWebpackPlugin({
     template: './src/index.html',
     filename: 'index.html',
     inject: true
   })
 ]
}
复制代码
```

删除旧包，执行`npm run build`重新打包，打开 dist 文件夹下的 index.html，验证是否正常显示 Hello Vue。

### 支持 CSS 及 SCSS

解析 css 文件需要运用 css-loader 进行加载，并且将其转换成 commonjs 对象，再通过 style-loader 将样式通过 style 标签插入到 head 标签中。

安装相关插件， `npm i css-loader style-loader \-D`。

`webpack.config.js`文件中添加 css 文件解析规则。

```
{
  test: /\.css$/,
  use: [
    'style-loader',
    'css-loader'
  ]
}
复制代码
```

这里有个小的知识点：loader 是`链式调用`的，执行顺序也是`从右到左`的。因此，需要先写 style-loader，再写 css-loader 。

新建 main.css 文件，再在 App.vue 文件中引用，完成后，可打包进行测试 ~

```
// main.css
.message {
  color: red;
}
复制代码
// App.vue
<template>
  <div id="app">
    <div class="message">{{ message }}</div>
  </div>
</template>
<script>
import './main.css'
export default {
  name: 'App',
  data() {
    return {
      message: 'Hello Vue'
    }
  }
}
</script>
复制代码
```

现有项目，大部分也都使用了 CSS 预处理器，这里以 SCSS 为例。

安装相关的插件 `npm i sass sass-loader \-D`。

安装完成后，将 main.css 改成 main.scss ， App.vue 中的样式引入更改为`import './main.scss'`。

`webpack.config.js` 文件中添加对 SCSS 文件的加载解析。

```
{
  test: /\.scss$/,
  use: [
    'style-loader',
    'css-loader',
    'sass-loader'
  ]
}
复制代码
```

完成后，删除旧包后重新打包，测试一下~

### 支持图片、字体

可以使用 file-loader 去解析图片、字体。

安装 `npm i file-loader \-D`。

src 目录下新建个 images 和 fonts 文件夹，images 文件夹下添加一张图片，fonts 文件夹下引添加字体文件。

在`App.vue`中引入。

```
<template>
  <div id="app">
    <div class="message">{{ message }}</div>
    <div class="image">
      <img :src="Image" alt="图片" />
    </div>
  </div>
</template>
<script>
import './main.scss'
import Image from './images/image.png'
export default {
  name: 'App',
  data() {
    return {
      message: 'Hello Vue',
      Image: Image
    }
  }
}
</script>
复制代码
```

在 main.scss 文件夹下添加字体的定义。

```
@font-face {
  font-family: 'Manrope-SemiBold';
  src: url('./fonts/Manrope-SemiBold.ttf');
}
.message {
  color: red;
  font-family: 'Manrope-SemiBold';
}
复制代码
```

`webpack.config.js`文件增加图片和字体文件的加载解析。

```
 {
   test: /.(png|jpg|gif|jpeg)$/,
   use: ['file-loader']
 }, 
 {
   test: /\.(woff|woff2|eot|ttf|otf)$/,
   use: ['file-loader']
 }
复制代码
```

完成后，删除旧包，打包访问的 html 文件可验证图片和字体文件是否正常加载。

在 loader 部分中有提到 url-loader，其底层基于 file-loader，在加载解析图片和文件基础上提供可设置较小资源转 base64 格式的功能。

> 转 base64 可减少 HTTP 请求。所以大文件是不适合转 base64，容易导致首屏空白现象。

使用如下所示，小于 10KB 的转 base64 格式。

```
{
  test: /.(png|jpg|gif|jpeg)$/,
  use: [{
    loader: 'url-loader',
    options: {
      limit: 10240
    }
  }]
}
复制代码
```

------

熟悉 v5 的，可能了解 webpack5 的资源模块，无需配置额外的 loader，如 file-loader、url-loader、raw-loader。

|      类型      |                             描述                             |
| :------------: | :----------------------------------------------------------: |
| asset/resource | 发送一个单独的文件并导出 URL。之前通过使用 `file-loader` 实现。 |
|  asset/inline  |  导出一个资源的 data URI。之前通过使用 `url-loader` 实现。   |
|  asset/source  |      导出资源的源代码。之前通过使用 `raw-loader` 实现。      |
|     asset      | 在导出一个 data URI 和发送一个单独的文件之间自动选择。之前通过使用 `url-loader`，并且配置资源体积限制实现。 |

更改下述代码。

```
{
  test: /.(png|jpg|gif|jpeg)$/,
-  use: ['file-loader'],
+  type: 'asset/resource',
+  generator: {
+    filename: '[name][hash:8].[ext]'
+  }
}, 
{
  test: /\.(woff|woff2|eot|ttf|otf)$/,
- use: ['file-loader'],
+  type: 'asset/resource',
+  generator: {
+    filename: '[name][hash:8].[ext]'
+  }
}
复制代码
```

### 开发服务器

搭建开发服务器，避免需先打包后验证的傻瓜式操作。同时，配置热更新，实时渲染页面，纠正开发阶段的低级错误。

安装 `npm i webpack-dev-server \-D`。

为了区分 生产 和 开发 模式，新建 `webpack.dev.js` 和 `webpack.prod.js` 文件。

复制一份 `webpack.config.js`，粘贴到 `webpack.dev.js` 。

更改部分内容：

1. ```
   mode 配置项更改为 development。
   ```

2. ```
   添加 devServer 配置，配置热更新，hot 为 true 的情况下会自动引入`HotModuleReplaceMentPlugin`插件。
   ```

```
devServer: {
  port: 3000, // 端口
  hot: true, // 开启热更新
  open: true // 启动开启浏览器
}
复制代码
```

同样的操作，粘贴到 `webpack.prod.js`，无需做改动，完成后，删除原有的 `webpack.config.js`。

最后，更改下`package.json`文件中的`scripts`字段。

```
scripts: {
  "dev": "webpack-dev-server --config webpack.dev.js",
  "build": "webpack --config webpack.prod.js",
  "test": "echo \"Error: no test specified\" && exit 1",
}
复制代码
```

完成后，可执行`npm run dev` 验证，是否正常显示页面且热更新生效。

### 添加文件指纹

文件指纹指打包后输出文件名的后缀，其有版本管理，清除缓存的作用。

文件指纹有三种类型。

1. hash: 与整个项目构建有关系，项目文件更改，整个项目构建的 hash 值也会更改。
2. chunkhash: 和 webpack 打包的 chunk 有关，不同的 entry 会生成不同的 chunkhash 值。
3. contenthash：根据文件内容来定义 hash，文件内容不变，则 contenthash 不变。

文件指纹的作用主要还是运用在测试、生产环境。所以，我们只需要更改 `webpack.prod.js` 文件即可。

针对 js 文件类型，设置 output 的 filename，使用的是 `[chunkhash:8]`。

```
output: {
  path: path.join(__dirname, 'dist'),
+ filename: '[name][chunkhash:8].js'
- filename: 'bundle.js'
}
复制代码
```

针对 css 文件类型，目前是使用 style-loader，其将 css 构建到 js 文件中，然后在 js 文件加载的时候再以 style 标签插入到 html 中。那如何提取独立的 CSS 文件呢？那就要谈到 `MiniCSSExtractPlugin` 插件。

安装`npm i mini-css-extract-plugin \-D`，webpack.prod.js 文件引入 `const MiniCssExtractPlugin = require('mini-css-extract-plugin')`。

plugins 添加 MiniCssExtractPlugin 插件，且使用 contenthash 变量。

```
plugins: [
  new VueLoaderPlugin(),
+  new MiniCssExtractPlugin({
+    filename: '[name][contenthash:8].css'
+  }),
  new HtmlWebpackPlugin({
    template: './src/index.html',
    inject: true,
    filename: 'index.html'
  })
]
复制代码
```

style-loader 与 MiniCSSExtractPlugin 冲突，替换 style-loader 为 MiniCssExtractPlugin.loader

```
{
  test: /\.css$/,
  use: [
-   'style-loader'
+    MiniCssExtractPlugin.loader,
    'css-loader'
  ]
}, 
{
  test: /\.scss$/,
  use: [
-   'style-loader'
+    MiniCssExtractPlugin.loader,
    'css-loader',
    'sass-loader'
  ]
}, 
复制代码
```

针对图片、字体等类型，设置相关解析 loader 的配置参数，使用的是 `[hash:8]`。

```
{
  test: /.(png|jpg|gif|jpeg)$/,
  use: [{
    loader: 'file-loader',
    options: {
      name: '[name][hash:8].[ext]'
    }
  }]
}, 
{
  test: /\.(woff|woff2|eot|ttf|otf)$/,
  use: [{
    loader: 'file-loader',
    options: {
      name: '[name][hash:8].[ext]'
    }
  }]
}    
复制代码
```

### 代码压缩

v5 版本开始，开箱即带最新版本的 terser-webpack-plugin。若想自定义配置，仍需安装。

若自定义，安装 `npm i terser-webpack-plugin \-D`。

配置如下，需使用 optimization（优化）字段，该字段从 v4 开始，根据不同的 `mode` 执行不同的优化。

```
optimization: {
  minimize: true， // 告知 webpack 使用 TerserPlugin 或其他使用 optimization.minimizer 定义的压缩插件 
  minimizer: [
    new TerserPlugin()
  ]
}
复制代码
```

再来讲 css 代码压缩，v5 推荐使用 CssMinimizer 插件，与 OptimizeCssAssetsPlugin 插件一样，但在 sourcemaps 和 assets 中使用查询字符串会更加准确，支持缓存和并发模式下并行，且内置了 cssnano，无需额外安装。

安装 `npm i css-minimizer-webpack-plugin \-D`。

配置如下。

```
optimization: {
  minimizer: [
    new CssMinimizerPlugin()
  ]
}
复制代码
```

执行 `npm run build`，出现报错。

根据提示，安装 postcss（v8.3.11）解决问题。

![图片](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)image.png

### 清除构建目录

每次构建时若不清理旧包，会造成构建的输出目录 output 文件越来越多，因此，清除是必然的操作。为了避免构建前手动删除 dist 目录，同样需要插件 CleanWebpackPlugin 去自动删除旧包。

安装 `npm i clean-webpack-plugin \-D`。

`webpack.prod.js`的 plugins 字段添加 CleanWebpackPlugin 插件。

头部引入`const { CleanWebpackPlugin } = require('clean-webpack-plugin')`。

```
plugins: [
  new VueLoaderPlugin(),
  new MiniCssExtractPlugin({
    filename: '[name][contenthash:8].css'
  }),
  new HtmlWebpackPlugin({
    template: './src/index.html',
    inject: true,
    filename: 'index.html'
  }),
+  new CleanWebpackPlugin()
]
复制代码
```

------

根据 webpack 官网 v5.2+ 增加了 output 的 clean 字段，具备同样的功能，无需额外安装 CleanWebpackPlugin 插件。

配置如下。

```
output {
  path: path.join(__dirname, 'dist'),
  filename: '[name][chunkhash:8].js',
+  clean: true
}
复制代码
```

## 总结

webpack 基础篇内容大致就是如此，希望读完的朋友能对 webpack 有个基本的了解，也有想法去应对日常脚手架配置。

