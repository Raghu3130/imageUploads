var q = require('q');
var gm = require('gm').subClass({ imageMagick: true });; // Working on Local
var path = require('path');
var AWS = require('aws-sdk');
var mime = require('mime');
var json2csv = require('json2csv');
var fs = require('fs');
 var moment = require('moment');
AWS.config.loadFromPath('config/aws_config.json');
var s3bucket = new AWS.S3({ params: { Bucket: 'hussain' } });




function DbService() {

  return {
    
    jsontoExcel: jsontoExcel,
    uploadImages:_uploadImages,
    savePhotosToAws:_savePhotosToAws

    };


  function jsontoExcel(export_data) {
    var deferred = q.defer();
    var dataArray=[];
    export_data.forEach(function(data,index){
      var t={
        index:index,
        path:data.path,
        name:data.name
      };
      dataArray.push(t);
    });
    var export_fields = ['index','name','path'];
    var randomString = function (length) {
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text;
    };

    var filename = randomString(5);

    var csv = json2csv({ data: dataArray, fields: export_fields });
    // console.log(csv);
    // fs.writeFile('.tmp/public/uploads/' + filename + '.csv', csv, function (err) {
    //   if (err) {

    //     throw err;
    //   }
    // });
    // var filepath =  filename + '.csv';
    // var file={};
    // file.name=filepath;
    // file.path=path.resolve(sails.config.appPath, '.tmp/public')+"/uploads/"  + filepath;
    // _uploadDocToAWS(file);
    // var r='https://s3.ap-south-1.amazonaws.com/raghu-upload/uploads/'+filepath;
    // return r;
    //   csv = json2csv({ data: export_data, fields: export_fields });

                fs.writeFile('users_export.csv', csv, function(err) {
                  if (err) {
                    throw err;
                  }

                  var stdout = fs.createReadStream('users_export.csv');
                  var buf = new Buffer('');

                  stdout.on('data', function(data) {
                         buf = Buffer.concat([buf, data]);
                  });

                  var file_name = moment.utc().valueOf() + ".csv";//utc timestamp

                  stdout.on('end', function(data) {

                    var param = {
                        Bucket: "raghu-upload",
                        Key:  "uploads/"+file_name,
                        Body: buf,
                        ACL: 'public-read',
                        ContentType: mime.getType(file_name)
                    };
                    // console.log("inside stdout");
                    s3bucket.putObject(param, function(err, data) {
                          if(err) {
                              console.log(err);
                          }
                          else {
                              var murl = "https://s3.ap-south-1.amazonaws.com/raghu-upload/uploads/" + file_name;
                              try {
                                  //--sendNotification
                                  deferred.resolve(murl);
                                  //-------------------------------------------------
                              }
                              catch(err) {
                                  console.log("ERROR: ",err);
                              }


                              deferred.resolve(murl);
                          }
                    });
                });
                  console.log('file saved');
                });
            

            // return res.jsonp({data: resp,length: resp.length});
            return deferred.promise;
        
  }




  
     function _uploadImages(file) {
    var deferred = q.defer();
    file.upload({
      dirname: path.resolve(sails.config.appPath, '.tmp/public/uploads')
    }, function(err, files) {
      if (err) {
        deferred.reject(err);
      }
      var imgpath = path.parse(files[0].fd);
      var image={ path:'uploads/' + imgpath.base,
       name:files[0].filename}
      deferred.resolve(image);
    });
    return deferred.promise;
  }
    function _savePhotosToAws(details) {
      console.log("hey");
    var deferred = q.defer();
    var path=[];
    // photos
    if (details && details.path.length) {

      async.eachLimit(details.path,5, function(row, callback) {


      getData(row)
        .then(function(aresp) {
            callback();
            path.push(aresp);
            
            console.log("[getData] Success");
        })
        .catch(function(err) {
          console.log("[getData] Error: ", err);
            callback();

        });
    }, function(err) {
      if (err)  {
        console.log("Error: ", err);
      } else {
        deferred.resolve(path);
        //All Records proceeds.
      }
    });
    }

    // console.log("ENd AWS");
    return deferred.promise
  }
  function getData(row)
      {
        var uploadImageData = {};
        var dataPromise = q.defer();
         var phtPath = {};
          uploadImageData.filePath = path.resolve(sails.config.appPath, '.tmp/public') + '/' + row.path ;
          uploadImageData.modelName = 'images';
          // var fileName = (details.photos[i].path).split('/');
          var fileName = path.parse(row.path);
          // uploadImageData.uploadFileName = fileName[fileName.length - 1];
          uploadImageData.uploadFileName = fileName.base;
          phtPath = 'https://s3.ap-south-1.amazonaws.com/raghu-upload/images/'+uploadImageData.uploadFileName;
          row.path = phtPath;
          // console.log(details.photos);
          // save photos to aws
          _uploadImagesToAWS(uploadImageData).then(function(response) {
            console.log("proceeds...");
                dataPromise.resolve(row);
          }).catch(function(err) {
            callback();
          });

          // blank tmp objects
          uploadImageData = {};
          phtPath = {}; 

        return dataPromise.promise;
      }
 function _uploadImagesToAWS(data) {
    var data = data;
    var deferred=q.defer();
    var successCount = 0;
    var failureCount = 0;
    
      gm(data.filePath)
        .stream(function(err, stdout, stderr) {
          var buf = new Buffer('');
          stdout.on('data', function(data) {
            buf = Buffer.concat([buf, data]);
          });
          stdout.on('end', function(res) {
            var data1 = {
              Bucket: "link2exel",
              Key:data.modelName+'/'+data.uploadFileName,
              ACL: 'public-read',
              Body: buf,
              ContentType: mime.getType(data.uploadFileName)
            };
            
            s3bucket.putObject(data1, function(err, rese) {

              if (!err) {
                successCount++;
              }
              if (err) {
                console.log(err);
                failureCount++;
              }
              
            });
          });
        });
       
    deferred.resolve(true);
     return deferred.promise;
    //return;
  }
  function _uploadDocToAWS(data) {
    var deferred=q.defer();
    var data = data;
    var successCount = 0;
    var failureCount = 0;
    
      gm(data.path)
        .stream(function(err, stdout, stderr) {
          var buf = new Buffer('');
          stdout.on('data', function(data) {
            buf = Buffer.concat([buf, data]);
          });
          stdout.on('end', function(res) {
            var data1 = {
              Bucket: "link2exel",
              Key:"uploads/"+data.name,
              ACL: 'public-read',
              Body: buf,
              ContentType: mime.getType(data.name)
            };
            s3bucket.putObject(data1, function(err, rese) {
              if (!err) {
                successCount++;
              }
              if (err) {
                console.log(err);
                failureCount++;
              }
              
            });
            
          });
        });
       
    deferred.resolve(true);
    // return deferred.promise;
    return deferred.promise;
  }




}
module.exports = DbService();
