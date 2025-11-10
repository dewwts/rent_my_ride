

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."user_role_enum" AS ENUM (
    'user',
    'admin'
);


ALTER TYPE "public"."user_role_enum" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_uuid"() RETURNS "uuid"
    LANGUAGE "sql" STABLE
    AS $$
  select gen_random_uuid()
$$;


ALTER FUNCTION "public"."generate_uuid"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_claims"("claims" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  user_role text;
BEGIN
  -- 1. Get the user's role from your user_info table.
  --    We now get the user's ID from the 'sub' claim in the token.
  SELECT role INTO user_role
  FROM public.user_info
  WHERE user_id = (claims->>'sub')::uuid;

  -- 2. Add the 'role' to the 'app_metadata' part of the claims.
  --    jsonb_set is a safe way to add/update a key.
  RETURN jsonb_set(
    claims,
    '{app_metadata,role}',
    to_jsonb(user_role),
    true -- This flag creates 'app_metadata' if it doesn't exist
  );
END;
$$;


ALTER FUNCTION "public"."get_my_claims"("claims" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_role"() RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN (
    SELECT role::text FROM public.user_info WHERE user_id = auth.uid()
  );
END;
$$;


ALTER FUNCTION "public"."get_my_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.user_info (user_id, u_email, u_firstname, u_lastname, role)
  VALUES (
    NEW.id, 
    NEW.email,
    NEW.raw_user_meta_data ->> 'firstname',
    NEW.raw_user_meta_data ->> 'lastname',
    (NEW.raw_user_meta_data ->> 'role')::public.user_role_enum
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE PROCEDURE "public"."update_transaction_and_renting"(IN "p_rid" "uuid", IN "p_amount" integer, IN "p_payment_intent_id" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_lessor_id UUID;
    v_lessee_id UUID;
BEGIN
    -- 1. ค้นหา ID ของผู้เช่าและผู้ให้เช่า
    SELECT r.lessee_id, c.owner_id
    INTO v_lessee_id, v_lessor_id
    FROM public.renting AS r
    JOIN public.car_information AS c ON r.car_id = c.car_id
    WHERE r.renting_id = p_rid; -- <--- แก้ไข: เพิ่ม Semicolon

    -- 2. อัปเดตสถานะการเช่า
    UPDATE public.renting
    SET status = 'Confirmed'
    WHERE renting_id = p_rid; -- <--- แก้ไข: เพิ่ม Semicolon

    -- 3. สร้างประวัติการทำรายการ
    INSERT INTO public.transactions (
        renting_id,
        lessee_id,
        lessor_id,
        amount,
        transaction_date,
        status,
        stripe_payment_intent_id
    )
    VALUES (
        p_rid,
        v_lessee_id,
        v_lessor_id,
        p_amount,
        NOW(),
        'success',
        p_payment_intent_id
    ); -- <--- แก้ไข: เพิ่ม Semicolon

END;
$$;


ALTER PROCEDURE "public"."update_transaction_and_renting"(IN "p_rid" "uuid", IN "p_amount" integer, IN "p_payment_intent_id" "text") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."car_information" (
    "car_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "owner_id" "uuid" NOT NULL,
    "car_conditionrating" integer,
    "daily_rental_price" numeric NOT NULL,
    "car_image" "text",
    "car_brand" character varying(50) NOT NULL,
    "year_created" integer,
    "model" character varying(50) NOT NULL,
    "has_camera" boolean DEFAULT false,
    "number_of_seats" integer NOT NULL,
    "mileage" integer NOT NULL,
    "is_verified" boolean DEFAULT false,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "gear_type" character varying,
    "oil_type" character varying,
    "location" character varying,
    "status" character varying(20),
    CONSTRAINT "car_information_car_conditionrating_check" CHECK ((("car_conditionrating" >= 1) AND ("car_conditionrating" <= 5))),
    CONSTRAINT "car_information_car_image_check" CHECK (("car_image" ~ '^https?://'::"text")),
    CONSTRAINT "car_information_daily_rental_price_check" CHECK (("daily_rental_price" >= (0)::numeric)),
    CONSTRAINT "car_information_mileage_check" CHECK (("mileage" >= 0)),
    CONSTRAINT "car_information_number_of_seats_check" CHECK ((("number_of_seats" >= 1) AND ("number_of_seats" <= 20))),
    CONSTRAINT "car_information_year_created_check" CHECK ((("year_created" >= 1900) AND (("year_created")::numeric <= EXTRACT(year FROM "now"()))))
);


ALTER TABLE "public"."car_information" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."insurance" (
    "insurance_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "renting_id" "uuid" NOT NULL,
    "cost" numeric NOT NULL,
    "package" character varying(200) NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"(),
    CONSTRAINT "insurance_cost_check" CHECK (("cost" >= (0)::numeric))
);


ALTER TABLE "public"."insurance" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."renting" (
    "renting_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "lessee_id" "uuid" NOT NULL,
    "car_id" "uuid" NOT NULL,
    "sdate" "date" NOT NULL,
    "edate" "date" NOT NULL,
    "status" character varying(20) DEFAULT 'Pending'::character varying NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"(),
    CONSTRAINT "renting_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['Pending'::character varying, 'Confirmed'::character varying, 'Cancelled'::character varying, 'Completed'::character varying])::"text"[])))
);


ALTER TABLE "public"."renting" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reviews" (
    "review_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "renting_id" "uuid" NOT NULL,
    "reviewer_id" "uuid" NOT NULL,
    "target_id" "uuid" NOT NULL,
    "rating" integer NOT NULL,
    "comment" "text",
    "created_at" timestamp without time zone DEFAULT "now"(),
    CONSTRAINT "reviews_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."reviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."transactions" (
    "transaction_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "renting_id" "uuid" NOT NULL,
    "lessee_id" "uuid" NOT NULL,
    "lessor_id" "uuid" NOT NULL,
    "amount" numeric NOT NULL,
    "transaction_date" timestamp without time zone DEFAULT "now"(),
    "status" character varying(20) NOT NULL,
    "stripe_payment_intent_id" "text",
    CONSTRAINT "transactions_amount_check" CHECK (("amount" >= (0)::numeric)),
    CONSTRAINT "transactions_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['Pending'::character varying, 'Done'::character varying, 'Failed'::character varying])::"text"[])))
);


ALTER TABLE "public"."transactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_info" (
    "user_id" "uuid" NOT NULL,
    "u_firstname" character varying(50) DEFAULT ''::character varying NOT NULL,
    "u_lastname" character varying(50) DEFAULT ''::character varying NOT NULL,
    "u_phone" character varying(15),
    "u_address" character varying(255),
    "u_email" character varying(255) NOT NULL,
    "role" "public"."user_role_enum" DEFAULT 'user'::"public"."user_role_enum" NOT NULL,
    "is_verified" boolean DEFAULT false,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "url" "text",
    "stripe_account_id" "text",
    CONSTRAINT "user_info_u_email_check" CHECK ((("u_email")::"text" ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::"text")),
    CONSTRAINT "user_info_u_phone_check" CHECK ((("u_phone")::"text" ~ '^[0-9]{10,15}$'::"text"))
);


ALTER TABLE "public"."user_info" OWNER TO "postgres";


COMMENT ON COLUMN "public"."user_info"."url" IS 'URL';



ALTER TABLE ONLY "public"."car_information"
    ADD CONSTRAINT "car_information_pkey" PRIMARY KEY ("car_id");



ALTER TABLE ONLY "public"."insurance"
    ADD CONSTRAINT "insurance_pkey" PRIMARY KEY ("insurance_id");



ALTER TABLE ONLY "public"."renting"
    ADD CONSTRAINT "renting_pkey" PRIMARY KEY ("renting_id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_pkey" PRIMARY KEY ("review_id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_pkey" PRIMARY KEY ("transaction_id");



ALTER TABLE ONLY "public"."user_info"
    ADD CONSTRAINT "user_info_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."user_info"
    ADD CONSTRAINT "user_info_u_email_key" UNIQUE ("u_email");



ALTER TABLE ONLY "public"."user_info"
    ADD CONSTRAINT "user_info_u_phone_key" UNIQUE ("u_phone");



ALTER TABLE ONLY "public"."car_information"
    ADD CONSTRAINT "car_information_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."user_info"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."insurance"
    ADD CONSTRAINT "insurance_renting_id_fkey" FOREIGN KEY ("renting_id") REFERENCES "public"."renting"("renting_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."renting"
    ADD CONSTRAINT "renting_car_id_fkey" FOREIGN KEY ("car_id") REFERENCES "public"."car_information"("car_id");



ALTER TABLE ONLY "public"."renting"
    ADD CONSTRAINT "renting_lessee_id_fkey" FOREIGN KEY ("lessee_id") REFERENCES "public"."user_info"("user_id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_renting_id_fkey" FOREIGN KEY ("renting_id") REFERENCES "public"."renting"("renting_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "public"."user_info"("user_id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_target_id_fkey" FOREIGN KEY ("target_id") REFERENCES "public"."car_information"("car_id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_lessee_id_fkey" FOREIGN KEY ("lessee_id") REFERENCES "public"."user_info"("user_id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_lessor_id_fkey" FOREIGN KEY ("lessor_id") REFERENCES "public"."user_info"("user_id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_renting_id_fkey" FOREIGN KEY ("renting_id") REFERENCES "public"."renting"("renting_id");



ALTER TABLE ONLY "public"."user_info"
    ADD CONSTRAINT "user_info_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can manage all cars." ON "public"."car_information" USING ((( SELECT "user_info"."role"
   FROM "public"."user_info"
  WHERE ("user_info"."user_id" = "auth"."uid"())) = 'admin'::"public"."user_role_enum"));



CREATE POLICY "Admins can manage all insurance records." ON "public"."insurance" USING ((( SELECT "user_info"."role"
   FROM "public"."user_info"
  WHERE ("user_info"."user_id" = "auth"."uid"())) = 'admin'::"public"."user_role_enum"));



CREATE POLICY "Admins can manage all rentals." ON "public"."renting" USING ((( SELECT "user_info"."role"
   FROM "public"."user_info"
  WHERE ("user_info"."user_id" = "auth"."uid"())) = 'admin'::"public"."user_role_enum"));



CREATE POLICY "Admins can manage all reviews." ON "public"."reviews" USING ((( SELECT "user_info"."role"
   FROM "public"."user_info"
  WHERE ("user_info"."user_id" = "auth"."uid"())) = 'admin'::"public"."user_role_enum"));



CREATE POLICY "Admins can manage all transactions." ON "public"."transactions" USING ((( SELECT "user_info"."role"
   FROM "public"."user_info"
  WHERE ("user_info"."user_id" = "auth"."uid"())) = 'admin'::"public"."user_role_enum"));



CREATE POLICY "Allow users to update own profile, and admins to update any" ON "public"."user_info" FOR UPDATE TO "authenticated" USING ((("public"."get_my_role"() = 'admin'::"text") OR ("auth"."uid"() = "user_id"))) WITH CHECK ((("public"."get_my_role"() = 'admin'::"text") OR ("auth"."uid"() = "user_id")));



CREATE POLICY "Lessee and Lessor can delete their rentals." ON "public"."renting" FOR DELETE USING ((("auth"."uid"() = "lessee_id") OR ("auth"."uid"() = ( SELECT "car_information"."owner_id"
   FROM "public"."car_information"
  WHERE ("car_information"."car_id" = "renting"."car_id")))));



CREATE POLICY "Lessee and Lessor can delete their transactions." ON "public"."transactions" FOR DELETE USING ((("auth"."uid"() = "lessee_id") OR ("auth"."uid"() = "lessor_id")));



CREATE POLICY "Lessee and Lessor can select their rentals." ON "public"."renting" FOR SELECT USING ((("auth"."uid"() = "lessee_id") OR ("auth"."uid"() = ( SELECT "car_information"."owner_id"
   FROM "public"."car_information"
  WHERE ("car_information"."car_id" = "renting"."car_id")))));



CREATE POLICY "Lessee and Lessor can select their transactions." ON "public"."transactions" FOR SELECT USING ((("auth"."uid"() = "lessee_id") OR ("auth"."uid"() = "lessor_id")));



CREATE POLICY "Lessee and Lessor can update their rentals." ON "public"."renting" FOR UPDATE USING ((("auth"."uid"() = "lessee_id") OR ("auth"."uid"() = ( SELECT "car_information"."owner_id"
   FROM "public"."car_information"
  WHERE ("car_information"."car_id" = "renting"."car_id")))));



CREATE POLICY "Lessee and Lessor can update their transactions." ON "public"."transactions" FOR UPDATE USING ((("auth"."uid"() = "lessee_id") OR ("auth"."uid"() = "lessor_id")));



CREATE POLICY "Owners can delete their own cars." ON "public"."car_information" FOR DELETE USING (("auth"."uid"() = "owner_id"));



CREATE POLICY "Owners can update their own cars." ON "public"."car_information" FOR UPDATE USING (("auth"."uid"() = "owner_id"));



CREATE POLICY "Owners can view their own cars." ON "public"."car_information" FOR SELECT USING (("auth"."uid"() = "owner_id"));



CREATE POLICY "Public can read reviews." ON "public"."reviews" FOR SELECT USING (true);



CREATE POLICY "Public can view user profiles." ON "public"."user_info" FOR SELECT USING (true);



CREATE POLICY "Public can view verified cars." ON "public"."car_information" FOR SELECT USING (("is_verified" = true));



CREATE POLICY "Related parties can view insurance details." ON "public"."insurance" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."renting" "r"
     JOIN "public"."car_information" "c" ON (("r"."car_id" = "c"."car_id")))
  WHERE (("r"."renting_id" = "insurance"."renting_id") AND (("auth"."uid"() = "r"."lessee_id") OR ("auth"."uid"() = "c"."owner_id"))))));



CREATE POLICY "Reviewers can delete their own reviews." ON "public"."reviews" FOR DELETE USING (("auth"."uid"() = "reviewer_id"));



CREATE POLICY "Reviewers can update their own reviews." ON "public"."reviews" FOR UPDATE USING (("auth"."uid"() = "reviewer_id"));



CREATE POLICY "Users can create own profile" ON "public"."user_info" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create their own cars." ON "public"."car_information" FOR INSERT WITH CHECK (("auth"."uid"() = "owner_id"));



CREATE POLICY "Users can create their own rentals." ON "public"."renting" FOR INSERT WITH CHECK (("auth"."uid"() = "lessee_id"));



CREATE POLICY "Users can create their own reviews." ON "public"."reviews" FOR INSERT WITH CHECK (("auth"."uid"() = "reviewer_id"));



CREATE POLICY "Users can create their own transactions." ON "public"."transactions" FOR INSERT WITH CHECK (("auth"."uid"() = "lessee_id"));



CREATE POLICY "Users can delete own profile" ON "public"."user_info" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own profile" ON "public"."user_info" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own profile" ON "public"."user_info" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own profile" ON "public"."user_info" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "admin_delete_any" ON "public"."user_info" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."user_info" "user_info_1"
  WHERE (("user_info_1"."user_id" = "auth"."uid"()) AND ("user_info_1"."role" = 'admin'::"public"."user_role_enum")))));



