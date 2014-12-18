require('..')

var chai = require('chai'),
    expect = chai.expect;

describe('typescript-require', function() {
  it('Should allow requiring a typescript file', function() {
    var ship = require('./assets/ship');
    console.log(ship)
    expect(ship).to.not.be.empty;
  })
})
