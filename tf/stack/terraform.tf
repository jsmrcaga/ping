terraform {
	required_providers {
    cloudflare = {
      source = "cloudflare/cloudflare"
      version = "~> 3.0"
    }

    vercel = {
      source = "vercel/vercel"
      version = "~> 0.4"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare.api_token
}

provider "vercel" {
  api_token = var.vercel.api_token
}