ALTER TABLE "public"."car_information" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."insurance" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."renting" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reviews" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."transactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_info" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_info_insert_own" ON "public"."user_info" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "user_info_select_own" ON "public"."user_info" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "user_info_update_own" ON "public"."user_info" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."generate_uuid"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_uuid"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_uuid"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_my_claims"("claims" "jsonb") TO "service_role";
GRANT ALL ON FUNCTION "public"."get_my_claims"("claims" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_claims"("claims" "jsonb") TO "anon";



GRANT ALL ON FUNCTION "public"."get_my_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON PROCEDURE "public"."update_transaction_and_renting"(IN "p_rid" "uuid", IN "p_amount" integer, IN "p_payment_intent_id" "text") TO "anon";
GRANT ALL ON PROCEDURE "public"."update_transaction_and_renting"(IN "p_rid" "uuid", IN "p_amount" integer, IN "p_payment_intent_id" "text") TO "authenticated";
GRANT ALL ON PROCEDURE "public"."update_transaction_and_renting"(IN "p_rid" "uuid", IN "p_amount" integer, IN "p_payment_intent_id" "text") TO "service_role";


















GRANT ALL ON TABLE "public"."car_information" TO "anon";
GRANT ALL ON TABLE "public"."car_information" TO "authenticated";
GRANT ALL ON TABLE "public"."car_information" TO "service_role";



GRANT ALL ON TABLE "public"."insurance" TO "anon";
GRANT ALL ON TABLE "public"."insurance" TO "authenticated";
GRANT ALL ON TABLE "public"."insurance" TO "service_role";



GRANT ALL ON TABLE "public"."renting" TO "anon";
GRANT ALL ON TABLE "public"."renting" TO "authenticated";
GRANT ALL ON TABLE "public"."renting" TO "service_role";



GRANT ALL ON TABLE "public"."reviews" TO "anon";
GRANT ALL ON TABLE "public"."reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."reviews" TO "service_role";



GRANT ALL ON TABLE "public"."transactions" TO "anon";
GRANT ALL ON TABLE "public"."transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."transactions" TO "service_role";



GRANT ALL ON TABLE "public"."user_info" TO "anon";
GRANT ALL ON TABLE "public"."user_info" TO "authenticated";
GRANT ALL ON TABLE "public"."user_info" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























drop extension if exists "pg_net";

alter table "public"."renting" drop constraint "renting_status_check";

alter table "public"."transactions" drop constraint "transactions_status_check";

alter table "public"."renting" add constraint "renting_status_check" CHECK (((status)::text = ANY ((ARRAY['Pending'::character varying, 'Confirmed'::character varying, 'Cancelled'::character varying, 'Completed'::character varying])::text[]))) not valid;

alter table "public"."renting" validate constraint "renting_status_check";

alter table "public"."transactions" add constraint "transactions_status_check" CHECK (((status)::text = ANY ((ARRAY['Pending'::character varying, 'Done'::character varying, 'Failed'::character varying])::text[]))) not valid;

alter table "public"."transactions" validate constraint "transactions_status_check";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


  create policy "Profile pictures are publicly viewable"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'profile-pictures'::text));



  create policy "Users can delete their own profile pictures"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'profile-pictures'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));



  create policy "Users can update their own profile pictures"
  on "storage"."objects"
  as permissive
  for update
  to public
using (((bucket_id = 'profile-pictures'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));



  create policy "Users can upload their own profile pictures"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'profile-pictures'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));



  create policy "can_do_anything 23tg_0"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'car'::text));



  create policy "can_do_anything 23tg_1"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check ((bucket_id = 'car'::text));



  create policy "can_do_anything 23tg_2"
  on "storage"."objects"
  as permissive
  for update
  to public
using ((bucket_id = 'car'::text));



  create policy "can_do_anything 23tg_3"
  on "storage"."objects"
  as permissive
  for delete
  to public
using ((bucket_id = 'car'::text));



  create policy "mbucket public read"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'mbucket'::text));



  create policy "mbucket user delete own objects"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = 'mbucket'::text) AND (owner = auth.uid())));



  create policy "mbucket user insert to own folder"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'mbucket'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "mbucket user update own objects"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using (((bucket_id = 'mbucket'::text) AND (owner = auth.uid())));



