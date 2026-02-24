CREATE TABLE IF NOT EXISTS tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id),
  key VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  description TEXT,
  icon VARCHAR,
  provider_key VARCHAR NOT NULL,
  workflow_ref VARCHAR NOT NULL,
  input_schema JSONB NOT NULL,
  output_schema JSONB,
  status VARCHAR NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_tools_tenant_key
  ON tools ((COALESCE(tenant_id::text, 'system')), key);

CREATE TABLE IF NOT EXISTS tool_menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  tool_id UUID NOT NULL REFERENCES tools(id),
  name_override VARCHAR,
  sort_order INTEGER NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, tool_id)
);
