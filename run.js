var request = require('request');
var xml2js = require('xml2js');
var notification = require('./notification');
var download = require('./download');

var imdb = process.env.MN_IMDB;
var feedURL = process.env.MN_FEED_URL;
var updateIntervalMinutes = process.env.MN_REFRESH_INTERVAL || 60;
var destinationEmail = process.env.MN_NOTIFICATION_EMAIL || 'user@mailinator.com';

run();

function run() {
    processFeeds();
    console.log('Processing feeds at ' + updateIntervalMinutes + ' minutes interval');
    var delay = updateIntervalMinutes * 60 * 1000;
    console.log('Interval ms: ' + delay);
    setInterval(processFeeds, delay);
}

function processFeeds() {
    console.log('Processing feeds...');
    request(feedURL, function (error, response, body) {
        if (error) {
            console.log(error);
        } else {
            xmlStringToObject(body, function (result) {
                var content = result.rss.channel[0].item;
                match(content);
            });
        }
    });
}

function xmlStringToObject(body, callback) {
    var header = '<?xml version="1.0" encoding="windows-1251" ?>';
    var xmlString = body.substring(header.length);
    // console.log('Converting xmlString:' + xmlString);
    xml2js.parseString(xmlString, function (error, result) {
        if (!error) {
            callback(result)
        } else {
            console.log('Xml conversion failed: ' + error);
        }
    });
}

function match(content) {
    var matches = [];
    content = curateContent(content);
    getWatchlist(function (result) {
        var watchlist = curateWatchlist(result);

        watchlist.forEach(function (movie) {
            content.forEach(function (item) {
                if (movie.title == item.title) {
                    matches.push(item);
                }
            })
        });

        console.log('Matches: ');
        console.log(matches);
        if (matches.length > 0) {
            notification.sendNotification(matches, destinationEmail);
            download.download(matches, 'download');
        }
    });
}

function getWatchlist(callback) {
    request(imdb, function (error, response, body) {
        xmlStringToObject(body, function (result) {
            callback(result.channel.item);
        });
    });
}

function curateWatchlist(watchlist) {
    watchlist.forEach(function (item) {
        var firstCharIndex = item.title[0].indexOf('(');
        item.title = item.title[0].substring(0, firstCharIndex).trim();
    });
    return watchlist;
}

function curateContent(content) {

    return content.map(function (item) {
        var regex = /([A-Za-z.]*).([0-9]{4})(.*)/;
        var oldTitle = item.title[0];
        var matchResults = oldTitle.match(regex);

        var newItem = {};
        if (matchResults) {
            newItem.title = matchResults[1].replace('.', ' ');
            newItem.year = matchResults[2];
            newItem.fullTitle = oldTitle;
            newItem.link = item.link[0];
        }

        return newItem;
    });
}

//make heroku happy
var http = require('http');
http.createServer(function (request, response) {
    response.end('It works');
}).listen(process.env.PORT);

//prevent heroku from killing the app
setInterval(function () {
    http.get('http://movie-notifier.herokuapp.com/');
}, 5 * 60 * 1000);