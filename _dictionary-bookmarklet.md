# Dictionary-bookmarklet 

## Install

For info and install, see http://htmlpreview.github.io/?https://gist.github.com/dergachev/e9339d65c1bf7a6c6226/raw/index.html

## Development notes

Bookmarklets:
* http://lifehacker.com/129141/geek-to-live-ten-must+have-bookmarklets
* http://mrcoles.com/blog/dictionary-bookmarklet-popup-definition-browser/
* http://www.nitinh.com/2009/02/dictionary-on-double-click-bookmarklet/

Text highlighting:
* https://code.google.com/p/rikaikun/source/browse/trunk/rikaichan.js
* http://stackoverflow.com/questions/5379120/get-the-highlighted-selected-text
* http://stackoverflow.com/questions/300129/how-do-i-wrap-a-span-around-a-section-of-text-in-javascript
* http://stackoverflow.com/questions/6865714/highlight-an-individual-word-within-a-text-block-on-hover
* http://dev.w3.org/csswg/cssom-view/#widl-Document-caretPositionFromPoint-CaretPosition-float-x-float-y
* http://stackoverflow.com/questions/2444430/how-to-get-a-word-under-cursor-using-javascript
* http://emgio.com/caretrangefrompointbug/
* http://stackoverflow.com/questions/11191136/set-a-selection-range-from-a-to-b-in-absolute-position

Translation Services:
* https://developers.google.com/translate/v2/faq#pricing
* http://stackoverflow.com/questions/6151668/alternative-to-google-translate-api
* http://detectlanguage.com/

## Bing Translator

### Resources

* http://www.microsoft.com/web/post/using-the-free-bing-translation-apis
* https://datamarket.azure.com/dataset/bing/microsofttranslator
* http://social.msdn.microsoft.com/Forums/en-US/microsofttranslator/thread/0ed61e34-1199-4000-8575-7976d7b98067
* http://msdn.microsoft.com/en-us/library/hh454950.aspx#phpexample
* http://msdn.microsoft.com/en-us/library/ff512385.aspx
* http://msdn.microsoft.com/en-us/library/ff512417.aspx#GetTranslations
* http://blogs.msdn.com/b/translation/p/phptranslator.aspx

```bash
# generates 10 minute access token
ACCESS_TOKEN=$(curl -X POST https://datamarket.accesscontrol.windows.net/v2/OAuth2-13 --data 'client_id=dictionary-bookmarklet-01&client_secret=12345678901234567890&grant_type=client_credentials&scope=http://api.microsofttranslator.com' | ruby -r json -e " puts JSON.parse(gets)['access_token'])")

# URI::encode doesn't work; must use CGI::escape else generic token error: "The Web Token must have a signature at the end."
curl "http://api.microsofttranslator.com/v2/Http.svc/Translate?oncomplete=ajaxTranslateCallback&text=comment&from=fr&to=en&appId="$(echo -n $ACCESS_TOKEN | ruby -r cgi -ne 'puts CGI::escape($_)')

# access token looks like this:
# Bearer%20http://api.microsofttranslator.com/v2/Http.svc/Translate?oncomplete=ajaxTranslateCallback&text=comment&from=fr&to=en&appId=Bearer+http%253a%252f%252fschemas.xmlsoap.org%252fws%252f2005%252f05%252fidentity%252fclaims%252fnameidentifier%3Ddictionary-bookmarklet-01%26http%253a%252f%252fschemas.microsoft.com%252faccesscontrolservice%252f2010%252f07%252fclaims%252fidentityprovider%3Dhttps%253a%252f%252fdatamarket.accesscontrol.windows.net%252f%26Audience%3Dhttp%253a%252f%252fapi.microsofttranslator.com%26ExpiresOn%3D1367996067%26Issuer%3Dhttps%253a%252f%252fdatamarket.accesscontrol.windows.net%252f%26HMACSHA256%3D%252bv5a2xxyfxG9%252bGX26LwKYXTUsRgNNcZfjJWoOmT77E4%253d

## working URL (aside from expired token)
# http://api.microsofttranslator.com/v2/Http.svc/Translate?dataType=jsonp&oncomplete=bob&text=comment&from=fr&to=en&appId=Bearer+http%253a%252f%252fschemas.xmlsoap.org%252fws%252f2005%252f05%252fidentity%252fclaims%252fnameidentifier%3Ddictionary-bookmarklet-01%26http%253a%252f%252fschemas.microsoft.com%252faccesscontrolservice%252f2010%252f07%252fclaims%252fidentityprovider%3Dhttps%253a%252f%252fdatamarket.accesscontrol.windows.net%252f%26Audience%3Dhttp%253a%252f%252fapi.microsofttranslator.com%26ExpiresOn%3D1367996067%26Issuer%3Dhttps%253a%252f%252fdatamarket.accesscontrol.windows.net%252f%26HMACSHA256%3D%252bv5a2xxyfxG9%252bGX26LwKYXTUsRgNNcZfjJWoOmT77E4%253d
```

