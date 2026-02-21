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

@Entity('users')
@Unique(['email'])
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  email!: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @OneToMany(() => SubscriptionEntity, (sub) => sub.user)
  subscriptions!: SubscriptionEntity[];
}

@Entity('subscriptions')
export class SubscriptionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @ManyToOne(() => UserEntity, (user) => user.subscriptions)
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column()
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

  @Column({ name: 'user_id' })
  userId!: string;

  @Column()
  type!: 'store' | 'campaign';

  @Column()
  name!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}

@Entity('tool_definitions')
export class ToolDefinitionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tool_key', unique: true })
  toolKey!: string;

  @Column({ name: 'prompt_template', type: 'text' })
  promptTemplate!: string;

  @Column({ name: 'input_schema', type: 'jsonb' })
  inputSchema!: Record<string, unknown>;

  @Column({ name: 'output_schema', type: 'jsonb' })
  outputSchema!: Record<string, unknown>;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

@Entity('tool_runs')
export class ToolRunEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @Column({ name: 'project_id', nullable: true })
  projectId!: string | null;

  @Column({ type: 'jsonb' })
  inputs!: Record<string, unknown>;

  @Column({ type: 'jsonb' })
  outputs!: Record<string, unknown>;

  @Column({ type: 'int', default: 0 })
  tokens!: number;

  @Column({ type: 'numeric', default: 0 })
  cost!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}

@Entity('workflow_wrappers')
export class WorkflowWrapperEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'workflow_key', unique: true })
  workflowKey!: string;

  @Column({ name: 'runninghub_workflow_id' })
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

@Entity('gen_tasks')
export class GenTaskEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'workflow_key' })
  workflowKey!: string;

  @Column()
  status!: string;

  @Column({ name: 'runninghub_task_id', nullable: true })
  runninghubTaskId!: string | null;

  @Column({ type: 'int', default: 0 })
  progress!: number;

  @Column({ name: 'result_url', nullable: true })
  resultUrl!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}

@Entity('assets')
export class AssetEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  type!: 'text' | 'image' | 'video';

  @Column({ name: 'content_url' })
  contentUrl!: string;

  @Column({ name: 'project_id', nullable: true })
  projectId!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}

@Entity('usage_ledger')
export class UsageLedgerEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @Column({ name: 'resource_type' })
  resourceType!: string;

  @Column({ type: 'numeric' })
  amount!: number;

  @Column()
  reason!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}

@Entity('batch_jobs')
export class BatchJobEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @Column()
  status!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}

@Entity('batch_items')
export class BatchItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'batch_job_id' })
  batchJobId!: string;

  @Column({ type: 'jsonb' })
  payload!: Record<string, unknown>;

  @Column()
  status!: string;
}

@Entity('provider_configs')
@Unique(['providerKey'])
export class ProviderConfigEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'provider_key' })
  providerKey!: 'openai_chat' | 'runninghub' | 'storage';

  @Column({ name: 'config_json', type: 'jsonb' })
  configJson!: Record<string, unknown>;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ name: 'updated_by_admin_id' })
  updatedByAdminId!: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

@Entity('provider_config_versions')
@Unique(['providerKey', 'version'])
export class ProviderConfigVersionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'provider_key' })
  providerKey!: 'openai_chat' | 'runninghub' | 'storage';

  @Column({ type: 'int' })
  version!: number;

  @Column({ name: 'config_json', type: 'jsonb' })
  configJson!: Record<string, unknown>;

  @Column({ name: 'change_note' })
  changeNote!: string;

  @Column({ name: 'created_by_admin_id' })
  createdByAdminId!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}

@Entity('secrets_vault')
@Unique(['secretKey'])
export class SecretVaultEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'secret_key' })
  secretKey!: string;

  @Column({ name: 'encrypted_value', type: 'text' })
  encryptedValue!: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ name: 'rotated_at', type: 'timestamptz', default: () => 'now()' })
  rotatedAt!: Date;

  @Column({ name: 'updated_by_admin_id' })
  updatedByAdminId!: string;
}

@Entity('admin_logs')
export class AdminLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'admin_id' })
  adminId!: string;

  @Column()
  action!: string;

  @Column({ name: 'target_type' })
  targetType!: string;

  @Column({ name: 'target_id', nullable: true })
  targetId!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}

export const ENTITIES = [
  UserEntity,
  SubscriptionEntity,
  ProjectEntity,
  ToolDefinitionEntity,
  ToolRunEntity,
  WorkflowWrapperEntity,
  GenTaskEntity,
  AssetEntity,
  UsageLedgerEntity,
  BatchJobEntity,
  BatchItemEntity,
  ProviderConfigEntity,
  ProviderConfigVersionEntity,
  SecretVaultEntity,
  AdminLogEntity,
];
