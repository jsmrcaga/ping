wrangler d1 execute ping -y --local --file ./migrations/00-bootstrap.sql
wrangler d1 execute ping -y --local --file ./migrations/01-indexes.sql
wrangler d1 execute ping -y --local --file ./migrations/02-performance.sql
wrangler d1 execute ping -y --local --file ./migrations/03-mc_region.sql
wrangler d1 execute ping -y --local --file ./migrations/04-standalone-performance.sql
