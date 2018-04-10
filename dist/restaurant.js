/**
 * Common database helper functions.
 */
class DBHelper {
    /**
     * Database URL.
     * Change this to restaurants.json file location on your server.
     */
    static get DB_NAME() {
        return 'restaurants-db';
    }
    static get OBJECT_STORE_NAME() {
        return 'restaurants';
    }
    static openDB() {
        // open DB
        return idb.open(DBHelper.DB_NAME, 1, upgradedDB => {
            // create restaurants store
            if (
                !upgradedDB.objectStoreNames.contains(
                    DBHelper.OBJECT_STORE_NAME
                )
            ) {
                upgradedDB.createObjectStore(DBHelper.OBJECT_STORE_NAME, {
                    keyPath: 'id'
                });
            }
        });
    }
    static get DATABASE_URL() {
        // new url for the data
        return `http://localhost:1337/restaurants`;
    }

    /**
     * Fetch all restaurants.
     */
    static async fetchRestaurants(callback) {
        //fetching the data with fetch API
        try {
            const my_db = await DBHelper.openDB() ;
            const tx = my_db.transaction(DBHelper.OBJECT_STORE_NAME,'readwrite') ;
            const restaurantsStore = tx.objectStore(DBHelper.OBJECT_STORE_NAME);
            let restaurants = await  restaurantsStore.getAll() ;
            // if all restaurants exist
            if(restaurants.length ===10) {
                console.log('we already stored on DB')
                callback(null,restaurants)
                return tx.complete.then(()=>console.log('all operations completed'));
            }
            restaurants =  await DBHelper.fetchRestaurantsFromNetwork() ;
            callback(null,restaurants);
            await DBHelper.saveRestaurantsOnDB(restaurants);
        }
        catch (e) {
            callback(e,null)
        }
    }
    // fetch restaurants data from network
    static async fetchRestaurantsFromNetwork() {
            try {
                const response = await window.fetch(DBHelper.DATABASE_URL) ;
                if (response.ok) return response.json() ;
                // response may occur but with the wrong status code
                // that wan't reject the promise
                return Promise.reject(`error returned with ${response.status} status code`);
            }
            // if any error happen while fetching
            // like internet connectivity or not valid url
            // reject error
            catch (e) {
                return Promise.reject(e);
            }


    }

    /**
     * store restaurants on DB Store
     * @param store {IDBObjectStore} store to store data on it
     * @param restaurants  array of all restaurants to store in DB
     */
    static async saveRestaurantsOnDB(restaurants) {
        const my_db = await DBHelper.openDB() ;
        const tx = my_db.transaction(DBHelper.OBJECT_STORE_NAME,'readwrite') ;
        const store = tx.objectStore(DBHelper.OBJECT_STORE_NAME)
        return   restaurants.forEach( async restaurant => {
            // check if values already exist
            const value = await store.get(restaurant.id) ;
            if (value) return ;
            await store.add(restaurant) ;

        });
    }

