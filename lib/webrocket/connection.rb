module WebRocket
  module Connection
    def connected
      super
      @dispatcher = server.create_dispatcher
    end

    def received_message(message)
      response = @dispatcher.dispatch decode_message(message)
      send_message encode_response(response)
    end

    def handshake_failed
      if http_response = @dispatcher.http_response
        write ["HTTP/1.1 200 OK",
          "Content-Type: text/html; charset=UTF-8",
          "Content-Length: #{http_response.length}",
          "", http_response].join("\r\n")
      end
    end

    private

    def decode_message(message)
      JSON.parse(message, :symbolize_names => true)
    end

    def encode_response(response)
      JSON.generate(response)
    end
  end
end
