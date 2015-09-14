'use strict';

var Promise = require('bluebird');
var spawn = require('child_process').spawn;
var _ = require('lodash');
var fs = Promise.promisifyAll(require('fs'));
var os = require('os');
var path = require('path');
var tmp = require('tmp');
var tmpName = Promise.promisify(tmp.tmpName);


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

module.exports = function(domain, options) {
  options = options || {};

  if (!options.cuit) { throw new Error('El CUIT es obligatorio.'); }
  options.outputDir = options.outputDir || os.tmpdir();
  options.company = options.company || domain;
  options.domain = domain;

  var subj = createSubjectString(options);

  var tmpNames = [];
  if (options.keyName) {
    tmpNames.push(path.join(options.outputDir, options.keyName));
  } else {
    tmpNames.push(tmpName());
  }
  if (options.csrName) {
    tmpNames.push(path.join(options.outputDir, options.csrName));
  } else {
    tmpNames.push(tmpName());
  }

  return Promise.all(tmpNames)
  .spread(function (keyPath, csrPath) {

    return new Promise(function (resolve, reject) {
      var opts = [
        'req',
        '-newkey', 'rsa:1024',
        '-keyout', keyPath,
        '-out', csrPath,
        '-subj', subj,
        '-nodes'
      ];
      var openssl = spawn('openssl', opts);

      // openssl.stdout.on('data', function(a) {
      //   log('stdout:' + a);
      // });
      // openssl.stderr.on('data', function(line) {
      //   line = _.trim(line);
      //   if (line && line !== '.' && line !== '+' && line !== '-----') {
      //     log('openssl: ' + line);
      //   }
      // });

      openssl.on('exit', function() {
        if (!options.read) {
          resolve({
            keyPath: keyPath,
            csrPath: csrPath
          });
          return;
        }

        Promise.all([
          fs.readFileAsync(keyPath, { encoding: 'utf8' }),
          fs.readFileAsync(csrPath, { encoding: 'utf8' })
        ])
        .spread(function (key, csr) {
          if (options.destroy) {
            // should I really care if any of these fails?
            fs.unlinkAsync(keyPath).catch(function () {});
            fs.unlinkAsync(csrPath).catch(function () {});
          }
          resolve({
            key: key,
            csr: csr
          });
        })
        .catch(function (err) {
          reject(err);
        });
      });

    });
  });

};
