locals {
  environment = coalesce(var.vercel.environment, [])
}

# Handle custom domain if needed
resource "cloudflare_record" "front_custom_domain_dns_record" {
  # only set domain if needed
  zone_id = var.cloudflare.zone_id
  # Naive subdomain spliting to get only the xxx part
  name = split(".", var.endpoints.front)[0]
  value = "cname.vercel-dns.com"
  type = "CNAME"
  ttl = 3600
  proxied = false
}

# Create vercel project
resource "vercel_project" "frontend" {
  name = var.vercel.project_name
  framework = var.vercel.framework
  
  environment = concat(local.environment, [{
    key = "NEXT_PUBLIC_API_URL"
    value = var.endpoints.api
    target = ["production"]
  }])
}

# Attach domain to project
resource "vercel_project_domain" "frontend_custom_domain" {
  project_id = vercel_project.frontend.id
  domain = var.endpoints.front
}
