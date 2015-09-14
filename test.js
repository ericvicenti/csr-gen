'use strict';

var csrgen = require('./src/csr-gen');

console.log('Generating CSR');

csrgen('ElFacturero.com.ar', {
  destroy: true,
  read: true,
  // outputDir: __dirname,
  // keyName: 'elfacturero.pem',
  // csrName: 'elfacturero.csr',
  company: 'Empresa Ficticia SA',
  cuit: '30444444440'
})
.then(function (data) {
  console.log('Done generating CSR');
  console.log(data.key || data.keyPath);
  console.log(data.csr || data.csrPath);
})
.catch(function (err) {
  console.error('Something went wrong!');
});
