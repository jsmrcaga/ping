module ping_repo {
  source = "git@github.com:jsmrcaga/terraform-modules//github-repo?ref=v0.1.5"

  github = {
    token = var.github_token
  }

  name = "ping"
  description = "A simple status page built over CloudFlare Workers"

  topics = ["management", "infrastructure", "reporting", "status"]
}
