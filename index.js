const settings = require('./config.json')
module.exports = app => {
  app.on('pull_request.opened', async context => {
    // app.log(context.payload.pull_request)
    const title = context.payload.pull_request.title
    const code = title.split(':')[0]
    const url = 'https://' + settings.host + '/browse/' + code
    const markdownLink = '[' + code + '](' + url + ')'
    const commitLink = context.payload.pull_request.commits_url
/*
    // app.log(commitLink) // works correctly
    var request = require('request')
    request({
      url: commitLink+'/e1391a78184a1e2efefb5c7b8f83b4c89ea6d362',
      json: true,
      headers: {
        'User-Agent': 'request'
      }
    }, function (error, response, body) {
      app.log(commitLink)
      app.log(response.statusCode)
      if (!error && response.statusCode === 200) {
        app.log(body) // Print the json response
      } else { app.log('bok') }
    })
*/
    var JiraApi = require('jira-client')
    var jira = new JiraApi({
      protocol: 'https',
      host: settings.host,
      username: settings.username,
      password: settings.password,
      apiVersion: '2',
      strictSSL: true
    })

    jira.findIssue(code)
      .then(function (issue) {
        // console.log('Description: ' + issue.fields.description)
        if (title.split(':').length != 2 || title.split(':')[1][0] != ' ') {
          return context.github.issues.createComment({ ...context.issue(), body: '![](https://media.giphy.com/media/vX9WcCiWwUF7G/giphy.gif)' })
        } else if (issue == null || issue.key == null || issue.key != code) {
          return context.github.issues.createComment({ ...context.issue(), body: 'Issue not found.' })
        }
        return context.github.issues.createComment({ ...context.issue(), body: markdownLink + ':\n' + issue.fields.description })
      })
      .catch(function (err) {
        return context.github.issues.createComment({ ...context.issue(), body: 'Issue not found.' })
      })
  })
}
