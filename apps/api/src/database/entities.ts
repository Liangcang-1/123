import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tenants')
export class TenantEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  slug!: string | null;

  @Column({ type: 'varchar', default: 'free' })
  plan!: string;

  @Column({ type: 'varchar', default: 'active' })
  status!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}

@Entity('users')
@Unique(['email'])
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  tenantId!: string | null;

  @Column({ type: 'varchar' })
  email!: string;

  @Column({ name: 'password_hash', type: 'varchar' })
  passwordHash!: string;

  @Column({ name: 'display_name', type: 'varchar', nullable: true })
  displayName!: string | null;

  @Column({ type: 'varchar', default: 'active' })
  status!: string;

  @Column({ type: 'varchar', default: 'OWNER' })
  role!: 'OWNER' | 'ADMIN' | 'MEMBER';

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => SubscriptionEntity, (sub) => sub.user)
  subscriptions!: SubscriptionEntity[];
}


@Entity('roles')
@Unique(['tenantId', 'key'])
export class RoleEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  tenantId!: string | null;

  @Column({ type: 'varchar' })
  key!: 'owner' | 'admin' | 'member';

  @Column({ type: 'varchar' })
  name!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}

@Entity('permissions')
@Unique(['key'])
export class PermissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  key!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}

@Entity('tenant_users')
@Unique(['tenantId', 'userId'])
export class TenantUserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'role_id', type: 'uuid', nullable: true })
  roleId!: string | null;

  @Column({ type: 'varchar', default: 'active' })
  status!: 'active' | 'invited' | 'disabled';

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}

@Entity('role_permissions')
@Unique(['roleId', 'permissionId'])
export class RolePermissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'role_id', type: 'uuid' })
  roleId!: string;

  @Column({ name: 'permission_id', type: 'uuid' })
  permissionId!: string;
}

@Entity('subscriptions')
export class SubscriptionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => UserEntity, (user) => user.subscriptions)
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ type: 'varchar' })
  plan!: string;

  @Column({ name: 'start_at', type: 'timestamptz' })
  startAt!: Date;

  @Column({ name: 'end_at', type: 'timestamptz' })
  endAt!: Date;
}

@Entity('projects')
export class ProjectEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar' })
  type!: 'store' | 'campaign';

  @Column({ type: 'varchar' })
  name!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}

@Entity('tool_definitions')
export class ToolDefinitionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tool_key', type: 'varchar', unique: true })
  toolKey!: string;

  @Column({ name: 'prompt_template', type: 'text' })
  promptTemplate!: string;

  @Column({ name: 'input_schema', type: 'jsonb' })
  inputSchema!: Record<string, unknown>;

  @Column({ name: 'output_schema', type: 'jsonb' })
  outputSchema!: Record<string, unknown>;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}

@Entity('tool_runs')
export class ToolRunEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'project_id', type: 'varchar', nullable: true })
  projectId!: string | null;

  @Column({ type: 'jsonb' })
  inputs!: Record<string, unknown>;

  @Column({ type: 'jsonb' })
  outputs!: Record<string, unknown>;

  @Column({ type: 'int', default: 0 })
  tokens!: number;

  @Column({ type: 'numeric', default: 0 })
  cost!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}


@Entity('workflow_wrappers')
export class WorkflowWrapperEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'workflow_key', type: 'varchar', unique: true })
  workflowKey!: string;

  @Column({ name: 'runninghub_workflow_id', type: 'varchar' })
  runninghubWorkflowId!: string;

  @Column({ name: 'form_schema', type: 'jsonb' })
  formSchema!: Record<string, unknown>;

  @Column({ name: 'mapping_json', type: 'jsonb' })
  mappingJson!: Record<string, unknown>;

  @Column({ name: 'defaults_json', type: 'jsonb' })
  defaultsJson!: Record<string, unknown>;

  @Column({ name: 'limits_json', type: 'jsonb' })
  limitsJson!: Record<string, unknown>;

  @Column({ name: 'cost_rules_json', type: 'jsonb' })
  costRulesJson!: Record<string, unknown>;
}

