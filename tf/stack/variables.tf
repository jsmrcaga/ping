variable cloudflare {
  type = object({
    api_token = string
    account_id = string
    zone_id = string

    api_environment = optional(map(string), {})
  })

}

variable endpoints {
  type = object({
    front = string
    api = string  
  })
}

variable vercel {
  type = object({
    api_token = string
    
    project_name = string
    framework = optional(string, "nextjs")
    environment = list(object({
      key = string
      value = string
      target = optional(string, "production")
    }))
  })
}
