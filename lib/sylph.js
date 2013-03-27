// **sylph** is a javascript library which aims to wrap many common image
// processing functions in simple API calls. It works together with such tools
// as pngcrush and jpegtran to provide image optimization with sane defaults
// and imagemagick for image manipulation (such as scaling and cropping). 
// This library is mostly
// a wrapper to each of these tools, and their lower-level API is exposed, so
// you're not constrained to what sylph provides.
//
// sylph also provides image spriting, which will allow you to build horizontal
// image sprites for use in web applications. In theory, you'll use it together
// with a queuing system, as image processing can be somewhat CPU-time
// intensive.

!function(global, module, require){
  'use strict';

  // sylph requires a few npm packages that themselves are simple wrappers
  // around the installed utilities, such as pngcrush and jpegtran.
  var fs = require('fs'),
      Stream = require('stream'),
      PNGCrush = require('pngcrush'),
      JPEGTran = require('jpegtran'),
      streamBuffers = require('stream-buffers'),
      imagemagick = require('imagemagick');

  // sylph is exposed as a constructor so that you have the opportunity to
  // override the defaults used to generate the PNG and JPEG optimizers.
  var Sylph = function(options){
    if(!(this instanceof Sylph)) {
      return new Sylph(options);
    }

    options = options || {};

    // Expose these publicly in case you want to use the raw APIs for 
    // pngcrush, jpegtran, or imagemagick.
    this.PNGCrush = PNGCrush;
    this.JPEGTran = JPEGTran;
    this.imagemagick = imagemagick;

    // Similarly, expose these in case you want to override and set up your own
    // stream pipes. You can also add your own to the Sylph prototype.
    this.pngCrusher = new this.PNGCrush(options.pngCrushInit || [
      '-rem', 'alla',
      '-fix'
    ]);

    this.jpgTranslator = new this.JPEGTran(options.jpgTranInit || [
      '-progressive',
      '-optimize'
    ]);

    // Allow overriding the regex for types, or to change the transform used
    // for a given type. If you add your own transform, you can add it to
    // the list for your specific instance or pass it in as an option.
    this.imageTypes = options.imageTypes || [
      { fn: 'smushJPG', regex: /jp(e?)g/i },
      { fn: 'smushPNG', regex: /png/i }
    ];
  };

  Sylph.prototype = {

    // Pass in a file buffer, then turn it into a stream and push it through
    // jpegtran. Using buffers instead of streams makes interacting with other
    // things in the sylph API (like `features()`) homogenous. Then return a
    // file buffer.
    smushJPG: function(fileBuffer, callback){
      var chunks = [];

      var fileStream = new streamBuffers.ReadableStreamBuffer();
      fileStream.put(fileBuffer);

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

    // Stream a file buffer through pngcrush, and return a file buffer.
    smushPNG: function(fileBuffer, callback){
      var chunks = [];

      var fileStream = new streamBuffers.ReadableStreamBuffer();
      fileStream.put(fileBuffer);

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

    // Allow just calling "smush" instead of implementing switching between
    // types manually. This won't touch the filesystem, so we can't load mime
    // data from the filesystem; you can call `sylph.features()` first to get
    // the file type. Smush takes a `stream`, not a `buffer`, so keep that in
    // mind (due to the way jpegtran / pngcrush work)
    smush: function(fileStream, fileType, callback){
      if(!fileStream){
        return callback('No file specified!');
      }else if(!fileType){
        return callback('No file type specified!');
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

    // Allow resizing of file types by passing in the loaded file buffer and an
    // options object with optional `height`, `width`, `scale` and `crop`.
    // `crop` and `scale` are false by default. If no height or width is
    // specified, the image will use the original height or width; if `scale`
    // is true, the aspect ratio will be used. Returns a text file buffer.
    scale: function(fileBuffer, options, callback){
      imagemagick.resize({
        srcData: fileBuffer,
        width: options.width || 0,
        height: options.height || 0,
        progressive: false
      }, function(err, stdout, stderr){
        var buffer = new Buffer(stdout, 'binary');
        callback(err || stderr || undefined, buffer);
      });
    },

    // Super simple wrapper around imagemagick to help out with loading file
    // information. Pass in a file buffer, get back all the data.
    features: function(fileData, callback){
      imagemagick.identify({ data: fileData },  function(err, features){
        return callback(err, features);
      });
    }
  };

  return module.exports = Sylph;
}(this, module, require);
