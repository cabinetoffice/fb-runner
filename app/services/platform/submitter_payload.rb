module Platform
  class SubmitterPayload
    attr_reader :service, :user_data

    def initialize(service:, user_data:)
      @service = service
      @user_data = user_data
    end

    def to_h
      {
        meta: meta,
        service: service_info,
        actions: actions,
        pages: pages
      }
    end

    def service_info
      {
        id: service.service_id,
        slug: service.slug,
        name: service.service_name
      }
    end

    def meta
      {
        pdf_heading: ENV['SERVICE_EMAIL_PDF_HEADING'],
        pdf_subheading: ENV['SERVICE_EMAIL_PDF_SUBHEADING']
      }
    end

    def actions
      [
        {
          kind: 'email',
          to: ENV['SERVICE_EMAIL_OUTPUT'],
          from: ENV['SERVICE_EMAIL_SENDER'],
          subject: ENV['SERVICE_EMAIL_SUBJECT'],
          email_body: ENV['SERVICE_EMAIL_BODY'],
          include_pdf: true
        }
      ]
    end

    def pages
      service.pages.map do |page|
        next if page.components.blank?

        {
          heading: '',
          answers: page.components.map do |component|
            {
              field_id: component.id,
              field_name: component.humanised_title,
              answer: answer_for(page, component)
            }
          end
        }
      end.compact
    end

    def answer_for(page, component)
      page_answers = MetadataPresenter::PageAnswers.new(page, user_data)
      answer = page_answers.send(component.id)

      if answer.is_a?(MetadataPresenter::DateField)
        # how can we reuse the presenter code? Module?
        I18n.l(
          Date.civil(answer.year.to_i, answer.month.to_i, answer.day.to_i),
          format: '%d %B %Y'
        )
      else
        answer
      end
    end
  end
end
