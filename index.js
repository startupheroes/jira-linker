module.exports = app => {
  app.on('pull_request.opened', async context => {
    const title = context.payload.pull_request.title
    const code = title.split(':')[0]
    const url = 'https://e-migros.atlassian.net/browse/' + code
    const markdownLink = '[' + code + '](' + url + ')'
    return context.github.issues.createComment({ ...context.issue(), body: markdownLink })
  })
}
