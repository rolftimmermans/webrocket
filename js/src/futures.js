/** @const */
var UNRESOLVED = 0;

/** @const */
var FULFILLED = 1;

/** @const */
var SMASHED = 2;

/**
 * Create a chainable promise
 */
function make_promise(guarantee) {
  var status = UNRESOLVED,
      outcome,
      waiting = [],
      dreading = [],
      passable,
      result;

  function vouch(deed, func) {
    switch (status) {
    case UNRESOLVED:
      (deed === FULFILLED ? waiting : dreading).push(func);
      break;
    case deed:
      func(outcome);
      break;
    }
  };

  function resolve(deed, value) {
    status = deed;
    outcome = value;
    (deed == FULFILLED ? waiting : dreading).forEach(function (func) {
      func.apply(func, outcome);
    });
    waiting = null;
    dreading = null;
  };

  passable = {
    when: function (f) {
      result.when(f);
      return this;
    },
    fail: function (f) {
      result.fail(f);
      return this;
    }
  };

  result = {
    when: function (func) {
      vouch(FULFILLED, func);
      return this;
    },
    fail: function (func) {
      vouch(SMASHED, func);
      return this;
    },
    fulfill: function () {
      var args = Array.prototype.slice.call(arguments);
      resolve(FULFILLED, args);
      return passable;
    },
    smash: function () {
      var args = Array.prototype.slice.call(arguments);
      resolve(SMASHED, args);
      return passable;
    },
    status: function () {
      return status;
    },
    passable: function () {
      return passable;
    }
  };

  if (undefined !== guarantee) {
    return result.fulfill(guarantee);
  }
  return result;
};

/**
 * Join any number of promises and return the results in the order they were passed in.
 *
 * p_all = join_promises([p1, p2, p3]);
 * p_all.when(function(d_arr){
 *   var d1 = d_arr[0],
 *     d2 = d_arr[1],
 *     d3 = d_arr[2];
 * });
 *
 * TODO add options, such as timeout
 * TODO notify the user which promise failed when smashed?
 * TODO treat a hash of promises as an array
 *
 * @param promises - an Array of Promises
 * @param params - an Object hash
 * @param args - any number of Promises, and perhaps an object hash
 * @return A promise which is fulfilled only if and when all other parameter promises are fulfilled.
 */
function join_promises (promises, params) {
  var p = make_promise(),
    num = 0,
    ps = [],
    success = true,
    use_array;

  // The user may pass in an array - from a loop for example
  if (Array.isArray(promises)) {
    use_array = true;
  } else {
    // or the user may pass in arguments
    promises = Array.prototype.slice.call(arguments);
    // TODO what if the last argument is params?
  }

  num = promises.length;

  function partial(data, i, status) {
    success = success && status;
    ps[i] = data;
    num -= 1;
    if (0 === num) {
      if (use_array) {
        (success ? p.fulfill.call(p.fulfill, ps) : p.smash.call(p.smash, ps));
      } else {
        (success ? p.fulfill.apply(p.fulfill, ps) : p.smash.apply(p.smash, ps));
      }
    }
  }

  promises.forEach(function (el, i, arr) {
    // increase the array to the appropriate size
    ps.push(undefined);
    el.when(function (data) {
      partial(data, i, true);
    });
    el.fail(function (data) {
      partial(data, i, false);
    });
  });
  return p;
}

  /**
   * Convert a function which a callback / errback to a promise
   *
   * func is function which accepts any number of arguments
   * params is a hash which describes which number argument
   *   maps to replacements for when and fail
   *
   *  func = function(arg1, arg2, callback, errback) { do_stuff() }
   *
   *  params = {
   *    when : 2, // third argument
   *    fail : 3, // fourth argument
   *    timeout : 5000, // 5 seconds
   *    error : param // param to pass to fails
   *  };
   *
   */
  function promisify(func, params) {
    return function () {
      var args = Array.prototype.slice.call(arguments),
      //args = _.toArray(arguments).slice(0), // the underscore.js way
      p = make_promise(),
      timeout,
      retval,
      result;

      if ("custom" === params) {
        // TODO this was a dumb idea... remove it once I confirm that
        func = func(p.fulfill, p.smash);
        //func = func(p); // not as dumb
      } else if (params) {

        // If you provide a timeout, it will smash the promise
        if (undefined !== params['timeout']) {
          timeout = setTimeout(function(){
            p.smash(params['error'] || "Timed Out");
          }, params['timeout']);
        }

        // If the function has an errback, replace it with smash
        if (undefined !== params['fail']) {
          if (args[params['fail']]) {
            p.fail(args[params['fail']]);
          }
          args[params['fail']] = p.smash;
        }

        // If the function has a callback, replace it with when
        if (undefined !== params['when']) {
          if (args[params['when']]) {
            p.when(args[params['when']]);
          }
          args[params['when']] = p.fulfill;
          if (undefined !== params['timeout']) {
            p.when(function(){
              clearTimeout(timeout)
            });
          }
        }
      }

      retval = func.apply(func, args);
      result = p.passable();
      result.withResult = function(func) {
        return func(retval);
      };
      return result;
    };
  }

  /**
   * Wraps a promisable function such that each time it fires
   * 'fulfill', '.when'ers get it once and '.subscribe'rs get it each time
   */
  function subscribify(promisable, params) {
    // TODO Four modes
    //    Order doesn't matter and fire all
    //    Order doesn't matter and wait for failure / timeout before firing again
    //    Order matters and drop stale
    //    Order matters and wait
    var callbacks = {},
    errbacks = {},
    live_promise,
    no_conflict = false,
    noConflict,
    s = make_subscription();


    // Assume that it is promisable unless params say otherwise
    if ('function' !== typeof promisable.when) {
      if (undefined == params) {
        error("You tried to subscribify a non-promisable without parameters to tell how to promisifiy it.");
      }
      promisable = promisify(promisable, params);
    }


    // Passes back a promise that changes each
    // time the subscribable is called
    noConflict = function (pass_me_the_no_conflict_subscription) {
      no_conflict = true;
      pass_me_the_no_conflict_subscription({
        subscribe : function (func) {
          s.subscribe(func);
          return this;
        },
        when : function(func) {
          live_promise.when(func);
          return this;
        },
        fail : function(func) {
          live_promise.fail(func);
          return this;
        },
        reConflict: function () {
          no_conflict = false;
        }
      });
      return subscribable;
    }


    // Each time this function is called it uses the same
    // a new promise with the same subscription
    function subscribable() {
      var args = Array.prototype.slice.call(arguments),
      p,
      original_result,
      result;
      // TODO "this" needs to be the same as the original
      // maybe add it as a property?
      live_promise = promisable.apply(promisable, args);
      p = live_promise;
      p.withResult(function (r) {
        original_result = r;
      });
      p.when(s.deliver);
      p.fail(s.hold);
      result = {
        when: function(func) {
          p.when(func);
          return this;
        },
        fail: function(func) {
          p.fail(func);
          return this;
        }
      }
      return (no_conflict ? original_result : result);
    }
    subscribable.subscribe = s.subscribe;
    subscribable.noConflict = noConflict;
    return subscribable;
  }









