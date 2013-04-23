var formidable = require('formidable'),
    http = require('http'),
    util = require('util'),
    fs = require('fs');

var filename = './world-current.7z',
    plaintext = { 'Content-Type': 'text/plain'};

var timestamp = function () {
    return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
}

http.createServer(function (req,res) {
    var logMsg = [
        timestamp(),
        '[INFO]',
        req.connection.remoteAddress,
        req.method,
        req.url
    ].join(' ');
    
    console.log(logMsg);
    
    if (req.url == '/upload' && req.method.toLowerCase() == 'post') {
        var form = new formidable.IncomingForm();

        form.on('fileBegin', function (name, file) {
            file.path = filename;
        });

        form.on('err', function (err) {
            console.warn(timestamp() + ' [ERROR] ' + err);
        });

        form.on('end', function () {
            console.log( timestamp()
                + ' [INFO] finished upload from '
                + req.connection.remoteAddress);

            res.writeHead(200, plaintext);
            res.write('Upload complete.\n')
            res.end();
        });

        form.parse(req);

        return;
    } else if (req.url == '/world') {
        fs.exists(filename, function(exists) {
            if (!exists) {
                res.writeHead(404, plaintext);
                res.end('No world has been uploaded since server restart.');
                return;
            }

            var fileStream = fs.createReadStream(filename);
            res.writeHead(200, {'content-type': 'application/x-7z-compressed'});
            fileStream.pipe(res);
        });
        return;
    } else {
        res.writeHead(404, plaintext);
        res.end("404 Not found");
        
        return;
    }
}).listen(process.env.PORT || 8000);
