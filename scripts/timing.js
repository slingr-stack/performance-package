let startTimes = {}, endTimes = {}, totals = {};

exports.diff = function(name) {
    return (endTimes[name].getTime()-startTimes[name].getTime())/1000;
};

exports.start = function(name) {
    startTimes[name] = new Date();
};

exports.end = function(name, options) {
    options = options || {};
    endTimes[name] = new Date();
    let d = pkg.performance.timing.diff(name);
    if (typeof totals[name] === 'undefined') {
        totals[name] = 0;
    }
    totals[name] += d;
    if (typeof options.log === 'undefined' || options.log) {
        pkg.performance.timing.log(name);
    }
};

exports.log = function(name) {
    if (typeof log == 'function') {
        log(name+': '+totals[name]);
    } else {
        sys.logs.debug(name + ': ' + totals[name]);
    }
};

exports.clear = function(name) {
    if (name) {
        delete startTimes[name];
        delete endTimes[name];
        delete totals[name];
    } else {
        startTimes = {};
        endTimes = {};
        totals = {};
    }
};