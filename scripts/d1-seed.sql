-- MLGRD portal — Cloudflare D1 seed content.
-- Mirrors src/lib/data/seed.ts so the live backend starts with the same content
-- as the static demo. Apply AFTER d1-schema.sql:
--   wrangler d1 execute mlgrd --remote --file=scripts/d1-seed.sql
-- Safe to re-run: uses INSERT OR IGNORE on fixed ids.

INSERT OR IGNORE INTO posts (id,slug,title,excerpt,body,category,coverImage,status,date,createdAt,updatedAt) VALUES
('post-solid-waste-bill','draft-solid-waste-management-bill-consultation','Draft Integrated Solid Waste Management Bill open for consultation','The Ministry has published the draft Integrated Solid Waste Management Bill 2026 for public consultation.','The Ministry has published the draft Integrated Solid Waste Management Bill 2026 for public consultation. The proposed framework aims to modernise how waste is collected, managed and recycled across the country.

Citizens, councils and stakeholders are invited to review the draft and share their feedback during the consultation period.','Legislation',NULL,'published','2026-03-12','2026-01-01T00:00:00.000Z','2026-01-01T00:00:00.000Z'),
('post-lgc-capacity','local-government-commission-strengthens-regional-capacity','Local Government Commission strengthens regional capacity','Capacity-building initiatives are underway to support the Local Government Commission and councils across the regions.','Capacity-building initiatives are underway to support the Local Government Commission and councils across the regions. The programme focuses on improving administration, planning and accountability so that local democratic organs can deliver services more effectively to the communities they serve.','Capacity-building',NULL,'published','2026-02-20','2026-01-01T00:00:00.000Z','2026-01-01T00:00:00.000Z'),
('post-report-online','report-a-local-problem-online','Report a local problem online through the Ministry portal','Citizens can now report local issues — such as roads, drainage and sanitation — online through the Ministry portal.','Citizens can now report local issues — such as roads, drainage and sanitation — online through the Ministry portal. The new digital service makes it easier to flag problems and route them to the responsible local authority, helping communities get faster, more transparent responses.','Digital services',NULL,'published','2026-02-04','2026-01-01T00:00:00.000Z','2026-01-01T00:00:00.000Z'),
('post-community-projects','community-development-projects-expand','Community development projects expand across the regions','Community development projects are expanding across Guyana''s regions, including support for hinterland communities.','Community development projects are expanding across Guyana''s regions, including support for hinterland communities. These initiatives partner with local councils and residents to improve infrastructure, public spaces and livelihoods, bringing tangible benefits closer to where people live.','Community development',NULL,'published','2026-01-15','2026-01-01T00:00:00.000Z','2026-01-01T00:00:00.000Z');

INSERT OR IGNORE INTO ministers (id,name,title,portrait,initials,bio,termStart,termEnd,current,"order",createdAt) VALUES
('minister-current','The Hon. Minister','Minister of Local Government & Regional Development',NULL,'HM','Leading the Ministry''s work to deepen local democracy, strengthen councils and bring development closer to every community in Guyana.','2020','',1,0,'2026-01-01T00:00:00.000Z'),
('official-ps','Permanent Secretary','Permanent Secretary',NULL,'PS','Senior administrative head supporting the Ministry''s programmes, planning and accountability across the ten regions.','','',1,1,'2026-01-01T00:00:00.000Z');

INSERT OR IGNORE INTO gallery (id,title,caption,image,category,date,"order",createdAt) VALUES
('gal-council-visit','Council capacity-building session','Regional officers at a planning and accountability workshop.','','Capacity-building','2026-02-18',0,'2026-01-01T00:00:00.000Z'),
('gal-community-project','Community development project','Infrastructure works improving public spaces in the regions.','','Community','2026-01-22',1,'2026-01-01T00:00:00.000Z'),
('gal-consultation','Public consultation','Citizens and stakeholders engaging on new local-government policy.','','Events','2026-03-10',2,'2026-01-01T00:00:00.000Z');
