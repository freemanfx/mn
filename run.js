var request = require('request');
var xml2js = require('xml2js');

var config = require('./config');
var imdb = 'http://rss.imdb.com/user/ur12807014/watchlist';

request(config.feedURL, function (error, response, body) {
    xmlStringToObject(body, function (result) {
        var content = result.rss.channel[0].item;
        match(content);
    });
});

function xmlStringToObject(body, callback) {
    var header = '<?xml version="1.0" encoding="windows-1251" ?>';
    var xmlString = body.substring(header.length);
    xml2js.parseString(xmlString, function (error, result) {
        callback(result)
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