@Entity('provider_configs')
@Unique(['providerKey'])
export class ProviderConfigEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'provider_key', type: 'varchar' })
  providerKey!: 'openai_chat' | 'provider_a' | 'storage';

  @Column({ type: 'varchar', default: 'ProviderA' })
  name!: string;

  @Column({ name: 'base_url', type: 'varchar', nullable: true })
  baseUrl!: string | null;

  @Column({ name: 'api_key', type: 'varchar', nullable: true })
  apiKey!: string | null;

  @Column({ name: 'enabled', type: 'boolean', default: true })
  enabled!: boolean;

  @Column({ name: 'config_json', type: 'jsonb' })
  configJson!: Record<string, unknown>;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'updated_by_admin_id', type: 'varchar' })
  updatedByAdminId!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}

@Entity('catalog_templates')
export class CatalogTemplateEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  @Column({ name: 'provider_id', type: 'uuid', nullable: true })
  providerId!: string | null;
  @Column({ name: 'provider_template_id', type: 'varchar' })
  providerTemplateId!: string;
  @Column({ type: 'varchar', unique: true })
  key!: string;
  @Column({ type: 'varchar' })
  name!: string;
  @Column({ type: 'text', nullable: true })
  description!: string | null;
  @Column({ type: 'varchar' })
  category!: string;
  @Column({ name: 'input_schema', type: 'jsonb' })
  inputSchema!: Record<string, unknown>;
  @Column({ name: 'output_schema', type: 'jsonb' })
  outputSchema!: Record<string, unknown>;
  @Column({ type: 'int', default: 1 })
  version!: number;
  @Column({ type: 'boolean', default: true })
  enabled!: boolean;
  @Column({ type: 'jsonb', nullable: true })
  scenes!: Record<string, unknown> | null;
  @Column({ type: 'jsonb', nullable: true })
  examples!: Record<string, unknown> | null;
  @Column({ type: 'jsonb', nullable: true })
  presets!: Record<string, unknown> | null;
  @Column({ name: 'cost_hint', type: 'varchar', nullable: true })
  costHint!: string | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}

@Entity('catalog_tools')
export class CatalogToolEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  @Column({ name: 'provider_id', type: 'uuid', nullable: true })
  providerId!: string | null;
  @Column({ name: 'provider_tool_id', type: 'varchar' })
  providerToolId!: string;
  @Column({ type: 'varchar', unique: true })
  key!: string;
  @Column({ type: 'varchar' })
  name!: string;
  @Column({ type: 'text', nullable: true })
  description!: string | null;
  @Column({ type: 'varchar' })
  category!: string;
  @Column({ name: 'input_schema', type: 'jsonb' })
  inputSchema!: Record<string, unknown>;
  @Column({ name: 'output_schema', type: 'jsonb' })
  outputSchema!: Record<string, unknown>;
  @Column({ type: 'int', default: 1 })
  version!: number;
  @Column({ type: 'boolean', default: true })
  enabled!: boolean;
  @Column({ type: 'jsonb', nullable: true })
  scenes!: Record<string, unknown> | null;
  @Column({ type: 'jsonb', nullable: true })
  examples!: Record<string, unknown> | null;
  @Column({ type: 'jsonb', nullable: true })
  presets!: Record<string, unknown> | null;
  @Column({ name: 'cost_hint', type: 'varchar', nullable: true })
  costHint!: string | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}

@Entity('tenant_entitlements')
export class TenantEntitlementEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;
  @Column({ name: 'item_type', type: 'varchar' })
  itemType!: 'template' | 'tool';
  @Column({ name: 'item_id', type: 'uuid' })
  itemId!: string;
  @Column({ type: 'boolean', default: true })
  enabled!: boolean;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}

