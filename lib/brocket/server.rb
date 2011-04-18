require "brocket/connection"
require "brocket/dispatcher"
require "brocket/web_socket/server"
require "json"

module Brocket
  class Server < WebSocket::Server
    attr_reader :front

    def initialize(front)
      super("127.0.0.1", 9999)
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
