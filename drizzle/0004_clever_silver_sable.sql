DO $$
BEGIN
  IF EXISTS (
    SELECT lower(btrim(email))
    FROM users
    GROUP BY lower(btrim(email))
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'Cannot normalize users.email: case-variant or whitespace duplicates exist';
  END IF;
END
$$;
--> statement-breakpoint
UPDATE "users" SET "email" = lower(btrim("email"))
WHERE "email" <> lower(btrim("email"));
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_normalized_check" CHECK ("users"."email" = lower(btrim("users"."email")));
