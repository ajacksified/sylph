Sylph
=====

v0.0.3
Image optimization, processing, and spriting library.

Example
-------

```javascript

var fs = require('fs'),
    Sylph = require('sylph');

var sylph = new Sylph();

var imagePath = './resources/image.jpg',
    image = fs.readFileSync(imagePath);

// let's scale an image to 200x200 and then optimize it

sylph.features(image, function(err, features){
  sylph.scale(image, { height: 200 }, function(err, image) {
    sylph.smush(image, features.format, function(err, image){
      fs.writeFile(imagePath.replace(/jpg/, 'min.jpg'), image);
    });
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

