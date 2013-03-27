Sylph
=====

Image optimization, processing, and spriting library.

Example
-------

```javascript

var fs = require('fs'),
    Sylph = require('sylph');

var sylph = new Sylph();

var imagePath = './resources/image.jpg',
    imageStream = fs.createReadStream(imagePath);

sylph.detectType(imagePath, function(err, type){
  sylph.smush(imageStream, type, function(err, image){
    fs.writeFile(imagePath.replace(/jpg/, 'min.jpg'), image);
  });
});

```

Features
--------

* Optimize images
* Build requested image sizes [planned]
* Build sprite sheet (image1&image2) [planned]

Dependencies
------------

* Imagemagick
* jpegtran (can be installed through npm)
* libmagic

OSX: `brew install imagemagick libmagic pngcrush`

Debians: `sudo apt-get install imagemagick pngcrush`

