class Client
  constructor: (@endpoint) ->
    @sequence = 0
    @promises = {}

  onmessage: (message) ->
    {id, result, error} = JSON.parse(message.data)
    if error?
      @promises[id].smash(error)
    else
      @promises[id].fulfill(result)

  connect: (promise) ->
    @socket = new WebSocket(@endpoint)
    @socket.onopen = -> promise.fulfill(null)
    @socket.onerror = -> promise.smash(null)
    @socket.onclose = -> promise.smash(null)
    @socket.onmessage = (message) => @onmessage(message)

  close: ->
    @socket.close()

  connected: ->
    @socket.readyState is 1

  send: (object, receiver, method, args) ->
    @promises[object.id] = object.promise
    @socket.send JSON.stringify
      id: object.id
      receiver: receiver
      method: method
      args: args


class RemoteObject
  constructor: (@client) ->
    @id = @client.sequence++
    @createPromise()

  send: (method, args...) ->
    @remoteCall(method, args)

  remoteCall: (method, args) ->
    @createObject args, (object) => @client.send(object, @value, method, args)

  returned: (callback) ->
    @callback = callback

  collectPromises: (object) ->
    remotes = []
    if Array.isArray object
      remotes = remotes.concat(@collectPromises(member)) for member in object
    else if object.constructor is RemoteObject
      remotes.push(object.promise)
    else if object.constructor is Object
      remotes = remotes.concat(@collectPromises(value)) for key, value of object
    remotes

  createObject: (values, callback) ->
    object = new RemoteObject(@client)
    join_promises(@collectPromises(values).concat(@promise)).when -> callback(object)
    object

  createPromise: ->
    @promise = make_promise()
    @promise.when (value) =>
      @value = value
      @callback(@) if @callback
    @promise.fail (error) =>
      @error = error
      @callback(@) if @callback

  toString: ->
    if @value?["_ref"]
      "[object #{@value["_class"] || "(Class)"}:#{@value["_ref"]}>"
    else
      JSON.stringify(@value)

  toJSON: ->
    throw new Error("Object not complete") unless @value?
    @value


class Service extends RemoteObject
  constructor: (@client) ->
    super
    @client.connect(@promise)

  connect: ->
    @createPromise()
    @client.connect(@promise)
    @

  close: ->
    @client.close()

  connected: ->
    @client.connected()

  object: (value) ->
    @createObject value, (object) => object.promise.fulfill(value)

Service.connect = (endpoint, callback) ->
  new Service(new Client(endpoint))


# Export the service.
window["WebRocket"] = Service
Service["connect"] = Service.connect
Service.prototype["connect"] = Service.prototype.connect
Service.prototype["close"] = Service.prototype.close
Service.prototype["connected"] = Service.prototype.connected
Service.prototype["object"] = Service.prototype.object
RemoteObject.prototype["send"] = RemoteObject.prototype.send
RemoteObject.prototype["returned"] = RemoteObject.prototype.returned
RemoteObject.prototype["toJSON"] = RemoteObject.prototype.toJSON
RemoteObject.prototype["__noSuchMethod__"] = RemoteObject.prototype.remoteCall
