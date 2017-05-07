## Airbnb API Demo
This project contains 2 "mini" projects - "airbnb-client" and "heat-map".

### Airbnb Client
Service for interacting with airbnb API for fetching data about listings. Currently implemented is the fetching of 4000 listings for "Los Angeles".

* Need to implement - fetching for each listing the availability for calculating the "demand score". Demand score will be calculated initially as the percentage of available days out of the entire month days.
```
https://www.airbnb.com/api/v2/calendar_months?key=[API_KEY]&currency=USD&locale=en&listing_id=[listingId]&month=${month}&year=2017&count=3&_format=with_conditions
```

#### Running the script:
1. npm install
2. set API_KEY as an environment variable
3. run node index.js

#### Running the tests:
1. TEST=true node test.js


### Heat Map
A basic Express based app for displaying a heat map of the to 100 most demanded listings in a specifc location.
Currently the listings are sorted by high rating and number of reviews.

#### Running the app:
1. npm install
2. npm start
3. Open browser @ http://localhost:3000

### Going forward:
1. Need to implement "demand score" calculation (as mentioned above)
2. Sort heat-map results by demand-score
3. Add more parameters to "demand-score" calculation:
    
    1. Price flexibility - strict high prices (relative to similar listings) over time can indicate a high demand
    2. Prime location - accessability to points of interest may increase demand
    3. Booking trends - increasing booking rates can indicate increasing demand
    4. High star score & for high number of reviewers - usually good rated locations will be in high demand