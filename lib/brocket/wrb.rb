require "brocket/server"

class Eval
  def initialize
    # Create a new, anonymous, fake "main" object, with global static scope.
    @binding, @scope = Object.class_eval <<-RUBY
      class Object
        Object.new.instance_eval do
          class << self
            private

            attr_accessor :_

            def to_s
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

Brocket::Server.new(Eval).start
