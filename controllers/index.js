var express = require('express');
var router = express.Router();

/* GET login page. */
router.get('/', function(req, res, next) {
  res.render('login', { title: 'Pineapple', layout: 'partials/login'});
});

module.exports = router;