    /**
     * Fetch a restaurant by its ID.
     */
    static async fetchRestaurantById(id, callback) {
        // fetch all restaurants with proper error handling.
        try{
            const my_db = await DBHelper.openDB() ;
            const tx = my_db.transaction(DBHelper.OBJECT_STORE_NAME) ;
            const restaurantsStore = tx.objectStore(DBHelper.OBJECT_STORE_NAME) ;
            let restaurant = await restaurantsStore.get(parseInt(id)) ;
            if (restaurant) {
                console.log('restaurant stored on DB') ;
                callback(null,restaurant) ;
                return tx.complete ;
            }
            restaurant = await DBHelper.fetchRestaurantFromNetwork() ;
            callback(null,restaurant) ;

        }
        catch (e) {
            callback(e,null) ;
        }


    }
    // fetch restaurant with specified Id form network
    static async fetchRestaurantFromNetwork() {
       try{
           const my_db = DBHelper.openDB() ;
           const tx = my_db.transaction(DBHelper.OBJECT_STORE_NAME,'readwrite');
           const store = tx.objectStore(DBHelper.OBJECT_STORE_NAME) ;
           const response = await  fetch(`${DBHelper.DATABASE_URL}/${id}`)
           // if the response is success
           if(response.ok){
               store.add(response.json());
               return response.json() ;
           }
           return Promise.reject(`error returned with status ${response.status}`) ;
       }
       catch (e) {
           return Promise.reject(e) ;
       }


    }
    /**
     * Fetch restaurants by a cuisine type with proper error handling.
     */
    static fetchRestaurantByCuisine(cuisine, callback) {
        // Fetch all restaurants  with proper error handling
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Filter restaurants to have only given cuisine type
                const results = restaurants.filter(
                    r => r.cuisine_type == cuisine
                );
                callback(null, results);
            }
        });
    }

    /**
     * Fetch restaurants by a neighborhood with proper error handling.
     */
    static fetchRestaurantByNeighborhood(neighborhood, callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Filter restaurants to have only given neighborhood
                const results = restaurants.filter(
                    r => r.neighborhood == neighborhood
                );
                callback(null, results);
            }
        });
    }

    /**
     * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
     */
    static fetchRestaurantByCuisineAndNeighborhood(
        cuisine,
        neighborhood,
        callback
    ) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                let results = restaurants;
                if (cuisine != 'all') {
                    // filter by cuisine
                    results = results.filter(r => r.cuisine_type == cuisine);
                }
                if (neighborhood != 'all') {
                    // filter by neighborhood
                    results = results.filter(
                        r => r.neighborhood == neighborhood
                    );
                }
                callback(null, results);
            }
        });
    }

    /**
     * Fetch all neighborhoods with proper error handling.
     */
    static fetchNeighborhoods(callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Get all neighborhoods from all restaurants
                const neighborhoods = restaurants.map(
                    (v, i) => restaurants[i].neighborhood
                );
                // Remove duplicates from neighborhoods
                const uniqueNeighborhoods = neighborhoods.filter(
                    (v, i) => neighborhoods.indexOf(v) == i
                );
                callback(null, uniqueNeighborhoods);
            }
        });
    }

    /**
     * Fetch all cuisines with proper error handling.
     */
    static fetchCuisines(callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Get all cuisines from all restaurants
                const cuisines = restaurants.map(
                    (v, i) => restaurants[i].cuisine_type
                );
                // Remove duplicates from cuisines
                const uniqueCuisines = cuisines.filter(
                    (v, i) => cuisines.indexOf(v) == i
                );
                callback(null, uniqueCuisines);
            }
        });
    }

    /**
     * Restaurant page URL.
     */
    static urlForRestaurant(restaurant) {
        return `./restaurant.html?id=${restaurant.id}`;
    }

    /**
     * Restaurant image URL.
     */
    static imageUrlForRestaurant(restaurant) {
        return `/img/${restaurant.id}.jpg`;
    }

    /**
     * Map marker for a restaurant.
     */
    static mapMarkerForRestaurant(restaurant, map) {
        const marker = new google.maps.Marker({
            position: restaurant.latlng,
            title: restaurant.name,
            url: DBHelper.urlForRestaurant(restaurant),
            map: map,
            animation: google.maps.Animation.DROP
        });
        return marker;
    }
}

'use strict';

