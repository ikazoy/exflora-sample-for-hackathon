const express = require("express");
const app = express();
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}, Ctrl+C to stop`)
});

app.use('/scripts', express.static(__dirname + '/node_modules/flickrapi/browser/'));

app.set('view engine', 'ejs');

function getApiKeys(callback, errorcallback) {
  // CHANGE THE CREDENTIALS OF FLICKR API
  callback('Your Flickr API key', 'Your Flickr API secret');
}

app.get("/", function(req, res) {
  getApiKeys(function callFlickrAPI(api_key, api_secret) {
    const Flickr = require("flickrapi"),
      flickrOptions = {
        api_key: api_key,
        secret: api_secret
      };
    console.log(api_key);
    console.log(api_secret);
    Flickr.tokenOnly(flickrOptions, function(error, flickr) {
      console.log("tokenOnly");
      if (error) {
        console.log(error);
        res.send(error);
        return;
      }
      // we can now use "flickr" as our API object,
      // but we can only call public methods and access public data
      let photos = [];
      const keyword = "red+panda";
      flickr.photos.search({
        text: keyword,
      }, (err, data) => {
        if (err) {
          console.log("error")
          res.send(err);
        }
        console.log("Got flickr data sending it");
        for (let p of data.photos.photo) {
          const src = `https://farm${p.farm}.staticflickr.com/${p.server}/${p.id}_${p.secret}.jpg`
          photos.push({
            'src': src,
            'title': p.title
          });
        }
        res.locals.name = 'ozaki';
        res.render('index', {
          'title': 'flickr api sample',
          'keyword': keyword,
          'photos': photos
        }, (err, html) => {
          res.send(html);
        })
      });
    });

  }, (err) => {
    console.log(err);
    res.send("Error!");
  })
});
