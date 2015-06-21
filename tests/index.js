var chai = require('chai')
  , sinon = require('sinon')
  , redis = require('redis').createClient()
  , promised = require('chai-as-promised')
  , subject = require('../')
  , expect = chai.expect

chai.use(promised)
chai.use(require('sinon-chai'))

describe('rollout', function () {

  it('should work', function () {
    return expect(true).to.be.true
  })

})
