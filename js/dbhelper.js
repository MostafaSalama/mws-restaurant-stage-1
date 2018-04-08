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
