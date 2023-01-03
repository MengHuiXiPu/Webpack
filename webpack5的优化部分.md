# webpack5的优化部分

> webpack 5是2020年发布的，webpack 4是2018年发布的，在webpack 4之上也做出了挺多的改变，比如，添加了cache的支持，模块联邦新玩意......

# 持久性缓存来提高构建性能

在webpack 5之前，webpack是没有提供持久化缓存，我们开发的时候需要使用类似 **cache-loader** 来做缓存方面的处理。

在webpack 4中：

```
module.exports = {
  module: {
    rules: [
      {
        test: /.ext$/,
        use: ['cache-loader', ...loaders],
        include: path.resolve('src'),
      },
    ],
  },
};
```

在webpack 5中

在webpack 5中自身也加入了持久化缓存，缓存生成的 webpack 模块和 chunk，来改善构建速度。cache 会在开发 模式被设置成 type: 'memory' 而且在 生产 模式 中被禁用。

```
module.exports = {
  cache: {
    type: 'filesystem',
  },
};
```

> **cache.type** 有两个值 **memory ｜ filesystem**memory表示会将打包生成的资源存放于内存中。filesystem表示开启了文件系统缓存。

# 更好的hash算法

这里指的就是访问web页面时的浏览器缓存，我们也知道，之前有 **hash** **chunckhash** **contenthash** 在 webpack 5中，把**hash**改成了**fullhash**。

首先，我们介绍一下这几个hash值有什么不一样。

## hash/fullhash

hash/fullhash 是根据打包中的所有文件计算出来的 hash 值，在一次打包中，所有的资源出口文件的filename获得的[hash]都是一样的。

## chunckhash

chunckhash顾名思义是根据打包过程中当前 chunck 计算出来的 hash 值。

## contenthash

contenthash顾名思义是根据打包时的内容计算出的 hash 值。

> 当然，这么看好像，看不出啥问题，不就是把一个 hash 改成 fullhash 而已嘛？dang dang dang 然不是，我们就来扒扒看，直接上实战，喵喵有啥不一样。

## 我们先设定webpack的设置如下

```
const path = require('path');
module.exports = {
  mode: 'production',
  entry: {
    index: './index.js'
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[contenthash].js',
  },
}
```

## 这里是要打包的 index.js 的内容

```
const num = 1;
console.log('这里是输出', num);
```

## 这是添加注释和修改变量后的 index.js 的内容

```
const str = 1;
//这里是输出
console.log('这里是输出', str);
```

## webpack 4打包

