export * from './classnames';
export * from './performance';

export const useStatus = ({ up, incidents=[], maintenance=[] }) => {
	if(!up) {
		return 'down';
	}

	if(incidents.length) {
		return 'down';
	}

	if(maintenance.length) {
		return 'maintenance';
	}

	return 'up';
};
