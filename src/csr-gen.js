'use strict';

var spawn = require('child_process').spawn;
var _ = require('lodash');
var fs = require('fs');
var os = require('os');
var path = require('path');

function log(a) {
  if (process.env.VERBOSE) {
    console.log('csr-gen: ' + a);
  }
}


var createSubjectString = function(options) {
  var subj =
    '/C=AR' +
    '/O=' + options.company +
    '/CN=' + options.domain +
    '/serialNumber=CUIT ' + options.cuit;

  return subj;
};

module.exports = function(domain, options, callback) {
  callback = callback || function() {};
  options = options || {};

  options.outputDir = options.outputDir || os.tmpdir();
  options.company = options.company || domain;
  if (!options.cuit) { throw new Error('El CUIT es obligatorio.'); }
  options.keyName = options.keyName || domain + '.pem';
  options.csrName = options.csrName || domain + '.csr';
  // Needed to generate subject string
  options.domain = domain;

  var keyPath = path.join(options.outputDir, options.keyName);
  var csrPath = path.join(options.outputDir, options.csrName);

  var read = options.read;
  var destroy = options.destroy;

  var subj = createSubjectString(options);

  log('Subj: ' + subj);

  var opts = [
    'req',
    '-newkey', 'rsa:1024',
    '-keyout', keyPath,
    '-out', csrPath,
    '-subj', subj,
    '-nodes'
  ];

  var openssl = spawn('openssl', opts);


  openssl.stdout.on('data', function(a) {
    log('stdout:' + a);
  });

  openssl.on('exit', function() {
    log('exited');
    if (read) {
      fs.readFile(keyPath, {
        encoding: 'utf8'
      }, function(err, key) {

        function readCSR() {
          fs.readFile(csrPath, {
            encoding: 'utf8'
          }, function(err, csr) {
            if (destroy) {
              fs.unlink(csrPath, function(err) {
                if (err) {
                  return callback(err);
                }
                return callback(undefined, {
                  key: key,
                  csr: csr
                });
              });
            } else {
              callback(undefined, {
                key: key,
                csr: csr
              });
            }
          });
        }

        if (destroy) {
          fs.unlink(keyPath, function(err) {
            if (err) {
              return callback(err);
            }
            readCSR();
          });
        } else {
          readCSR();
        }
      });
    } else {
      callback(undefined, {});
    }
  });

  openssl.stderr.on('data', function(line) {
    line = _.trim(line);
    if (line && line !== '.' && line !== '+' && line !== '-----') {
      log('openssl: ' + line);
    }
  });
};
