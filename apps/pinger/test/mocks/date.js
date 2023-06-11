const NativeDate = Date;
let frozen = null;
class DateFreeze extends Date {
	freeze(new_date) {
		frozen = new_date;
		global.Date = DateFreeze;
	}

	static now() {
		if(frozen) {
			return frozen.getTime();
		}

		return global.Date.now();
	}

	native_date() {
		return NativeDate;
	}

	unfreeze() {
		frozen = null;
		global.Date = NativeDate;
	}

	toString() {
		return `FrozenDate<frozen.toISOString()>`;
	}
}

const date_freezer = new DateFreeze();

module.exports = { date_freezer };
