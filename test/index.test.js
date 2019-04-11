const nock = require('nock')
const lightning = require('..')
const { Probot } = require('probot')
const payload = require('./fixtures/pull_request.opened.json')
// const prFiles = require('./fixtures/prFiles.json')

nock.disableNetConnect()

describe('LightningMcQueen95', () => {
  let probot

  beforeEach(() => {
    probot = new Probot({})
    // Load our app into probot
    const app = probot.load(lightning)

    // just return a test token
    app.app = () => 'test'
  })

  test('creates a comment when a pull request is opened', async () => {
    // Test that we correctly return a test token
    nock('https://api.github.com')
      .post('/app/installations/811835/access_tokens')
      .reply(200, { token: 'test' })

    // Test that a comment is posted
    nock('https://api.github.com')
      .post('/repos/afgedemenli/denemereposu/issues/58/comments', (body) => {
        // console.log(body.body)
        expect(body).toMatchObject({ body: '[AP-251](https://e-migros.atlassian.net/browse/AP-251)' })
        return true
      })
      .reply(200)

    // Receive a webhook event
    await probot.receive({ name: 'pull_request.opened', payload })
  })
})

// For more information about testing with Jest see:
// https://facebook.github.io/jest/

// For more information about testing with Nock see:
// https://github.com/nock/nock
