var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/add', function(req, res, next) {
  res.render('add_survey', { title: 'fancy.me', layout: 'partials/add_survey', user: req.user});
});

module.exports = router;
