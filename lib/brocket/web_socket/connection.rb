require "libwebsocket"

module Brocket
  module WebSocket
    module Connection
      include LibWebSocket

      def connected
        super
        @established = false
        @handshake = OpeningHandshake::Server.new(:url => "ws://localhost:9003/")
        @frame = Frame.new
      end

      def send_message(message)
        write @frame.new(message).to_s
      end

      def received_data(data)
        if @established
          @frame.append data
          while message = @frame.next
            received_message message
          end
        else
          @handshake.parse data
          if @handshake.done?
            write @handshake.to_s
            @established = true
          end
        end
      end
    end
  end
end
