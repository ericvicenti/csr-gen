csr-gen
=======

Generates an OpenSSL key and CSR

### Install

```
npm install csr-gen
```
OR download from github and place in ./node_modules

### Usage



```
var csrgen = require('csr-gen');
var fs = require('fs');

var exportLocation = __dirname;
var domain = 'exampledomain.com';

csrgen(domain, exportLocation, {
	company: 'Example, Inc.',
	email: 'joe@foobar.com'
}, function(err){
	console.log('CSR created!')
	var csr = fs.readFileSync(__dirname + '/' + domain + '.csr');
	console.log('csr: '+csr);
});

```

CSR will perform the following shell command:

```
$ openssl req -nodes -newkey rsa:2048 -keyout ./exampledomain.com.key -out ./exampledomain.com.csr
Generating a 2048 bit RSA private key
...................................................................+++
................................................................................................................................+++
writing new private key to './exampledomain.com.key'
-----
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

* company, defaults to the domain
* country, 2 letter country code, defaults to 'US'
* state, default: "California"
* city, default: "San Francisco"
* division, default: "Operations"
* email, typically required, empty by default
* password, default empty
* optionalCompany, second company name, defaults empty
* keyName, the filename of the private key to export. Defaults to `domain+'.key'`
* csrName, the filename of the csr to export. Defaults to `domain+'.csr'`


### Note

It is advisable to generate your keys on a machine with a significant random source like one with a mouse/trackpad.

### Todo

* Real tests

Contributors welcome!