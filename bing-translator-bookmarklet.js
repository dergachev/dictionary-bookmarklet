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
      test: typeof(window.jQuery) === 'undefined' || jQuery.fn.jquery.match(/^1\.[0-9]+/) <= 1.4,
      yep: '//cdnjs.cloudflare.com/ajax/libs/jquery/1.4.4/jquery.min.js'
    },
    {
      test: typeof(window.jQuery) === 'undefined' || typeof(window.jQuery.jGrowl) === 'undefined',
      yep: ['//cdnjs.cloudflare.com/ajax/libs/jquery-jgrowl/1.2.12/jquery.jgrowl.min.js','//cdnjs.cloudflare.com/ajax/libs/jquery-jgrowl/1.2.12/jquery.jgrowl.css'],
      complete: function (url, result, key) {
        initMyBookmarklet(jQuery);
      }
    }
  ]);
}

function initMyBookmarklet($) {
  $(function(){ 
      $.jGrowl('Highlight a phrase to translate it.', {header:"FR>EN bookmarklet activated"});
      $(document).mouseup(function(e) {
          var word = window.getSelection().toString();
          lookupTranslation(word);
      });
  });

  function lookupTranslation(word) { 
    // ensure selection is a single word, recognizing accents too
    if (word.length < 2) {
      return;      
    }

    // there seems to be no other way to escape quotes in YQL syntax
    word = word.replace(/"/,"'");

    var query ='select * from microsoft.translator where text="' + word + '" and from = "fr" and to = "en" and client_id="dictionary-bookmarklet-01" and client_secret="12345678901234567890"';
    $.get("http://query.yahooapis.com/v1/public/yql", { q: query, env: "store://datatables.org/alltableswithkeys" }, function(data) {
      var answer = $('query results',data).text();
      $.jGrowl(answer, {header: word, life: Math.max(word.length * 50, 3000) });
    });   
  }

  function lookupDef(word) {
    // ensure selection is a single word, recognizing accents too
    word = word.toLowerCase().split(' ')[0].replace(/[^'a-zA-Z0-9\u00E0-\u00FC-]/,'');
    if (word.length < 2) {
      return;      
    }

   $.getJSON(url, function(data) {
      var items = [];
      $.each(data.tuc, function(key, val) {    
        if ( typeof(val) !== 'undefined' && typeof(val.phrase) !== 'undefined' && typeof(val.phrase.text) !== 'undefined') {
          items.push('<li>' + val.phrase.text + '</li>');         
        }    
      });
      if (items.length == 0) {
        $.each(data.tuc, function(key, val) {    
          if (typeof(val) !== 'undefined' && typeof(val.meanings) !== 'undefined') {
            $.each(val.meanings, function(meaningKey, meaningValue) {
              if (typeof(meaningValue.text) != 'undefined') {
                items.push('<li>' + meaningValue.text + '</li>');
              }
            });
          }
        });
      }
      if (items.length == 0) {
        items.push('<li>No definitions found.</li>');
      }
      var list = $('<ul/>', {
        'class': 'my-new-list',
        html: items.join('')
      });
             
      
      $.jGrowl('<b>' + word + '</b>' + list.html());
              
    });   
  }
}
