require('../../../');
var assert = require('assert');

var SomeClass = require('../src/Class').Something;

describe('fix typescript-require import bug', function() {
  var sut;

  beforeEach(function() {
    sut = new SomeClass();
  });

  afterEach(function() {
    sut = null;
  });

  it('reference paths work with files in another directory', function() {
      assert.notStrictEqual(sut); // check if class exists
  })

  it('imports work with files from another directory', function() {
    assert.strictEqual(sut.getImport(), 'tomatoes are fruit');
  });
})
