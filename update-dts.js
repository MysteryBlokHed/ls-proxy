const { readFile, appendFile } = require('fs')
const root = require('path').dirname(
  require.main.filename || process.mainModule.filename
)
const vanillaLibraryName = require('./webpack.config').output.library

const exportAsNamespace = `\nexport as namespace ${vanillaLibraryName};\n`

console.log('Project Root:', root)

readFile(`${root}/lib/index.d.ts`, (err, data) => {
  if (err) throw err
  if (!data.includes(exportAsNamespace))
    appendFile(`${root}/lib/index.d.ts`, exportAsNamespace, 'utf-8', err => {
      if (err) throw err
    })
})
