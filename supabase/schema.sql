-- ============================================================
-- Phong Vũ Help Center - Lược đồ CSDL ĐỀ XUẤT cho Supabase
-- Frontend đang gọi đúng các bảng/cột/hàm dưới đây.
-- Nếu BE (Phạm Khoa) đã tạo bảng khác tên, sửa lại trong
-- src/services/supabaseApi.js cho khớp, KHÔNG cần chạy file này.
-- Cách chạy: Supabase Dashboard > SQL Editor > dán toàn bộ > Run
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- Bảng ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text,
  phone text,
  role text not null default 'customer' check (role in ('customer','technician','admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.branches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text
);

create table if not exists public.parts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'Khác',
  price numeric not null default 0,
  stock int not null default 0
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  customer_id uuid references public.profiles(id),
  customer_name text not null,
  phone text not null,
  email text,
  branch_id uuid not null references public.branches(id),
  brand text,
  model text,
  issue_type text,
  description text,
  appointment_date date not null,
  time_slot text not null,
  status text not null default 'cho_xac_nhan'
    check (status in ('cho_xac_nhan','da_xac_nhan','da_tiep_nhan','dang_sua','cho_linh_kien','hoan_thanh','da_tra_may','da_huy')),
  technician_id uuid,
  note text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bookings_technician_id_fkey foreign key (technician_id) references public.profiles(id)
);

create table if not exists public.booking_logs (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  status text not null,
  note text default '',
  changed_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.quote_items (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  part_id uuid references public.parts(id) on delete set null,
  description text not null,
  quantity int not null default 1,
  unit_price numeric not null default 0
);

-- ---------- Tự tạo profile khi đăng ký ----------
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email, phone, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), new.email, new.raw_user_meta_data->>'phone', 'customer');
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------- Ghi log khi khách đặt lịch ----------
create or replace function public.log_new_booking() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.booking_logs (booking_id, status, note, changed_by)
  values (new.id, new.status, 'Khách hàng đặt lịch online', new.customer_id);
  return new;
end $$;

drop trigger if exists on_booking_created on public.bookings;
create trigger on_booking_created after insert on public.bookings
for each row execute function public.log_new_booking();

-- ---------- Hàm tiện ích ----------
create or replace function public.my_role() returns text
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

-- Đếm số lịch đã đặt theo khung giờ (khách chưa đăng nhập cũng gọi được)
create or replace function public.get_slot_usage(p_branch_id uuid, p_date date)
returns table(time_slot text, total bigint)
language sql stable security definer set search_path = public as $$
  select time_slot, count(*) from public.bookings
  where branch_id = p_branch_id and appointment_date = p_date and status <> 'da_huy'
  group by time_slot
$$;

-- Tra cứu tiến độ bằng mã lịch hẹn + số điện thoại
create or replace function public.track_booking(p_code text, p_phone text)
returns json language sql stable security definer set search_path = public as $$
  select json_build_object(
    'id', b.id, 'code', b.code, 'customer_name', b.customer_name, 'phone', b.phone,
    'brand', b.brand, 'model', b.model, 'issue_type', b.issue_type, 'description', b.description,
    'appointment_date', b.appointment_date, 'time_slot', b.time_slot, 'status', b.status,
    'created_at', b.created_at, 'updated_at', b.updated_at,
    'branch', (select row_to_json(br) from public.branches br where br.id = b.branch_id),
    'technician', (select json_build_object('id', p.id, 'full_name', p.full_name) from public.profiles p where p.id = b.technician_id),
    'logs', coalesce((select json_agg(l order by l.created_at) from public.booking_logs l where l.booking_id = b.id), '[]'),
    'quote_items', coalesce((select json_agg(q) from public.quote_items q where q.booking_id = b.id), '[]')
  )
  from public.bookings b
  where upper(b.code) = upper(p_code) and replace(b.phone,' ','') = p_phone
$$;

-- ---------- Phân quyền (RLS) ----------
alter table public.profiles enable row level security;
alter table public.branches enable row level security;
alter table public.parts enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_logs enable row level security;
alter table public.quote_items enable row level security;

drop policy if exists "profiles read" on public.profiles;
create policy "profiles read" on public.profiles for select
  using (id = auth.uid() or public.my_role() in ('admin','technician'));
drop policy if exists "profiles admin write" on public.profiles;
create policy "profiles admin write" on public.profiles for update using (public.my_role() = 'admin');

drop policy if exists "branches read" on public.branches;
create policy "branches read" on public.branches for select using (true);

drop policy if exists "parts read" on public.parts;
create policy "parts read" on public.parts for select using (true);
drop policy if exists "parts admin" on public.parts;
create policy "parts admin" on public.parts for all using (public.my_role() = 'admin') with check (public.my_role() = 'admin');

drop policy if exists "bookings insert" on public.bookings;
create policy "bookings insert" on public.bookings for insert
  with check (status = 'cho_xac_nhan' and (customer_id is null or customer_id = auth.uid()));
drop policy if exists "bookings read" on public.bookings;
create policy "bookings read" on public.bookings for select using (
  public.my_role() = 'admin'
  or technician_id = auth.uid()
  or customer_id = auth.uid()
);
drop policy if exists "bookings update" on public.bookings;
create policy "bookings update" on public.bookings for update using (
  public.my_role() = 'admin' or technician_id = auth.uid()
);

drop policy if exists "logs read" on public.booking_logs;
create policy "logs read" on public.booking_logs for select using (
  exists (select 1 from public.bookings b where b.id = booking_id)
);
drop policy if exists "logs insert" on public.booking_logs;
create policy "logs insert" on public.booking_logs for insert with check (public.my_role() in ('admin','technician'));

drop policy if exists "quotes read" on public.quote_items;
create policy "quotes read" on public.quote_items for select using (
  exists (select 1 from public.bookings b where b.id = booking_id)
);
drop policy if exists "quotes write" on public.quote_items;
create policy "quotes write" on public.quote_items for all
  using (public.my_role() in ('admin','technician'))
  with check (public.my_role() in ('admin','technician'));

-- ---------- Dữ liệu mẫu ----------
insert into public.branches (name, address) values
  ('Help Center Quận 10', '264 Lý Thường Kiệt, Phường 14, Quận 10, TP.HCM'),
  ('Help Center Quận 1', '132 Nguyễn Thị Minh Khai, Quận 1, TP.HCM'),
  ('Help Center Thủ Đức', '15 Võ Văn Ngân, TP. Thủ Đức, TP.HCM')
on conflict do nothing;

insert into public.parts (name, category, price, stock) values
  ('Màn hình 15.6" FHD IPS 144Hz', 'Màn hình', 2450000, 6),
  ('Bàn phím Asus TUF F15', 'Bàn phím', 650000, 8),
  ('Pin Dell Latitude 3 cell', 'Pin', 890000, 5),
  ('RAM DDR4 8GB 3200MHz', 'RAM', 520000, 20),
  ('SSD NVMe 512GB', 'SSD', 1090000, 15),
  ('Vệ sinh + tra keo tản nhiệt', 'Dịch vụ', 250000, 999);

-- Tạo tài khoản Admin/KTV: đăng ký bình thường trên web, sau đó chạy
-- update public.profiles set role = 'admin' where email = 'email_cua_ban@...';
-- update public.profiles set role = 'technician' where email = 'email_ktv@...';
