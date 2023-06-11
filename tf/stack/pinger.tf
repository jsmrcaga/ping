resource "cloudflare_worker_script" "pinger_worker" {
  account_id = var.cloudflare.account_id
  name = "ping_pinger"
  content = file("./dummy.js")

  module = false

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

resource "cloudflare_worker_cron_trigger" "pinger_schdeuler" {
  account_id = var.cloudflare.account_id
  script_name = cloudflare_worker_script.pinger_worker.name
  schedules = [
    "*/10 * * * *" // every minute
  ]
}
