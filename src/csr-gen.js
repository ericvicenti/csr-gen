var s = require('child_process').spawn;
var _ = require('underscore');

_.mixin({
	endsWith: function(a, b){
	    var lastIndex = a.lastIndexOf(b);
	    return (lastIndex != -1) && (lastIndex + b.length == a.length);
	},
	contains: function(s, a){
		s = ''+s;
		return s.lastIndexOf(a) != -1;
	},
	log: function(a){
		if(process.env.VERBOSE) console.log('csr-gen: '+a);
	}
});
_.mixin({
	containsAny: function(s, a){
		var result = false;
		_.each(a, function(a){
			if(_.contains(s, a)) result = true; 
		});
		return result;
	}
});

module.exports = function(domain, outputDir, options, callback){

	if(!_.endsWith(outputDir, '/')) outputDir += '/';

	options || (options = {});
	if(!options.company) options.company = domain;
	if(!options.country) options.country = 'US';
	if(!options.state) options.state = 'California';
	if(!options.city) options.city = 'San Fransisco';
	if(!options.division) options.division = 'Operations';
	if(!options.email) options.email = '';
	if(!options.password) options.password = '';
	if(!options.optionalCompany) options.optionalCompany = '';
	if(!options.keyName) options.keyName = domain+'.key';
	if(!options.csrName) options.csrName = domain+'.csr';

	var openssl = s('openssl', [
		'req','-nodes','-newkey','rsa:2048',
		'-keyout', outputDir+options.keyName,
		'-out', outputDir+options.csrName
	]);

	function inputText(a){
		_.log('writing: '+a)
		openssl.stdin.write(a+'\n');
	}

	openssl.stdout.on('data', function(a){
		_.log('stdout:'+a);
	});

	openssl.on('exit',function(){
		_.log('exited');
		if(_.isFunction(callback)) callback();
	});

	openssl.stderr.on('data',function(line){
		if(_.contains(line,':')){
			if(_.contains(line,'Country Name')){
				_.log("country name");
				inputText(options.country);
			} else if(_.contains(line,'State')){
				_.log("state");
				inputText(options.state);
			} else if(_.contains(line,'city')){
				_.log("city");
				inputText(options.city);
			} else if(_.contains(line,'Organization Name')){
				_.log("org");
				inputText(options.company);
			} else if(_.contains(line,'Organizational Unit')){
				_.log("section");
				inputText(options.division);
			} else if(_.contains(line,'Common Name')){
				_.log("domain");
				inputText(domain);
			} else if(_.contains(line,'Email Address')){
				_.log("email");
				inputText(options.email);
			} else if(_.contains(line,'challenge password')){
				_.log("challenge password");
				inputText(options.password);
			} else if(_.contains(line, 'company name')){
				_.log("optional company");
				inputText(options.optionalCompany);
			} else {
				_.log('unknown prompt::');
				_.log(''+line);
			}
		}
	});

};