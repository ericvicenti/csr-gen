csr-gen
=======

Generates an OpenSSL key and CSR

### Install
1. Make sure you have openSSL (try `$ openssl` if you aren't sure)
2. npm package install

```
npm install csr-gen
```
OR download from github and place in ./node_modules

### Usage



```
var csrgen = require('csr-gen');
var fs = require('fs');

var domain = 'exampledomain.com';

csrgen(domain, {
	outputDir: __dirname,
	read: true,
	company: 'Example, Inc.',
	email: 'joe@foobar.com'
}, function(err, keys){
	console.log('CSR created!')
	console.log('key: '+keys.private);
	console.log('csr: '+keys.csr);
});

```

CSR will perform the following shell command:

```
$ openssl req -nodes -newkey rsa:2048 -keyout ./exampledomain.com.key -out ./exampledomain.com.csr -subj '/C=US/ST=California/L=San Fransisco/O=FooBar/OU=Operations/CN=foobar.com/emailAddress=info@foobar.biz'
Generating a 2048 bit RSA private key
...................................................................+++
................................................................................................................................+++
writing new private key to './exampledomain.com.key'
-----
```

__And you're done!__ Adding the -subj (above) switch allows us to skip the following familiar process!

```
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) [AU]:US
State or Province Name (full name) [Some-State]:California
Locality Name (eg, city) []:San Francisco 
Organization Name (eg, company) [Internet Widgits Pty Ltd]:Example, Inc.
Organizational Unit Name (eg, section) []:Operations
Common Name (eg, YOUR name) []:exampledomain.com
Email Address []:joe@foobar.com

Please enter the following 'extra' attributes
to be sent with your certificate request
A challenge password []:
An optional company name []: 
```

### Parameters

* outputDir, directory to create the keys in, defaults to os.tmpdir()
* read, bool, should the files get read for the callback to get the key and CSR
* destroy, bool, should the files be destroyed after they have been read
* company, defaults to the domain
* country, 2 letter country code, defaults to 'US'
* state, default: "California"
* city, default: "San Francisco"
* division, default: "Operations"
* email, typically required, empty by default
* password, default empty
* keyName, the filename of the private key to export. Defaults to `domain+'.key'`
* csrName, the filename of the csr to export. Defaults to `domain+'.csr'`


### Note

It is advisable to generate your keys on a machine with a significant random source like one with a mouse/trackpad.

### License

csr-gen is [open source](https://github.com/ericvicenti/csr-gen/blob/master/LICENSE.md) under the MIT license

### Todo

* Real tests

Contributors welcome!
