var sylph = require('../../lib/sylph'),
    sinon = require('sinon'),
    chai = require('chai'),
    expect = require('chai').expect,
    sinonChai = require('sinon-chai'),
    fs = require('fs');

chai.use(sinonChai);
require('sinon-mocha').enhance(sinon);

describe('sylph', function(){
  var testJPEGPath = __dirname + '/../resources/house.jpg',
      testPNGPath = __dirname + '/../resources/wishlists.png',
      testJPEGStream = fs.createReadStream(testJPEGPath),
      testJPEGFile = fs.readFileSync(testJPEGPath),
      testPNGStream = fs.createReadStream(testPNGPath),
      testPNGFile = fs.readFileSync(testPNGPath);

  describe('module loading', function(){
    it('should return a module', function(){
      expect(sylph).not.to.be.undefined;
    });
  });

  describe('image smushing', function(){
    it('should accept an image and properly detect the type', function(done){
      sylph.detect(testJPEGPath, function(err, type){
        expect(type).to.match(/jp(e?)g/);
        done();
      });
    });

    it('should error if no file is specified', function(done){
      sylph.smush(undefined, undefined, function(err, callback){
        expect(err).to.equal("No file specified!");
        done();
      });
    })

    it('should error if no file type is specified', function(done){
      sylph.smush(testJPEGStream, undefined, function(err, callback){
        expect(err).to.equal("No file type specified!");
        done();
      });
    });

    it('should error if invalid file type is specified', function(done){
      sylph.smush(testJPEGStream, "coffee", function(err, callback){
        expect(err).to.equal("Invalid file type specified! Passed in: coffee");
        done();
      });
    });

    it('should error if unsupported file type is specified', function(done){
      sylph.smush(testJPEGStream, "image/tiff", function(err, callback){
        expect(err).to.equal("Unsupported file type specified! Passed in: image/tiff");
        done();
      });
    });

    it('should accept an unoptimized jpeg and return an optimized jpeg', function(done){
      sylph.detect(testJPEGPath, function(err, type){
        sylph.smush(testJPEGStream, type, function(err, result){
          expect(err).to.be.undefined

          var optimizedLength = result.toString().length;
          var oldLength = testJPEGFile.length;

          expect(optimizedLength).to.be.below(oldLength);
          done();
        });
      });
    });

    it('should accept an unoptimized png and return an optimized png', function(done){
      sylph.detect(testPNGPath, function(err, type){
        sylph.smush(testPNGStream, type, function(err, result){
          expect(err).to.be.undefined

          var optimizedLength = result.toString().length;
          var oldLength = testPNGFile.length;

          expect(optimizedLength).to.be.below(oldLength);
          done();
        });
      });
    });
  });
});

