var http = require('http');
var fs = require('fs');

function download(content, destinationFolder) {
    createFolderIfNotExists(destinationFolder);

    content.forEach(function (item) {
        var fileName = destinationFolder + '/' + item.fullTitle + '.torrent';
        var file = fs.createWriteStream(fileName);

        http.get(item.link, function (response) {
            response.pipe(file);
        });
    });
}

function createFolderIfNotExists(folder) {
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
    }
}

module.exports.download = download;