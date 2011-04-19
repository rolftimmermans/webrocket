require "webrocket/connection"
require "webrocket/dispatcher"
require "webrocket/web_socket/server"
require "json"

module WebRocket
  class Server < WebSocket::Server
    attr_reader :front

    def initialize(front)
      super("127.0.0.1", 9003)
      @front = front
    end

    def create_dispatcher
      Dispatcher.new(front.new)
    end

    protected

    def connection_modules
      [Connection] + super
    end
  end
end
