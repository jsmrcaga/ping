resource "cloudflare_worker_script" "ping_worker_script" {
  account_id = var.cloudflare.account_id
  name = "ping_api"
  content = file("./dummy.js")

  module = true

  # For D1
  # service_binding {
  #   name = "PING_DB"
  #   service = "ping"
  # }

  lifecycle {
    # Do not try to reset code
    ignore_changes = [content]
  }
}

resource "cloudflare_worker_route" "api_route" {
  zone_id = var.cloudflare.zone_id
  pattern = "${var.endpoints.api}/*"
  script_name = cloudflare_worker_script.ping_worker_script.name
}

resource cloudflare_record "api_status_jocolina" {
  zone_id = var.cloudflare.zone_id

  name = "api-status"
  type = "CNAME"
  value = "jocolina.com"

  proxied = true
}
