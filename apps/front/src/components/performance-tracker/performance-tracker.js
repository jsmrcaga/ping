import React from 'react';

import { classnames, usePerformanceStatus } from '../../hooks';
import { Chart } from './chart/chart';

import Styles from './performance-tracker.module.css';

export function PerformanceTrackerGroup({ trackers }) {
	return (
		// A group is a grid of trackers
		<div className={Styles['performance-tracker-group']}>
			{ trackers.map(tracker => <PerformanceTracker key={tracker.id} tracker={tracker} />) }
		</div>
	);
}

function PerformanceTracker({ tracker: { id, name, description, unit, points, width, ok, nok, chart }}) {
	if(!points?.length) {
		return null;
	}

	const [latest_point] = points;

	width = width ?? 4;

	const status = usePerformanceStatus({ value: latest_point.agg_value, ok, nok })

	return (
		<div className={classnames(Styles['performance-tracker'], {
			[Styles['w-1']]: width === 1,
			[Styles['w-2']]: width === 2,
			[Styles['w-3']]: width === 3,
			[Styles['w-4']]: width === 4,
			[Styles['ok']]: status === 'ok',
			[Styles['nok']]: status === 'nok',
		})}>
			<div className={Styles['padding']}>
				<div className={Styles['value']}>
					{latest_point.agg_value}
					{unit && <span>{unit}</span>}
				</div>
				<div className={Styles['title']}>{ name }</div>
				{ description && <div className={Styles['description']}>{ description }</div> }
			</div>
			{
				chart && 
				<div className={Styles['chart']}>
					<Chart points={points} unit={unit}/>
				</div>
			}
		</div>
	);
}
