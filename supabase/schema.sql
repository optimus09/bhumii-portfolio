-- Run this once in your Supabase project's SQL Editor (Database > SQL Editor > New query).

-- 1. PROFILE (singleton row)
create table if not exists profile (
  id integer primary key default 1,
  name text not null default '',
  role text not null default '',
  location text not null default '',
  email text not null default '',
  github_url text not null default '',
  linkedin_url text not null default '',
  medium_url text not null default '',
  hero_thesis text not null default '',
  about_paragraph_1 text not null default '',
  about_paragraph_2 text not null default '',
  quick_facts jsonb not null default '[]',
  stats jsonb not null default '[]',
  photo_url text,
  self_check_enabled boolean not null default true,
  constraint singleton check (id = 1)
);

-- 2. EVIDENCE ITEMS
create table if not exists evidence_items (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('ip', 'peer_review', 'conference')),
  tag_label text not null default '',
  tag_color text not null default 'blue' check (tag_color in ('blue','purple','green','yellow')),
  title text not null default '',
  meta_lines text[] not null default '{}',
  note text,
  pdf_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 3. PROJECTS
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  description text not null default '',
  note text,
  tags text[] not null default '{}',
  live_demo_url text,
  code_url text,
  is_live boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Row Level Security: public can READ everything, only a logged-in user can WRITE.
alter table profile enable row level security;
alter table evidence_items enable row level security;
alter table projects enable row level security;

create policy "public read profile" on profile for select using (true);
create policy "auth write profile" on profile for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "public read evidence" on evidence_items for select using (true);
create policy "auth write evidence" on evidence_items for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "public read projects" on projects for select using (true);
create policy "auth write projects" on projects for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Storage buckets (create these in Storage tab, or via this SQL)
insert into storage.buckets (id, name, public) values ('profile-photos', 'profile-photos', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('evidence-pdfs', 'evidence-pdfs', true)
  on conflict (id) do nothing;

create policy "public read profile-photos" on storage.objects for select using (bucket_id = 'profile-photos');
create policy "auth write profile-photos" on storage.objects for all using (bucket_id = 'profile-photos' and auth.role() = 'authenticated') with check (bucket_id = 'profile-photos' and auth.role() = 'authenticated');

create policy "public read evidence-pdfs" on storage.objects for select using (bucket_id = 'evidence-pdfs');
create policy "auth write evidence-pdfs" on storage.objects for all using (bucket_id = 'evidence-pdfs' and auth.role() = 'authenticated') with check (bucket_id = 'evidence-pdfs' and auth.role() = 'authenticated');

-- Seed the profile singleton row and starting content.
insert into profile (id, name, role, location, email, github_url, linkedin_url, medium_url, hero_thesis, about_paragraph_1, about_paragraph_2, quick_facts, stats, photo_url)
values (
  1,
  'Bhumii Shah',
  'AI Data Quality Specialist',
  'London, UK',
  'bhumiishah33@gmail.com',
  'https://github.com/Bhumii-AI-IoT',
  'https://linkedin.com/in/bhumii-shah-ai-iot',
  'https://medium.com/@bhumiishah33',
  'I work with AI training data every day, so I know exactly how quietly bad data breaks a model. I build and review systems in healthcare and biomedical electronics — where that failure mode costs the most.',
  'I work in AI data quality in London — reviewing multilingual audio and conversational AI training data, including Indic languages. Doing that every day, I kept noticing the same thing: a model trained on averages fails the people who don''t fit the average.',
  'A regional accent isn''t an edge case. A less-resourced language isn''t an edge case. They''re only edge cases if you built for the average. That observation is what the registered designs, the peer review work, and the software below all trace back to — checking whether a system still holds up when it meets someone it wasn''t built to expect.',
  '[
    {"label":"Role","value":"AI Data Quality Specialist, Sigma AI — London, permanent since April 2024"},
    {"label":"Education","value":"MSc Global Project Management, University of Essex"},
    {"label":"Education","value":"BE Electronics & Communications Engineering"},
    {"label":"Field","value":"Data quality and trustworthy AI, applied to healthcare and biomedical systems"},
    {"label":"Endorsing body","value":"Tech Nation — Digital Technology route"}
  ]'::jsonb,
  '[
    {"label":"Registered UK Designs","value":2},
    {"label":"Manuscripts Peer-Reviewed","value":3},
    {"label":"SPACAID Meta-Reviews","value":5},
    {"label":"Conference Papers Presented","value":2}
  ]'::jsonb,
  null
)
on conflict (id) do nothing;

