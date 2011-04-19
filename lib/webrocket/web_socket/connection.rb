require "libwebsocket"

module WebRocket
  module WebSocket
    module Connection
      include LibWebSocket

      protected

      def connected
        super
        @established, @handshake_failed = false, false
        @handshake = OpeningHandshake::Server.new(:url => "ws://localhost:9003/")
        @frame = Frame.new
      end

      def send_message(message)
        write @frame.new(message).to_s
      end

      def received_data(data)
        return if @handshake_failed
        if @established
          @frame.append data
          while message = @frame.next
            received_message message
          end
        else
          @handshake.parse data
          if @handshake.error
            @handshake_failed = true
            handshake_failed
          elsif @handshake.done?
            write @handshake.to_s
            @established = true
          end
        end
      end

      def handshake_failed
      end
    end
  end
end