@Entity('menu_groups')
export class MenuGroupEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  @Column({ type: 'varchar' })
  scope!: 'global' | 'tenant';
  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  tenantId!: string | null;
  @Column({ type: 'varchar' })
  name!: string;
  @Column({ type: 'varchar' })
  icon!: string;
  @Column({ type: 'int', default: 0 })
  sort!: number;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}

@Entity('menu_items')
export class MenuItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  @Column({ name: 'group_id', type: 'uuid' })
  groupId!: string;
  @Column({ name: 'item_type', type: 'varchar' })
  itemType!: 'template' | 'tool' | 'page';
  @Column({ name: 'item_id', type: 'uuid', nullable: true })
  itemId!: string | null;
  @Column({ name: 'page_path', type: 'varchar', nullable: true })
  pagePath!: string | null;
  @Column({ type: 'varchar' })
  title!: string;
  @Column({ type: 'varchar', nullable: true })
  subtitle!: string | null;
  @Column({ type: 'varchar' })
  icon!: string;
  @Column({ type: 'int', default: 0 })
  sort!: number;
  @Column({ type: 'boolean', default: true })
  enabled!: boolean;
  @Column({ type: 'boolean', default: false })
  pinned!: boolean;
  @Column({ type: 'varchar', nullable: true })
  category!: string | null;
  @Column({ name: 'cost_hint', type: 'varchar', nullable: true })
  costHint!: string | null;
  @Column({ name: 'disabled_reason', type: 'varchar', nullable: true })
  disabledReason!: string | null;
  @Column({ name: 'gray_release', type: 'boolean', default: false })
  grayRelease!: boolean;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}

@Entity('gen_tasks')
export class GenTaskEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  tenantId!: string | null;
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId!: string | null;
  @Column({ type: 'varchar', default: 'template' })
  type!: 'template' | 'tool';
  @Column({ name: 'template_id', type: 'uuid', nullable: true })
  templateId!: string | null;
  @Column({ name: 'tool_id', type: 'uuid', nullable: true })
  toolId!: string | null;
  @Column({ name: 'workflow_key', type: 'varchar' })
  workflowKey!: string;
  @Column({ type: 'varchar' })
  status!: string;
  @Column({ name: 'runninghub_task_id', type: 'varchar', nullable: true })
  runninghubTaskId!: string | null;
  @Column({ name: 'provider_task_id', type: 'varchar', nullable: true })
  providerTaskId!: string | null;
  @Column({ name: 'input', type: 'jsonb', default: {} })
  input!: Record<string, unknown>;
  @Column({ name: 'output', type: 'jsonb', nullable: true })
  output!: Record<string, unknown> | null;
  @Column({ type: 'int', default: 0 })
  progress!: number;
  @Column({ name: 'result_url', type: 'varchar', nullable: true })
  resultUrl!: string | null;
  @Column({ name: 'error_code', type: 'varchar', nullable: true })
  errorCode!: string | null;
  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage!: string | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}


@Entity('asset_folders')
export class AssetFolderEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;
  @Column({ type: 'varchar' })
  name!: string;
  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId!: string | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}

@Entity('assets')
export class AssetEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  tenantId!: string | null;
  @Column({ name: 'task_id', type: 'uuid', nullable: true })
  taskId!: string | null;
  @Column({ type: 'varchar' })
  type!: 'text' | 'image' | 'video';
  @Column({ name: 'content_url', type: 'text' })
  contentUrl!: string;
  @Column({ name: 'meta', type: 'jsonb', nullable: true })
  meta!: Record<string, unknown> | null;
  @Column({ name: 'project_id', type: 'varchar', nullable: true })
  projectId!: string | null;
  @Column({ name: 'folder_id', type: 'uuid', nullable: true })
  folderId!: string | null;
  @Column({ type: 'text', array: true, default: () => "'{}'" })
  tags!: string[];
  @Column({ type: 'varchar', nullable: true })
  title!: string | null;
  @Column({ name: 'source_task_id', type: 'uuid', nullable: true })
  sourceTaskId!: string | null;
  @Column({ name: 'archived_at', type: 'timestamptz', nullable: true })
  archivedAt!: Date | null;
  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}

