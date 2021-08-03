## 从零搭建Webpack5-react脚手架



## webpack5

近期终于有时间和精力专注于公司技术基础建设了，于是一开始，将公司的`Saas`系统改造成了微前端模式，解决了历史遗留的一部分问题

接着，想着`webpack5`已经发布这么久了，该在生产环境用起来了，也顺势想推动`微前端`、`webpack5`、`vite`在业内的普及率,没看过我之前文章的朋友可以在文末找找,干货真的很多

## 正式开始

#### webpack5升级后，有哪些改变？

- 通过持久化缓存提高性能
- 采用更好的持久化缓存算法和默认行为
- 通过优化 Tree Shaking 和代码生成来减小Bundle体积（干掉了nodejs的polyfill）
- 提高 Web 平台的兼容性
- 清除之前为了实现 Webpack4 没有不兼容性变更导致的不合理 state
- 尝试现在引入重大更改来为将来的功能做准备，以使我们能够尽可能长时间地使用 Webpack 5
- `新增Module Federation(联邦模块)`

## 搭建指南

> 推荐大家使用我在我们公司(`深圳明源云空间`)做的脚手架，给大家一键生成项目模板，这样大家在看本文的时候会得到更好的提升

生成模板步骤：

```
npm  i ykj-cli -g 
ykj init webpack5 （这里选择通用项目模板）
cd webpack5
yarn 
yarn dev
```

------

#### 开始搭建

- 首先新建文件夹，使用yarn初始化项目

```
mkdir webpack5-demo
cd webpack5-demo
yarn init webpack5-demo
...一路回车
```

- 下载`webpack webpack-cli`最新版本:

```
yarn add webpack@next webpack-cli@next -D
```

- 然后安装`React react-dom`17版本的库

```
yarn add react@17.0.0 react-dom@17.0.0 --save 
```

- 接着安装`react`官方热更新推荐的库

```
yarn add react-refresh -D
```

- 安装`less css style标签 postcss`等样式处理的库（`mini-css-extract-plugin`要安装`@next`版本的）

```
yarn add less less-loader css-loader style-loader mini-css-extract-plugin@next -D
```

- 安装相关`babel`依赖

```
yarn add core-js@3.9.0 @babel/core@next  babel-loader@next @babel/preset-env@next -D
```

> `babel`具体要哪些配置，建议大家参考我的模板里面

------

#### 完成了依赖的准备工作,开始搭建项目

- 项目根目录创建`config`文件夹，用于放置`webpack`配置文件
- `config`文件夹下新建四个文件

```
paths.js//存放路径
webpack.base.js //基础配置
webpack.dev.js//开发配置
webpack.prod.js//生产配置
```

- 在`paths`文件内，用变量记录几个关键目录:

```
const path = require('path');

module.exports = {
    // 源码目录
    src: path.resolve(__dirname, '../src'),

    // 构建后的资源产物文件夹
    build: path.resolve(__dirname, '../dist'),

    // 静态资源
    public: path.resolve(__dirname, '../public'),
};
```

- 编写基础`webpack.base.js`配置文件,引入依赖

```
//webpack.base.js
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const paths = require('./paths');
```

- 编写`entry`和`output`字段：

```
 entry: paths.src + 'index.tsx',
 output: {
        path: path.resolve(__dirname, '../dist'),
        filename: '[name].[contenthash].js',
        publicPath: '',
    },
```

> 这里要注意的是，`webpack5`对`contenthash`算法进行了优化，这里可以在`chunkhash`和`contenthash`中选择一个，建议`contenthash`

- 编写基础`loader`配置:

```
    module: {
        rules: [
            {
                use: 'babel-loader',
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
            },
            {
                use: ['style-loader', 'css-loader', 'less-loader'],
                test: /\.(css|less)$/,
            },
            {
                type: 'asset',
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
            },
        ],
    },
```

> 这里要注意的是：`webpack5`对于资源，类似：图片、字体文件等，可以用内置的`asset`去处理，不用`url-loader`和`file-loader`了

- 接着，由于项目需要配置别名和省略后缀名，我们先配置`resolve`字段(我是TypeScript+React技术栈):

```
 resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json', '.jsx'],
        alias: {
            '@': paths.src,
            '@c': paths.src + '/components',
            '@m': paths.src + '/model',
            '@s': paths.src + '/services',
            '@t': paths.src + '/types',
        },
    },
```

- 插件的话，由于是基础配置，只要一个`clean、html`的插件即可

```
  plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: './public/index.html',
        }),
    ],
```

- 在项目根目录新建文件`babel.config.js`

