const _ = require('lodash');
const path = require('path');
const request = require('request');
const async = require('async');
const config = require('./config.json');
const test = require('tape');
const Datastore = require('nedb');
let db;
if (!process.env.TEST) {
  db = new Datastore({ filename: path.join(__dirname, '..', '..', 'data', 'listings1.json'), autoload: true });
  db.ensureIndex({ fieldName: 'city' }, function (err) {
    if (err) {
      console.error(err);
    }
  });
  console.log('Creating DB at', path.join(__dirname, '..', 'data', 'listings1.json'));  
}

const API_KEY = process.env.API_KEY;

const priceGroups = [
      {min: 0, max: 100},
      {min: 101, max: 200},
      {min: 201, max: 300},
      {min: 301, max: 1000000}
    ];

// Throttle
const fetch = _.throttle((query, callback) => {
  const options = {
    url: query,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36',
      'Accept-Encoding': 'gzip'
    },
    gzip: true
  };
  request(options, (error, response, body) => callback(error, body));
}, 100);

const flattenRange = group => multiply => {
  const range = offestRange(multiply);
  return _.flatten(
    range.map(r => group.map(g => Object.assign({}, g, r)))
  );
}

const offestRange = max => _.range(0, max, config.API.LIMIT)
  .map(r => ({ offset: r }));

const generateListingQueries = location =>
  flattenRange(priceGroups)(1000)
    .map(x => `https://api.airbnb.com/v2/search_results?client_id=${API_KEY}&location=${encodeURI(location)}&_limit=${config.API.LIMIT}&_offset=${x.offset}&price_min=${x.min}&price_max=${x.max}`);

const storeInDB = (listing, callback) => {
  db.insert(listing, (err) => {
    if (err) {
      console.error('Error', err);
      callback(err);
    }
    callback();
  });
}

const storeResults = (body, callback) => {
  const funcs = JSON.parse(body).search_results.map(listing => {
    return (next) => storeInDB(listing.listing, next);
  });

  async.series(funcs, callback);
}

const fetchListings = exports.fetchListings = (location, onFinish) => {
  const queries = generateListingQueries(location);
  const fetchFunctions = queries.map(query => (next) => {
    console.log(query);
    fetch(query, (err, data) => {
      storeResults(data, next);
    });
  });
  async.series(fetchFunctions, err => {
    if (err) {
      return console.error('Error', err);
    }
    onFinish();
  })
}

const month = (new Date()).getMonth() + 1;

const fetchAvailability = (listingId, callback) => {
  const query = `https://www.airbnb.com/api/v2/calendar_months?key=${API_KEY}&currency=USD&locale=en&listing_id=${listingId}&month=${month}&year=2017&count=3&_format=with_conditions`;
  fetch(query, callback);
}

const calculateAvailablityScore = (availability) => {
  return availability.days.filter(d => d.available).length / availability.days.length;
}
const fetchAllAvailabilities = exports.fetchAllAvailabilities = (callback) => {
  db.find({}).exec((err, data) => {
    if (err) {
      return console.error(err);
    }
    async.each(data, (listing, next) => {
      fetchAvailability(listing.id, (err, availability) => {
        if (err) {
          console.error(err);
          return next(err);
        }
        db.update({ _id: listing._id }, { $set: {availabilityScore: calculateAvailablityScore(availability)}},
        next);
      })
    }, () => {
      callback();
    });
  });

}

// Tests
if (process.env.TEST) {
  test('flatten range', t => {
    const limit = 1000;
    const arr = flattenRange(priceGroups)(limit);
    t.equal(arr.length, 80);
    t.deepEqual(arr[0], { offset: 0, min: 0, max: 100 });
    t.deepEqual(arr[1], { offset: 0, min: 101, max: 200 });
    t.deepEqual(arr[4], { offset: 50, min: 0, max: 100 });
    t.end();
  });

  test('test step range', t => {
    const range = offestRange(1000);
    t.deepEqual(range[0], { offset: 0 });
    t.deepEqual(range[1], { offset: 50 });
    t.deepEqual(range[range.length -1], { offset: 950 });
    t.end();
  });

  test('test correct queries', t => {
    const queries = generateListingQueries('Los Angeles');
    t.equal(queries.length, 80);
    t.equal(queries[0], 'https://api.airbnb.com/v2/search_results?client_id=undefined&location=Los%20Angeles&_limit=50&_offset=0&price_min=0&price_max=100');
    t.end();
  });
}
