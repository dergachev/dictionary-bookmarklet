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
    {
      test: typeof(window.jQuery) === 'undefined' || typeof(window.jQuery.fn.powerTip) === 'undefined',
      //note: 1.2 version isnt on cdnjs.org yet; using gh-pages is good for no-sniff header, but this will not work on HTTPS
      yep: ['http://stevenbenner.github.io/jquery-powertip/scripts/jquery.powertip.js','http://stevenbenner.github.io/jquery-powertip/styles/jquery.powertip.css'],
      complete: function (url, result, key) {
        initMyBookmarklet(jQuery);
      }
    }
  ]);
}

function initMyBookmarklet($) {
  // call with no args to clear, o
  // call with just _word_ to indicate we're looking up word
  function powerTip(word,answer,event) {
   $.powerTip.destroy();
    if (typeof(word) === "undefined" || word == "") {
      $(event.target).data('powertipjq', '');
    } else if (typeof(answer) === "undefined") {
      $(event.target).data('powertipjq', $('<p>Looking up <b>' + word + '</b>...</p>')).powerTip({followMouse:true});
    } else {
      $(event.target).data('powertipjq', $('<p><b>' + word + '</b></p>' + "\n" + '<p>' + answer + '</p>')).powerTip({followMouse:true});
    }
  }

  $(function() {
      // $.jGrowl('Highlight a phrase to translate it.', {header:"FR>EN bookmarklet activated"});
      $(document).mouseup(function(e) {
        var word = window.getSelection().toString();
        powerTip(word, undefined, e);
        lookupTranslation(word, e);
      });
  });

  function lookupTranslation(word, event) {
    // ensure selection is a single word, recognizing accents too
    if (word.length < 2) {
      return;
    }
    // there seems to be no other way to escape quotes in YQL syntax
    word = word.replace(/"/,"'");
    var query = 'SELECT * from microsoft.translator WHERE text="' + word + '" AND from = "fr" AND to = "en" AND ' +
                 'client_id="dictionary-bookmarklet-01" AND client_secret="12345678901234567890"';
    $.get("http://query.yahooapis.com/v1/public/yql",
          { q: query, env: "store://datatables.org/alltableswithkeys" }, function(data) {
      var answer = $('query results',data).text();
      powerTip(word,answer,event);
    });
  }
}
