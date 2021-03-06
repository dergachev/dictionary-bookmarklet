(function(){
    var done = false;
    var script = document.createElement("script");
    script.src = "//cdnjs.cloudflare.com/ajax/libs/yepnope/1.5.4/yepnope.min.js";
    script.onload = script.onreadystatechange = function(){
      if (!done && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
        done = true;
        requireDeps();
      }
    };
    document.getElementsByTagName("head")[0].appendChild(script);
})();

function requireDeps() {
  //TODO: reverse yep / nope logic to be consistent with standard usage;
  yepnope([{
      test: typeof(window.jQuery) === 'undefined' || jQuery.fn.jquery.match(/^1\.[0-9]+/) < 1.7,
      yep: '//cdnjs.cloudflare.com/ajax/libs/jquery/2.0.0/jquery.min.js'
    },
    { test: typeof(window.rangy) === 'undefined',
      yep: '//rangy.googlecode.com/svn/trunk/currentrelease/rangy-core.js'
    },
    { test: typeof(window.rangy) === 'undefined' || typeof(rangy.CssClassApplier) === 'undefined',
      yep: '//rangy.googlecode.com/svn/trunk/currentrelease/rangy-cssclassapplier.js'
    },
    { test: typeof(window.jQuery) === 'undefined' || typeof(window.jQuery.fn.powerTip) === 'undefined',
      yep: ['//cdnjs.cloudflare.com/ajax/libs/jquery-powertip/1.2.0/jquery.powertip.min.js','//cdnjs.cloudflare.com/ajax/libs/jquery-powertip/1.2.0/css/jquery.powertip-dark.min.css'],
      complete: function (url, result, key) {
        // XXX: due to yepnope bug, this will get called immediately if jquery.powertip.js is already present
        initBookmarklet(jQuery);
      }
    }
  ]);
}

function initBookmarklet($) {
  function handleSelection() { // without delay window.getSelection().isCollapsed is unreliable

    // initialize rangy, from http://stackoverflow.com/a/5765574/9621
    rangy.init();
    this.selectionWrapper = this.selectionWrapper || rangy.createCssClassApplier("selected", {normalize: true});

    var selection = window.getSelection(),
        selectedText = selection.toString();

    // only if selection is active, and selected phrase is non-trivial
    if (!selection.isCollapsed && selectedText.length >= 2) {
      this.selectionWrapper.applyToSelection();
      lookupTranslation(selectedText, function(answer) {
        $('span.selected')
          .data('powertip', '<em>' + selectedText + '</em><hr/>\n<p>' + answer + '</p>')
          .powerTip({smartPlacement:true, manual:true})
          .first().powerTip('show'); // I'm not yet sure which element should be activated
      });
    }
  }

  function getDatamarketToken(callback) {
    // caches token for this request (TODO: respect 10 minute expiry)
    if (getDatamarketToken.accessToken) {
      return callback(getDatamarketToken.accessToken);
    }
    /*  
      //TODO: remove reliance on custom datatable, as follows:
     var url="https://datamarket.accesscontrol.windows.net/v2/OAuth2-13/", 
     postData = "scope=http://api.microsofttranslator.com&grant_type=client_credentials&client_id=dictionary-bookmarklet-01&client_secret=12345678901234567890"; 
     var query = "select * from jsonpost where url='" + url + "' and postdata='" + postData + "'";
     console.log("http://query.yahooapis.com/v1/public/yql?q=" + encodeURIComponent(query)+ "&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=")
     */
    var data = {
      q: 'use "https://raw.github.com/dergachev/yql-tables/master/microsoft/translator/microsoft.datamarket.token.xml"; select * from microsoft.datamarket.token where client_id="dictionary-bookmarklet-01" and client_secret= "12345678901234567890"'
    };
    $.get("http://query.yahooapis.com/v1/public/yql", data, function(data) {
      var answer = $('query results access_token',data).text();
      if (!answer) {
        console.log("Unable to get access token");
      }
      getDatamarketToken.accessToken = answer;
      callback(answer);
    });
  }

  function lookupTranslation(word, callback) {
    getDatamarketToken(function(accessToken) {
      var options = {
        data: { from: 'fr', to: 'en', text: word, appId: 'Bearer ' + accessToken },
        jsonp: 'oncomplete',
        dataType: 'jsonp',
        success: callback
      };
      $.ajax("http://api.microsofttranslator.com/v2/Ajax.svc/Translate", options);
    });
  }

  $(function() {
    $('body').on('mousedown', function(e) {
      // unwrap span.selected contents; via http://stackoverflow.com/q/2409117/9621
      $('span.selected').powerTip('hide').replaceWith( function() {
        return $(this).contents();
      });
    });
    $('body').on('mouseup', function(e) { // 'mouseup' works better for dragging (eg highlighting) than 'click'
      window.setTimeout(handleSelection, 1);
      // TODO: make alt-clicking on an element automatically translate its contents (without selection)
      // make it easier to highlight link text by disabling click handlers if alt-key is held
      if (e.altKey) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
    // Check if text is selected on bookmarklet load, and if so translate it.
    // XXX: commented out because it throws errors about stuff being not defined.
    //  handleSelection();
  });
}
