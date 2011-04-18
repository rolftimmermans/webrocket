module Brocket
  module TCPSocket
    module Socket
      attr_reader :server

      def connect(server)
        @server = server
        connected
      end

      def reading?
        true
      end

      def writing?
        false
      end

      def read_event
      end

      def write_event
      end

      def close
        super
        @server.sockets.delete self
        closed
      end

      protected

      def connected
      end

      def closed
      end
    end
  end
end