@Entity('usage_ledger')
export class UsageLedgerEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  tenantId!: string | null;
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;
  @Column({ name: 'resource_type', type: 'varchar' })
  resourceType!: string;
  @Column({ type: 'numeric' })
  amount!: number;
  @Column({ type: 'varchar' })
  reason!: string;
  @Column({ name: 'task_id', type: 'uuid', nullable: true })
  taskId!: string | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}

@Entity('batch_jobs')
export class BatchJobEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;
  @Column({ type: 'varchar' })
  status!: string;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}

@Entity('batch_items')
export class BatchItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  @Column({ name: 'batch_job_id', type: 'uuid' })
  batchJobId!: string;
  @Column({ type: 'jsonb' })
  payload!: Record<string, unknown>;
  @Column({ type: 'varchar' })
  status!: string;
}

@Entity('provider_config_versions')
@Unique(['providerKey', 'version'])
export class ProviderConfigVersionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'provider_key', type: 'varchar' })
  providerKey!: 'openai_chat' | 'provider_a' | 'storage';

  @Column({ type: 'int' })
  version!: number;

  @Column({ name: 'config_json', type: 'jsonb' })
  configJson!: Record<string, unknown>;

  @Column({ name: 'change_note', type: 'text' })
  changeNote!: string;

  @Column({ name: 'created_by_admin_id', type: 'varchar' })
  createdByAdminId!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}

@Entity('secrets_vault')
@Unique(['secretKey'])
export class SecretVaultEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'secret_key', type: 'varchar' })
  secretKey!: string;

  @Column({ name: 'encrypted_value', type: 'text' })
  encryptedValue!: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'rotated_at', type: 'timestamptz', default: () => 'now()' })
  rotatedAt!: Date;

  @Column({ name: 'updated_by_admin_id', type: 'varchar' })
  updatedByAdminId!: string;
}

@Entity('admin_logs')
export class AdminLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'admin_id', type: 'varchar' })
  adminId!: string;

  @Column({ type: 'varchar' })
  action!: string;

  @Column({ name: 'target_type', type: 'varchar' })
  targetType!: string;

  @Column({ name: 'target_id', type: 'varchar', nullable: true })
  targetId!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}

@Entity('audit_logs')
export class AuditLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  @Column({ name: 'actor_type', type: 'varchar' })
  actorType!: string;
  @Column({ name: 'actor_id', type: 'uuid' })
  actorId!: string;
  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  tenantId!: string | null;
  @Column({ type: 'varchar' })
  action!: string;
  @Column({ type: 'varchar' })
  entity!: string;
  @Column({ name: 'entity_id', type: 'uuid', nullable: true })
  entityId!: string | null;
  @Column({ name: 'detail', type: 'jsonb', nullable: true })
  detail!: Record<string, unknown> | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}

export const ENTITIES = [
  TenantEntity,
  UserEntity,
  RoleEntity,
  PermissionEntity,
  TenantUserEntity,
  RolePermissionEntity,
  SubscriptionEntity,
  ProjectEntity,
  ToolDefinitionEntity,
  ToolRunEntity,
  WorkflowWrapperEntity,
  ProviderConfigEntity,
  CatalogTemplateEntity,
  CatalogToolEntity,
  TenantEntitlementEntity,
  MenuGroupEntity,
  MenuItemEntity,
  GenTaskEntity,
  AssetFolderEntity,
  AssetEntity,
  UsageLedgerEntity,
  BatchJobEntity,
  BatchItemEntity,
  ProviderConfigVersionEntity,
  SecretVaultEntity,
  AdminLogEntity,
  AuditLogEntity,
];
