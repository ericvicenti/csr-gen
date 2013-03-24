var s = require('child_process').spawn;
var _ = require('underscore');
var fs = require('fs');
var os = require('os');

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

module.exports = function(domain, options, callback){

	callback || (callback = function(){});

	options || (options = {});
	if(!options.outputDir) options.outputDir = os.tmpdir();
	if(!_.endsWith(options.outputDir, '/')) options.outputDir += '/';
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

	var keyPath = options.outputDir+options.keyName;
	var csrPath = options.outputDir+options.csrName;

	var read = options.read;
	var destroy = options.destroy;

	var openssl = s('openssl', [
		'req','-nodes','-newkey','rsa:2048',
		'-keyout', keyPath,
		'-out', csrPath
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
		if(read){
			fs.readFile(keyPath, {encoding: 'utf8'}, function(err, key){
				if(destroy) fs.unlink(keyPath, function(err){
					if(err) return callback(err);
					readCSR();
				});
				else readCSR();
				function readCSR(){
					fs.readFile(csrPath, {encoding: 'utf8'}, function(err, csr){
						if(destroy) fs.unlink(csrPath, function(err){
							if(err) return callback(err);
							return callback(undefined, { key: key, csr: csr });
						});
						else callback(undefined, { key: key, csr: csr });
					});
				}
			});
		} else callback(undefined, {});
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