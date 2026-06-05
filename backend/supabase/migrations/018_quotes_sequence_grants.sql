-- serial id on quotes requires sequence privileges for service_role inserts.

grant usage, select on sequence public.quotes_id_seq to service_role;

notify pgrst, 'reload schema';
