(function() {
  var Console;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Console = (function() {
    function Console(element) {
      document.addEventListener("DOMContentLoaded", __bind(function() {
        this.element = element != null ? document.getElementById(element) : document.body;
        this.service = Brocket.connect("ws://localhost:9003");
        return this.createConsole();
      }, this), false);
    }
    Console.prototype.createConsole = function() {
      this.historySequence = this.sequence = 0;
      this.history = [];
      this.element.innerHTML = '<div class="console"><div id="console-messages" class="console-messages"></div>\
      <div class="console-tail"><div id="console-prompt" spellcheck="false" class="source-code console-prompt"></div></div></div>';
      this.messages = document.getElementById("console-messages");
      this.prompt = document.getElementById("console-prompt");
      this.prompt.addEventListener("keypress", (__bind(function(event) {
        return this.onKeyPress(event);
      }, this)), false);
      this.prompt.addEventListener("keydown", (__bind(function(event) {
        return this.onKeyDown(event);
      }, this)), false);
      return this.focusPrompt();
    };
    Console.prototype.createMessage = function(command) {
      var group, message;
      this.currentCommand = null;
      this.historySequence = ++this.sequence;
      this.history.push(command);
      message = document.createElement("div");
      message.setAttribute("class", "source-code console-command");
      message.appendChild(document.createTextNode(command));
      group = document.createElement("div");
      group.setAttribute("class", "console-group");
      group.appendChild(message);
      this.messages.appendChild(group);
      window.scrollTo(0, document.body.scrollHeight);
      return group;
    };
    Console.prototype.focusPrompt = function() {
      var range, selection;
      this.prompt.setAttribute("contenteditable", true);
      this.prompt.focus();
      range = document.createRange();
      range.setStart(this.prompt, this.prompt.childNodes.length);
      range.setEnd(this.prompt, this.prompt.childNodes.length);
      selection = window.getSelection();
      selection.removeAllRanges();
      return selection.addRange(range);
    };
    Console.prototype.setPrompt = function(value) {
      this.prompt.textContent = value;
      return this.focusPrompt();
    };
    Console.prototype.clearPrompt = function() {
      return this.setPrompt("");
    };
    Console.prototype.clearMessages = function() {
      return this.messages.innerHTML = "";
    };
    Console.prototype.getCommand = function() {
      return this.prompt.textContent;
    };
    Console.prototype.moveHistory = function(relative) {
      if (this.historySequence === this.sequence) {
        this.currentCommand = this.getCommand();
      }
      this.historySequence = this.historySequence + relative;
      if (this.historySequence < 0) {
        this.historySequence = 0;
      }
      if (this.historySequence > this.history.length) {
        this.historySequence = this.history.length;
      }
      return this.setPrompt(this.history[this.historySequence] || this.currentCommand);
    };
    Console.prototype.onKeyDown = function(event) {
      var ignored;
      ignored = false;
      switch (event.keyCode) {
        case 27:
          this.clearMessages();
          this.clearPrompt();
          break;
        case 38:
          this.moveHistory(-1);
          break;
        case 40:
          this.moveHistory(+1);
          break;
        default:
          ignored = true;
      }
      if (!ignored) {
        return event.preventDefault();
      }
    };
    Console.prototype.onKeyPress = function(event) {
      if (event.keyCode !== 13) {
        return;
      }
      event.preventDefault();
      this.exec(this.getCommand());
      return this.clearPrompt();
    };
    Console.prototype.exec = function(command) {
      var message;
      if (command === "") {
        return;
      }
      message = this.createMessage(command);
      if (!this.service.connected()) {
        this.service.connect().returned(__bind(function() {
          if (this.service.connected()) {
            return this.appendError(message, "Reconnected, your session may be lost.");
          } else {
            return this.appendError(message, "Could not connect.");
          }
        }, this));
      }
      if (command === "?") {
        return this.appendResult(message, ["WRB v0.1. Copyright 2010-" + (new Date().getFullYear()) + " Rolf Timmermans.", "", "Type any Ruby expression and press [Enter] to evaluate.", "Press [Esc] to clear the buffer."].join("\n"));
      } else {
        return this.service.send("eval", command).returned(__bind(function(object) {
          if (object.error) {
            return this.appendError(message, object.error["class"] + ": " + object.error.message);
          } else {
            return this.appendResult(message, object.value);
          }
        }, this));
      }
    };
    Console.prototype.appendResult = function(message, result) {
      return this.appendMessage(message, result, "console-result");
    };
    Console.prototype.appendError = function(message, error) {
      return this.appendMessage(message, error, "console-error");
    };
    Console.prototype.appendMessage = function(placeholder, message, klass) {
      var result;
      result = document.createElement("div");
      result.setAttribute("class", "source-code " + klass);
      result.appendChild(document.createTextNode(message.replace(/\\n/g, "\n")));
      placeholder.appendChild(result);
      return window.scrollTo(0, document.body.scrollHeight);
    };
    return Console;
  })();
  new Console();
}).call(this);
