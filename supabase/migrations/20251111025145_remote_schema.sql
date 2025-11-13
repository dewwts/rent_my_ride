alter table "public"."renting" drop constraint "renting_status_check";

alter table "public"."transactions" drop constraint "transactions_status_check";

alter table "public"."renting" add constraint "renting_status_check" CHECK (((status)::text = ANY ((ARRAY['Pending'::character varying, 'Confirmed'::character varying, 'Cancelled'::character varying, 'Completed'::character varying])::text[]))) not valid;

alter table "public"."renting" validate constraint "renting_status_check";

alter table "public"."transactions" add constraint "transactions_status_check" CHECK (((status)::text = ANY ((ARRAY['Pending'::character varying, 'Done'::character varying, 'Failed'::character varying])::text[]))) not valid;

alter table "public"."transactions" validate constraint "transactions_status_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.check_car_availability(p_car_id uuid, p_start_date timestamp with time zone, p_end_date timestamp with time zone)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    is_available BOOLEAN;
BEGIN
    SELECT NOT EXISTS (
        SELECT 1
        FROM public.renting -- <-- เปลี่ยนชื่อ table
        WHERE
            car_id = p_car_id   -- <-- เปลี่ยนชื่อคอลัมน์ car_id
            AND status = 'Confirmed'  -- <-- เพิ่มการตรวจสอบ status ที่นี่
            AND (
                (sdate, edate) OVERLAPS (p_start_date, p_end_date) -- <-- เปลี่ยนชื่อคอลัมน์ sdate, edate
            )
    ) INTO is_available;

    RETURN is_available;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_my_role()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN (
    SELECT role::text FROM public.user_info WHERE user_id = auth.uid()
  );
END;
$function$
;


