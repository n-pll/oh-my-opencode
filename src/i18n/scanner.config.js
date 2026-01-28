module.exports = {
  input: ['src/**/*.{ts,tsx,js,jsx}'],
  output: 'src/i18n/locales/{{lng}}/{{ns}}.json',
  options: {
    debug: false,
    sort: true,
    func: {
      list: ['t'],
      extensions: ['.ts', '.tsx']
    }
  },
  lngs: ['en', 'zh-CN'],
  defaultNs: 'common',
  resource: {
    loadPath: 'src/i18n/locales/{{lng}}/{{ns}}.json',
    savePath: 'src/i18n/locales/{{lng}}/{{ns}}.json',
    jsonIndent: 2,
    lineEnding: '\n'
  }
}