```
const { argv } = require('yargs');
const isDev = argv.mode === 'development';
const plugins = [
    [
        'const-enum',
        {
            transform: 'constObject',
        },
    ],
    'lodash',
    '@babel/plugin-transform-runtime',
    //支持import 懒加载
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-transform-async-to-generator',
    'transform-class-properties',
    [
        'import',
        {
            libraryName: 'antd',
            libraryDirectory: 'es',
            style: true, // or 'css'
        },
        'antd',
    ],
    [
        'import',
        {
            libraryName: 'ykj-ui',
            libraryDirectory: 'lib/components',
            style: true, // or 'css'
        },
        'ykj-ui',
    ],
];
module.exports = (api) => {
    api.cache(true);
    return {
        presets: [
            [
                '@babel/preset-env',
                {
                    corejs: 3.9,
                    useBuiltIns: 'usage',
                },
            ],
            [
                '@babel/preset-react',
                {
                    runtime: 'automatic',
                },
            ],
            '@babel/preset-typescript',
        ],
        plugins: isDev ? [...plugins, 'react-refresh/babel'] : [...plugins],
    };
};
```

> 这样，我们的基础`webpack`配置就好了,捋一捋先：

- 用babel处理`tsx ts` 和`es`高阶语法
- 用`loader`处理`less`语法
- 用插件处理了`html`和负责清理工作
- 用`resolve`字段配置了别名和省略文件后缀
- 用内置的`asset`处理了静态文件，例如图片等

#### 编写`webpack.dev.js`开发配置

引入依赖

```
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const { HotModuleReplacementPlugin } = require('webpack');
const { merge } = require('webpack-merge');
const common = require('./webpack.base');
```

先引入了热更新、合并配置、基础配置、官方react热更新依赖

接着编写配置

```
const devConfig = {
    mode: 'development',
    devServer: {
        port: 3000,
        contentBase: '../dist',
        open: true,
        hot: true,
    },
    target: 'web',
    plugins: [new HotModuleReplacementPlugin(), new ReactRefreshWebpackPlugin()],
    devtool: 'eval-cheap-module-source-map',
};

module.exports = merge(common, devConfig);
```

> 注意：这里要设置`target: 'web'`才会有热更新效果

- devtool在开发模式最佳实践是:`eval-cheap-module-source-map`

这样，我们的开发模式配置就搭建好了，只要在`public`文件夹下编写一个`index.html`，就可以跟之前一样，开始写`react`项目了

------

#### 开始编写`webpack.prod.js`生产配置

- 引入依赖：

```
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { merge } = require('webpack-merge');
const common = require('./webpack.base');
```

- 生产环境要抽离`css`标签，所以这里针对less和css要做特殊处理,一个是`postcss`处理样式兼容性问题，一个是`MiniCssExtractPlugin.loader`:

```
const prodConfig = {
    mode: 'production',
    devtool: 'hidden-source-map',
    module: {
        rules: [
            {
                test: /\.(css|less)$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'less-loader'],
            },
        ],
    },
    optimization: {
        splitChunks: {
            chunks: 'all',
            name: false,
        },
    },
    plugins: [new MiniCssExtractPlugin()],
};
module.exports = merge(common, prodConfig);
```

- 这样生产的配置也编写好了

> 生产环境devtool最佳实践是: `hidden-source-map`

------

#### 编写scripts命令

```
"build": "webpack --config config/webpack.prod.js  --mode production",
"dev": "webpack serve --config config/webpack.dev.js  --mode development",
```

> 注意：热更新以前是`webpack-dev-server`,现在是`webpack serve`!!!

#### 配置代码质量管控流程

- 新增依赖

```
yarn add lint-staged @commitlint/cli @commitlint/config-conventional -D
```

- 编写代码、提交检测流程

```
 "husky": {
        "hooks": {
            "pre-commit": "lint-staged",
            "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
        }
    },
    "lint-staged": {
        "src/**/*.{js,jsx,ts,tsx,json,css,less,md}": [
            "prettier --write",
            "eslint --fix",
            "git add"
        ]
    },
    "browserslist": [
        "ie >= 10",
        "ff >= 30",
        "chrome >= 34",
        "safari >= 8",
        "opera >= 23"
    ]
}
```

- 新增`eslint`配置：

