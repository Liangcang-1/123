CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  plan VARCHAR NOT NULL DEFAULT 'free',
  status VARCHAR NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR NOT NULL DEFAULT 'OWNER';

ALTER TABLE provider_configs ADD COLUMN IF NOT EXISTS name VARCHAR NOT NULL DEFAULT 'ProviderA';
ALTER TABLE provider_configs ADD COLUMN IF NOT EXISTS base_url VARCHAR;
ALTER TABLE provider_configs ADD COLUMN IF NOT EXISTS api_key VARCHAR;
ALTER TABLE provider_configs ADD COLUMN IF NOT EXISTS enabled BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE provider_configs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS catalog_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID REFERENCES provider_configs(id),
  provider_template_id VARCHAR NOT NULL,
  key VARCHAR NOT NULL UNIQUE,
  name VARCHAR NOT NULL,
  description TEXT,
  category VARCHAR NOT NULL,
  input_schema JSONB NOT NULL,
  output_schema JSONB NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS catalog_tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID REFERENCES provider_configs(id),
  provider_tool_id VARCHAR NOT NULL,
  key VARCHAR NOT NULL UNIQUE,
  name VARCHAR NOT NULL,
  description TEXT,
  category VARCHAR NOT NULL,
  input_schema JSONB NOT NULL,
  output_schema JSONB NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tenant_entitlements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  item_type VARCHAR NOT NULL,
  item_id UUID NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, item_type, item_id)
);

CREATE TABLE IF NOT EXISTS menu_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scope VARCHAR NOT NULL,
  tenant_id UUID REFERENCES tenants(id),
  name VARCHAR NOT NULL,
  icon VARCHAR NOT NULL,
  sort INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES menu_groups(id),
  item_type VARCHAR NOT NULL,
  item_id UUID,
  page_path VARCHAR,
  title VARCHAR NOT NULL,
  subtitle VARCHAR,
  icon VARCHAR NOT NULL,
  sort INTEGER NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE gen_tasks ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE gen_tasks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);
ALTER TABLE gen_tasks ADD COLUMN IF NOT EXISTS type VARCHAR NOT NULL DEFAULT 'template';
ALTER TABLE gen_tasks ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES catalog_templates(id);
ALTER TABLE gen_tasks ADD COLUMN IF NOT EXISTS tool_id UUID REFERENCES catalog_tools(id);
ALTER TABLE gen_tasks ADD COLUMN IF NOT EXISTS input JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE gen_tasks ADD COLUMN IF NOT EXISTS output JSONB;
ALTER TABLE gen_tasks ADD COLUMN IF NOT EXISTS provider_task_id VARCHAR;
ALTER TABLE gen_tasks ADD COLUMN IF NOT EXISTS error_code VARCHAR;
ALTER TABLE gen_tasks ADD COLUMN IF NOT EXISTS error_message TEXT;
ALTER TABLE gen_tasks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE assets ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS task_id UUID REFERENCES gen_tasks(id);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS meta JSONB;

ALTER TABLE usage_ledger ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE usage_ledger ADD COLUMN IF NOT EXISTS task_id UUID REFERENCES gen_tasks(id);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_type VARCHAR NOT NULL,
  actor_id UUID NOT NULL,
  tenant_id UUID REFERENCES tenants(id),
  action VARCHAR NOT NULL,
  entity VARCHAR NOT NULL,
  entity_id UUID,
  detail JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
