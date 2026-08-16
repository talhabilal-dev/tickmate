CREATE TYPE "public"."audit_action" AS ENUM('login', 'logout', 'user_created', 'user_deleted', 'user_role_updated', 'user_status_updated', 'ticket_created', 'ticket_updated', 'ticket_assigned', 'ticket_completed', 'ticket_deleted');--> statement-breakpoint
CREATE TYPE "public"."audit_entity_type" AS ENUM('auth', 'user', 'ticket');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "audit_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"action" "audit_action" NOT NULL,
	"entity_type" "audit_entity_type" NOT NULL,
	"entity_id" integer,
	"actor_user_id" integer,
	"target_user_id" integer,
	"ticket_id" integer,
	"assigned_from_user_id" integer,
	"assigned_to_user_id" integer,
	"description" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_target_user_id_users_id_fk" FOREIGN KEY ("target_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_assigned_from_user_id_users_id_fk" FOREIGN KEY ("assigned_from_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_assigned_to_user_id_users_id_fk" FOREIGN KEY ("assigned_to_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_audit_logs_created_at" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_action_created_at" ON "audit_logs" USING btree ("action","created_at");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_actor_created_at" ON "audit_logs" USING btree ("actor_user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_target_user_created_at" ON "audit_logs" USING btree ("target_user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_ticket_created_at" ON "audit_logs" USING btree ("ticket_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_assigned_to_created_at" ON "audit_logs" USING btree ("assigned_to_user_id","created_at");