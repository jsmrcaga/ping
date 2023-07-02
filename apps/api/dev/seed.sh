# Migrate real db
echo "Applying system migrations...";
wrangler d1 execute ping -y --local --file ../../packages/db/migrations/00-bootstrap.sql
wrangler d1 execute ping -y --local --file ../../packages/db/migrations/01-indexes.sql
wrangler d1 execute ping -y --local --file ../../packages/db/migrations/02-performance.sql
wrangler d1 execute ping -y --local --file ../../packages/db/migrations/03-mc_region.sql
wrangler d1 execute ping -y --local --file ../../packages/db/migrations/04-standalone-performance.sql

# Add fake data
echo "Applying fake data...";
echo "Creating base config...";
wrangler d1 execute ping -y --local --file ./dev/data/01-seed.sql
echo "Creating local data...";
wrangler d1 execute ping -y --local --file ./dev/data/02-data.sql
