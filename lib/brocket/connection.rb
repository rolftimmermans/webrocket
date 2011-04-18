module Brocket
  module Connection
    def connected
      super
      @dispatcher = server.create_dispatcher
    end

    def received_message(message)
      response = @dispatcher.dispatch decode_message(message)
      send_message encode_response(response)
    end

    # def closed
    #   super
    # end

    private

    def decode_message(message)
      JSON.parse(message, :symbolize_names => true)
    end

    def encode_response(response)
      JSON.generate(response)
    end
  end
end
