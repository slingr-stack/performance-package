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
    let d = diff(name);
    if (typeof totals[name] === 'undefined') {
        totals[name] = 0;
    }
    totals[name] += d;
    if (typeof options.log === 'undefined' || options.log) {
        logTotal(name);
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
        startTimes[name] = null;
        endTimes[name] = null;
        totals[name] = null;
    } else {
        startTimes = {};
        endTimes = {};
        totals = {};
    }
};