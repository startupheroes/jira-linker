const settings = require('./config.json')
const getConfig = require('probot-config')
module.exports = app => {
  app.on('pull_request.opened', async context => {
    // app.log(context.payload.pull_request)
    const title = context.payload.pull_request.title
    const code = title.split(':')[0]

    // const commitLink = context.payload.pull_request.commits_url

    // app.log(commitLink) // works correctly
    /*
    var request = require('request')
    request({
      url: commitLink,
      json: true,
      headers: {
        'User-Agent': 'request'
      }
    }, function (error, response, body) {
      app.log(commitLink)
      app.log(response.statusCode)
      if (!error && response.statusCode === 200) {
        app.log(body) // Print the json response
      } else { app.log('bk') }
    })
*/
    const config = await getConfig(context, 'jira-linker.yml')
    //app.log(config)
    let JiraApi = require('jira-client')
    let jira = new JiraApi({
      protocol: 'https',
      host: process.env.HOST || config.host,
      username: process.env.USERNAME || config.username,
      password: process.env.PASSWORD || config.password,
      apiVersion: '2',
      strictSSL: true
    })

    const url = 'https://' + config.host + '/browse/' + code
    const markdownLink = '[' + code + '](' + url + ')'
    jira.findIssue(code)
      .then(function (issue) {
        // console.log('Description: ' + issue.fields.description)
        if (title.split(':').length != 2 || title.split(':')[1][0] != ' ') {
          return context.github.issues.createComment({ ...context.issue(), body: '![](https://media.giphy.com/media/vX9WcCiWwUF7G/giphy.gif)' })
        } else if (issue == null || issue.key == null || issue.key != code) {
          return context.github.issues.createComment({ ...context.issue(), body: 'Issue not found.' })
        }
        //app.log(issue.fields)
        return context.github.issues.createComment({ ...context.issue(), body: '### ' + markdownLink + ': ' + issue.fields.summary + '\n\n ```\n' + issue.fields.description + '\n```' })
      })
      .catch(function (err) {
        return context.github.issues.createComment({ ...context.issue(), body: 'Issue not found.' })
      })
  })
}
