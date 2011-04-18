module Brocket
  module TCPSocket
    module Connection
      attr_reader :server

      MAX_READ = 10

      def connected
        @write_buffer = ""
        @read_buffer = ""
      end

      def received_data(data)
      end

      def writing?
        @write_buffer.length > 0
      end

      def write(data)
        @write_buffer << data
      end

      def read_event
        @read_buffer << read_nonblock(MAX_READ)
        received_data(@read_buffer)
        @read_buffer = ""
      rescue EOFError
        close
      end

      def write_event
        write_nonblock(@write_buffer)
        @write_buffer = ""
      rescue EOFError
        close
      end
    end
  end
end
