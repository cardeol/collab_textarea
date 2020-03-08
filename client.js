var ReconnectingWebSocket = require('reconnecting-websocket');
var rtf = require('rich-text');
var Quill = require('quill');
var sharedb = require('sharedb/lib/client');

sharedb.types.register(rtf.type);

var socket = new ReconnectingWebSocket('ws://' + window.location.host);
var connection = new sharedb.Connection(socket);

window.disconnect = function() {
  connection.close();
};
window.connect = function() {
  var socket = new ReconnectingWebSocket('ws://' + window.location.host);
  connection.bindToSocket(socket);
};

var doc = connection.get('SummaryService', 'richtext');
doc.subscribe(function(err) {
  if (err) throw err;
  var quill = new Quill('#editor', {theme: 'snow'});
  quill.setContents(doc.data);
  quill.on('text-change', function(delta, oldDelta, source) {
    console.log(source,delta);
    if (source !== 'user') return;
    doc.submitOp(delta, {source: quill});
  });
  doc.on('op', function(op, source) {
    if (source === quill) return;
    quill.updateContents(op);
  });
});