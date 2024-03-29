resource "cloudflare_worker_script" "pinger_worker" {
  account_id = var.cloudflare.account_id
  name = "ping_pinger"
  content = file("./dummy.js")

  module = true

  dynamic "secret_text_binding" {
    for_each = var.cloudflare.api_environment
    iterator = env

    content {
      name = env.key
      text = env.value
    }
  }

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
    "*/5 * * * *" // every 5 minutes
  ]
}
