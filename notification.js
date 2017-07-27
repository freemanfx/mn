var emailjs = require('emailjs');
var config = require('./config').config;

var server = emailjs.server.connect(config.email);

function sendNotification(matches, destination) {
    server.send({
        text: emailFormat(matches),
        from: "Movie Notification <movie.notification@gmail.com>",
        to: '<' + destination + '>',
        subject: "Movie notification",
        attachment: [
            {data: emailFormat(matches), alternative: true}
        ]
    }, function (err, message) {
        console.log(err || message);
    });
}

function emailFormat(matches) {
    var body = 'Matches: <br/><br />';

    function formatItem(item) {
        var text = '<b>' + item.title + '</b><br/><br/>' +
            '<b>Full title:</b> ' + item.fullTitle + '<br/>' +
            '<a href="' + item.link + '">Download</a>';

        return text;
    }

    matches.forEach(function (item) {
        body += formatItem(item) + '\n';
    });

    return body;
}

module.exports.sendNotification = sendNotification;