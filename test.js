'use strict';

var csrgen = require('./src/csr-gen');

console.log('Generating CSR');

csrgen('ElFacturero', {
  destroy: true,
  read: true,
  outputDir: __dirname,
  company: 'Gaston Elhordoy',
  cuit: '20304089343'
}, function(err, a) {
  if (err) {
    return console.log('Something went wrong!');
  }

  console.log('Done generating CSR');
  console.log(a.key);
  console.log(a.csr);
});