```
//.eslintrc.js
module.exports = {
    root: true,
    parserOptions: {
        ecmaVersion: 7,
        sourceType: 'module',
    },
    parser: '@typescript-eslint/parser',
    plugins: ['typescript', 'react'],
    env: {
        browser: true,
        node: true,
        es6: true,
    },
    rules: {
        semi: ['error', 'always'], // 该规则强制使用一致的分号
        'no-unused-vars': 'off', // 禁止未使用过的变量
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off', //生产环境禁用 debugger
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off', //生产环境禁用 console
        'default-case': ['warn', { commentPattern: '^no default$' }], //要求 Switch 语句中有 Default
        'dot-location': ['warn', 'property'], // 强制在点号之前或之后换行
        eqeqeq: ['error', 'allow-null'], //要求使用 === 和 !==
        'new-parens': 'warn', //要求调用无参构造函数时带括号
        'no-caller': 'error', // 禁用 caller 或 callee
        'no-const-assign': 'error', //不允许改变用 const 声明的变量
        'no-dupe-args': 'error', //禁止在 function 定义中出现重复的参数
        'no-dupe-class-members': 'error', //不允许类成员中有重复的名称
        'no-dupe-keys': 'warn', //禁止在对象字面量中出现重复的键
        'no-extend-native': 'warn', //禁止扩展原生对象
        'no-extra-bind': 'warn', //禁止不必要的函数绑定
        'no-fallthrough': 'error', //禁止 case 语句落空
        'no-func-assign': 'warn', //禁止对 function 声明重新赋值
        'no-implied-eval': 'error', //禁用隐式的 eval()
        'no-label-var': 'error', //禁用与变量同名的标签
        'no-loop-func': 'error', //禁止循环中存在函数
        'no-mixed-operators': [
            'warn',
            {
                groups: [
                    ['&', '|', '^', '~', '<<', '>>', '>>>'],
                    ['==', '!=', '===', '!==', '>', '>=', '<', '<='],
                    ['&&', '||'],
                    ['in', 'instanceof'],
                ],
                allowSamePrecedence: false,
            },
        ], //禁止混合使用不同的操作符
        'no-multi-str': 'warn', //禁止多行字符串 (需要多行时用\n)
        'no-native-reassign': 'warn', //禁止重新分配本地对象
        'no-obj-calls': 'warn', //禁止将全局对象当作函数进行调用
        'no-redeclare': 'error', //禁止重新声明变量
        'no-script-url': 'warn', //禁用 Script URL
        'no-shadow-restricted-names': 'warn', //关键字不能被遮蔽
        'no-sparse-arrays': 'warn', //禁用稀疏数组
        'no-this-before-super': 'warn', //在构造函数中禁止在调用 super()之前使用 this 或 super
        'no-undef': 'error', //禁用未声明的变量
        'no-unexpected-multiline': 'warn', //禁止使用令人困惑的多行表达式
        'no-use-before-define': [
            'warn',
            {
                functions: false,
                classes: false,
                variables: false,
            },
        ], //禁止定义前使用
        'no-with': 'error', //禁用 with 语句
        radix: 'error', //禁用函数内没有 yield 的 generator 函数
        'rest-spread-spacing': ['warn', 'never'], //强制限制扩展运算符及其表达式之间的空格
        'react/jsx-no-undef': 'error', //在 JSX 中禁止未声明的变量
        'react/no-direct-mutation-state': 'error', //禁止 this.state 的直接变化
        'react/jsx-uses-react': 'warn', //防止 React 被错误地标记为未使用
        'no-alert': 0, //禁止使用alert confirm prompt
        'no-duplicate-case': 2, //switch中的case标签不能重复
        'no-eq-null': 2, //禁止对null使用==或!=运算符
        'no-inner-declarations': [2, 'functions'], //禁止在块语句中使用声明（变量或函数）
        'no-iterator': 2, //禁止使用__iterator__ 属性
        'no-negated-in-lhs': 2, //in 操作符的左边不能有!
        'no-octal-escape': 2, //禁止使用八进制转义序列
        'no-plusplus': 0, //禁止使用++，--
        'no-self-compare': 2, //不能比较自身
        'no-undef-init': 2, //变量初始化时不能直接给它赋值为undefined
        'no-unused-expressions': 2, //禁止无用的表达式
        'no-useless-call': 2, //禁止不必要的call和apply
        'init-declarations': 0, //声明时必须赋初值
        'prefer-const': 0, //首选const
        'use-isnan': 2, //禁止比较时使用NaN，只能用isNaN()
        'vars-on-top': 2, //var必须放在作用域顶部
    },
};
```

------

#### 单元测试

新增命令：

```
"test": "jest", //进行测试
"test-c": "jest --coverage" //生成测试报告
```

安装`jest`等依赖:

```
yarn add jest-environment-enzyme ts-jest@next enzyme enzyme-adapter-react-17 enzyme-to-json  @types/enzyme @types/enzyme-adapter-react-17 @types/enzyme-to-json -D 
```

新建文件夹 `test`

编写第一个单元测试,引入依赖:

```
import App from '../src/App';
import { mount, shallow } from 'enzyme';
import React from 'react';
import toJson from 'enzyme-to-json'; //做快照
```

然后就可以愉快的开始写单元测试了哦

