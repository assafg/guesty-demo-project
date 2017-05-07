var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', {
    title: 'Express',
    location: req.query.location || 'Los Angeles',
    apiKey: 'AIzaSyA0odcu89q5cvOQ8RRi8_Tx7D9p4Lk-W4Y'
  });
});

module.exports = router;
