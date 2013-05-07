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
      $(document).mouseup(function(e) {               
          var word = window.getSelection().toString();
          lookupDef(word);
      });
  });


  function lookupDef(word) {
   // ensure selection is a single word, recognizing accents too
   word = word.toLowerCase().split(' ')[0].replace(/[^'a-zA-Z0-9\u00E0-\u00FC-]/,'');
    if (word.length < 2) {
      return;      
    }
   $.getJSON('http://glosbe.com/gapi/translate?from=fra&dest=eng&format=json&callback=?&pretty=true&phrase='+word, function(data) {
      var items = [];
      $.each(data.tuc, function(key, val) {    
        if ( typeof(val) !== 'undefined' && typeof(val.phrase) !== 'undefined' && typeof(val.phrase.text) !== 'undefined') {
          items.push('<li>' + val.phrase.text + '</li>');         
        }    
      });
      if(items.length == 0) {
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