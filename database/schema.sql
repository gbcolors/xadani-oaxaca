create table if not exists reservations (
  id serial primary key,
  folio text unique not null,
  name text not null,
  phone text not null,
  email text,
  guests integer not null default 1,
  reservation_time text not null,
  restrictions text default '',
  payment_type text default 'free',
  payment_label text default 'Reserva sin cargo',
  payment_total integer default 0,
  payment_status text default 'not_required',
  status text default 'pending',
  table_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists tables (
  id text primary key,
  capacity integer not null,
  zone text not null,
  status text not null default 'free',
  shape text not null default 'square',
  x integer not null default 0,
  y integer not null default 0,
  updated_at timestamptz default now()
);

create table if not exists menu_items (
  id serial primary key,
  category text not null,
  name text not null,
  description text not null,
  price integer not null,
  image text,
  tags text[] default array[]::text[],
  active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz default now()
);

create table if not exists admin_users (
  username text primary key,
  salt text not null,
  password_hash text not null,
  updated_at timestamptz default now()
);