Notes:

* signed up for bing account 
* signed up for azure marketplace, got primary account key; https://datamarket.azure.com/account
* created secondary account key (just in case):  https://datamarket.azure.com/account/keys?Desc=TestTranslator
* register application on https://datamarket.azure.com/developer/applications/
  - client_id: dictionary-bookmarklet-01, client_secret: 12345678901234567890 (this will need to be changed regularly)

Encoding notes:

* encodeURIComponent is different than encodeURI. Don't use the latter, since it ingores [&=] and others.
* the first request returns an access_token that's an encoded URL.
* acces_token, AS RETURNED: 
    http%3a%2f%2fschemas.xmlsoap.org%2fws%2f2005%2f05%2fidentity%2fclaims%2fnameidentifier=dictionary-bookmarklet-01&http%3a%2f%2fschemas.microsoft.com%2faccesscontrolservice%2f2010%2f07%2fclaims%2fidentityprovider=https%3a%2f%2fdatamarket.accesscontrol.windows.net%2f&Audience=http%3a%2f%2fapi.microsofttranslator.com&ExpiresOn=1368029727&Issuer=https%3a%2f%2fdatamarket.accesscontrol.windows.net%2f&HMACSHA256=fOGpx96tCpsyLnaaAojpfa0OBx%2bEa0V5Fj2oQVA0mgU%3d
* decodeURIComponent(access_token):
    http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier=dictionary-bookmarklet-01&http://schemas.microsoft.com/accesscontrolservice/2010/07/claims/identityprovider=https://datamarket.accesscontrol.windows.net/&Audience=http://api.microsofttranslator.com&ExpiresOn=1368029727&Issuer=https://datamarket.accesscontrol.windows.net/&HMACSHA256=fOGpx96tCpsyLnaaAojpfa0OBx+Ea0V5Fj2oQVA0mgU=
* you need to take the access_token AS RETURNED, and formulate the following AJAX request
    http://jsbin.com/ovijux/2

## YQL / Pipes proxying:

```
# this works!!
curl "http://query.yahooapis.com/v1/public/yql?q=select+*+from+microsoft.translator+where+text%3D%22hello%20world%22+and+client_id%3D%22dictionary-bookmarklet-01%22+and+client_secret%3D%2212345678901234567890%22&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys" 

# console URL: 
## http://developer.yahoo.com/yql/console/?q=select%20*%20from%20microsoft.translator%20where%20text%3D%22hello%20world%22%20and%20client_id%3D%22dictionary-bookmarklet-01%22%20and%20client_secret%3D%20%2212345678901234567890%22&format=json&env=store://datatables.org/alltableswithkeys
```

YQL Resources:

* http://stackoverflow.com/questions/3206753/cross-domain-requests-with-jquery-using-yql/
* http://developer.yahoo.com/yql/guide/yql-code-examples.html
* http://developer.yahoo.com/yql/
* http://www.datatables.org/
* http://developer.yahoo.com/yql/console/?q=show%20tables&env=store://datatables.org/alltableswithkeys#h=show%20tables
* http://developer.yahoo.com/blogs/ydn/scraping-html-documents-require-post-data-yql-7775.html
* http://pipes.yahoo.com/pipes/docs?doc=sources#YQL
* https://github.com/yql/yql-tables/pull/208
* http://stackoverflow.com/questions/3113924/jquery-jsonp-yahoo-query-language
* https://raw.github.com/dergachev/yql-tables/MS-TRANSLATOR-EXPERIMENT/microsoft/translator/microsoft.translator.xml
* http://httpbin.org/get?user=alex
* http://developer.yahoo.com/yql/guide/yql-opentables-import.html

## Selection tooltip

Proof of concept with rangy: http://jsfiddle.net/dergachev/3kc9X/

* http://craigsworks.com/projects/qtip2/demos/#shared
* http://www.boduch.ca/2013/03/jquery-ui-tooltips-for-selected-text.html
* http://stevenbenner.github.io/jquery-powertip/
* http://huffpostlabs.github.io/highlighter.js/
* http://stackoverflow.com/questions/2444430/how-to-get-a-word-under-cursor-using-javascript
* http://dev.w3.org/csswg/cssom-view/#the-caretposition-interface
* http://jsfiddle.net/kkgEt/2/
