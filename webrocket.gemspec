# Generated by jeweler
# DO NOT EDIT THIS FILE DIRECTLY
# Instead, edit Jeweler::Tasks in Rakefile, and run 'rake gemspec'
# -*- encoding: utf-8 -*-

Gem::Specification.new do |s|
  s.name = %q{webrocket}
  s.version = "0.0.0"

  s.required_rubygems_version = Gem::Requirement.new(">= 0") if s.respond_to? :required_rubygems_version=
  s.authors = ["Rolf Timmermans"]
  s.date = %q{2011-04-19}
  s.default_executable = %q{wrb}
  s.description = %q{A Remote Method Invocation / Remote Procedure Call server for Ruby. Call Ruby methods from within your browser, using a WebSocket-based RPC connection.}
  s.email = %q{r.timmermans@voormedia.com}
  s.executables = ["wrb"]
  s.files = [
    "Rakefile",
    "VERSION",
    "bin/wrb",
    "js/webrocket.js",
    "js/wrb.js",
    "lib/webrocket.rb",
    "lib/webrocket/connection.rb",
    "lib/webrocket/dispatcher.rb",
    "lib/webrocket/server.rb",
    "lib/webrocket/tcp_socket/connection.rb",
    "lib/webrocket/tcp_socket/listener.rb",
    "lib/webrocket/tcp_socket/server.rb",
    "lib/webrocket/tcp_socket/socket.rb",
    "lib/webrocket/web_socket/connection.rb",
    "lib/webrocket/web_socket/server.rb",
    "lib/webrocket/wrb.rb",
    "prompt/index.html",
    "prompt/userInputIcon.png",
    "prompt/userInputPreviousIcon.png",
    "webrocket.gemspec"
  ]
  s.require_paths = ["lib"]
  s.rubygems_version = %q{1.5.2}
  s.summary = %q{WebSocket-based RPC server for Ruby}

  if s.respond_to? :specification_version then
    s.specification_version = 3

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
    else
    end
  else
  end
end
