variable cloudflare {
  type = object({
    api_token = string
    account_id = string
    zone_id = string
  })
}
