import { getHost } from '../../../../hooks/host';

import { classnames } from '../../../../hooks';
import { get_lang } from '../../../../hooks/i18n';
import { Title, Incident, TimelineItem, Box } from '../../../../components';

import Styles from './page.module.css';

const get_page_data = (incident_id) => {
	const host = getHost();
	const url = `${process.env.NEXT_PUBLIC_API_URL}/${host}/incidents/${incident_id}`;
	return fetch(url).then(response => {
		if(!response.ok) {
			throw new Error('Impossible to fetch data');
		}

		return response.json();
	});
};

export default function IncidentDetail({ params: { id } }) {
	const locales = get_lang();
	const formatter = new Intl.DateTimeFormat(locales, {
		dateStyle: 'long',
		timeStyle: 'long'
	});

	return get_page_data(id).then(incident => {
		return (
			<>
				<Title as='h2' className={classnames({
					[Styles.danger]: !incident.is_maintenance,
					[Styles.maintenance]: incident.is_maintenance,
				})}>
				{
					incident.is_maintenance ? 'Maintenance' : 'Incident'
				}
				</Title>
				<Title>{ incident.title }</Title>
				<Incident
					button={false}
					incident={incident}
					monitors={{
						[incident.monitor_id]: incident.monitor
					}}
				/>

				{
					incident.updates.map(update => {
						return (
							<TimelineItem date={update.date} dateFormatter={formatter} className={Styles['timeline-item']}>
								<Box className={Styles.box}>
									<Title left as='h3' className={Styles['update-title']}>{update.title}</Title>
									{update.description}
								</Box>
							</TimelineItem>
						);
					})
				}
			</>
		);
	});
}