(function() {
    function toArray(arr) {
        return Array.prototype.slice.call(arr);
    }

    function promisifyRequest(request) {
        return new Promise(function(resolve, reject) {
            request.onsuccess = function() {
                resolve(request.result);
            };

            request.onerror = function() {
                reject(request.error);
            };
        });
    }

    function promisifyRequestCall(obj, method, args) {
        var request;
        var p = new Promise(function(resolve, reject) {
            request = obj[method].apply(obj, args);
            promisifyRequest(request).then(resolve, reject);
        });

        p.request = request;
        return p;
    }

    function promisifyCursorRequestCall(obj, method, args) {
        var p = promisifyRequestCall(obj, method, args);
        return p.then(function(value) {
            if (!value) return;
            return new Cursor(value, p.request);
        });
    }

    function proxyProperties(ProxyClass, targetProp, properties) {
        properties.forEach(function(prop) {
            Object.defineProperty(ProxyClass.prototype, prop, {
                get: function() {
                    return this[targetProp][prop];
                },
                set: function(val) {
                    this[targetProp][prop] = val;
                }
            });
        });
    }

    function proxyRequestMethods(ProxyClass, targetProp, Constructor, properties) {
        properties.forEach(function(prop) {
            if (!(prop in Constructor.prototype)) return;
            ProxyClass.prototype[prop] = function() {
                return promisifyRequestCall(this[targetProp], prop, arguments);
            };
        });
    }

    function proxyMethods(ProxyClass, targetProp, Constructor, properties) {
        properties.forEach(function(prop) {
            if (!(prop in Constructor.prototype)) return;
            ProxyClass.prototype[prop] = function() {
                return this[targetProp][prop].apply(this[targetProp], arguments);
            };
        });
    }

    function proxyCursorRequestMethods(ProxyClass, targetProp, Constructor, properties) {
        properties.forEach(function(prop) {
            if (!(prop in Constructor.prototype)) return;
            ProxyClass.prototype[prop] = function() {
                return promisifyCursorRequestCall(this[targetProp], prop, arguments);
            };
        });
    }

    function Index(index) {
        this._index = index;
    }

    proxyProperties(Index, '_index', [
        'name',
        'keyPath',
        'multiEntry',
        'unique'
    ]);

    proxyRequestMethods(Index, '_index', IDBIndex, [
        'get',
        'getKey',
        'getAll',
        'getAllKeys',
        'count'
    ]);

    proxyCursorRequestMethods(Index, '_index', IDBIndex, [
        'openCursor',
        'openKeyCursor'
    ]);

    function Cursor(cursor, request) {
        this._cursor = cursor;
        this._request = request;
    }

    proxyProperties(Cursor, '_cursor', [
        'direction',
        'key',
        'primaryKey',
        'value'
    ]);

    proxyRequestMethods(Cursor, '_cursor', IDBCursor, [
        'update',
        'delete'
    ]);

    // proxy 'next' methods
    ['advance', 'continue', 'continuePrimaryKey'].forEach(function(methodName) {
        if (!(methodName in IDBCursor.prototype)) return;
        Cursor.prototype[methodName] = function() {
            var cursor = this;
            var args = arguments;
            return Promise.resolve().then(function() {
                cursor._cursor[methodName].apply(cursor._cursor, args);
                return promisifyRequest(cursor._request).then(function(value) {
                    if (!value) return;
                    return new Cursor(value, cursor._request);
                });
            });
        };
    });

    function ObjectStore(store) {
        this._store = store;
    }

    ObjectStore.prototype.createIndex = function() {
        return new Index(this._store.createIndex.apply(this._store, arguments));
    };

    ObjectStore.prototype.index = function() {
        return new Index(this._store.index.apply(this._store, arguments));
    };

    proxyProperties(ObjectStore, '_store', [
        'name',
        'keyPath',
        'indexNames',
        'autoIncrement'
    ]);

    proxyRequestMethods(ObjectStore, '_store', IDBObjectStore, [
        'put',
        'add',
        'delete',
        'clear',
        'get',
        'getAll',
        'getKey',
        'getAllKeys',
        'count'
    ]);

    proxyCursorRequestMethods(ObjectStore, '_store', IDBObjectStore, [
        'openCursor',
        'openKeyCursor'
    ]);

    proxyMethods(ObjectStore, '_store', IDBObjectStore, [
        'deleteIndex'
    ]);

    function Transaction(idbTransaction) {
        this._tx = idbTransaction;
        this.complete = new Promise(function(resolve, reject) {
            idbTransaction.oncomplete = function() {
                resolve();
            };
            idbTransaction.onerror = function() {
                reject(idbTransaction.error);
            };
            idbTransaction.onabort = function() {
                reject(idbTransaction.error);
            };
        });
    }

    Transaction.prototype.objectStore = function() {
        return new ObjectStore(this._tx.objectStore.apply(this._tx, arguments));
    };

    proxyProperties(Transaction, '_tx', [
        'objectStoreNames',
        'mode'
    ]);

    proxyMethods(Transaction, '_tx', IDBTransaction, [
        'abort'
    ]);

    function UpgradeDB(db, oldVersion, transaction) {
        this._db = db;
        this.oldVersion = oldVersion;
        this.transaction = new Transaction(transaction);
    }

    UpgradeDB.prototype.createObjectStore = function() {
        return new ObjectStore(this._db.createObjectStore.apply(this._db, arguments));
    };

    proxyProperties(UpgradeDB, '_db', [
        'name',
        'version',
        'objectStoreNames'
    ]);

    proxyMethods(UpgradeDB, '_db', IDBDatabase, [
        'deleteObjectStore',
        'close'
    ]);

    function DB(db) {
        this._db = db;
    }

    DB.prototype.transaction = function() {
        return new Transaction(this._db.transaction.apply(this._db, arguments));
    };

    proxyProperties(DB, '_db', [
        'name',
        'version',
        'objectStoreNames'
    ]);

    proxyMethods(DB, '_db', IDBDatabase, [
        'close'
    ]);

    // Add cursor iterators
    // TODO: remove this once browsers do the right thing with promises
    ['openCursor', 'openKeyCursor'].forEach(function(funcName) {
        [ObjectStore, Index].forEach(function(Constructor) {
            Constructor.prototype[funcName.replace('open', 'iterate')] = function() {
                var args = toArray(arguments);
                var callback = args[args.length - 1];
                var nativeObject = this._store || this._index;
                var request = nativeObject[funcName].apply(nativeObject, args.slice(0, -1));
                request.onsuccess = function() {
                    callback(request.result);
                };
            };
        });
    });

    // polyfill getAll
    [Index, ObjectStore].forEach(function(Constructor) {
        if (Constructor.prototype.getAll) return;
        Constructor.prototype.getAll = function(query, count) {
            var instance = this;
            var items = [];

            return new Promise(function(resolve) {
                instance.iterateCursor(query, function(cursor) {
                    if (!cursor) {
                        resolve(items);
                        return;
                    }
                    items.push(cursor.value);

                    if (count !== undefined && items.length == count) {
                        resolve(items);
                        return;
                    }
                    cursor.continue();
                });
            });
        };
    });

    var exp = {
        open: function(name, version, upgradeCallback) {
            var p = promisifyRequestCall(indexedDB, 'open', [name, version]);
            var request = p.request;

            request.onupgradeneeded = function(event) {
                if (upgradeCallback) {
                    upgradeCallback(new UpgradeDB(request.result, event.oldVersion, request.transaction));
                }
            };

            return p.then(function(db) {
                return new DB(db);
            });
        },
        delete: function(name) {
            return promisifyRequestCall(indexedDB, 'deleteDatabase', [name]);
        }
    };

    if (typeof module !== 'undefined') {
        module.exports = exp;
        module.exports.default = module.exports;
    }
    else {
        self.idb = exp;
    }
}());

