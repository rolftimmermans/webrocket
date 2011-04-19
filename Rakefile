require "jeweler"
require "rake/testtask"

Jeweler::Tasks.new do |spec|
  spec.name = "webrocket"
  spec.summary = "WebSocket-based RPC server for Ruby"
  spec.description = "A Remote Method Invocation / Remote Procedure Call server for Ruby. Call Ruby methods from within your browser, using a WebSocket-based RPC connection."

  spec.authors = ["Rolf Timmermans"]
  spec.email = "r.timmermans@voormedia.com"

  spec.executables = ["wrb"]
  spec.files -= Dir["js/src/*"]
end

desc "Compile JavaScript library"
task :compile do
  require "coffee-script"

  def js(filename)
    File.read(filename)
  end

  def coffee(filename)
    comp = CoffeeScript.compile File.read(filename), :bare => true
    comp.gsub("function ctor()", "/** @constructor */ function ctor()")
  end

  def compile(src, filename)
    IO.popen "closure --externs js/src/externs.js " +
      "--compilation_level ADVANCED_OPTIMIZATIONS " +
      "--output_wrapper '(function(){%output%})()'", "w+" do |io|
      io.write src
      io.close_write
      File.open filename, "w+" do |file|
        file.puts "/* Copyright 2010-#{Time.now.year} Rolf Timmermans */"
        file.write io.read
      end
    end
  end

  webrocket = js("js/src/futures.js") + coffee("js/src/webrocket.coffee")
  wrb = webrocket + coffee("js/src/console.coffee")

  compile webrocket, "js/webrocket.js"
  compile wrb, "js/wrb.js"
end
