require "brocket/tcp_socket/server"
require "brocket/web_socket/connection"

module Brocket
  module WebSocket
    class Server < TCPSocket::Server
      protected

      def connection_modules
        [Connection] + super
      end
    end
  end
end
