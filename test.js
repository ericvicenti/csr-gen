var csrgen = require('src/csr-gen');

console.log('Generating csr')
csrgen('foobar.com', __dirname, {
	company: 'FooBar',
	email: 'info@foobar.com'
}, function(){
	console.log('Done generating CSRs in '+__dirname);
});