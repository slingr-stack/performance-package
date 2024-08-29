let _cache = {};
let _defaultIndexes = {};

exports.getCache = function() {
    return _cache;
};

exports.clearCache = function(entity) {
    if (entity) {
        _cache[entity] = null;
    } else {
        _cache = {};
    }
};

exports.setDefaultIndexes = function(entity, fields) {
    _defaultIndexes[entity] = fields;
}

exports.loadCache = function(entity, indexes) {
    let extractKeyValue = function(value) {
        if (typeof value == 'object' && value.id) {
            return value.id;
        }
        return value;
    };
    // we always have the id as an index
    if (!indexes && indexes.length === 0) {
        indexes = ['id'];
    } else if (indexes && !indexes.includes('id')) {
        indexes.push('id');
    }
    let lockKey = 'loadCache-'+entity;
    if (sys.utils.concurrency.tryLock(lockKey, 1)) {
        try {
            if (_cache[entity]) {
                pkg.performance.cache.clearCache(entity);
            }
            _cache[entity] = {
                items: [],
                indexes: {}
            };
            let records = sys.data.find(entity, {});
            while (records.hasNext()) {
                let record = records.next();
                _cache[entity].items.push(record);
                if (indexes) {
                    indexes.forEach(index => {
                        if (!_cache[entity].indexes[index]) {
                            _cache[entity].indexes[index] = {};
                        }
                        let value;
                        switch (index) {
                            case 'id': value = record.id(); break;
                            case 'label': value = record.label(); break;
                            default: value = record.field(index).val();
                        }
                        if (Array.isArray(value)) {
                            value.forEach(v => {
                                v = extractKeyValue(v);
                                if (!_cache[entity].indexes[index][v]) {
                                    _cache[entity].indexes[index][v] = [];
                                }
                                _cache[entity].indexes[index][v].push(record);
                            });
                        } else {
                            value = extractKeyValue(value);
                            if (!_cache[entity].indexes[index][value]) {
                                _cache[entity].indexes[index][value] = [];
                            }
                            _cache[entity].indexes[index][value].push(record);
                        }
                    });
                }
            }
        } finally {
            sys.utils.concurrency.unlock(lockKey);
        }
    }
};

exports.findAll = function(entity, options) {
    let res = [];
    options = options || {};
    if (!_cache[entity]) {
        // not cached yet, we will do it now
        pkg.performance.cache.loadCache(entity, _defaultIndexes[entity]);
    }
    let cacheData = _cache[entity];
    res = cacheData.items;
    if (options.sortBy) {
        res.sort((a, b) => {
            const fieldA = a.field(options.sortBy).val();
            const fieldB = b.field(options.sortBy).val();
            if (!options.sortType || options.sortType === "asc") {
                return compareValues(fieldA, fieldB);
            } else if (options.sortType === "desc") {
                return compareValues(fieldB, fieldA);
            }
        });
    }
    return res;
};

exports.find = function(entity, field, value, options) {
    let res = [];
    options = options || {};
    if (!_cache[entity]) {
        // not cached yet, we will do it now
        pkg.performance.cache.loadCache(entity, _defaultIndexes[entity]);
    }
    let cacheData = _cache[entity];
    if (cacheData.indexes[field]) {
        // find using indexes
        if (Array.isArray(value)) {
            for (let i in value) {
                if (cacheData.indexes[field][value[i]]) {
                    res = res.concat(cacheData.indexes[field][value[i]]);
                    if (options.firstMatch && res.length > 0) {
                        return res;
                    }
                }
            }
        } else if (cacheData.indexes[field][value]) {
            res = res.concat(cacheData.indexes[field][value]);
            if (options.firstMatch && res.length > 0) {
                return res;
            }
        }
    } else {
        // scan all values
        cacheData.items.forEach(item => {
            if (Array.isArray(value)) {
                for (let i in value) {
                    if (item.field(field).equals(value[i])) {
                        res.push(item);
                        if (options.firstMatch) {
                            return res;
                        }
                        break;
                    }
                }
            } else if (item.field(field).equals(value)) {
                res.push(item);
                if (options.firstMatch) {
                    return res;
                }
            }
        });
    }
    if (options.sortBy) {
        res.sort((a, b) => {
            const fieldA = a.field(options.sortBy).val();
            const fieldB = b.field(options.sortBy).val();
            if (!options.sortType || options.sortType === "asc") {
                return compareValues(fieldA, fieldB);
            } else if (options.sortType === "desc") {
                return compareValues(fieldB, fieldA);
            }
        });
    }
    return res;
};

exports.findOne = function(entity, field, value) {
    let res = pkg.performance.cache.find(entity, field, value, {firstMatch: true});
    if (res.length > 0) {
        return res[0];
    }
    return null;
};

exports.findById = function(entity, id) {
    let res = pkg.performance.cache.find(entity, 'id', id, {firstMatch: true});
    if (res.length > 0) {
        return res[0];
    }
    return null;
};

function compareValues(a, b) {
    if (typeof a === "string" || a instanceof String) {
        return a.localeCompare(b);
    } else if (a instanceof Date && b instanceof Date) {
        return a.getTime() - b.getTime();
    } else {
        return a - b;
    }
}