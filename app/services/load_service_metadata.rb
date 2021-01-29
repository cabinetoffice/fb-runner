class LoadServiceMetadata
  class ServiceMetadataNotFoundError < StandardError
  end

  def initialize(service_metadata:, fixture:, asset_precompile:)
    @service_metadata = service_metadata
    @fixture = MetadataPresenter::Engine.root.join('fixtures', "#{fixture}.json")
    @asset_precompile = asset_precompile
  end

  def to_h
    if @service_metadata.blank? && File.exist?(@fixture)
      puts("Loading fixture #{@fixture}")
      return JSON.parse(File.read(@fixture))
    end

    return JSON.parse(@service_metadata) if @service_metadata.present?

    raise ServiceMetadataNotFoundError.new(error_message) unless @asset_precompile.present?
  end

  def error_message
    <<~HEREDOC
      No service metadata found.

      if you want to run in development you can pass a fixture
      from the metadata presenter gem instead:

      ENV['SERVICE_FIXTURE']='version' rails s

      If you want to pass the actual metadata you can do via:

      ENV['SERVICE_METADATA']='{ ... json ... }' rails s

      Values of each env var:
      ENV['SERVICE_METADATA'] = '#{ENV['SERVICE_METADATA']}'
      ENV['SERVICE_FIXTURE'] = '#{ENV['SERVICE_FIXTURE']}'
    HEREDOC
  end
end
