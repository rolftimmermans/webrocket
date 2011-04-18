module Brocket
  class Dispatcher
    attr_reader :front

    REF = :_ref
    CLASS = :_class

    def initialize(front)
      @front = front
      @objects = {}
    end

    def dispatch(message)
      response = begin
        receiver = message[:receiver] ? dereferentialize(message[:receiver]) : front
        result = receiver.__send__ message[:method], *message[:args]
        { :result => referentialize(result) }
      rescue Exception => exception
        { :error => { :class => exception.class.name, :message => exception.message } }
      end
      response[:id] = message[:id]
      response
    end

    private

    def referentialize(object)
      case object
      when Array
        object.map do |member|
          referentialize(member)
        end
      when Hash
        object.each_with_object({}) do |(key, value), hash|
          hash[referentialize(key)] = referentialize(value)
        end
      when String, Integer, Float, TrueClass, FalseClass, NilClass
        object
      else
        reference = object.object_id
        @objects[reference] = object
        { REF => reference, CLASS => object.class.name }
      end
    end

    def dereferentialize(object)
      case object
      when Array
        object.map do |member|
          dereferentialize(member)
        end
      when Hash
        if reference = object[REF]
          @objects[reference]
        else
          object.each_with_object({}) do |(key, value), hash|
            hash[dereferentialize(key)] = dereferentialize(value)
          end
        end
      else
        object
      end
    end
  end
end
