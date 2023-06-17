import React from 'react';

import Link from 'next/link';

import { Box } from '../section/section';
import { Tag } from '../tag/tag';
import { StatusIcon, Icon } from '../status-icon/status-icon';
import ArrowRightSVG from '../icons/arrow-right';

import { useStatus, classnames } from '../../hooks';
import { get_lang, format_relative_date } from '../../hooks/i18n';

import Styles from './banner.module.css';

const STATUS_MESSAGE = {
	down: 'Some services are down',
	maintenance:'Maintenance ongoing',
	up: 'All services are online',
};

function IncidentDate({ name, date, className }) {
	return (
		<div className={classnames(Styles['incident-date'], className)}>
			<span>{ name }</span>
			<span>{ date }</span>
		</div>
	);
}

export function Incident({ monitors={}, incident, className, button=true }) {
	const { is_maintenance } = incident;
	const locales = get_lang();
	const formatter = new Intl.DateTimeFormat(locales, {
		dateStyle: 'short',
		timeStyle: 'long'
	});

	const monitor = monitors[incident.monitor_id];

	return (
		<Link href={`/incidents/${incident.id}`} className={classnames(Styles.link, Styles['incident-link'], className)}>
			<div className={Styles.incident}>
				<div className={Styles['big-button']}>
					<StatusIcon
						small
						status={is_maintenance ? 'maintenance' : 'down'}
					/>

					<div className={Styles['incident-text']}>
						<div className={Styles['incident-title']}>
							<Tag>{ monitor.name }</Tag>
							<span>{ incident.title }</span>
						</div>

						<div className={Styles['incident-dates']}>
							<IncidentDate
								name={new Date(incident.from) > new Date() ? 'Starts' : 'Started'}
								date={formatter.format(new Date(incident.from))}
							/>

							{
								incident.to &&
								<IncidentDate
									name={'Resolved'}
									date={formatter.format(new Date(incident.to))}
								/>
							}

							{
								Boolean(incident.expected_duration && !incident.to) &&
								<IncidentDate
									name={'Expected duration'}
									date={format_relative_date(incident.expected_duration)}
								/>
							}
						</div>

						{
							incident.description &&
							<span className={Styles.description}>
								{ incident.description }
							</span>
						}
					</div>

					{
						button &&
						<div className={Styles['button-container']}>
							<Icon small button IconComponent={ArrowRightSVG}/>
						</div>
					}
				</div>
			</div>
		</Link>
	);
}


export function MainBanner({ monitors=[], incidents=[], scheduled_maintenance=[] }) {
	const all_up = Object.values(monitors).every(({ currently_up }) => currently_up);
	const current_incidents = incidents.filter(({ to }) => to === null);
	const current_maintenance = scheduled_maintenance.filter(({ to }) => to === null);

	const status = useStatus({ up: all_up, incidents: current_incidents, maintenance: current_maintenance });

	const show_incidents = current_incidents.length || current_maintenance.length;

	return (
		<Box className={Styles.banner}>
			<div className={Styles.title}>
				<StatusIcon status={status}/>
				<h2>{ STATUS_MESSAGE[status] || STATUS_MESSAGE.up }</h2>
			</div>

			{
				show_incidents &&
				<div className={Styles['banner-incidents']}>
					{
						current_incidents.map(incident => {
							return (
								<Incident
									key={incident.id}
									incident={incident}
									monitors={monitors}
								/>
							);
						})
					}
					{
						current_maintenance.map(incident => {
							return (
								<Incident
									key={incident.id}
									incident={incident}
									monitors={monitors}
								/>
							);
						})
					}
				</div>
			}
		</Box>
	);
}

