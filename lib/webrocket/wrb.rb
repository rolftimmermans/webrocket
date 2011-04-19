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

    self.last_value = nil
  end

  def eval(source)
    (self.last_value = @context.eval(source, "(wrb)")).inspect
  end

  private

  def last_value=(value)
    @context.eval("_ = ObjectSpace._id2ref(#{value.object_id.inspect})") # FIXME: Giant hack
  end

  def retrieve(filename)
    File.read(File.expand_path("../../" + filename, File.dirname(__FILE__)))
  end
end
