const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')
const webpack = require('webpack')
const package = require('./package.json')
const genBanner = require('greasetools').genBanner

/**
 * Values to add to the banner.
 * More info in template README.md
 */
const banner = genBanner({
  name: package.name,
  descripton: package.description,
  version: package.version,
  author: package.author,
  license: package.license,
  homepageURL: package.homepage,
})

/**
 * The name that will be used to import your library in vanilla JS.
 *
 * @example
 *
 * // Using a value of 'LibraryName'
 * const { hello } = LibraryName
 * hello()
 */
const vanillaLibraryName = 'LibraryName'

/** The name of the generated Userscript file */
const outFile = `${package.name}.user.js`

module.exports = {
  entry: path.resolve(__dirname, 'lib/index.js'),
  output: {
    filename: outFile,
    path: __dirname,
    library: vanillaLibraryName,
    libraryTarget: 'window',
  },
  plugins: [
    new webpack.BannerPlugin({
      banner,
      raw: true,
      entryOnly: true,
    }),
  ],
  optimization: {
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          format: {
            comments(_, comment) {
              const userScriptComment = /==\/?UserScript==|@/g
              return (
                comment.type === 'comment1' &&
                userScriptComment.exec(comment.value)
              )
            },
          },
        },
      }),
    ],
  },
  mode: 'development',
  devtool: false,
}
