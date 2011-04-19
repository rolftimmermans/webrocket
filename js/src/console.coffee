class Console
  constructor: (element) ->
    document.addEventListener "DOMContentLoaded", =>
      @element = if element? then document.getElementById(element) else document.body
      @service = WebRocket.connect("ws://localhost:9003")
      @createConsole()
      @element.parentElement.addEventListener "click", => @focusPrompt()
    , false

  createConsole: ->
    @historySequence = @sequence = 0
    @history = []
    @element.innerHTML = '<div class="console"><div id="console-messages" class="console-messages"></div>' +
      '<div class="console-tail"><div id="console-prompt" spellcheck="false" class="source-code console-prompt"></div></div></div>'
    @messages = document.getElementById("console-messages")
    @prompt = document.getElementById("console-prompt")
    @prompt.addEventListener("keypress", ((event) => @onKeyPress(event)), false)
    @prompt.addEventListener("keydown", ((event) => @onKeyDown(event)), false)
    @focusPrompt()

  createMessage: (command) ->
    @currentCommand = null
    @historySequence = ++@sequence
    @history.push(command)
    message = document.createElement("div")
    message.setAttribute("class", "source-code console-command")
    message.appendChild(document.createTextNode(command))
    group = document.createElement("div")
    group.setAttribute("class", "console-group")
    group.appendChild(message)
    @messages.appendChild(group)
    window.scrollTo(0, document.body.scrollHeight)
    group

  focusPrompt: ->
    @prompt.setAttribute("contenteditable", true)
    @prompt.focus()
    range = document.createRange()
    range.setStart(@prompt, @prompt.childNodes.length)
    range.setEnd(@prompt, @prompt.childNodes.length)
    selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)

  setPrompt: (value) ->
    @prompt.textContent = value
    @focusPrompt()

  clearPrompt: ->
    @setPrompt("")

  clearMessages: ->
    @messages.innerHTML = ""

  getCommand: ->
    @prompt.textContent

  moveHistory: (relative) ->
    @currentCommand = @getCommand() if @historySequence == @sequence
    @historySequence = @historySequence + relative
    @historySequence = 0 if @historySequence < 0
    @historySequence = @history.length if @historySequence > @history.length
    @setPrompt(@history[@historySequence] || @currentCommand)

  onKeyDown: (event) ->
    ignored = false
    switch event.keyCode
      when 27 # Esc
        @clearMessages()
        @clearPrompt()
      when 38 # Up
        @moveHistory(-1)
      when 40 # Down
        @moveHistory(+1)
      else
        ignored = true
    event.preventDefault() unless ignored

  onKeyPress: (event) ->
    return if event.keyCode != 13
    event.preventDefault()
    @exec(@getCommand())
    @clearPrompt()

  exec: (command) ->
    return if command == ""
    message = @createMessage(command)

    unless @service.connected()
      @service.connect().returned =>
        if @service.connected()
          @appendError(message, "Reconnected, your session may be lost")
        else
          @appendError(message, "Could not connect")

    if command == "?"
      @appendResult(message, ["WRB v0.1. Copyright 2010-#{new Date().getFullYear()} Rolf Timmermans.",
        "Type any Ruby expression and press [Enter] to evaluate."
        "Press [Esc] to clear the buffer."].join("\n"))
    else
      @service.send("eval", command).returned (object) =>
        if object.error
          @appendError(message, object.error.class + ": " + object.error.message)
        else
          @appendResult(message, object.value)

  appendResult: (message, result) ->
    @appendMessage(message, result, "console-result")

  appendError: (message, error) ->
    @appendMessage(message, error, "console-error")

  appendMessage: (placeholder, message, klass) ->
    result = document.createElement("div")
    result.setAttribute("class", "source-code " + klass)
    result.appendChild(document.createTextNode(message.replace(/\\n/g, "\n")))
    placeholder.appendChild(result)
    window.scrollTo(0, document.body.scrollHeight)

# Export the console.
window["WRB"] = Console
