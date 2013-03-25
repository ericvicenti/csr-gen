var csrgen = require('./src/csr-gen');

console.log('Generating CSR');

csrgen('foobar.com', {
  destroy: true,
  read: true,
  outputDir: __dirname,
  company: 'FooBar',
  email: 'info@foobar.biz',
  password: 'asdf'
}, function(err, a){

  if(err) return console.log('Something went wrong!');

  console.log('Done generating CSR');
  console.log(a.key);
  console.log(a.csr);

});
