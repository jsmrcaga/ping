variable github_token {
  type = string
}

variable cloudflare {
  type = object({
    api_token = string
    account_id = string
    zone_id = string
  })
}

variable vercel {
  type = object({
    api_token = string
    
    project_name = string
    framework = optional(string, "nextjs")
    environment = optional(list(object({
      key = string
      value = string
      target = optional(string, "production")
    })), [])
  })
}
