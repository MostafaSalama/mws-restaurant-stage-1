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
    static fetchRestaurants(callback) {
        //fetching the data with fetch API
        const my_db = DBHelper.openDB();
        my_db
            .then(db => {
                const tx = db.transaction(
                    DBHelper.OBJECT_STORE_NAME,
                    'readwrite'
                );
                const restaurantsStore = tx.objectStore(
                    DBHelper.OBJECT_STORE_NAME
                );
                // check if all restaurants exist
                restaurantsStore.count().then(numOfRecords => {
                    // all data already exist
                    if (numOfRecords === 10) {
                        restaurantsStore
                            .getAll()
                            .then(restaurants => {
                                callback(null, restaurants);
                            })
                            .catch(error => {
                                callback(error.message, null);
                            });
                        return;
                    }
                    // fetch if the  restaurants not complete
                    DBHelper.fetchRestaurantsFromNetwork(
                        restaurantsStore,
                        callback
                    );
                });
                return tx.complete;
            })
            .then(() => console.log('all operations completed'));
    }
    // fetch restaurants data from network
    static fetchRestaurantsFromNetwork(store, callback) {
        fetch(DBHelper.DATABASE_URL)
            .then(response => {
                // response with the data
                if (response.ok) {
                    return response.json();
                }
                return Promise.reject(
                    `error , returned with status code of ${response.status}`
                );
            })
            .then(restaurants => {
                callback(null, restaurants);
                DBHelper.saveRestaurantsOnDB(store, restaurants);
            })
            .catch(error => {
                callback(error, null);
            });
    }

    /**
     * store restaurants on DB Store
     * @param store {IDBObjectStore} store to store data on it
     * @param restaurants  array of all restaurants to store in DB
     */
    static saveRestaurantsOnDB(store, restaurants) {
        restaurants.forEach(restaurant => {
            // check if values already exist
            store.get(restaurant.id).then(value => {
                if (value) return;
                store.add(restaurant);
            });
        });
    }

    /**
     * Fetch a restaurant by its ID.
     */
    static fetchRestaurantById(id, callback) {
        // fetch all restaurants with proper error handling.
        this.openDB().then(db => {
            const tx = db.transaction(DBHelper.OBJECT_STORE_NAME);
            const restaurantsStore = tx.objectStore(DBHelper.OBJECT_STORE_NAME);
            console.log(restaurantsStore);
            // the passed id is string so we parse it Int
            restaurantsStore
                .get(parseInt(id))
                .then(restaurant => {
                    // already on db
                    if (restaurant) {
                        console.log('found the restaurant');
                        callback(null, restaurant);
                        return;
                    }
                    //fetching form server if not exist
                    DBHelper.fetchRestaurantFromNetwork(
                        restaurantsStore,
                        tx,
                        id,
                        callback
                    );
                })
                .catch(error => {
                    callback(error, null);
                });
            tx.complete;
        });
    }
    // fetch restaurant with specified Id form network
    static fetchRestaurantFromNetwork(store, tx, id, callback) {
        fetch(`${DBHelper.DATABASE_URL}/${id}`)
            .then(res => {
                if (res.ok) return res.json();
                return Promise.reject(`error no restaurant with ${id} id `);
            })
            .then(restaurant => {
                callback(null, restaurant);
                store.add(restaurant);
            })
            .catch(error => callback(error, restaurant));
        return tx.complete;
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
