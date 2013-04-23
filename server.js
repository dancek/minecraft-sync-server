var formidable = require('formidable'),
    http = require('http'),
    util = require('util'),
    fs = require('fs');

var filename = './world-current.7z';

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

            res.writeHead(200, {'content-type': 'text/plain'});
            res.write('Upload complete.\n')
            res.end();
        });

        form.parse(req);

        return;
    } else if (req.url == '/world') {
        // TODO check exists
        var fileStream = fs.createReadStream(filename);

        res.writeHead(200, {'content-type': 'application/x-7z-compressed'});
        fileStream.pipe(res);
    }
}).listen(process.env.PORT || 8000);
