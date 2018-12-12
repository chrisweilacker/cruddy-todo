const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
const Promise = require('bluebird');

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId()
    .then((id) =>{
      var todo = {text: text, id: id, createTime: Date()};
      var todoString = JSON.stringify(todo);
      fs.writeFile(exports.dataDir + '/' + id + '.txt', todoString, (err) => {
        if (err) {
          throw ('error writing todo');
        } else {
          callback(null, todo);
        }
      });
    })
    .catch((err)=>{
      id = 0;
      callback(err, null);
    });
};

exports.readAll = (callback) => {
  var data = [];
  fs.readdir(exports.dataDir, (err, files)=>{
    if (err) {
      callback(null, data);
    } else {
      files.forEach((file) => {
        if (file[0] !== '.') {
          var filePrefix = file.substring(0, 5);
          console.log('FILE NAME IN READALL', file);
          var readFile = new Promise((resolve, reject) => {
            fs.readFile(exports.dataDir + '/' + file, 'utf-8', (err, todoString) => {
              if (err) {
                reject(err);
              } else {
                console.log('got to this string', todoString);
                var todo = JSON.parse(todoString);
                console.log('got to the object', todo);
                resolve(todo);
              }
            });
          });
          data.push(readFile);
        }
      });
      Promise.all(data).then((values)=> {
        callback(null, values);
      });
    }
  });
};

exports.readOne = (id, callback) => {
  fs.readFile(exports.dataDir + '/' + id + '.txt', (err, todoString) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      var todo = JSON.parse(todoString);
      callback(null, todo);
    }
  });
};

exports.update = (id, text, callback) => {
  var filePath = exports.dataDir + '/' + id + '.txt';
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      callback(err, {id, text});
    } else {
      var newTodo = {id: id, text: text, updateTime: Date()};
      exports.readOne(id, (err, oldTodo) => {
        newTodo.createTime = oldTodo.createTime;
        var newTodoString = JSON.stringify(newTodo);
        fs.writeFile(filePath, newTodoString, (err) => {
          if (err) {
            throw ('error updating todo');
          } else {
            callback(null, newTodo);
          }
        });
      });
    }
  });
};

exports.delete = (id, callback) => {
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
