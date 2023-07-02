import React from 'react';

import { StatusIcon } from '../status-icon/status-icon';
import { classnames, useStatus } from '../../hooks';
import { get_lang, get_date_formatter } from '../../hooks/i18n';

import Styles from './monitor.module.css';

const DAYS_RANGE_CACHE = {};
const MAX_DATA_POINTS = 90;


function l(str) {
	return `00${str}`.slice(-2);
}

function compute_date_range({ from, to, agg={} }) {
	const cache_key = '${from}-${to}';
	if(DAYS_RANGE_CACHE[cache_key]) {
		return DAYS_RANGE_CACHE[cache_key];
	}

	const current_date = new Date(from);
	if(current_date > new Date(to)) {
		DAYS_RANGE_CACHE[cache_key] = agg;
		return agg;
	}

	// This is done to match the DB format
	const formatted_date = `${current_date.getFullYear()}-${l(current_date.getMonth() + 1)}-${l(current_date.getDate())}`;
	agg[formatted_date] = null;

	return compute_date_range({
		from: new Date(current_date.setDate(current_date.getDate() + 1)),
		to,
		agg
	});
};

function sort_checks({ from, to, checks }) {
	// Checks is pre-aggregated between from and to dates
	
	// Algo: compute all necessary days (object)
	const days_range = compute_date_range({ from, to });
	
	// fill with data
	checks.forEach(check => {
		days_range[check.agg_date] = {
			...check,
			monitored: true,
		};
	});

	// fill null values
	const mapped_data = Object.entries(days_range).map(([date, value]) => {
		return value || { monitored: false, agg_date: date };
	});

	if(mapped_data.length > MAX_DATA_POINTS) {
		const extra_points = mapped_data.length - MAX_DATA_POINTS;
		mapped_data.splice(0, extra_points);
	}

	mapped_data.sort((a, b) => new Date(a.agg_date) - new Date(b.agg_date));
	return mapped_data;
}

function MonitorPopupContent({ date, children }) {
	const date_formatter = get_date_formatter();

	return (
		<div className={Styles['monitor-popup']}>
			<div>
				{ children }
			</div>
			<hr/>
			<div className={Styles['secondary-text']}>
				{date_formatter.format(new Date(date))}
			</div>
		</div>
	);
}

function MonitorPopup({ up, ping, date, monitored }) {
	if(!monitored) {
		return (
			<MonitorPopupContent date={date}>
				Not monitored
			</MonitorPopupContent>
		);
	}

	const locales = get_lang();
	const formatter = new Intl.NumberFormat(locales, {
		style: 'decimal',
		minimumFractionDigits: 3
	});

	return (
		<MonitorPopupContent date={date}>
			<div className={Styles.indicator}>
				<div>
					<span className={classnames({
						[Styles['uptime-ok']]: up === 1,
						[Styles['uptime-nok']]: up < 0.7,
					})}>{formatter.format(up * 100)} %</span>
					<label>Uptime</label>
				</div>
				<div>
					<span>{ping} <span className={Styles['secondary-text']}>ms</span></span>
					<label>Ping</label>
				</div>
			</div>
		</MonitorPopupContent>
	);
}


function MonitorPoint({ date, up, ping, monitored, className='' }) {
	return (
		<div className={classnames(className, Styles.point, {
			[Styles['up']]: monitored && up === 1,
			[Styles['down']]: monitored && up !== 1
		})}>
			<MonitorPopup date={date} up={up} ping={ping} monitored={monitored}/>
		</div>
	);
}

function MonitorDetail({ checks }) {
	return (
		<div className={Styles.detail}>
			{
				checks.map((day, i) => {
					const is_last_30 = i >= 60;
					return <MonitorPoint
						key={day.agg_date}
						monitored={day.monitored}
						up={day.agg_up}
						ping={day.agg_ping}
						date={day.agg_date}
						className={classnames({
							[Styles['hide-mobile']]: !is_last_30
						})}
					/>
				})
			}
		</div>
	);
}

export function Monitor({ from, to, monitor }) {
	const locales = get_lang();
	const sorted_checks = sort_checks({ from, to, checks: monitor.checks });

	const monitored_checks = sorted_checks.filter(({ monitored }) => monitored);
	const avg_uptime = monitored_checks.reduce((sum, { agg_up=0 }) => sum + agg_up, 0) / monitored_checks.length * 100;

	const formatter = new Intl.NumberFormat(locales, {
		style: 'decimal',
		minimumFractionDigits: 3
	});

	const status = useStatus({
		up: monitor.currently_up
	});

	return (
		<div className={Styles.monitor}>
			<div className={Styles.title}>
				<span className={Styles['title-container']}>
					<StatusIcon className={Styles['title-icon']} status={status} small/>
					<span>{ monitor.name }</span>
				</span>
				<span className={Styles.endpoint}>{ monitor.config?.endpoint }</span>

				<span className={Styles['full-uptime']}>
					<span className={classnames(Styles.uptime, {
						[Styles['uptime-ok']]: avg_uptime === 100,
						[Styles['uptime-nok']]: avg_uptime !== 100
					})}>
						{ formatter.format(avg_uptime) }%
					</span>
					&nbsp;uptime
				</span>
			</div>

			<MonitorDetail checks={sorted_checks}/>

			<div className={Styles['monitor-footer']}>
				<span className={Styles['hide-mobile']}>{sorted_checks.length} days ago</span>
				<span className={Styles['show-mobile']}>30 days ago</span>
				<span>Today</span>
			</div>
		</div>
	);

}
