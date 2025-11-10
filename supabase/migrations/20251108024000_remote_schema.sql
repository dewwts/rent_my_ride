alter table "public"."renting" drop constraint "renting_status_check";

alter table "public"."transactions" drop constraint "transactions_status_check";

alter table "public"."renting" add constraint "renting_status_check" CHECK (((status)::text = ANY ((ARRAY['Pending'::character varying, 'Confirmed'::character varying, 'Cancelled'::character varying, 'Completed'::character varying])::text[]))) not valid;

alter table "public"."renting" validate constraint "renting_status_check";

alter table "public"."transactions" add constraint "transactions_status_check" CHECK (((status)::text = ANY ((ARRAY['Pending'::character varying, 'Done'::character varying, 'Failed'::character varying])::text[]))) not valid;

alter table "public"."transactions" validate constraint "transactions_status_check";


