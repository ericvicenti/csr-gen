csr-gen
=======

Generates an OpenSSL key and CSR for AFIP

### Install
1. Make sure you have openSSL (try `$ openssl` if you aren't sure)
2. npm package install

```
npm install csr-gen-afip
```
OR download from github and place in ./node_modules

### Usage

```
var csrgen = require('csr-gen-afip');
var fs = require('fs');

var domain = 'ElFacturero.com.ar';

csrgen(domain, {
	outputDir: __dirname,
	read: true,
  destroy: true,
	company: 'Empresa SA',
	cuit: '30444444440'
}, function(err, keys){
	console.log('CSR creado!')
	console.log('key: ' + keys.private);
	console.log('csr: ' + keys.csr);
});

```

CSR will perform the following shell command:

```
$ openssl req -nodes -newkey rsa:1024 -keyout ./ElFacturero.com.ar.key -out ./ElFacturero.com.ar.csr -subj '/C=AR/O=Empresa SA/CN=ElFacturero.com.ar/serialNumber=CUIT 30444444440'
```

For more information about `openssl req` checkout the [docs](https://www.openssl.org/docs/manmaster/apps/req.html)


### Parameters

* outputDir, directory to create the keys in, defaults to os.tmpdir()
* read, bool, should the files get read for the callback to get the key and CSR
* destroy, bool, should the files be destroyed after they have been read
* company, defaults to the domain
* cuit, CUIT for legal entity 
* keyName, the filename of the private key to export. Defaults to `domain+'.pem'`
* csrName, the filename of the csr to export. Defaults to `domain+'.csr'`


### Note

It is advisable to generate your keys on a machine with a significant random source like one with a mouse/trackpad.

### License

csr-gen is [open source](https://github.com/ericvicenti/csr-gen/blob/master/LICENSE.md) under the MIT license

### Todo

* Real tests

Contributors welcome!
