var s = require('child_process').spawn;
var _ = require('underscore');
var fs = require('fs');
var os = require('os');
_.str = require('underscore.string');
_.mixin(_.str.exports());

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

var createSubjectString = function(options) {

	var subj =
		'/C='+options.country+
		'/ST='+options.state+
		'/L='+options.city+
		'/O='+options.company+
		'/OU='+options.division+
		'/CN='+options.domain+
		'/emailAddress='+options.email;
	
	return subj;
};

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
	if(!options.keyName) options.keyName = domain+'.key';
	if(!options.csrName) options.csrName = domain+'.csr';

	// Needed to generate subject string
	options.domain = domain;

	var keyPath = options.outputDir+options.keyName;
	var csrPath = options.outputDir+options.csrName;

	var read = options.read;
	var destroy = options.destroy;

	var subj = createSubjectString(options);

	_.log("Subj: " + subj);

	var opts = [
		'req',
		'-newkey','rsa:2048',
		'-keyout', keyPath,
		'-out', csrPath,
		'-subj', subj
	];

	var passFile = options.password != '' ? "pass.txt" : false;

	if (passFile) {
		fs.writeFile(passFile, options.password, function(err) {
			if(err) {
				_.log("Error saving password to temp file: " + err);
			}
		});
		opts.push('-passout');
		opts.push('file:'+passFile);
	} else {
		opts.push('-nodes');
	}

	var openssl = s('openssl', opts);

	function inputText(a){
		_.log('writing: '+a)
		openssl.stdin.write(a+'\n');
	}

	openssl.stdout.on('data', function(a){
		_.log('stdout:'+a);
	});

	openssl.on('exit',function(){
		if(passFile) fs.unlink(passFile);
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
		line = _.trim(line);
		if (line && line != '.' && line != '+' && line != '-----')
			_.log('openssl: ' + line);
	});
};
