'use client';

import React from 'react';

import {
	AreaChart,
	Area,
	Tooltip,
	ResponsiveContainer
} from 'recharts';

import Styles from './chart.module.css';

function ChartTooltip({ payload, unit }) {
	if(!payload?.length) {
		return null;
	}

	const { payload: { value, name }} = payload[0];
	return (
		<div className={Styles['chart-tooltip']}>
			<div className={Styles['value']}>
				{value}
				{unit && <span>{unit}</span>}
			</div>
			<div>{name}</div>
		</div>
	);
}


export function Chart({ points, unit }) {
	const data = React.useMemo(() => {
		const date_formatter = new Intl.DateTimeFormat(window.navigator.language, {
			dateStyle: 'long',
			timeStyle: 'short'
		});
		return points.map(({ agg_value, agg_date }) => {
			return {
				name: date_formatter.format(new Date(agg_date)),
				value: agg_value
			};
		})
	}, [points]);

	return (
		<ResponsiveContainer width="100%" height="100%">
			<AreaChart data={data} margin={{ top: 10, left: 0, right: 0, bottom: 0 }}>
				<Tooltip content={<ChartTooltip unit={unit}/>}/>

				{/*
					For some reason declaring the defs outside does not work 
					I'm guessing they filter every component
				*/}
				<defs>
					<linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
						<stop offset="5%" stopColor="#1368ed" stopOpacity={0.8}/>
						<stop offset="100%" stopColor="#1368ed" stopOpacity={0}/>
					</linearGradient>
				</defs>

				<Area
					type="monotone"
					dataKey="value"
					stroke="#1368ed"
					fill="url(#chartGradient)"
					fillOpacity={0.8}
				/>
			</AreaChart>
		</ResponsiveContainer>
	);
}
