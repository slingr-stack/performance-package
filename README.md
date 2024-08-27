# Overview

Repo: [https://github.com/slingr-stack/performance-package](https://github.com/slingr-stack/performance-package)

This package has utilities to evaluate and improve performance in Slingr apps. Here are some of the things available:

- Timing of processes

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

# About Slingr

Slingr is a low-code rapid application development platform that speeds up development,
with robust architecture for integrations and executing custom workflows and automation.

[More info about Slingr](https://slingr.io)

# License

This package is licensed under the Apache License 2.0. See the `LICENSE` file for more details.
