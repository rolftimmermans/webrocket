require "socket"
require "brocket/tcp_socket/socket"
require "brocket/tcp_socket/listener"
require "brocket/tcp_socket/connection"

module Brocket
  module TCPSocket
    class Server
      attr_reader :sockets

      def initialize(host, port)
        @host, @port = host, port
        @sockets = []
      end

      def start
        create_listener
        reactor_loop
      end

      def stop
        close_sockets
      end

      def create_connection(socket)
        create_socket socket, connection_modules
      end

      def create_listener
        create_socket TCPServer.new(@host, @port), listener_modules
      end

      protected

      def reactor_loop
        loop do
          break if @sockets.empty?
          readables, writables = IO.select @sockets.select(&:reading?), @sockets.select(&:writing?)
          readables.each(&:read_event)
          writables.each(&:write_event)
        end
      end

      def create_socket(socket, modules)
        socket.extend *modules
        socket.connect self
        @sockets << socket
      end

      def close_sockets
        @sockets.each(&:close)
        @sockets.clear
      end

      def listener_modules
        [Listener, Socket]
      end

      def connection_modules
        [Connection, Socket]
      end
    end
  end
end
