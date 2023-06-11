import { headers } from 'next/headers';

function parse_locale_header(header) {
	const reg = /([\w]{2}(-[\w]{0,2})?,?)+(;q=\d\.\d)?/g;
	const result = {};
	for(const match of header.matchAll(header)) {
		const [locales, quality='q=1'] = match[0].split(';');
		const quality_value = parseFloat(quality.replace('q=', ''));

		const locales_list = locales.split(',');
		for(const l of locales_list) {
			result[l] = quality_value;
		}
	}

	return Object.entries(result).sort(([lA, qA], [lB, qB]) => qA - qB).map(([l]) => l);
};

export function get_lang() {
	const user_headers = headers();
	const lang = user_headers.get('Accept-Language');
	return parse_locale_header(lang) || ['en-GB'];
}

export function get_date_formatter() {
	const locales = get_lang();
	return new Intl.DateTimeFormat(locales, { dateStyle: 'long' });
}

const SEC_MS = 1000;
const MIN_MS = SEC_MS * 60;
const HOUR_MS = MIN_MS * 60;
const DAY_MS = HOUR_MS * 24;
const WEEK_MS = DAY_MS * 7;
const MONTH_MS = DAY_MS * 30;
const YEAR_MS = DAY_MS * 365;
function convert_relative_unit(ms) {
	if(ms < MIN_MS) {
		return {
			unit: 'second',
			value: ms / SEC_MS
		};
	}

	if(ms < HOUR_MS) {
		return {
			unit: 'minute',
			value: ms / MIN_MS,
		};
	}

	if(ms < DAY_MS) {
		return {
			unit: 'hour',
			value: ms / HOUR_MS,
		};
	}

	if(ms < WEEK_MS) {
		return {
			unit: 'day',
			value: ms / DAY_MS,
		};
	}

	if(ms < MONTH_MS) {
		return {
			unit: 'week',
			value: ms / WEEK_MS,
		};
	}

	if(ms < YEAR_MS) {
		return {
			unit: 'month',
			value: ms / MONTH_MS,
		};
	}

	return {
		unit: 'year',
		value: ms / YEAR_MS,
	};
}

export function format_relative_date(duration_ms) {
	const locales = get_lang();

	const formatter = new Intl.RelativeTimeFormat(locales, {
		numeric: 'auto',
		style: 'long'
	});

	const { value, unit } = convert_relative_unit(duration_ms);

	const parts = formatter.formatToParts(value, unit);
	return parts.slice(-2).map(({ value }) => value).join(' ');
}
