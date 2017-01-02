var request = require('request');
var xml2js = require('xml2js');

var config = require('./config');

request(config.feedURL, function(error, response, body){
  toDownloadList(body);
});

function toDownloadList(body){
  var header = '<?xml version="1.0" encoding="windows-1251" ?>';
  var xmlString = body.substring(header.length);
  xml2js.parseString(xmlString, function(error, result){
    var content = result.rss.channel[0].item;
    console.log(content);
  });
}
