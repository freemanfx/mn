var request = require('request');
var xml2js = require('xml2js');
var notification = require('./notification');
var download = require('./download');

var imdb = process.argv[2];
var feedURL = process.argv[3];
var updateIntervalMinutes = process.argv[4] || 10;
var destinationEmail = process.argv[5] || 'user@mailinator.com';

run();

function run() {
    processFeeds();
    setInterval(processFeeds, updateIntervalMinutes * 60 * 1000);
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
    console.log('Converting xmlString:' + xmlString)
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
        notification.sendNotification(matches, destinationEmail);
        download.download(matches, 'download');
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
        newItem.title = matchResults[1].replace('.', ' ');
        newItem.year = matchResults[2];
        newItem.fullTitle = oldTitle;
        newItem.link = item.link[0];

        return newItem;
    });
}