'use strict'
module.exports = function () {
  const path = require('path');
  var webpack = require('webpack');
  var HtmlWebpackPlugin = require('html-webpack-plugin');
  var CompressionWebpackPlugin = require('compression-webpack-plugin');
  var CleanWebpackPlugin = require('clean-webpack-plugin');
  const ExtractTextPlugin = require("extract-text-webpack-plugin");
  var WebpackMd5Hash = require('webpack-md5-hash');
  const theme = {
    "font-family": '"SourceHanSansCN-Normal","Open Sans","Microsoft YaHei","Hiragino Sans GB","Hiragino Sans GB W3","微软雅黑","H' +
        'elvetica Neue",Arial,sans-serif',
  };
  var isDev = process.env.NODE_ENV == 'dev';
  var isTest = process.env.NODE_ENV == 'test';
  var isPro = process.env.NODE_ENV == 'pro' || process.env.NODE_ENV == 'rel';
  var loginUrl = "";
  var releasestage = "";
  switch (process.env.NODE_ENV) {
    case 'test':
      loginUrl = "//localhost:8082/login";
      releasestage ="development";
      break;
    case 'dev':
      loginUrl = "//localhost:3020/login";
      releasestage ="development";
      break;
    case 'rel':
      loginUrl = "//account.rel.gaia/login";
      releasestage ="development";
      break;
    default:
      loginUrl = "//account.gaiasys.cn/login";
      releasestage ="production"
  }
  const plugins = [
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en-ca|zh-cn/),
    new webpack
      .optimize
      .CommonsChunkPlugin({names: ['vendor']}),
    new ExtractTextPlugin(isPro
      ? "css/App.[contenthash:8].css"
      : "css/App.css"),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src/index.html'),
      inject: false,
      filename: isPro
        ? '../app.html'
        : 'index.html',
      minify: {
        removeComments: true,
        collapseWhitespace: true
      }
    })
  ];
  if (isDev || isTest) {
    plugins.push(new webpack.LoaderOptionsPlugin({debug: true}))
    plugins.push(new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('dev')
      },
      loginUrl: JSON.stringify(loginUrl),
      releasestage:JSON.stringify(releasestage)
    }))
  }
  if (isPro) {
    plugins.push(new webpack.optimize.UglifyJsPlugin({
      comments: false,
      beautify: false,
      sourceMap: true,
      compress: {
        warnings: false,
        drop_console: true,
        collapse_vars: true,
        reduce_vars: true
      }
    }))
    plugins.push(new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      },
      loginUrl: JSON.stringify(loginUrl),
      releasestage:JSON.stringify(releasestage)
    }))
    plugins.push(new CompressionWebpackPlugin({asset: '[path].gz[query]', algorithm: 'gzip', test: new RegExp('\\.(js|css)$'), threshold: 10240, minRatio: 0.8}))
    plugins.push(new CleanWebpackPlugin([__dirname + "/build"]))
    plugins.push(new WebpackMd5Hash())
  }
  return {
    devtool: isPro?'source-map':'cheap-module-eval-source-map',
    entry: {
      index: ['react-hot-loader/patch',__dirname + '/src/index.jsx'],
      vendor: [
        
        "babel-polyfill",
        "es6-promise",
        "jsbarcode",
        "rc-queue-anim",
        "rc-tween-one",
        "react",
        "react-dom",
        "react-router-dom",
        "whatwg-fetch",
        "wangeditor"
      ]
    },
    output: {
      path: __dirname + "/build/static/",
      publicPath: isPro ? "/static/" : "/",
      pathinfo: isPro
        ? false
        : true,
      filename: isPro
        ? "js/[name].[chunkhash:8].js"
        : "js/[name].js",
      chunkFilename: isPro
        ? "js/[name].[chunkhash:8].js"
        : "js/[name].js"
    },
    module: {
      rules: [
        {
          exclude: /node_modules/,
          test: /\.(js|jsx)$/,
          use: [
            {
              loader: "babel-loader"
            }
          ]
        }, {
          test: /\.css$/,
          use: [
            {
              loader: "style-loader"
            }, {
              loader: "css-loader",
              options: {
                minimize: isPro
                  ? true
                  : false,
                sourceMap: isPro
                  ? false
                  : true
              }
            }
          ]
        }, {
          test: /\.less$/,
          // include: [path.resolve(__dirname, 'node_modules/antd'),path.resolve(__dirname, 'src')],
          use: ExtractTextPlugin.extract({
            fallback: "style-loader",
            use: [
              {
                loader: "css-loader",
                options: {
                  minimize: isPro
                    ? true
                    : false,
                  modules: false,
                  sourceMap: isPro
                    ? false
                    : true
                }
              }, {
                loader: 'less-loader',
                options: {
                  modules: false,
                  modifyVars: theme,
                  sourceMap: isPro
                    ? false
                    : true
                }
              }
            ]
          })
        }, {
          test: /\.(png|jpg|svg)$/,
          use: ['url-loader?limit=81920&name=[name]-[hash].[ext]&publicPath=../&outputPath=images' +
              '/']
        }, {
          test: /\.(woff|woff2|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
          use: ["file-loader?name=[name]-[hash].[ext]&publicPath=../&outputPath=css/fonts/"]
        }
      ]
    },
    plugins: plugins,
    resolve: {
      alias: {
        'moment$': 'moment/moment',
      },
        extensions: ['.js', '.jsx', '.json', '.coffee']
    },
    devServer: {
      historyApiFallback: true,
      host: '0.0.0.0',
      disableHostCheck: true,
      proxy: {
        '/api/*': {
          target: isDev
            ? 'http://localhost:7300'
            : 'http://provider.gaia.com:8083',
          changeOrigin: true,
          pathRewrite: isDev?{'^/api' : '/mock/59df196aa0028674ecc75f59/api'}:{}
        }
      }
    }
  }
}
