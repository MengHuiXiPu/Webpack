webpack优化

1, 速度分析
speed - measure - webpack - plugin
使用， 用实例化对象包裹webpack配置对象
const smp = new SpeedMeasurePlugin()
const webpackConfig = smp.wrap({
  plugins: []
})
运行打包结果： 1， 计算整个打包总耗时， 2. 分析插件和loader的后市情况， 对症下药即可

2 体积分析
webpack - bundle - analyzer
可交互式缩放属性图显示， webpac输出文件的大小。
plugins: [
    new BundleAnalyzerPlugin({
      analzerMode: 'server',
      analyzerHost: '127.0.0.1',
      analyzerProt: 8866,
      reprotFilename: 'report,html;,
      defaultSizes: 'parsed',
      openAnalyzer: true,
      generateStatsFile: false,
      statsFilename: 'stats,json',
      statsOptions: null,
      logLevel: 'info'
    })
    运行后在本地开启一个端口为8888的本地服务器： 展示图可以清晰的展示组件， 第三方库的代码体积。
    3 多进程 / 多实例构建
    原理： we 'b'
    pack运行在node中单线程， webpack的打包过程是io密集型和计算密集型操作， 如果能同时用多个进程并行处理各个人物， 将会有效的缩短构建时间。
    thread - loader, (webpack4 .0 推荐)
    thread - loader会将loader放置在一个worker池里面运行， 已达到多线程构建。
    module： {
      rules: [{
        test: '/\.js$',
        include: path.resoleve('src')
        use;
        [
          'thred-loader
        ]
      }]
    }
    4 多进程并行压缩代码
    parallel - uglify - plugin(不再维护)
    uglifyjs - webpack - plugin
    terser - webpack - plugin

    plugins: [
      new UglifyOptions: {
        warnings: false,
        parase: {},
        compress: {},
        ie8: false
      },
      parallel: true
    ]

    terser - webpack - plugin
    module.exports = {
      optimization: {
        minimize: true,
        minimizer: [
          new TerserPlugin({
            parallel: 4
          })
        ]
      }
    }

    5 预编辑资源模块
    使用webpack进行打包时， 对于依赖的第三方库， 比如vue， vuex, redux等， 等不会修改的东西， 我们打包的时候就不需要打包， 如此第一次打包正常打包， 从第二次开始只会打包其余部分， 所以可以提高速度
    Dllplugin 和 DllReferencePlugin

    Dllplugin能把第三方库代码分离， 并且每次文件更改的时候， 他指挥打包自身代码，
    Dllplugin是一个额外的独立webpack配置中创建一个dll的bundle, 也就是说我们的项目更目录下除了webpack.config.js外还有一个webpack.dll.js文件。
    此dll.js的作用是将第三方依赖库打包到bundle的dll文件中， 还会生成一个mainfest.json文件， 该mainfest.json的作用是让DllReferencePlugin映射到相关的依赖上。

    DllReferencePlugin
    该创建在webpack.config.js中使用， 该插件的作用是把上面在webpack.dll.js中打包生成的dll文件引用到需要的预编译的依赖上，

    6 利用缓存提升二次构建速度
    一般而言 对于静态资源， 我们都希望浏览器能够进行缓存， 那么以后进入页面就可以直接使用缓存资源， 页面打开速度会显著加快， 既提高了用户体验也节省了带宽资源。

    bable - loader开启缓存
    cache - loader
    hard - source - webpack - plugin
    1. bable - loader在执行的时候， 可能会产生一些运行期间重复的公共文件， 造成代码冗余， 同时会减缓编译效率。 可以加上cacheDirectory开启缓存 {
      test: /\.js$/,
      exclude: /node_modules/,
      use: [{
        loader: 'bable-loader',
        options: {
          cacheDirectory: true
        }
      }]
    }
    2. cache - loader在一些性能开销较大的loader之前使用将有结果缓存到磁盘里

    {
      rules：[{
        test: /\.ext$/,
        use: [
          'cache-loader'
          ...loders
        ],
        include: path.resolve('src')
      }]
    }
    3. hard - source - webpack - plugin
    HardSourceWebpackPlugi为模块提供了中间缓存， 缓存默认的存放路径是： node_moudles / .cache / hard - source
    配置该插件后第一次构建时间并不会有太大变化， 但是从第二次开始构建时间可以减少80 % 左右。

    7 缩小构建目标 / 减少文件搜索范围
    有时候我们的项目中用到很多模块， 但是有些模块其实是不需要被解析的。 这时我们就可以通过缩小构建目标或者减少文件搜索范围的方式对构建做适当的优化。
    1， 缩小构建目标 主要是使用exclude与include的使用

    modules：[
      rules;
      [{
        test: /\.js$/,
        exclude: /node_modules/,
        //include：path.resolve('src')
        user['babel-loader']
      }]
    ]
    2. 减少文件的搜索范围
    resolve.modules: 解析模块时应该搜索的目录，
    resolve.mainFields: 当npm 包中导入模块时， 此选项将决定在package.json中使用哪个字段导入模块， 根据webpack配置中指定的target不同， 默认值也会有所不同
    resolve.mainFiles: 解析目录时要使用的文件名， 默认为index
    resolve.extensions: 文件扩展名
    moduel.exports = {
      resolve: {
        alias: {
          react: path.resolve(__dirname, 'node_modules.react/umd/react.production.min.js)}
            modules: [path.resovle(__dirname, 'node_modules'),
              extensions: ['.js'],
              mainFields: ['mains']
            }

          }
          8 动态Polyfill服务
          module.exports = {
            entry: ['@babel/polyfill', './app/js']
          }
          每次打开页面， 浏览器都会向Poly 'fill  Server发送请求，通过识别UserAgent来下发不同的Polyfill做到按需加载Polyfill的效果。

          使用： 使用官方提供的地址即可： https: //polyfill.is.v3/polufill.main.js

            9 Scope Hoisting
          直译： 作用域提升， Scope Hoisting可以让webpack打包出来的 文件跟小运行更快，
          webpack已经内置了该功能， 所以只需要实例化这个插件即可。
          plugins: [new webpack.optmize.ModuleConcatenationPlugin()]
          Scope Hoisting的实现原理： 分析出模块之间的依赖关系， 尽可能把打散的模块合并到一个函数中， 但前提是不能造成代码冗余， 因此只有那些被引用一次的模块才能被合并。