const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
const Promise = require('bluebird');

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId((err, id) =>{
    if (err) {
      id = 0;
    }
    //console.log(exports.dataDir);
    fs.writeFile(exports.dataDir + '/' + id + '.txt', text, (err) => {
      if (err) {
        throw ('error writing todo');
      } else {
        callback(null, {id, text});
      }
    });
  });
};

exports.readAll = (callback) => {
  var data = [];
  fs.readdir(exports.dataDir, (err, files)=>{
    if (err) {
      callback(null, data);
    } else {
      files.forEach((file) => {
        var filePrefix = file.substring(0, 5);
        var readFile = new Promise((resolve, reject) => {
          fs.readFile(exports.dataDir + '/' + file, 'utf-8', (err, text) => {
            if (err) {
              reject(err);
            }
            resolve({id: filePrefix, text: text});
          });
        });
        data.push(readFile);
      });
      Promise.all(data).then((values)=> {
        callback(null, values);
      });
    }
  });
};

exports.readOne = (id, callback) => {
  fs.readFile(exports.dataDir + '/' + id + '.txt', (err, fileData) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      callback(null, {id: id, text: fileData.toString()});
    }
  });
};

exports.update = (id, text, callback) => {
  // var item = items[id];
  // if (!item) {
  //   callback(new Error(`No item with id: ${id}`));
  // } else {
  //   items[id] = text;
  //   callback(null, { id, text });
  // }
  var filePath = exports.dataDir + '/' + id + '.txt';
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      callback(err, {id, text});
    } else {
      fs.writeFile(filePath, text, (err) => {
        if (err) {
          throw ('error updating todo');
        } else {
          callback(null, {id, text});
        }
      });
    }
  });
};

exports.delete = (id, callback) => {
  // var item = items[id];
  // delete items[id];
  // if (!item) {
  //   // report an error if item not found
  //   callback(new Error(`No item with id: ${id}`));
  // } else {
  //   callback();
  // }
  var filePath = exports.dataDir + '/' + id + '.txt';
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      callback(err);
    } else {
      fs.unlink(filePath, (err) => {
        if (err) {
          throw ('error deleting todo');
        } else {
          callback(null);
        }
      });
    }
  });
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
