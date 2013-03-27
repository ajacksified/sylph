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
    image = fs.readFileSync(imagePath);

sylph.features(image, function(err, features){
  sylph.smush(image, features.format, function(err, image){
    fs.writeFile(imagePath.replace(/jpg/, 'min.jpg'), image);
  });
});

```

Features
--------

* Optimize images
* Build requested image sizes
* Build sprite sheet (image1&image2) [planned]

Dependencies
------------

* Imagemagick
* jpegtran (can be installed through npm)

OSX: `brew install imagemagick pngcrush`

Debians: `sudo apt-get install imagemagick pngcrush`

