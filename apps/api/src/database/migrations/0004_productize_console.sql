CREATE TABLE IF NOT EXISTS asset_folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR NOT NULL,
  parent_id UUID REFERENCES asset_folders(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS pinned BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS category VARCHAR;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS cost_hint VARCHAR;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS disabled_reason VARCHAR;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS gray_release BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE catalog_templates ADD COLUMN IF NOT EXISTS scenes JSONB;
ALTER TABLE catalog_templates ADD COLUMN IF NOT EXISTS examples JSONB;
ALTER TABLE catalog_templates ADD COLUMN IF NOT EXISTS presets JSONB;
ALTER TABLE catalog_templates ADD COLUMN IF NOT EXISTS cost_hint VARCHAR;

ALTER TABLE catalog_tools ADD COLUMN IF NOT EXISTS scenes JSONB;
ALTER TABLE catalog_tools ADD COLUMN IF NOT EXISTS examples JSONB;
ALTER TABLE catalog_tools ADD COLUMN IF NOT EXISTS presets JSONB;
ALTER TABLE catalog_tools ADD COLUMN IF NOT EXISTS cost_hint VARCHAR;

ALTER TABLE assets ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES asset_folders(id);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE assets ADD COLUMN IF NOT EXISTS title VARCHAR;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS source_task_id UUID REFERENCES gen_tasks(id);
ALTER TABLE assets ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_gen_tasks_tenant_created ON gen_tasks(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gen_tasks_status_created ON gen_tasks(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assets_tenant_created ON assets(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assets_folder ON assets(folder_id);
CREATE INDEX IF NOT EXISTS idx_assets_tags_gin ON assets USING GIN(tags);
