(function() {
  var Client, RemoteObject, Service;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __slice = Array.prototype.slice, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  Client = (function() {
    function Client(endpoint) {
      this.endpoint = endpoint;
      this.sequence = 0;
      this.promises = {};
    }
    Client.prototype.onmessage = function(message) {
      var error, id, result, _ref;
      _ref = JSON.parse(message.data), id = _ref.id, result = _ref.result, error = _ref.error;
      if (error != null) {
        return this.promises[id].smash(error);
      } else {
        return this.promises[id].fulfill(result);
      }
    };
    Client.prototype.connect = function(promise) {
      this.socket = new WebSocket(this.endpoint);
      this.socket.onopen = function() {
        return promise.fulfill(null);
      };
      this.socket.onerror = function() {
        return promise.smash(null);
      };
      this.socket.onclose = function() {
        return promise.smash(null);
      };
      return this.socket.onmessage = __bind(function(message) {
        return this.onmessage(message);
      }, this);
    };
    Client.prototype.close = function() {
      return this.socket.close();
    };
    Client.prototype.connected = function() {
      return this.socket.readyState === 1;
    };
    Client.prototype.send = function(object, receiver, method, args) {
      this.promises[object.id] = object.promise;
      return this.socket.send(JSON.stringify({
        id: object.id,
        receiver: receiver,
        method: method,
        args: args
      }));
    };
    return Client;
  })();
  RemoteObject = (function() {
    function RemoteObject(client) {
      this.client = client;
      this.id = this.client.sequence++;
      this.createPromise();
    }
    RemoteObject.prototype.send = function() {
      var args, method;
      method = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      return this.remoteCall(method, args);
    };
    RemoteObject.prototype.remoteCall = function(method, args) {
      return this.createObject(args, __bind(function(object) {
        return this.client.send(object, this.value, method, args);
      }, this));
    };
    RemoteObject.prototype.returned = function(callback) {
      return this.callback = callback;
    };
    RemoteObject.prototype.collectPromises = function(object) {
      var key, member, remotes, value, _i, _len;
      remotes = [];
      if (Array.isArray(object)) {
        for (_i = 0, _len = object.length; _i < _len; _i++) {
          member = object[_i];
          remotes = remotes.concat(this.collectPromises(member));
        }
      } else if (object.constructor === RemoteObject) {
        remotes.push(object.promise);
      } else if (object.constructor === Object) {
        for (key in object) {
          value = object[key];
          remotes = remotes.concat(this.collectPromises(value));
        }
      }
      return remotes;
    };
    RemoteObject.prototype.createObject = function(values, callback) {
      var object;
      object = new RemoteObject(this.client);
      join_promises(this.collectPromises(values).concat(this.promise)).when(function() {
        return callback(object);
      });
      return object;
    };
    RemoteObject.prototype.createPromise = function() {
      this.promise = make_promise();
      this.promise.when(__bind(function(value) {
        this.value = value;
        if (this.callback) {
          return this.callback(this);
        }
      }, this));
      return this.promise.fail(__bind(function(error) {
        this.error = error;
        if (this.callback) {
          return this.callback(this);
        }
      }, this));
    };
    RemoteObject.prototype.toString = function() {
      var _ref;
      if ((_ref = this.value) != null ? _ref["_ref"] : void 0) {
        return "[object " + (this.value["_class"] || "(Class)") + ":" + this.value["_ref"] + ">";
      } else {
        return JSON.stringify(this.value);
      }
    };
    RemoteObject.prototype.toJSON = function() {
      if (this.value == null) {
        throw new Error("Object not complete");
      }
      return this.value;
    };
    return RemoteObject;
  })();
  Service = (function() {
    __extends(Service, RemoteObject);
    function Service(client) {
      this.client = client;
      Service.__super__.constructor.apply(this, arguments);
      this.client.connect(this.promise);
    }
    Service.prototype.connect = function() {
      this.createPromise();
      this.client.connect(this.promise);
      return this;
    };
    Service.prototype.close = function() {
      return this.client.close();
    };
    Service.prototype.connected = function() {
      return this.client.connected();
    };
    Service.prototype.object = function(value) {
      return this.createObject(value, __bind(function(object) {
        return object.promise.fulfill(value);
      }, this));
    };
    return Service;
  })();
  Service.connect = function(endpoint, callback) {
    return new Service(new Client(endpoint));
  };
  window["Brocket"] = Service;
  Service["connect"] = Service.connect;
  Service.prototype["connect"] = Service.prototype.connect;
  Service.prototype["close"] = Service.prototype.close;
  Service.prototype["connected"] = Service.prototype.connected;
  Service.prototype["object"] = Service.prototype.object;
  RemoteObject.prototype["send"] = RemoteObject.prototype.send;
  RemoteObject.prototype["returned"] = RemoteObject.prototype.returned;
  RemoteObject.prototype["toJSON"] = RemoteObject.prototype.toJSON;
  RemoteObject.prototype["__noSuchMethod__"] = RemoteObject.prototype.remoteCall;
}).call(this);
