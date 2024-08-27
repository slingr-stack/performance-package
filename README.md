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
timing.logTotal('querying-data');

while (orders.hasNext()) {
    let order = orders.next();
    timing.start('processing-orders');
    app.orders.process(order);
    timing.end('processing-orders');
}
timing.logTotal('processing-orders');
```

When you call `start(timerName)` the timer is started and it is ended when you call `end(timerName)`. You can log the total time using `logTotal(timerName)`. It will log into the console if you are running it in the console or will log it in the monitor otherwise.

Keep in mind that if you call `start` and `end` several times with the same time name, the total time will be added. You can clear a timer using `clear(timerName)` or clear all timers using `clear()`.

# About Slingr

Slingr is a low-code rapid application development platform that speeds up development,
with robust architecture for integrations and executing custom workflows and automation.

[More info about Slingr](https://slingr.io)

# License

This package is licensed under the Apache License 2.0. See the `LICENSE` file for more details.
