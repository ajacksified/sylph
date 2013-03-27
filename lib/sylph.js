!function(global, module, require){
  'use strict';

  var fs = require('fs'),
      Stream = require('stream'),
      PNGCrush = require('pngcrush'),
      JPEGTran = require('jpegtran'),
      mime = require('mime-magic'),
      imagemagick = require('imagemagick');

  var Sylph = function(options){
    if(!(this instanceof Sylph)) {
      return new Sylph(options);
    }

    options = options || {};

    // Expose these in case you want to use the raw APIs for pngcrush,
    // jpegtran, mime-magic (mmmagic), or imagemagick.
    this.PNGCrush = PNGCrush;
    this.JPEGTran = JPEGTran;
    this.mime = mime;
    this.imagemagick = imagemagick;

    // Similarly, expose these in case you want to override and set up your own
    // stream pipes
    this.pngCrusher = new this.PNGCrush(options.pngCrushInit || [
      '-rem', 'alla',
      '-brute'
    ]);

    this.jpgTranslator = new this.JPEGTran(options.jpgTranInit || [
      '-progressive',
      '-optimize',
      '-perfect'
    ]);

    // Allow overriding the regex for types, or to change the transform
    this.imageTypes = options.imageTypes || [
      { fn: 'smushJPG', regex: /jp(e?)g/ },
      { fn: 'smushPNG', regex: /png/ }
    ];
  };

  Sylph.prototype = {

    // Stream a jpg file stream through jpegtran and output the result as a
    // file buffer.
    smushJPG: function(fileStream, callback){
      var chunks = [];

      fileStream.pipe(this.jpgTranslator)
                .on('data', function(chunk){
                  chunks.push(chunk);
                })
                .on('end', function(){
                  var resultBuffer = Buffer.concat(chunks);
                  return callback(undefined, resultBuffer);
                })
                .on('error', callback);
    },

    // Stream a png file stream through pngcrush and output the result as a
    // file buffer.
    smushPNG: function(fileStream, callback){
      var chunks = [];
      fileStream.pipe(this.pngCrusher)
                .on('data', function(chunk){
                  chunks.push(chunk);
                })
                .on('end', function(){
                  var resultBuffer = Buffer.concat(chunks);
                  return callback(undefined, resultBuffer);
                })
                .on('error', callback);
    },

    // Allow just calling "smush" and not having to do the switching between
    // things yourself. This does require calling detect first, so that it
    // doesn't have to do the file i/o itself.
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

      this.imageTypes.forEach(function(fn){
        if(fn.regex.test(fileType)){
          called = true;
          return sylph[fn.fn](fileStream, callback);
        }
      });

      if(!called){
        return callback('Unsupported file type specified! Passed in: ' + fileType);
      }
    },

    // Super simple wrapper around mmmagic to help out with the above.
    detectType: function(filePath, callback){
      mime(filePath, function(err, type){
        return callback(err, type);
      });
    }
  };

  return module.exports = Sylph;
}(this, module, require);
