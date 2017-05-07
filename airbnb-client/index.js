const client = require('./bin/listings');

client.fetchListings('Los Angeles', () => console.log('Done!'));
