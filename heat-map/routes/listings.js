const express = require('express');
const path = require('path');
const router = express.Router();
const Datastore = require('nedb')
  , db = new Datastore({ filename: path.join(__dirname, '..', '..', 'data', 'listings1.json'), autoload: true });

/* GET listing. */
router.get('/:city', function(req, res) {
  db.find({city: req.params.city}).sort({'star_rating': -1, 'reviews_count': -1}).limit(100).exec((err, docs) => {
    res.send(docs.map(doc => ({
      lat: doc.lat,
      lng: doc.lng,
      starRating: doc.star_rating,
      reviewsCount: doc.reviews_count
    })))
  })
});

module.exports = router;
