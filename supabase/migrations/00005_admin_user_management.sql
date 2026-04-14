-- Update handle_new_user() to copy role from app_metadata
-- when admin creates a user via auth.admin.createUser()

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_app_meta_data ->> 'role')::public.user_role, 'customer')
  );
  return new;
end;
$$;