insert into evidence_items (category, tag_label, tag_color, title, meta_lines, note, sort_order) values
('ip', 'Registered Design · UK IPO', 'blue', 'Alzheimer''s Disease Prediction Device with Artificial Intelligence',
  array['Design No. 6521594 · Class 24, Medical & Laboratory Equipment','Registered 21 April 2026 · Granted 5 May 2026','Co-authored with Shyamkumar Parikh'],
  'A registered design protects the device''s appearance, not its function.', 1),
('ip', 'Registered Design · UK IPO', 'blue', 'Robotic Fleet Control Console',
  array['Design No. 6521595 · Class 14, Data Processing Equipment','Registered 21 April 2026 · Granted 1 May 2026','Co-authored with Shyamkumar Parikh'],
  null, 2),
('ip', 'Published Patent Application · India', 'purple', 'AI-enabled smart healthcare wearable bracelet for continuous real-time patient monitoring and predictive health analytics',
  array['Application No. 202611062464 · Publication No. IN202611062464 A1','Filed 17 May 2026 · Published 17 July 2026','Co-applicant Dr. Anurag Shrivastava'],
  'Published application — not yet examined or granted.', 3),
('peer_review', 'Peer Reviewer', 'green', 'Springer Nature — Scientific Reports',
  array['3 manuscripts reviewed, 2026 · Reviewer certificate issued'], null, 4),
('peer_review', 'Meta-Reviewer', 'green', 'SPACAID 2026',
  array['IEEE-sponsored · IPS Academy · Invited via Microsoft CMT, 24 July 2026','5 papers assigned · 3 meta-review decisions completed — one Minor Revision, one Major Revision, one Desk Reject'],
  'Subject matter: deep CNN leukaemia classification, EEG-driven cognitive regulation, biomedical instrumentation, explainable multimodal deep learning for heart disease, FPGA collision avoidance.', 5),
('conference', 'Presented · Co-author', 'yellow', 'Adaptive Intrusion Detection System with Random Forest Classifier and Web-Based Interface',
  array['Ref. PU/PiCET26/COP/147 · Presented May 2026 · 8th Parul University International Conference on Engineering & Technology (PiCET 2026)'],
  'With Mukesh Patidar, K. Mani Kumar, K. Shailandra Ganesh, T.S.V.N. Siva Prasad, Krupali Dave, M. Chaitanya Ram. Publication partner: IET Conference Proceedings, Scopus-indexed — proceedings pending.', 6),
('conference', 'Presented · Co-author', 'yellow', 'AgroSMART: An Advanced Agriculture Platform',
  array['Ref. PU/PiCET26/COP/153 · Presented May 2026 · 8th Parul University International Conference on Engineering & Technology (PiCET 2026)'],
  'With Penta Mahesh, Gurram Naveen, Gujja Sai Lokesh, Krupali Dave, Poonam Songde, Rangala Vamshi Reddy. Publication partner: IET Conference Proceedings, Scopus-indexed — proceedings pending.', 7)
on conflict do nothing;

insert into projects (name, description, note, tags, live_demo_url, code_url, is_live, sort_order) values
('audio-qa-dashboard',
  'Quality-tracking dashboard for multilingual audio and conversational AI data. Tracks approval rates, rejection patterns, and risk flags across projects, with a Random Forest model predicting which projects miss the quality gate early.',
  'Data in the repo is synthetic, modelling patterns from daily QA review — no client records.',
  array['Python','Streamlit','scikit-learn'],
  'https://audio-app-dashboard-nun6jt8bkandqfhza9xpsv.streamlit.app/',
  'https://github.com/Bhumii-AI-IoT/audio-qa-dashboard', true, 1),
('alzheimer-ai-device',
  'Companion repository to UK Registered Design 6521594 — signal processing and ML classification for early Alzheimer''s detection, moving the concept from a design drawing into tested work.',
  'Rebuilt on a publicly available clinical EEG dataset (OpenNeuro ds004504 — 88 subjects, 19-channel, CC0). ROC-AUC 0.789 under leave-one-subject-out cross-validation.',
  array['Python','Signal Processing','EEG'],
  null, 'https://github.com/Bhumii-AI-IoT/alzheimer-ai-device', false, 2),
('ai-care-alert',
  'AI-assisted emergency alert system for people living alone, elderly, and disabled individuals — tiered alert logic and fall-detection simulation built around individual thresholds rather than one-size-fits-all defaults.',
  null, array['Python','System Design'],
  null, 'https://github.com/Bhumii-AI-IoT/ai-care-alert', false, 3),
('AI-IoT-Maintenance',
  'Predictive maintenance using a Random Forest model on simulated IoT sensor data — data generation, training, and prediction with confidence scores.',
  null, array['Python','Random Forest','IoT'],
  null, 'https://github.com/Bhumii-AI-IoT/AI-IoT-Maintenance', false, 4)
on conflict do nothing;
