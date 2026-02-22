CREATE TABLE provider_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_key VARCHAR NOT NULL UNIQUE CHECK (provider_key IN ('openai_chat', 'runninghub', 'storage')),
  config_json JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_by_admin_id VARCHAR NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE provider_config_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_key VARCHAR NOT NULL CHECK (provider_key IN ('openai_chat', 'runninghub', 'storage')),
  version INTEGER NOT NULL,
  config_json JSONB NOT NULL,
  change_note TEXT NOT NULL,
  created_by_admin_id VARCHAR NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(provider_key, version)
);

CREATE TABLE secrets_vault (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  secret_key VARCHAR NOT NULL UNIQUE,
  encrypted_value TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  rotated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by_admin_id VARCHAR NOT NULL
);

CREATE TABLE admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id VARCHAR NOT NULL,
  action VARCHAR NOT NULL,
  target_type VARCHAR NOT NULL,
  target_id VARCHAR,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