- 这样，一个`webpack5`的脚手架就搭建好了，`webpack`内置的一些东西，可以让我们省去很多配置，看起来会更简单



**🐸往期我的原创好文推荐**

[微前端的部署最佳实践（k8s + ingress）](http://mp.weixin.qq.com/s?__biz=MzkwODIwMDY2OQ==&mid=2247490709&idx=1&sn=7959a97ed4f0151c932e429c1c505634&chksm=c0ccc327f7bb4a31d30b0bc05f2089dba385c61ecb9d72252ca8e0f88573ef89e1b9d101d031&scene=21#wechat_redirect)

[微前端框架是怎么导入加载子应用的  【3000字精读】](http://mp.weixin.qq.com/s?__biz=MzkwODIwMDY2OQ==&mid=2247488271&idx=1&sn=84fd48b1632fe1baa2b1e28bc8c8ce43&chksm=c0ccccbdf7bb45ab1bd9d85135cbe6ed6287e4e80728bbfec344f4f5954f51475ad5ae51f532&scene=21#wechat_redirect)

[熬夜准备的一个React项目升级Vite的指南](http://mp.weixin.qq.com/s?__biz=MzkwODIwMDY2OQ==&mid=2247489551&idx=2&sn=94df9d930dda0d7f7f28356c51212c05&chksm=c0ccc7bdf7bb4eab7950dd406762496e9974af2a8ea8cf904daa3d3380b8d4ddf895487d10c9&scene=21#wechat_redirect)

[尤雨溪的5KB petite-vue源码解析](http://mp.weixin.qq.com/s?__biz=MzkwODIwMDY2OQ==&mid=2247490648&idx=1&sn=cdcb54ce789ab219c0873e293616f0b1&chksm=c0ccc3eaf7bb4afcbfea01b42bfc650007bae2c7c4b0c7d71b84040ca4ff2188371e6c9c5477&scene=21#wechat_redirect)

[熬夜写的解析掘金新版本编辑器源码](http://mp.weixin.qq.com/s?__biz=MzkwODIwMDY2OQ==&mid=2247490056&idx=1&sn=dd5b11a232ccc4f577a61fa1a7be4ce3&chksm=c0ccc5baf7bb4cac606a9d90547274f4e9540ca538231a90343fd6776a300cc71cd6aed4f81a&scene=21#wechat_redirect)

[Vite和Webpack的核心差异](http://mp.weixin.qq.com/s?__biz=MzkwODIwMDY2OQ==&mid=2247488867&idx=1&sn=e3ce0595309d90914de76bedcc7b8daa&chksm=c0cccad1f7bb43c7025c800d97d34148c6ba81d6ce383933f83413717ae6fad7db7071373a99&scene=21#wechat_redirect)

[CSS是如何发起攻击的?](http://mp.weixin.qq.com/s?__biz=MzkwODIwMDY2OQ==&mid=2247489711&idx=1&sn=1d65fca7998ae60a5eb21eec5f028824&chksm=c0ccc71df7bb4e0ba6f0143848ca9cf2936bc28b6a9160f58e617fa0262ce73deb515fa61ed7&scene=21#wechat_redirect)

[使用require.context，实现去路由中心化管理](http://mp.weixin.qq.com/s?__biz=MzkwODIwMDY2OQ==&mid=2247488139&idx=1&sn=4f21f256378a5c1f1eab3b75980ef64f&chksm=c0cccd39f7bb442f626604df9fe979d8969ea1ba90043f26c902daaf5d291d9850a3bda44c29&scene=21#wechat_redirect)

[一行代码实现display"过渡动画"原理](http://mp.weixin.qq.com/s?__biz=MzkwODIwMDY2OQ==&mid=2247488141&idx=1&sn=fb07153ea1388ea30be27c38569a115d&chksm=c0cccd3ff7bb4429cd35307cde78ee10356cd6ea5a62136f1149d0fedbcf4a8e9b0b7c758d2b&scene=21#wechat_redirect)

[在React中实现和Vue一样舒适的keep-alive](http://mp.weixin.qq.com/s?__biz=MzkwODIwMDY2OQ==&mid=2247488187&idx=1&sn=a05674e9b003b72fc8e0d99724a1cdae&chksm=c0cccd09f7bb441f079f9553f1b1d4db09fa8682a0ba2214c28941113036850023ab993c1584&scene=21#wechat_redirect)

[Node.js结合ProtoBuffer,从零实现一个redis! [一万字\]](http://mp.weixin.qq.com/s?__biz=MzkwODIwMDY2OQ==&mid=2247488205&idx=1&sn=e1700235e0e63efd84ae6a3206ce3c8d&chksm=c0cccd7ff7bb446914f6eebc7343e024e735a9504f982759521bfe14cac702d0e34f1c316ced&scene=21#wechat_redirect)

[使用Node.js驱动Redis,实现一个消息队列！](http://mp.weixin.qq.com/s?__biz=MzkwODIwMDY2OQ==&mid=2247488214&idx=1&sn=ae43a079c275f5e39447ea369e7c0756&chksm=c0cccd64f7bb447231804f65adbef48a93581ea151b3e620e7dd96a95b9ac351058670dbd21e&scene=21#wechat_redirect)

[8000字总结的前端性能优化](http://mp.weixin.qq.com/s?__biz=MzkwODIwMDY2OQ==&mid=2247488161&idx=1&sn=b5a7a8a537c18fd31a9df74549b57a2d&chksm=c0cccd13f7bb44058b2c145054a30f7e8fe1a2a658dbbc100f459a9aeb0de1d5b2c2ea017b47&scene=21#wechat_redirect)

[前端工程师学Docker ？看这篇就够了  【零基础入门 原创】](http://mp.weixin.qq.com/s?__biz=MzkwODIwMDY2OQ==&mid=2247489266&idx=2&sn=070422b33a291de921426a3991a4f4a2&chksm=c0ccc940f7bb40566c3d4f206c559a6d16ac2a81b9a91d424436a551817f436d80fd417d8fb4&scene=21#wechat_redirect)

[深度：手写一个WebSocket协议   [7000字\]](http://mp.weixin.qq.com/s?__biz=MzkwODIwMDY2OQ==&mid=2247489517&idx=2&sn=1726e91dcd4ff71c6d4d31f60bb5f02d&chksm=c0ccc85ff7bb4149eba0ba1548f8639ebda04905f4889016dee658cb035122e2d769394a8d87&scene=21#wechat_redirect)

[精读:10个案例让你彻底理解React hooks的渲染逻辑](http://mp.weixin.qq.com/s?__biz=MzkwODIwMDY2OQ==&mid=2247488267&idx=1&sn=b8e09ddb5ffb1c35fea8ff02d826845f&chksm=c0ccccb9f7bb45afe79d9e8c68c0c846b838cb233567b2a4f59e931b021dbd4ffb312bef3a64&scene=21#wechat_redirect)

[原创：如何自己实现一个简单的webpack](http://mp.weixin.qq.com/s?__biz=MzkwODIwMDY2OQ==&mid=2247488297&idx=1&sn=a635f6fcf19029c20f0366996b42c710&chksm=c0cccc9bf7bb458d0a684e775d5da0ce663cee45ef4ba5d3eb6f13f11f6073c82c077cbe07ef&scene=21#wechat_redirect)

[5000字解析：前端五种跨平台技术](http://mp.weixin.qq.com/s?__biz=MzkwODIwMDY2OQ==&mid=2247488295&idx=1&sn=4a321e04119b5cf1aae9375a7c97aabd&chksm=c0cccc95f7bb45831b67b304a8a46937aa2ca26513e808698fb489f55cc21a3132363a9c46d4&scene=21#wechat_redirect)

[如何优化你的超大型React应用 【原创精读】](http://mp.weixin.qq.com/s?__biz=MzkwODIwMDY2OQ==&mid=2247488299&idx=2&sn=13140b672872b0ffa288c83c226355b0&chksm=c0cccc99f7bb458f79e749552e0dc140105e205566bfe822399d8bddd1d1b53de83bb823f805&scene=21#wechat_redirect)

[前端面试官:你知道source-map的原理是什么吗？](http://mp.weixin.qq.com/s?__biz=MzkwODIwMDY2OQ==&mid=2247488313&idx=1&sn=776ebee5d34de3c3a2b0b4aeb636100b&chksm=c0cccc8bf7bb459d1e76ba199f215ad0f3eeb606f44627cc7393c4db661f2312f8b8a3fd3eb9&scene=21#wechat_redirect)

[原创：带你从零看清Node源码createServer和负载均衡整个过程](http://mp.weixin.qq.com/s?__biz=MzkwODIwMDY2OQ==&mid=2247488335&idx=2&sn=549e7022c643d7a13c04d5f77a77852b&chksm=c0ccccfdf7bb45ebb27fb24baf838f1c1dd10b0de3648d70c6e183b96122b82dcbf35ab14972&scene=21#wechat_redirect)

[Express version 4.17核心源码解析](http://mp.weixin.qq.com/s?__biz=MzkwODIwMDY2OQ==&mid=2247488310&idx=1&sn=ae7fd0c85c17b072e660bbc2dd9edc8e&chksm=c0cccc84f7bb459265e327b1b373f2fb14b6d75b934fffb893cd230b10ab33b59af1985fb70a&scene=21#wechat_redirect)

[通过Node.js的Cluster模块源码，深入PM2原理](http://mp.weixin.qq.com/s?__biz=MzkwODIwMDY2OQ==&mid=2247488424&idx=1&sn=c76b5d2b28ff6344c1ed2893a7f8a5b7&chksm=c0cccc1af7bb450cf426e896f2fea3524a2c20f075909c95e5b82aa45c8ac49bfb40446b4128&scene=21#wechat_redirect)

[大前端时代，浅谈JavaScript开发重型跨平台应用以及架构](http://mp.weixin.qq.com/s?__biz=MzkwODIwMDY2OQ==&mid=2247488456&idx=2&sn=4c7ff92aafc68c04b9b9a989070140e5&chksm=c0cccc7af7bb456c1ce6d757962181a191958574b2a3e7bff1a8846aa33baf35d6043c959d54&scene=21#wechat_redirect)

[为什么我们要熟悉这些通信协议？【精读】](http://mp.weixin.qq.com/s?__biz=MzkwODIwMDY2OQ==&mid=2247488458&idx=1&sn=ee1a9c2df46d4824c3cc896c1c145c39&chksm=c0cccc78f7bb456e3f85bee39f730bb50db03489b1552f33907bd621eeb22f38c8261fcdaf07&scene=21#wechat_redirect)

[阅读原文](https://mp.weixin.qq.com/s?__biz=MzAxMTMyOTk3MA==&mid=2456451574&idx=1&sn=4a518c9c00ae6c3ecbcd1e4a26ce8dc8&chksm=8cdc112bbbab983d9a405b4f80ba0966e099c08c9cbeceb45be48fe6ac3ab4a5fd8794c9c97e&scene=126&sessionid=1627995495&key=7794279d9ef868f3539c637f3b8d1af801a4fc09f4c6886aea9e3362d86aa39ccd46402c5d40d9ccebbf4942e343257e76112d2c1bd8cac0613cc1ab4e50aa615a33ea737c9234d9b0da84733700d36aced5a6120682833508a6bb07fca01d5b6b0ea6fcdc6148b91da0dc330674abb8e9e7d01076e15180a9518949108c1a07&ascene=1&uin=MTI2MDExMzc3MQ%3D%3D&devicetype=Windows+10+x64&version=6303051e&lang=zh_CN&exportkey=AT%2FUeBdI7xRlLrDcXgjaUts%3D&pass_ticket=m%2BxSSpY1w%2FIfxg7FptPFSi0kwJOnrrxRBniAKRx3rkzIDsMrCMmNjJuhldEUAgCS&wx_header=0&fontgear=2##)

阅读 457

分享收藏

赞2在看

写下你的留言前后端分离接口规范

随着互联网的高速发展，前端页面的展示、交互体验越来越灵活、炫丽，响应体验也要求越来越高，后端服务的高并发、高可用、高性能、高扩展等特性的要求也愈加苛刻，从而导致前后端研发各自专注于自己擅长的领域深耕细作。

然而带来的另一个问题：前后端的对接界面双方却关注甚少，没有任何接口约定规范情况下各自干各自的，导致我们在产品项目开发过程中，前后端的接口联调对接工作量占比在30%-50%左右，甚至会更高。往往前后端接口联调对接及系统间的联调对接都是整个产品项目研发的软肋。

本文的主要初衷就是规范约定先行，尽量避免沟通联调产生的不必要的问题，让大家身心愉快地专注于各自擅长的领域。

## 2. 为何要分离

参考两篇文章：

> http://blog.jobbole.com/65509/
> http://blog.jobbole.com/56161/

目前现有前后端开发模式：“后端为主的MVC时代”，如下图所示：

![图片](https://mmbiz.qpic.cn/mmbiz_png/eQPyBffYbueoAtLwpSLvz7O2sEvLD0iaF6aTR3V0TMpINndgQUL0oeKyqe6GiadKiayALib8VT83Bq8pN6ww9vk06w/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

后端为主的MVC时代

代码可维护性得到明显好转，MVC 是个非常好的协作模式，从架构层面让开发者懂得什么代码应该写在什么地方。为了让 View 层更简单干脆，还可以选择 Velocity、Freemaker 等模板，使得模板里写不了 Java 代码。

看起来是功能变弱了，但正是这种限制使得前后端分工更清晰。然而依旧并不是那么清晰，这个阶段的典型问题是：

**前端开发重度依赖开发环境，开发效率低。**

这种架构下，前后端协作有两种模式：一种是前端写demo，写好后，让后端去套模板 。淘宝早期包括现在依旧有大量业务线是这种模式。好处很明显，demo 可以本地开发，很高效。不足是还需要后端套模板，有可能套错，套完后还需要前端确定，来回沟通调整的成本比较大。

另一种协作模式是前端负责浏览器端的所有开发和服务器端的 View 层模板开发，支付宝是这种模式。好处是 UI 相关的代码都是前端去写就好，后端不用太关注，不足就是前端开发重度绑定后端环境，环境成为影响前端开发效率的重要因素。

**前后端职责依旧纠缠不清。**

Velocity 模板还是蛮强大的，变量、逻辑、宏等特性，依旧可以通过拿到的上下文变量来实现各种业务逻辑。这样，只要前端弱势一点，往往就会被后端要求在模板层写出不少业务代码。还有一个很大的灰色地带是 Controller，页面路由等功能本应该是前端最关注的，但却是由后端来实现。Controller 本身与 Model 往往也会纠缠不清，看了让人咬牙的业务代码经常会出现在 Controller 层。这些问题不能全归结于程序员的素养，否则 JSP 就够了。

**对前端发挥的局限。**

性能优化如果只在前端做空间非常有限，于是我们经常需要后端合作才能碰撞出火花，但由于后端框架限制，我们很难使用Comet、Bigpipe等技术方案来优化性能。

总上所述，就跟为什麽要代码重构一样：

- 关注点分离
- 职责分离
- 对的人做对的事
- 更好的共建模式
- 快速的反应变化

## 3. 什么是分离

我们现在要做的前后分离第一阶段：“基于 Ajax 带来的 SPA 时代”，如图：

![图片](https://mmbiz.qpic.cn/mmbiz_png/eQPyBffYbueoAtLwpSLvz7O2sEvLD0iaFM6IEry3a3tIGWVKCicdlic3Y6LicEaCXHjJ5KS0ZRSo0eVgTLBWOoSvrg/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

基于 Ajax 带来的 SPA 时代

这种模式下，前后端的分工非常清晰，前后端的关键协作点是 Ajax 接口。看起来是如此美妙，但回过头来看看的话，这与 JSP 时代区别不大。复杂度从服务端的 JSP 里移到了浏览器的 JavaScript，浏览器端变得很复杂。类似 Spring MVC，这个时代开始出现浏览器端的分层架构：

![图片](https://mmbiz.qpic.cn/mmbiz_png/eQPyBffYbueoAtLwpSLvz7O2sEvLD0iaFMeOHEW5FoTRb7xsNiaEqBHiaopNrZSTMqkYBuicke3OicVQZicib3aUrlYWw/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

浏览器端的分层架构

对于这一SPA阶段，前后端分离有几个重要挑战：

**前后端接口的约定。**

如果后端的接口一塌糊涂，如果后端的业务模型不够稳定，那么前端开发会很痛苦。这一块在业界有 API Blueprint 等方案来约定和沉淀接口，==在阿里，不少团队也有类似尝试，通过接口规则、接口平台等方式来做。有了和后端一起沉淀的接口规则，还可以用来模拟数据，使得前后端可以在约定接口后实现高效并行开发。== 相信这一块会越做越好。

**前端开发的复杂度控制。**

SPA 应用大多以功能交互型为主，JavaScript 代码过十万行很正常。大量 JS 代码的组织，与 View 层的绑定等，都不是容易的事情。典型的解决方案是业界的 Backbone，但 Backbone 做的事还很有限，依旧存在大量空白区域需要挑战。

## 4. 如何做分离

### 4.1 职责分离

![图片](https://mmbiz.qpic.cn/mmbiz/eQPyBffYbueoAtLwpSLvz7O2sEvLD0iaFkzfG4WlF1IibuFFF8o9y9Zq9HDHhFJjiaoIriaaYmvLicmqkNmAuna2FNg/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

职责分离



- 前后端仅仅通过异步接口(AJAX/JSONP)来编程
- 前后端都各自有自己的开发流程，构建工具，测试集合
- 关注点分离，前后端变得相对独立并松耦合



![图片](https://mmbiz.qpic.cn/mmbiz_png/eQPyBffYbueoAtLwpSLvz7O2sEvLD0iaFa653luncco3zOQViaeBaJ5SAibPvfKuSvibaG2tD0qiabZGrxAYkrwHRicQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

### 4.2 开发流程

- 后端编写和维护接口文档，在 API 变化时更新接口文档
- 后端根据接口文档进行接口开发
- 前端根据接口文档进行开发 + Mock平台
- 开发完成后联调和提交测试

Mock 服务器根据接口文档自动生成 Mock 数据，实现了接口文档即API：

![图片](https://mmbiz.qpic.cn/mmbiz/eQPyBffYbueoAtLwpSLvz7O2sEvLD0iaFg8EphmicwFmcSXhLAbzACQB0EqbrEQdmuE3ekY2Dfg2Tye9YxMyiaFgQ/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

开发流程

### 4.3 具体实施

现在已基本完成了，接口方面的实施：

- 接口文档服务器：可实现接口变更实时同步给前端展示；
- Mock接口数据平台：可实现接口变更实时Mock数据给前端使用；
- 接口规范定义：很重要，接口定义的好坏直接影响到前端的工作量和实现逻辑；具体定义规范见下节；



![图片](https://mmbiz.qpic.cn/mmbiz/eQPyBffYbueoAtLwpSLvz7O2sEvLD0iaF43ZaUwxNCZCqaQEZ7ibbldJuAh1q5CibHrF5C79HLZrIMdOqDjKfP2icQ/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

接口文档+Mock平台服务器

## 5. 接口规范V1.0.0

### 5.1 规范原则

- 接口返回数据即显示：前端仅做渲染逻辑处理；
- 渲染逻辑禁止跨多个接口调用；
- 前端关注交互、渲染逻辑，尽量避免业务逻辑处理的出现；
- 请求响应传输数据格式：JSON，JSON数据尽量简单轻量，避免多级JSON的出现；

### 5.2 基本格式

#### 5.2.1 请求基本格式

GET请求、POST请求==必须包含key为body的入参，所有请求数据包装为JSON格式，并存放到入参body中==，示例如下：

**GET请求：**

```
xxx/login?body={"username":"admin","password":"123456","captcha":"scfd","rememberMe":1}
```

**POST请求：**

![图片](https://mmbiz.qpic.cn/mmbiz/eQPyBffYbueoAtLwpSLvz7O2sEvLD0iaFB6lEnny85qFE6gyV7XNMgbiawD2PQMq422MYicMR7Th7gOt5JfNgtCgw/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

#### 5.2.2 响应基本格式

```
{
    code: 200,
    data: {
        message: "success"
    }
}
```

code : 请求处理状态

- 200: 请求处理成功
- 500: 请求处理失败
- 401: 请求未认证，跳转登录页
- 406: 请求未授权，跳转未授权提示页

data.message: 请求处理消息

- code=200 且 data.message="success": 请求处理成功
- code=200 且 data.message!="success": 请求处理成功, 普通消息提示：message内容
- code=500: 请求处理失败，警告消息提示：message内容

### 5.3 响应实体格式

```
{
    code: 200,
    data: {
        message: "success",
        entity: {
            id: 1,
            name: "XXX",
            code: "XXX"
        }
    }
}
```

data.entity: 响应返回的实体数据

### 5.4 响应列表格式

data.list: 响应返回的列表数据

### 5.5 响应分页格式

```
{
    code: 200,
    data: {
        recordCount: 2,
        message: "success",
        totalCount: 2,
        pageNo: 1,
        pageSize: 10,
        list: [
            {
                id: 1,
                name: "XXX",
                code: "H001"
            },
            {
                id: 2,
                name: "XXX",
                code: "H001"
            } ],
        totalPage: 1
    }
}
```



- data.recordCount: 当前页记录数
- data.totalCount: 总记录数
- data.pageNo: 当前页码
- data.pageSize: 每页大小
- data.totalPage: 总页数

### 5.6 特殊内容规范

#### 5.6.1 下拉框、复选框、单选框

由后端接口统一逻辑判定是否选中，通过isSelect标示是否选中，示例如下：

```
{
    code: 200,
    data: {
        message: "success",
        list: [{
            id: 1,
            name: "XXX",
            code: "XXX",
            isSelect: 1
        }, {
            id: 1,
            name: "XXX",
            code: "XXX",
            isSelect: 0
        }]
    }
}
```

禁止下拉框、复选框、单选框判定选中逻辑由前端来处理，统一由后端逻辑判定选中返回给前端展示；

#### 5.6.2 Boolean类型

关于Boolean类型，JSON数据传输中一律使用1/0来标示，1为是/True，0为否/False；

#### 5.6.3 日期类型

关于日期类型，JSON数据传输中一律使用字符串，具体日期格式因业务而定；

## 6. 未来的大前端

目前我们现在用的前后端分离模式属于第一阶段，由于使用到的一些技术jquery等，对于一些页面展示、数据渲染还是比较复杂，不能够很好的达到复用。对于前端还是有很大的工作量。

下一阶段可以在前端工程化方面，对技术框架的选择、前端模块化重用方面，可多做考量。也就是要迎来“==前端为主的 MV* 时代==”。大多数的公司也基本都处于这个分离阶段。

最后阶段就是==Node 带来的全栈时代==，完全有前端来控制页面，URL，Controller，路由等，后端的应用就逐步弱化为真正的数据服务+业务服务，做且仅能做的是提供数据、处理业务逻辑，关注高可用、高并发等。

>  