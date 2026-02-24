CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR NOT NULL UNIQUE,
  password_hash VARCHAR NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  plan VARCHAR NOT NULL,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR NOT NULL CHECK (type IN ('store', 'campaign')),
  name VARCHAR NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE tool_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_key VARCHAR NOT NULL UNIQUE,
  prompt_template TEXT NOT NULL,
  input_schema JSONB NOT NULL,
  output_schema JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE tool_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  project_id VARCHAR,
  inputs JSONB NOT NULL,
  outputs JSONB NOT NULL,
  tokens INTEGER NOT NULL DEFAULT 0,
  cost NUMERIC(10, 4) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE workflow_wrappers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_key VARCHAR NOT NULL UNIQUE,
  runninghub_workflow_id VARCHAR NOT NULL,
  form_schema JSONB NOT NULL,
  mapping_json JSONB NOT NULL,
  defaults_json JSONB NOT NULL,
  limits_json JSONB NOT NULL,
  cost_rules_json JSONB NOT NULL
);

CREATE TABLE gen_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_key VARCHAR NOT NULL,
  status VARCHAR NOT NULL,
  runninghub_task_id VARCHAR,
  progress INTEGER NOT NULL DEFAULT 0,
  result_url VARCHAR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR NOT NULL CHECK (type IN ('text', 'image', 'video')),
  content_url VARCHAR NOT NULL,
  project_id VARCHAR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE usage_ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  resource_type VARCHAR NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  reason VARCHAR NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE batch_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE batch_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_job_id UUID NOT NULL REFERENCES batch_jobs(id),
  payload JSONB NOT NULL,
  status VARCHAR NOT NULL
);
