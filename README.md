# Bookshare Web Reader (fka Readium)

_an open source library for handling EPUB documents_

This project is a fork of the the [Readium Project](http://readium.org/), modified to be used with [Bookshare](https://www.bookshare.org).


##  Testing

We are using [Jasmine](https://github.com/pivotal/jasmine/wiki) to perform javascript unit tests. The best way to get these running is to install the [Jasmine rubygem](http://rubygems.org/gems/jasmine).

    $ gem install jasmine

Then the specs can be run via the command:

    $ rake jasmine

This will start a webserver running on `port 8888`. To run the spect navigate to (or refresh) `localhost:8888`.


## License
[BSD](https://github.com/readium/readium/blob/master/LICENSE)


## Contributors

* [IDPF](http://idpf.org/)
* [Evident Point Software Corp.](http://www.evidentpoint.com/)
* [Bluefire Productions](http://www.bluefirereader.com/)


## Attribution

Bookshare Web Reader is a fork of Readium.  Readium is an open source project, built on top of other open source projects. In addition to Chrome and WebKit, development of Readium would not have been possible without the following projects:

* [jQuery](http://jquery.com/)
* [Backbonejs](http://documentcloud.github.com/backbone/)
* [Twitter Bootstrap](http://twitter.github.com/bootstrap/)
* [Underscorejs](http://documentcloud.github.com/underscore/)
* [Lawnchair](http://westcoastlogic.com/lawnchair/)
* [ZipFile.js](http://cheeso.members.winisp.net/srcview.aspx?dir=js-unzip&file=js-zip.zip)
* [jsUri](http://code.google.com/p/jsuri/)



_See also [Readium Homepage in Github Pages](http://github.readium.org/) and [Benetech Homepage](http://www.benetech.org/)_
