var clipboard = require('copy-paste');
document.getElementById("dropzone").addEventListener("dragover", drag, false);
document.getElementById("dropzone").addEventListener("dragleave", dragleave, false);
document.getElementById("dropzone").addEventListener("drop", drop, false);

function noProp(e) {
  e.stopPropagation();
  e.preventDefault();
}

function drag(e) {
  e.stopPropagation();
  e.preventDefault();
  document.getElementById("dropzone").style.backgroundColor = "#00ff00";
  document.getElementById("dropzone").innerHTML = "<h1>Drop now!</h1>";
}

function dragleave(e) {
  e.stopPropagation();
  e.preventDefault();
  document.getElementById("dropzone").style.backgroundColor = "";
  document.getElementById("dropzone").innerHTML = "<h1>Drop a file inside this window</h1>";
}

function drop(e) {
  e.stopPropagation();
  e.preventDefault();
  document.getElementById("dropzone").style.backgroundColor = "";
  document.getElementById("dropzone").removeEventListener("dragover", drag, false);
  document.getElementById("dropzone").removeEventListener("dragleave", dragleave, false);
  document.getElementById("dropzone").removeEventListener("drop", drop, false);
  document.getElementById("dropzone").addEventListener("dragover", noProp, false);
  document.getElementById("dropzone").addEventListener("dragleave", noProp, false);
  document.getElementById("dropzone").addEventListener("drop", noProp, false);
  var f = e.dataTransfer.files[0];
  // files is a FileList of File objects. List some properties.
  var output = [];
  output.push('<li><strong>', f.name, '</strong> - ', ((f.size / 1024) / 1024), ' megabytes, last modified: ',
    f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
    '<ul>Download from <a id="sharelink" href="' + ipaddr[0] + '">' + ipaddr[0] + '</a></ul></li><button onclick="location.reload()" id="refresh">Transfer new file</button>');
  document.getElementById('dropzone').innerHTML = '<ul>' + output.join('') + '</ul>';
  document.getElementById("sharelink").addEventListener("click", share, false);

  function share(e) {
    e.stopPropagation();
    e.preventDefault();
    alert("You can drag this link into a chat window or email in order to send it to another PC. It has also been copied onto your clipboard.");
    clipboard.copy(ipaddr[0]);
  };
  serveFile(f.path);
}

document.getElementById("closebutton").addEventListener("click", closewindow, false);

function closewindow() {
  window.close();
};

var http = require("http");
var fs = require("fs");

function serveFile(filename) {
  var serv;
  serv = http.createServer(function(req, res) {
    var stat = fs.statSync(filename);
    res.writeHeader(200, {
      "Content-Length": stat.size,
      "mime-type": 'application\octet-stream'
    });
    var fileStream = fs.createReadStream(filename);
    fileStream.on('data', function(chunk) {
      if (!res.write(chunk)) {
        fileStream.pause();
      }
    });
    fileStream.on('end', function() {
      res.end();
    });
    res.on("drain", function() {
      fileStream.resume();
    });
  });
  serv.listen(8080);
}

'use strict';

var os = require('os');
var ifaces = os.networkInterfaces();
var ipaddr = [];

Object.keys(ifaces).forEach(function(ifname) {
  var alias = 0;

  ifaces[ifname].forEach(function(iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      return;
    }

    if (alias >= 1) {
      // this single interface has multiple ipv4 addresses
      ipaddr.push( /*ifname': ' +*/ alias, iface.address);
    } else {
      // this interface has only one ipv4 adress
      ipaddr.push( /*ifname': ' +*/ 'http://' + iface.address + ':8080');
    }
  });
});

window.addEventListener('mousewheel', function(e) {
  if (e.ctrlKey) {
    noProp(e);
  }
});