module Massagers
  module Components
    class Date
      attr_reader :hash

      def initialize(hash:)
        @hash = hash
      end

      def call
        process_components(hash[:page])

        (hash[:page][:components] || []).each do |c|
          process_components(c)
        end
      end

      private

      def process_components(sub_hash)
        (sub_hash[:components] || []).each do |c|
          if c[:_type] == "date"
            c[:items] = [
              {
                "instanceName": "dob",
                "compositeName": "COMPOSITE.dob-day",
                "name": "COMPOSITE.dob-day",
                "label": "Day",
                "classes": "govuk-input--width-2",
                "value": ""
              },
              {
                "instanceName": "dob",
                "compositeName": "COMPOSITE.dob-month",
                "name": "COMPOSITE.dob-month",
                "label": "Month",
                "classes": "govuk-input--width-2",
                "value": ""
              },
              {
                "instanceName": "dob",
                "compositeName": "COMPOSITE.dob-year",
                "name": "COMPOSITE.dob-year",
                "label": "Year",
                "classes": "govuk-input--width-4",
                "value": ""
              }
            ]
          end
        end
      end
    end
  end
end
