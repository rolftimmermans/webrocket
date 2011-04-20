require "webrocket/server"

module WRB
  def self.retrieve(filename)
    File.read(File.expand_path("../../" + filename, File.dirname(__FILE__)))
  end

  user_icon1 = retrieve("prompt/userInputIcon.png")
  user_icon2 = retrieve("prompt/userInputPreviousIcon.png")
  javascript = retrieve("js/wrb.js").chomp
  index      = retrieve("prompt/index.html").chomp

  index.gsub!('{js}', javascript)
  index.gsub!('url(userInputIcon.png)', "url(data:image/png;base64," + [user_icon1].pack("m").gsub("\n", "").chomp + ")")
  index.gsub!('url(userInputPreviousIcon.png)', "url(data:image/png;base64," + [user_icon2].pack("m").gsub("\n", "").chomp + ")")

  HTTP_RESPONSE = index

  class Session
    def initialize
      @line = 0
      @context = TOPLEVEL_BINDING.eval("proc { binding }.call")
      @last_value_setter = @context.eval("_ = nil; lambda { |value| _ = value }")
    end

    def eval(source)
      eval_and_save(source).inspect
    end

    def http_response
      HTTP_RESPONSE
    end

    private

    def eval_and_save(source)
      set_last_value @context.eval(source, "(wrb)", @line += 1)
    end

    def set_last_value(value)
      @last_value_setter.call(value)
    end
  end
end
