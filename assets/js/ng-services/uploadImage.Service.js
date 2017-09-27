  (function () {

  app.service('widgetServices', ['$q','$http','BASE_URL', function ($q,$http,BASE_URL) {

    return {
      uploadImage:uploadImage
    };
    function uploadImage(name){
      var data={
        name:name
      };
      var deferred = $q.defer();
      $http.post(BASE_URL+'upload',data).then(function(response){
        deferred.resolve(response);
      }).catch(function(err){
        deferred.reject(err);
      });
      return deferred.promise;
    }

    

  }]);

})(); //IIFE
