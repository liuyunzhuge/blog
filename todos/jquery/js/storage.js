var Storage = (function () {
    var key = 'todos-app',
        create = function (storage) {
            var _storage = {};

            var mod = {
                init: function () {
                    var storageStr = storage.getItem(key);
                    if (storageStr) {
                        _storage = JSON.parse(storageStr);
                    }
                },
                _save: function () {
                    storage.setItem(key, JSON.stringify(_storage));
                },
                put: function (prop, data) {
                    _storage[prop] = data;
                    this._save();
                },
                get: function (prop) {
                    return _storage[prop];
                },
                remove: function (prop) {
                    delete _storage[prop];
                    this._save();
                },
                destroy: function () {
                    storage.removeItem(key)
                }
            };

            mod.init();

            return mod;
        };

    return {
        init: function () {
            this.session = create(sessionStorage);
            this.local = create(localStorage);

            return this;
        }
    }
})().init();
