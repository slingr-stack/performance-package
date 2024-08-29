# Overview

Repo: [https://github.com/slingr-stack/performance-package](https://github.com/slingr-stack/performance-package)

This package has utilities to evaluate and improve performance in Slingr apps. Here are some of the things available:

- Timing of processes
- Caching of data

# Configuration

No configuration needed.

# Javascript API

## Timing

The timing library allows metering how much time scripts are taking to execute. Here is an example of how to use it:

```javascript
let timing = pkg.performance.timing;
timing.clear();

timing.start('querying-data');
let orders = sys.data.find('orders', queryParams);
timing.end('querying-data');

while (orders.hasNext()) {
    let order = orders.next();
    timing.start('processing-orders');
    app.orders.process(order);
    timing.end('processing-orders', {log: false});
}
timing.log('processing-orders');
```

When you call `start(name)` the timer is started and it is ended when you call `end(name)`. By default, it will log the time when you end the timer. It will log it in the console if you are running the script from the console, or will log it in the app monitor otherwise. If you don't want to log it, you can use `end(name, {log: false)`.

Keep in mind that if you call `start` and `end` several times with the same time name, the total time will be added. You can clear a timer using `clear(name)` or clear all timers using `clear()`.

## Cache

It is possible to cache records inside an entity. This is very useful for configuration entities. For example, let's suppose you have an app with the entities `Pricing Rules` and `Items` that you read all the time in your code to do complex data processing. Going to the database to fetch these records all the time is inefficient. Instead, it would be better to cache these records and use them from the cache.

The performance package offers the `cache` library to do that. Here is an example:

```javascript
let cache = pkg.performance.cache;

cache.setDefaultIndexes('pricingRules', ['item']);

let pricingRules = cache.findAll('pricingRules');
pricingRules.forEach(pricingRule => {
    log(pricingRule.label());
});

let item = cache.findById('items', itemId);
if (item) log(item.label());

pricingRules = cache.find('pricingRules', 'item', item.id());
pricingRules.forEach(pricingRule => {
    log(pricingRule.label());
});

let itemFromQb = cache.findOne('item', 'qbId', qbId);
if (itemFromQb) log(itemFromQb.label());
```

As you can see, it is possible to define indexes in the cache using `setdefaultIndexes(entity, fields)`. This is useful if you need to find data by a specific field. Creating an index on that field will significantly improve performance. By default, the index of the `id` is always configured. You don't need to specify it manually.

You can fetch all the records in the entity using `findAll(entity)` or you can fetch only some records by using `find(entity, field, value, options)`. In this case, you can filter by a field specifying a desired value, which could be an array. The options are:

- `firstMatch`: only returns the first record that matches. It won't keep looking, which makes things more efficient.
- `sortBy`: a field to sort the result by.
- `sortType`: it can be `asc` or `desc`.

There is a shortcut to avoid using `firstMatch` which is `findOne(entity, field, value)`. This will automatically return only the first record found.

Another shortcut you can use is `findById(entity, id)`. This will find a record by its ID.

In all cases, the package will try to find the data in the cache. If the cache for that entity hasn't been loaded, it will fetch all the records from the database and build the cache. If for any reason you need to clear the cache (data was modified, for example), you can call the method `clear(entity)` that will remove the cache for that entity. If you call `clear()`, the cache for all entities will be removed.

# About Slingr

Slingr is a low-code rapid application development platform that speeds up development,
with robust architecture for integrations and executing custom workflows and automation.

[More info about Slingr](https://slingr.io)

# License

This package is licensed under the Apache License 2.0. See the `LICENSE` file for more details.