let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
    fetchRestaurantFromURL((error, restaurant) => {
        if (error) {
            // Got an error!
            console.error(error);
        } else {
            self.map = new google.maps.Map(document.getElementById('map'), {
                zoom: 16,
                center: restaurant.latlng,
                scrollwheel: false
            });
            fillBreadcrumb();
            DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
        }
    });
};

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = callback => {
    if (self.restaurant) {
        // restaurant already fetched!
        callback(null, self.restaurant);
        return;
    }
    const id = getParameterByName('id');
    if (!id) {
        // no id found in URL
        error = 'No restaurant id in URL';
        callback(error, null);
    } else {
        DBHelper.fetchRestaurantById(id, (error, restaurant) => {
            self.restaurant = restaurant;
            if (!restaurant) {
                console.error(error);
                return;
            }
            fillRestaurantHTML();
            callback(null, restaurant);
        });
    }
};

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
    const name = document.getElementById('restaurant-name');
    name.innerHTML = restaurant.name;

    const address = document.getElementById('restaurant-address');
    address.innerHTML = restaurant.address;

    const image = document.getElementById('restaurant-img');
    image.className = 'restaurant-img';
    image.alt = `${restaurant.name} restaurant, address ${
        restaurant.address
    }, ${restaurant.cuisine_type} cuisine`;
    image.src = DBHelper.imageUrlForRestaurant(restaurant);

    const cuisine = document.getElementById('restaurant-cuisine');
    cuisine.innerHTML = restaurant.cuisine_type;

    // fill operating hours
    if (restaurant.operating_hours) {
        fillRestaurantHoursHTML();
    }
    // fill reviews
    fillReviewsHTML();
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (
    operatingHours = self.restaurant.operating_hours
) => {
    const hours = document.getElementById('restaurant-hours');
    for (let key in operatingHours) {
        const row = document.createElement('tr');

        const day = document.createElement('td');
        day.innerHTML = key;
        row.appendChild(day);

        const time = document.createElement('td');
        time.innerHTML = operatingHours[key];
        row.appendChild(time);

        hours.appendChild(row);
    }
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
    const container = document.getElementById('reviews-container');
    const title = document.createElement('h2');
    title.innerHTML = 'Reviews';
    container.appendChild(title);

    if (!reviews) {
        const noReviews = document.createElement('p');
        noReviews.innerHTML = 'No reviews yet!';
        container.appendChild(noReviews);
        return;
    }
    const ul = document.getElementById('reviews-list');
    reviews.forEach(review => {
        ul.appendChild(createReviewHTML(review));
    });
    container.appendChild(ul);
};

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = review => {
    const li = document.createElement('li');
    const name = document.createElement('p');
    name.innerHTML = review.name;
    li.appendChild(name);

    const date = document.createElement('p');
    date.innerHTML = review.date;
    li.appendChild(date);

    const rating = document.createElement('p');
    rating.innerHTML = `Rating: ${review.rating}`;
    li.appendChild(rating);

    const comments = document.createElement('p');
    comments.innerHTML = review.comments;
    li.appendChild(comments);

    return li;
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
    const breadcrumb = document.getElementById('breadcrumb');
    const li = document.createElement('li');
    // for accessibility
    const a = document.createElement('a');
    a.href = `restaurant.html?id=${restaurant.id}`;
    a.innerHTML = restaurant.name ;
    a.setAttribute('aria-current', 'page');
    li.appendChild(a);
    breadcrumb.appendChild(li);
};

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
};
