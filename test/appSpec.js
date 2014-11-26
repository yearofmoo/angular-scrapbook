describe("Scrapbook App", function() {

  beforeEach(module('MockedAppTemplates'));
  beforeEach(module('AngularScrapbookApp'));
  
  describe('<scrapbook-entry>', function() {

    var element, render, scope;

    beforeEach(inject(function($compile, $rootScope, $templateCache) {
      scope = $rootScope.$new();
      scope.listing = {};

      var link = $compile('<scrapbook-entry entry="listing"></scrapbook-entry>');
      render = function() {
        element = link(scope);
        $rootScope.$digest();
      };
    }));

    it('should display an image', function() {
      var FAKE_IMAGE = 'http://www.fake-image/image.png';
      scope.listing.image = FAKE_IMAGE;
      render();

      expect(element.find('img').attr('src')).toMatch(FAKE_IMAGE);
    });

    it('should display a description', function() {
      var FAKE_DESCRIPTION = 'fake...';
      scope.listing.description = FAKE_DESCRIPTION;
      render();

      expect(element.find('p').text()).toMatch(FAKE_DESCRIPTION);
    });

    it('should display a button to watch the video when a video listing is used', function() {
      scope.listing.video = true;
      render();

      expect(element.text()).toMatch('Watch Video');
    });

    it('should provide a button to remove the entry', function() {
      render();
      expect(element.find('.remove-action')).toBeTruthy();
    });

    it('should provide a button to view the entry', function() {
      var FAKE_URL = 'http://fake.com';
      scope.listing.url = FAKE_URL;

      render();
      expect(element.find('.view-action').attr('href')).toEqual(FAKE_URL);
    });
  });
});
