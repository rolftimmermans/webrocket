require "jeweler"
require "rake/testtask"

Jeweler::Tasks.new do |spec|
  spec.name = "brocket"
  spec.summary = "WebSocket-based RPC server for Ruby"
  spec.description = "A Remote Method Invocation or Remote Procedure Call server for Ruby. Call Ruby methods from within your browser, using a WebSocket-based RPC client."

  spec.authors = ["Rolf Timmermans"]
  spec.email = "r.timmermans@voormedia.com"

  spec.executables = ["wrb"]
end

desc "Compile JavaScript library"
task :compile do
  require "coffee-script"
  futures = File.read("js/src/futures.js")
  brocket = CoffeeScript.compile File.read("js/src/brocket.coffee"), :bare => true
  brocket.gsub!("function ctor()", "/** @constructor */ function ctor()")
  js = futures + brocket

  IO.popen "closure --externs js/src/externs.js --compilation_level ADVANCED_OPTIMIZATIONS --output_wrapper '(function(){%output%})()'", "w+" do |io|
    io.write js
    io.close_write
    File.open "js/brocket.js", "w+" do |file|
      file.write io.read.gsub("n.prototype.toJSON=n.prototype.toJSON;", "")
    end
  end
end
