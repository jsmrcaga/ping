module ping_repo {
  source = "git@github.com:jsmrcaga/terraform-modules//github-repo?ref=v0.1.5"

  github = {
    token = var.github_token
  }

  name = "ping"
  description = "A simple status page built over CloudFlare Workers"

  topics = ["management", "infrastructure", "reporting", "status"]

  actions = {
    secrets = {
      CF_ACCOUNT_ID = var.cloudflare.account_id
      CF_API_TOKEN = var.cloudflare.api_token
      CF_ZONE_ID = var.cloudflare.zone_id

      VERCEL_TOKEN = var.vercel.api_token
    }
  }
}
