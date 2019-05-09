const settings = require('./config.json')
const getConfig = require('probot-config')
module.exports = app => {
  app.on('pull_request.opened', async context => {
    const title = context.payload.pull_request.title
    const code = title.split(':')[0]

    const config = await getConfig(context, 'jira-linker.yml')
    let JiraApi = require('jira-client')
    let jira = new JiraApi({
      protocol: 'https',
      host: config.host,
      username: config.username,
      password: config.password,
      apiVersion: '2',
      strictSSL: true
    })

    const url = 'https://' + config.host + '/browse/' + code
    const markdownLink = '[' + code + '](' + url + ')'
    jira.findIssue(code)
      .then(function (issue) {
        if (title.split(':').length != 2 || title.split(':')[1][0] != ' ') {
          return context.github.issues.createComment({ ...context.issue(), body: '![](https://media.giphy.com/media/vX9WcCiWwUF7G/giphy.gif)' })
        } else if (issue == null || issue.key == null || issue.key != code) {
          return context.github.issues.createComment({ ...context.issue(), body: 'Issue not found.' })
        }
        return context.github.issues.createComment({ ...context.issue(), body: '### ' + markdownLink + ': ' + issue.fields.summary + '\n\n ```\n' + issue.fields.description + '\n```' })
      })
      .catch(function (err) {
        app.log(err)
        return context.github.issues.createComment({ ...context.issue(), body: 'Issue not found.' })
      })
  })
}
