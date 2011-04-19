require "webrocket/server"

class WRB
  attr_reader :http_response

  def initialize
    user_icon1 = retrieve("prompt/userInputIcon.png")
    user_icon2 = retrieve("prompt/userInputPreviousIcon.png")
    javascript = retrieve("js/wrb.js").chomp
    index      = retrieve("prompt/index.html").chomp

    index.gsub!('{js}', javascript)
    index.gsub!('url(userInputIcon.png)', "url(data:image/png;base64," + [user_icon1].pack("m").gsub("\n", "").chomp + ")")
    index.gsub!('url(userInputPreviousIcon.png)', "url(data:image/png;base64," + [user_icon2].pack("m").gsub("\n", "").chomp + ")")
    @http_response = index

    # Create a new, isolated binding in the global static scope.
    @context = TOPLEVEL_BINDING.eval("proc { binding }.call")
    @last_value_setter = @context.eval("_ = nil; lambda { |value| _ = value }")
  end

  def eval(source)
    eval_and_save(source).inspect
  end

  private

  def eval_and_save(source)
    set_last_value @context.eval(source, "(wrb)")
  end

  def set_last_value(value)
    @last_value_setter.call(value)
  end

  def retrieve(filename)
    File.read(File.expand_path("../../" + filename, File.dirname(__FILE__)))
  end
end
