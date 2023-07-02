import React from 'react';

function nn(v) {
	return v !== null && v !== undefined;
}

function test_value(value, { gt, lt, gte, lte, eq }={}) {
	if(nn(eq)) {
		return value === eq;
	}

	if(nn(gt)) {
		return value > gt;
	}

	if(nn(gte)) {
		return value >= gte;
	}

	if(nn(lt)) {
		return value < lt;
	}

	if(nn(lte)) {
		return value <= lte;
	}

	return false;
}

export function usePerformanceStatus({
	value,
	ok,
	nok
}) {
	return React.useMemo(() => {
		console.log('Comparing', { value, ok, nok });
		if(!ok && !nok) {
			return null;
		}

		if(test_value(value, ok)) {
			return 'ok';
		}

		if(test_value(value, nok)) {
			return 'nok';
		}

		return null;
	}, [value, ok, nok]);
}
