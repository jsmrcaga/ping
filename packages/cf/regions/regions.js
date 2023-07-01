// https://www.feitsui.com/en/article/26
const CF_REGIONS = require('./cf_regions.json');
const CF_REGION_ENDPOINT = 'https://cloudflare-dns.com/dns-query';

class CloudflareRegion {
	from_colo(colo) {
		return CF_REGIONS[colo] || null;
	}

	region() {
		return fetch(CF_REGION_ENDPOINT, {
			method: 'OPTIONS'
		}).then(res => {
			const cf_ray = res.headers.get('cf-ray');

			if(!cf_ray) {
				return null;
			}

			const [id, colo] = cf_ray.split('-');

			const region = this.from_colo(colo);
			if(!region) {
				return null;
			}

			return {
				...region,
				colo
			};
		}).catch(e => {
			// Region is not 100% necessary
			console.error(e);

			return null;
		});
	}
}

const cf_region = new CloudflareRegion();
module.exports = cf_region;
