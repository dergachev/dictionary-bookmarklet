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
      yep: ['//cdnjs.cloudflare.com/ajax/libs/jquery-powertip/1.2.0/jquery.powertip.min.js','//cdnjs.cloudflare.com/ajax/libs/jquery-powertip/1.2.0/css/jquery.powertip-light.min.css'],
      complete: function (url, result, key) {
        // XXX: due to yepnope bug, this will get called immediately if jquery.powertip.js is already present
        initBookmarklet(jQuery);
      }
    }
  ]);
}

function initBookmarklet($) {
  function handleSelection() { // without delay window.getSelection().isCollapsed is unreliable
    // unwrap span.selected contents; via http://stackoverflow.com/q/2409117/9621
    $('span.selected').replaceWith( function() {
      return $(this).contents();
    });

    // initialize rangy, from http://stackoverflow.com/a/5765574/9621
    rangy.init();
    this.selectionWrapper = this.selectionWrapper || rangy.createCssClassApplier("selected", {normalize: true});

    var selection = window.getSelection(),
        selectedText = selection.toString();

    // only if selection is active, and selected phrase is non-trivial
    if (!selection.isCollapsed && selectedText.length >= 2) {
      this.selectionWrapper.applyToSelection();
      lookupTranslation(selectedText, function(word,answer) {
        $('span.selected')
          .data('powertip', '<em>' + word + '</em><hr/>\n<p>' + answer + '</p>')
          .powerTip({smartPlacement:true})
          .first().powerTip('show'); // I'm not yet sure which element should be activated
      });
    }
  }

  function lookupTranslation(word, callback) {
    // there seems to be no other way to escape quotes in YQL syntax
    word = word.replace(/"/,"'");
    var data = { q: 'SELECT * from microsoft.translator WHERE text="' +
                     word + '" AND from = "fr" AND to = "en" AND ' +
                     'client_id="dictionary-bookmarklet-01" AND client_secret="12345678901234567890"',
                 env: "store://datatables.org/alltableswithkeys"
    };
    $.get("http://query.yahooapis.com/v1/public/yql", data, function(data) {
      var answer = $('query results',data).text();
      callback(word, answer);
    });
  }

  $(function() {
    $('body').on('mouseup', function(e) { // 'mouseup' works better for dragging (eg highlighting) than 'click'
      window.setTimeout(handleSelection, 1);
      // make it easier to highlight link text by disabling click handlers if alt-key is held
      if (e.altKey) {
        e.preventDefault();
        e.stopPropagation();
      }
    })
  });
}
