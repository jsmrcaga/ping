import { headers } from 'next/headers';

export const getHost = () => {
	const req_headers = headers();
	const [host] = (req_headers.get('host') || '').split(':');
	return host;
};
