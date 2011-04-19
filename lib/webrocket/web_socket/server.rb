require "webrocket/tcp_socket/server"
require "webrocket/web_socket/connection"

module WebRocket
  module WebSocket
    class Server < TCPSocket::Server
      protected

      def connection_modules
        [Connection] + super
      end
    end
  end
end
