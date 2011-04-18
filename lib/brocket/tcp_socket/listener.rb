module Brocket
  module TCPSocket
    module Listener
      def read_event
        server.create_connection accept_nonblock
      end
    end
  end
end
