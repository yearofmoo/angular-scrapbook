angular.module('AngularScrapbookApp',
  ['ngMessages', 'ngAnimate', 'ngRoute', 'angular-embedly'])

  .constant("EMBEDLY_KEY", "c01b65e16c31464db62426e3b22aa84a")

  .config(["$routeProvider", "embedlyServiceProvider", "EMBEDLY_KEY",
    function($routeProvider, embedlyServiceProvider,    EMBEDLY_KEY) {

    $routeProvider.when("/", {
      controller: 'ScrapbookPageController as scrapbookCtrl',
      templateUrl: './scrapbook-page.html'
    });

    $routeProvider.when("/new", {
      controller: 'ScrapbookFormPageController as scrapbookFormCtrl',
      templateUrl: './scrapbook-form-page.html' 
    });

    embedlyServiceProvider.setKey(EMBEDLY_KEY);
  }])

  .run(["$rootScope", function($rootScope) {
    $rootScope.count = function(collection) {
      return collection ? Object.keys(collection).length : 0;
    };
  }])

  .factory('surveyRegistry', [function() {
    var self, PREFIX = 'surveyRegistry';
    var data = localStorage[PREFIX];
    var collection = data && data.length ? loadEntryFromJSON(data) : {};
    return self = {
      list : function() {
        return collection;
      },
      get : function(id) {
        return collection[id + ""];
      },
      exists : function(id) {
        return !!collection[id + ""];
      },
      set : function(id, data) {
        if (self.exists(id)) {
          data.id = id;
          collection[id] = data;
          self.save();
        }
      },
      add : function(data) {
        var id = getMaxID(collection) + 1;
        data.id = id;
        collection[id + ""] = data;
        self.save();
      },
      remove : function(id) {
        if (self.exists(id)) {
          delete collection[id];
          self.save();
        }
      },
      save : function() {
        localStorage[PREFIX] = JSON.stringify(collection);
      }
    };

    function loadEntryFromJSON(data) {
      var contents = JSON.parse(data);
      angular.forEach(contents, function(entry) {
        entry.date = new Date(entry.date);
      });
      return contents;
    }

    function getMaxID(data) {
      var max = 0;
      for (var i in data) {
        max = Math.max(i, max);
      }
      return max;
    }
  }])

  .controller("ScrapbookPageController", ['surveyRegistry', '$location', '$rootScope',
                                  function(surveyRegistry,   $location,   $rootScope) {
    this.entries = surveyRegistry.list();
    this.remove = function(entry) {
      surveyRegistry.remove(entry.id);
    };
  }])

  .factory('scrapbookEmbedExtractor', ['embedlyService', function(embedlyService) {
    return function(url) {
      return embedlyService.extract(url).then(function(response) {
        var data = response.data;
        var image = data.images && data.images[0] && data.images[0].url;
        var keywords = _.map(data.keywords || [], function(entry) {
          return entry.name;
        });
        return {
          description: data.description,
          image: image,
          media: data.media,
          video: data.media && data.media.html ? true : false,
          keywords: keywords,
          type: data.type,
          url: data.url,
          title: data.title
        };
      });
    }
  }])

  .controller("ScrapbookFormPageController",
           ['surveyRegistry', 'scrapbookEmbedExtractor', '$location',
    function(surveyRegistry,   scrapbookEmbedExtractor,   $location) {

    var ctrl = this;
    this.submit = function(valid, data) {
      if (!valid) return;

      surveyRegistry.add(data);
      $location.path('/');
    }; 
  }])

  .directive('scrapbookList', [function() {
    return {
      controllerAs: 'list',
      controller: ['$scope', '$attrs', function($scope, $attrs) {
        this.entries = $scope.$eval($attrs.entries);
        this.isEmpty = !this.entries || Object.keys(this.entries) == 0;

        var ctrl = this;
        this.remove = function(entry) {
          $scope.$eval($attrs.onRemove, {
            entry: entry 
          });
          delete ctrl.entries[entry.id];
        };
      }]
    }
  }])

  .directive('scrapbookEntry', [function() {
    return {
      transclude: true,
      templateUrl: './scrapbook-entry-template.html',
      controllerAs: 'ctrl',
      require: ['^?scrapbookList','scrapbookEntry'],
      controller: ['$scope', '$attrs', function($scope, $attrs) {
        var entry = $scope.$eval($attrs.entry);
        this.data = entry;
      }],
      link : function(scope, element, attrs, ctrls) {
        var scrapbookCtrl = ctrls[0];
        var ctrl = ctrls[1];
        ctrl.remove = function() {
          scrapbookCtrl && scrapbookCtrl.remove(ctrl.data);
        };
      }
    }
  }])

  .directive('scrapbookEmbedField',
    ['scrapbookEmbedExtractor', function(scrapbookEmbedExtractor) {

    return {
      templateUrl: 'scrapbook-embed-field-template.html',
      controllerAs: 'ctrl',
      require: ['ngModel', 'scrapbookEmbedField'],
      link : function(scope, element, attrs, ctrls) {
        var ngModel = ctrls[0];
        var ctrl = ctrls[1];
        ctrl.setModel = function(value) {
          ngModel.$setViewValue(value);
        };
      },
      controller : ['$scope', '$attrs', function($scope, $attrs) {
        var ctrl = this;
        $scope.$watch($attrs.inputUrl, function(url) {
          ctrl.setModel(null);
          ctrl.embed = null;

          if (!url) {
            ctrl.ready = true;
            return;
          }
          
          ctrl.embedError = false;
          ctrl.loading = true;
          ctrl.ready = false;

          scrapbookEmbedExtractor(url).then(function(data) {
            ctrl.loading = false;
            ctrl.embed = data;
            ctrl.setModel(data);
          }, function() {
            ctrl.loading = false;
            ctrl.embedError = true;
          });
        });
      }]
    };
  }])
