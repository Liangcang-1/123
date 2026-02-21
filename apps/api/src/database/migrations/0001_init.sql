CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  plan TEXT NOT NULL,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  type TEXT NOT NULL CHECK (type IN ('store', 'campaign')),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE tool_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_key TEXT NOT NULL UNIQUE,
  prompt_template TEXT NOT NULL,
  input_schema JSONB NOT NULL,
  output_schema JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE tool_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  project_id UUID REFERENCES projects(id),
  inputs JSONB NOT NULL,
  outputs JSONB NOT NULL,
  tokens INTEGER NOT NULL DEFAULT 0,
  cost NUMERIC(10, 4) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE workflow_wrappers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_key TEXT NOT NULL UNIQUE,
  runninghub_workflow_id TEXT NOT NULL,
  form_schema JSONB NOT NULL,
  mapping_json JSONB NOT NULL,
  defaults_json JSONB NOT NULL,
  limits_json JSONB NOT NULL,
  cost_rules_json JSONB NOT NULL
);

CREATE TABLE gen_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_key TEXT NOT NULL,
  status TEXT NOT NULL,
  runninghub_task_id TEXT,
  progress INTEGER NOT NULL DEFAULT 0,
  result_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('text', 'image', 'video')),
  content_url TEXT NOT NULL,
  project_id UUID REFERENCES projects(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE usage_ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  resource_type TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE batch_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE batch_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_job_id UUID NOT NULL REFERENCES batch_jobs(id),
  payload JSONB NOT NULL,
  status TEXT NOT NULL
);
