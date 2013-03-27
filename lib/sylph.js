!function(global, module, require){
  'use strict';

  var fs = require('fs'),
      mime = require('mime-magic'),
      im = require('imagemagick'),
      Stream = require('stream'),
      PNGCrush = require('pngcrush'),
      JPEGTran = require('jpegtran');

  var pngCrusher = new PNGCrush([
    '-rem', 'alla',
    '-brute'
  ]);

  var jpgTranslator = new JPEGTran([
    '-progressive',
    '-optimize',
    '-perfect'
  ]);

  var imageTypes = [
    { fn: 'smushJPG', regex: /jp(e?)g/ },
    { fn: 'smushPNG', regex: /png/ }
  ];

  var Sylph = function(){
    if(!(this instanceof Sylph)) {
      return new Sylph();
    }
  };

  Sylph.prototype = {
    smushJPG: function(fileStream, callback){
      var chunks = [];

      fileStream.pipe(jpgTranslator)
                .on('data', function(chunk){
                  chunks.push(chunk);
                })
                .on('end', function(){
                  var resultBuffer = Buffer.concat(chunks);
                  return callback(undefined, resultBuffer);
                })
                .on('error', callback);
    },

    smushPNG: function(fileStream, callback){
      var chunks = [];
      fileStream.pipe(pngCrusher)
                .on('data', function(chunk){
                  chunks.push(chunk);
                })
                .on('end', function(){
                  var resultBuffer = Buffer.concat(chunks);
                  return callback(undefined, resultBuffer);
                })
                .on('error', callback);
    },

    smush: function(fileStream, fileType, callback){
      if(!fileStream){
        return callback('No file specified!');
      }else if(!fileType){
        return callback('No file type specified!');
      }else if(fileType.indexOf('/') < 0){
        return callback('Invalid file type specified! Passed in: ' + fileType);
      }

      var sylph = this,
          called = false;

      imageTypes.forEach(function(fn){
        if(fn.regex.test(fileType)){
          called = true;
          return sylph[fn.fn](fileStream, callback);
        }
      });

      if(!called){
        return callback('Unsupported file type specified! Passed in: ' + fileType);
      }
    },

    detect: function(filePath, callback){
      mime(filePath, function(err, type){
        return callback(err, type);
      });
    }
  };

  return module.exports = new Sylph();
}(this, module, require);