![图片](https://mmbiz.qpic.cn/mmbiz/pqcWLvSo2kgtQtm6aSGmmPjWbv5E98jKBFFWygHF955A6sFqvql4XOOHksMbZvnEc2IS5MqIq7vsOUibECsGIVA/640?wx_fmt=other&wxfrom=5&wx_lazy=1&wx_co=1)

我们可以看到这里的 hash 值为 *e8510378c5f44d16af40* 。

**这里是添加注释和修改变量后打包后的结果**

![图片](https://mmbiz.qpic.cn/mmbiz/pqcWLvSo2kgtQtm6aSGmmPjWbv5E98jKJaQNnNyD2HmSCGv3yDzib2F4Qh7ia0CuMKCAzelnicFuxUxgRiaWNQhWSg/640?wx_fmt=other&wxfrom=5&wx_lazy=1&wx_co=1)

我们可以看到这里的 hash 值为 *2c719bba27df586bf8f2* 。

## webpack 5打包

![图片](https://mmbiz.qpic.cn/mmbiz/pqcWLvSo2kgtQtm6aSGmmPjWbv5E98jK8VVrPXm4DHpQF5vFBGFBoXejk2avvco9WWGtpKNEu4IsMpxwibENKeg/640?wx_fmt=other&wxfrom=5&wx_lazy=1&wx_co=1)

我们可以看到这里的 hash 值为 *d1bc13ae7e7dc828a64f* 。

**这里是添加注释和修改变量后打包后的结果**

![图片](https://mmbiz.qpic.cn/mmbiz/pqcWLvSo2kgtQtm6aSGmmPjWbv5E98jKzYdaRv26ezQP1EW8ibic1Mt1QWoA4FLBSA0hYLoojwTibTM09zI1gAJcg/640?wx_fmt=other&wxfrom=5&wx_lazy=1&wx_co=1)

我们可以看到这里的 hash 值为 *d1bc13ae7e7dc828a64f* 。

## 总结

> 我们可以明显看出，webpack 4对于添加注释和修改变量其实，是会影响它的一个**contenthash**值的计算，如果是webpack 5的话，就不会影响。

# Tree Shaking 的改进

> tree shaking是一个术语，通常用于描述移除 JavaScript 上下文中的未引用代码(dead-code)。它依赖于 ES2015 模块语法的 静态结构 特性，例如 import 和 export。

既然webpack 4都有这个功能，那么随着webpack 5的升级，又有什么不一样的地方呢？

我们来建立一个三个文件，**index.js、a.js、b.js**

```
// a.js
const name = 'zhangSan';
const age = 18;

export { name, age };
// b.js
import * as data from'./a';
export { data };
// index.js
import * as common from'./b';
// 我们可以看到只是使用了 age，而没有使用 name
console.log(common.data.age);
```

## webpack 4打包结果

![图片](https://mmbiz.qpic.cn/mmbiz/pqcWLvSo2kgtQtm6aSGmmPjWbv5E98jKJM9ufwRwXGQgmc4RsnBrVjaqhxpX1s3e57gGtzr6zJsQeSKriaFDTHQ/640?wx_fmt=other&wxfrom=5&wx_lazy=1&wx_co=1)

但是我们打包出来的结果，却是连 name 也打包进去。

## webpack 5打包结果

![图片](https://mmbiz.qpic.cn/mmbiz/pqcWLvSo2kgtQtm6aSGmmPjWbv5E98jKFiaxMCBEPWenDqGY7l6sXPDH8AWicOuF2mvmlD9U4xOyUicMCXMxoBg9A/640?wx_fmt=other&wxfrom=5&wx_lazy=1&wx_co=1)

简直完美秒杀。

## 总结

> 当然，在webpack 4中，Tree Shaking 对嵌套的导出模块未使用代码无法很好进行 Tree Shaking，当然我们也可以借助一些plugin来实现，但是到了webpack 5得到了很大的改进。

# 模块联邦（Module Federation）

> Webpack5 模块联邦让 Webpack 达到了线上 Runtime 的效果，让代码直接在项目间利用 CDN 直接共享，不再需要本地安装 Npm 包、构建再发布了！

## 容器项目

```
//这里是容器的webpack模块联邦设置【也就是在该组件使用】
newModuleFederationPlugin({
  name: 'react1',
  library: { type: 'var', name: 'react1' },
  remotes: {
    RemoteComponent: 'RemoteComponent'
  },
}),
// 在html引入
<script src="http://localhost:3001/remoteEntry.js"></script>
// 这里是它的代码
importReact, { Fragment } from'react';
importReactDOMfrom'react-dom';

constButton = React.lazy(() =>import('RemoteComponent/Button'));

functionApp() {
  functiononClick() {
    console.log('这里是远程组件触发的');
  }
  return (
    <div>
      <h1>这里是测试模块联邦的项目</h1>
      <React.Suspense fallback='努力加载中💪...'>
        <Button onClick={onClick} content='content'></Button>
      </React.Suspense>
    </div>
  );
}
```

## 远程组件项目

```
// 提供远程组件的项目webpack模块联邦设置
newModuleFederationPlugin({
  name: 'RemoteComponent',
  library: { type: 'var', name: 'RemoteComponent' },
  // 使用此远程组件加载的文件名称
  filename: 'remoteEntry.js',
  exposes: {
  //此处提供了一个Button组件
    './Button': './src/components/Button',
  },
}),
// 这是远程button组件
importReactfrom'react';

exportdefaultfunctionButton({ content, onClick = () => {} }) {
  return (
    <button onClick={onClick}>{ content }</button>
  )
}
```

## 实际效果

![图片](https://mmbiz.qpic.cn/mmbiz/pqcWLvSo2kgtQtm6aSGmmPjWbv5E98jKiaPuXC0uVZM5hDHldquXYWKBuyEnMJSWCscFYQ1XicdHPOybTg85XorQ/640?wx_fmt=other&wxfrom=5&wx_lazy=1&wx_co=1)

我们可以看到，点击按钮，成功触发onClick事件。

# Asset Modules

> Asset Modules 通常被翻译为资源模块，它指的是图片和字体等这一类型文件模块，它们无须使用额外的预处理器，webpack 通过一些配置就可以完成对它们的解析。

在 webpack 5 之前，没有内置资源模块，所以，我们通常使用，**file-loader** **url-loader** **raw-loader**之类的loader去处理。

```
// 在webpack5中，可以直接使用内置的资源模块就行了
module.exports = {
// ...
  module: {
    rules: [{
      test: /\.jpg$/,
      type: 'asset/resource'
    }]
  }
}
// 在webpack 4就需要使用 file-loader 之类的loader
module.exports = {
  module: {
    rules: [
      {
        test: /.(png|jpg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {}
          }
        ]
      }
    ]
  }
}
```

> Asset Modules 它的值有四种，asset/resource（对应file-loader）、asset/inline（对应url-loader）、asset/source（对应raw-loader）、asset。

# 结束

当然，webpack 5的改变不止这些，比如，还有 不再为 Node.js 模块自动引用 polyfill、也内置了terser进行代码压缩......