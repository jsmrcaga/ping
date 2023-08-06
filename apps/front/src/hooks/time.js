const ISOStringRegex = /^\d{4}-\d{2}-\d{2}T(\d{2}:){2}\d{2}.\d{3}Z/;

const UNIT_TO_MS = {
	year: 1000 * 60 * 60 * 24 * 365.25,
	month: 1000 * 60 * 60 * 24 * 30,
	week: 1000 * 60 * 60 * 24 * 7, 
	day: 1000 * 60 * 60 * 24,
	hour: 1000 * 60 * 60,
	minute: 1000 * 60,
	second: 1000
};

class DateParser {
	parse_unit(qtty, unit) {
		const single_unit = unit.replace(/s$/, '');
		if(!UNIT_TO_MS[single_unit]) {
			throw new Error(`Unknown unit "${single_unit}" (from "${unit}")`);
		}

		const equivalence = UNIT_TO_MS[single_unit];
		return qtty * equivalence;
	}

	parse(time) {
		// Formats:
		// - ISOString
		// - w months, v weeks, x days, y hours, z minutes, zz seconds
		const parts = time.split(',');
		let total_ms = 0;
		for(const part of parts) {
			const [qtty, unit] = part.trim().split(' ');

			const equivalent_ms = this.parse_unit(Number.parseFloat(qtty.trim()), unit.trim());
			total_ms += equivalent_ms;
		}

		return total_ms;
	}

	from(time) {
		if(ISOStringRegex.test(time)) {
			return new Date(time);
		}

		const time_ms = this.parse(time);
		return new Date(Date.now() - time_ms);
	}

	to(time) {
		if(ISOStringRegex.test(time)) {
			return new Date(time);
		}

		const time_ms = this.parse(time);
		return new Date(Date.now() + time_ms);
	}
}

const parser = new DateParser();
// export default parser;
