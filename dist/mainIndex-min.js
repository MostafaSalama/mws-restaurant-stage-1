class DBHelper{static get DB_NAME(){return"restaurants-db"}static get OBJECT_STORE_NAME(){return"restaurants"}static openDB(){return idb.open(DBHelper.DB_NAME,1,e=>{e.objectStoreNames.contains(DBHelper.OBJECT_STORE_NAME)||e.createObjectStore(DBHelper.OBJECT_STORE_NAME,{keyPath:"id"})})}static get DATABASE_URL(){return"http://localhost:1337/restaurants"}static async fetchRestaurants(e){try{const t=(await DBHelper.openDB()).transaction(DBHelper.OBJECT_STORE_NAME,"readwrite"),r=t.objectStore(DBHelper.OBJECT_STORE_NAME);let n=await r.getAll();if(10===n.length)return console.log("we already stored on DB"),e(null,n),t.complete.then(()=>console.log("all operations completed"));e(null,n=await DBHelper.fetchRestaurantsFromNetwork()),await DBHelper.saveRestaurantsOnDB(n)}catch(t){e(t,null)}}static async fetchRestaurantsFromNetwork(){try{const e=await window.fetch(DBHelper.DATABASE_URL);return e.ok?e.json():Promise.reject(`error returned with ${e.status} status code`)}catch(e){return Promise.reject(e)}}static async saveRestaurantsOnDB(e){const t=(await DBHelper.openDB()).transaction(DBHelper.OBJECT_STORE_NAME,"readwrite").objectStore(DBHelper.OBJECT_STORE_NAME);return e.forEach(async e=>{await t.get(e.id)||await t.add(e)})}static async fetchRestaurantById(e,t){try{const r=(await DBHelper.openDB()).transaction(DBHelper.OBJECT_STORE_NAME),n=r.objectStore(DBHelper.OBJECT_STORE_NAME);let o=await n.get(parseInt(e));if(o)return console.log("restaurant stored on DB"),t(null,o),r.complete;t(null,o=await DBHelper.fetchRestaurantFromNetwork())}catch(e){t(e,null)}}static async fetchRestaurantFromNetwork(){try{const e=DBHelper.openDB().transaction(DBHelper.OBJECT_STORE_NAME,"readwrite").objectStore(DBHelper.OBJECT_STORE_NAME),t=await fetch(`${DBHelper.DATABASE_URL}/${id}`);return t.ok?(e.add(t.json()),t.json()):Promise.reject(`error returned with status ${t.status}`)}catch(e){return Promise.reject(e)}}static fetchRestaurantByCuisine(e,t){DBHelper.fetchRestaurants((r,n)=>{if(r)t(r,null);else{const r=n.filter(t=>t.cuisine_type==e);t(null,r)}})}static fetchRestaurantByNeighborhood(e,t){DBHelper.fetchRestaurants((r,n)=>{if(r)t(r,null);else{const r=n.filter(t=>t.neighborhood==e);t(null,r)}})}static fetchRestaurantByCuisineAndNeighborhood(e,t,r){DBHelper.fetchRestaurants((n,o)=>{if(n)r(n,null);else{let n=o;"all"!=e&&(n=n.filter(t=>t.cuisine_type==e)),"all"!=t&&(n=n.filter(e=>e.neighborhood==t)),r(null,n)}})}static fetchNeighborhoods(e){DBHelper.fetchRestaurants((t,r)=>{if(t)e(t,null);else{const t=r.map((e,t)=>r[t].neighborhood),n=t.filter((e,r)=>t.indexOf(e)==r);e(null,n)}})}static fetchCuisines(e){DBHelper.fetchRestaurants((t,r)=>{if(t)e(t,null);else{const t=r.map((e,t)=>r[t].cuisine_type),n=t.filter((e,r)=>t.indexOf(e)==r);e(null,n)}})}static urlForRestaurant(e){return`./restaurant.html?id=${e.id}`}static imageUrlForRestaurant(e){return`/img/${e.id}.jpg`}static mapMarkerForRestaurant(e,t){return new google.maps.Marker({position:e.latlng,title:e.name,url:DBHelper.urlForRestaurant(e),map:t,animation:google.maps.Animation.DROP})}}let restaurants,neighborhoods,cuisines;var map;!function(){function e(e){return new Promise(function(t,r){e.onsuccess=function(){t(e.result)},e.onerror=function(){r(e.error)}})}function t(t,r,n){var o,s=new Promise(function(s,a){e(o=t[r].apply(t,n)).then(s,a)});return s.request=o,s}function r(e,t,r){r.forEach(function(r){Object.defineProperty(e.prototype,r,{get:function(){return this[t][r]},set:function(e){this[t][r]=e}})})}function n(e,r,n,o){o.forEach(function(o){o in n.prototype&&(e.prototype[o]=function(){return t(this[r],o,arguments)})})}function o(e,t,r,n){n.forEach(function(n){n in r.prototype&&(e.prototype[n]=function(){return this[t][n].apply(this[t],arguments)})})}function s(e,r,n,o){o.forEach(function(o){o in n.prototype&&(e.prototype[o]=function(){return e=this[r],(n=t(e,o,arguments)).then(function(e){if(e)return new i(e,n.request)});var e,n})})}function a(e){this._index=e}function i(e,t){this._cursor=e,this._request=t}function c(e){this._store=e}function u(e){this._tx=e,this.complete=new Promise(function(t,r){e.oncomplete=function(){t()},e.onerror=function(){r(e.error)},e.onabort=function(){r(e.error)}})}function l(e,t,r){this._db=e,this.oldVersion=t,this.transaction=new u(r)}function p(e){this._db=e}r(a,"_index",["name","keyPath","multiEntry","unique"]),n(a,"_index",IDBIndex,["get","getKey","getAll","getAllKeys","count"]),s(a,"_index",IDBIndex,["openCursor","openKeyCursor"]),r(i,"_cursor",["direction","key","primaryKey","value"]),n(i,"_cursor",IDBCursor,["update","delete"]),["advance","continue","continuePrimaryKey"].forEach(function(t){t in IDBCursor.prototype&&(i.prototype[t]=function(){var r=this,n=arguments;return Promise.resolve().then(function(){return r._cursor[t].apply(r._cursor,n),e(r._request).then(function(e){if(e)return new i(e,r._request)})})})}),c.prototype.createIndex=function(){return new a(this._store.createIndex.apply(this._store,arguments))},c.prototype.index=function(){return new a(this._store.index.apply(this._store,arguments))},r(c,"_store",["name","keyPath","indexNames","autoIncrement"]),n(c,"_store",IDBObjectStore,["put","add","delete","clear","get","getAll","getKey","getAllKeys","count"]),s(c,"_store",IDBObjectStore,["openCursor","openKeyCursor"]),o(c,"_store",IDBObjectStore,["deleteIndex"]),u.prototype.objectStore=function(){return new c(this._tx.objectStore.apply(this._tx,arguments))},r(u,"_tx",["objectStoreNames","mode"]),o(u,"_tx",IDBTransaction,["abort"]),l.prototype.createObjectStore=function(){return new c(this._db.createObjectStore.apply(this._db,arguments))},r(l,"_db",["name","version","objectStoreNames"]),o(l,"_db",IDBDatabase,["deleteObjectStore","close"]),p.prototype.transaction=function(){return new u(this._db.transaction.apply(this._db,arguments))},r(p,"_db",["name","version","objectStoreNames"]),o(p,"_db",IDBDatabase,["close"]),["openCursor","openKeyCursor"].forEach(function(e){[c,a].forEach(function(t){t.prototype[e.replace("open","iterate")]=function(){var t,r=(t=arguments,Array.prototype.slice.call(t)),n=r[r.length-1],o=this._store||this._index,s=o[e].apply(o,r.slice(0,-1));s.onsuccess=function(){n(s.result)}}})}),[a,c].forEach(function(e){e.prototype.getAll||(e.prototype.getAll=function(e,t){var r=this,n=[];return new Promise(function(o){r.iterateCursor(e,function(e){e?(n.push(e.value),void 0===t||n.length!=t?e.continue():o(n)):o(n)})})})});var d={open:function(e,r,n){var o=t(indexedDB,"open",[e,r]),s=o.request;return s.onupgradeneeded=function(e){n&&n(new l(s.result,e.oldVersion,s.transaction))},o.then(function(e){return new p(e)})},delete:function(e){return t(indexedDB,"deleteDatabase",[e])}};"undefined"!=typeof module?(module.exports=d,module.exports.default=module.exports):self.idb=d}();var markers=[];document.addEventListener("DOMContentLoaded",e=>{fetchNeighborhoods(),fetchCuisines(),registerServiceWorker()});const registerServiceWorker=()=>{"serviceWorker"in navigator&&navigator.serviceWorker.register("./sw.js").then(e=>{console.log("successful register the service worker")})};fetchNeighborhoods=(()=>{DBHelper.fetchNeighborhoods((e,t)=>{e?console.error(e):(self.neighborhoods=t,fillNeighborhoodsHTML())})}),fillNeighborhoodsHTML=((e=self.neighborhoods)=>{const t=document.getElementById("neighborhoods-select");e.forEach(e=>{const r=document.createElement("option");r.innerHTML=e,r.value=e,t.append(r)})}),fetchCuisines=(()=>{DBHelper.fetchCuisines((e,t)=>{e?console.error(e):(self.cuisines=t,fillCuisinesHTML())})}),fillCuisinesHTML=((e=self.cuisines)=>{const t=document.getElementById("cuisines-select");e.forEach(e=>{const r=document.createElement("option");r.innerHTML=e,r.value=e,t.append(r)})}),window.initMap=(()=>{self.map=new google.maps.Map(document.getElementById("map"),{zoom:12,center:{lat:40.722216,lng:-73.987501},scrollwheel:!1}),updateRestaurants()}),updateRestaurants=(()=>{const e=document.getElementById("cuisines-select"),t=document.getElementById("neighborhoods-select"),r=e.selectedIndex,n=t.selectedIndex,o=e[r].value,s=t[n].value;DBHelper.fetchRestaurantByCuisineAndNeighborhood(o,s,(e,t)=>{e?console.error(e):(resetRestaurants(t),fillRestaurantsHTML())})}),resetRestaurants=(e=>{self.restaurants=[],document.getElementById("restaurants-list").innerHTML="",self.markers.forEach(e=>e.setMap(null)),self.markers=[],self.restaurants=e}),fillRestaurantsHTML=((e=self.restaurants)=>{const t=document.getElementById("restaurants-list");e.forEach(e=>{t.append(createRestaurantHTML(e))}),addMarkersToMap()}),createRestaurantHTML=(e=>{const t=document.createElement("li"),r=document.createElement("img");r.className="restaurant-img",r.alt=`${e.name} restaurant, address ${e.address}, ${e.cuisine_type} cuisine`,r.src=DBHelper.imageUrlForRestaurant(e),t.append(r);const n=document.createElement("h1");n.innerHTML=e.name,t.append(n);const o=document.createElement("p");o.innerHTML=e.neighborhood,t.append(o);const s=document.createElement("p");s.innerHTML=e.address,t.append(s);const a=document.createElement("a");return a.innerHTML="View Details",a.href=DBHelper.urlForRestaurant(e),t.append(a),t}),addMarkersToMap=((e=self.restaurants)=>{e.forEach(e=>{const t=DBHelper.mapMarkerForRestaurant(e,self.map);google.maps.event.addListener(t,"click",()=>{window.location.href=t.url}),self.markers.push(t)})});