/*
 * Make Subscription
 * This varies from a promise in that it can be FULFILLED multiple times
 */
function make_subscription() {
  var status = UNRESOLVED,
      outcome,
      waiting = [],
      dreading = [],
      result;

  function vouch(deed, func) {
    switch (status) {
    case UNRESOLVED:
      (deed === FULFILLED ? waiting : dreading).push(func);
      break;
    case deed:
      func(outcome);
      break;
    }
  };

  function resolve(deed, value) {
    status = deed;
    outcome = value;
    (deed == FULFILLED ? waiting : dreading).forEach(function (func) {
      func.apply(func, outcome);
    });
  };

  result = {
    subscribe: function (func) {
      vouch(FULFILLED, func);
    },
    miss: function (func) {
      vouch(SMASHED, func);
    },
    deliver: function () {
      var args = Array.prototype.slice.call(arguments);
      resolve(FULFILLED, args);
    },
    hold: function () {
      var args = Array.prototype.slice.call(arguments);
      resolve(SMASHED, args);
    },
    status: function () {
      return status;
    }
  };

  result.passable = function () {
    return {
      when: function (f) {
        result.when(f);
        return this;
      },
      fail: function (f) {
        result.fail(f);
        return this;
      }
    };
  }

  return result;
};



/*
 * Synchronize subscriptions such that when all have updated the delivery fires.
 *
 * TODO should each failure trigger as it currently does?
 *  it may be easier for the user to watch each subscription
 *  for a failure individually.
 * TODO if the user doesn't use an array, still grab params
 */
function join_subscriptions (subscriptions, params) {
  var s = make_subscription(),
    wait_for = 0,
    deliveries = [],
    ready = [],
    use_array = false,
    x = 0;

  if (Array.isArray(subscriptions)) {
    use_array = true;
  } else {
    subscriptions = Array.prototype.slice.call(arguments);
  }
  wait_for = subscriptions.length;

  function partial(data, i, status) {
    deliveries[i] = data;
    if (false === status) {
      (use_array ? s.hold.call(s.hold, deliveries) : s.hold.apply(s.hold, deliveries));
      return;
    }
    if (undefined === ready[i]) {
      wait_for -= 1;
    }
    ready[i] = (new Date()).valueOf();
    if (0 === wait_for) {
      ready.forEach(function (item, i, arr) {
        ready[i] = undefined;
        wait_for = subscriptions.length;
      });
      (use_array ? s.deliver.call(s.hold, deliveries) : s.deliver.apply(s.hold, deliveries));
    }
  }

  // i substitutes as a unique token to identify
  // the subscription
  subscriptions.forEach(function (el, i, arr) {
    // increase the array to the appropriate size
    // for use in partial above
    deliveries.push(undefined);
    ready.push(undefined);
    el.subscribe(function (data) {
      partial(data, i, true);
    });
    // Hmm... difficult to say how to
    // handle a failure case such as this
    el.miss(function (data) {
      partial(data, i, false);
    });
  });
  return s;
}
