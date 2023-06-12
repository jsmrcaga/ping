module status_infra {
  source = "./stack"

  cloudflare = var.cloudflare

  vercel = var.vercel

  endpoints = {
    front = "status.jocolina.com"
    api = "api-status.jocolina.com"
  }
}
