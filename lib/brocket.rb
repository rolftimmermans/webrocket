$: << File.dirname(__FILE__)
require "brocket/server"

class Eval
  def initialize
    # Create a new, anonymous, fake "main" object.
    @binding, @scope = Object.class_eval <<-RUBY
      class Object
        Object.new.instance_eval do
          class << self
            private

            attr_accessor :_

            def inspect
              "main"
            end
          end

          [binding, self]
        end
      end
    RUBY
  end

  def eval(source)
    (@scope.send :_=, @binding.eval(source, "(ruby)")).inspect
  end
end

brocket = Brocket::Server.new(Eval)
brocket.start
