import { getHost } from '../../hooks/host';
import { Title, TimelineItem, Incident } from '../../components';

import Styles from './page.module.css';

const get_page_data = () => {
	const host = getHost();
	const url = `${process.env.NEXT_PUBLIC_API_URL}/${host}/incidents`;
	return fetch(url).then(response => {
		if(!response.ok) {
			throw new Error('Impossible to fetch incidents');
		}

		return response.json();
	});
};

const get_day = (date) => {
	const d = new Date(date);
	return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

const group_by_day = (incidents) => {
	const groups_by_day = incidents.reduce((groups, incident) => {
		const day = get_day(incident.from);
		groups[day] = groups[day] || {
			date: day,
			incidents: []
		};
		groups[day].incidents.push(incident);
		return groups;
	}, {});

	return Object.values(groups_by_day);
};

function IncidentTimeline({ groups, monitors }) {
	const sorted_groups = groups.sort((g1, g2) => new Date(g2.date) - new Date(g1.date));

	return sorted_groups.map(group => {
		return (
			<TimelineItem date={group.date}>
				{
					group.incidents.map(incident => {
						return <Incident key={incident.id} monitors={monitors} incident={incident}/>
					})
				}
			</TimelineItem>
		);
	});
}

export default function IncidentList() {
	return get_page_data().then(({ incidents, monitors }) => {
		// Sort by date & ongoing first
		incidents.sort((ia, ib) => {
			if(!ia.to) {
				return -1;
			}

			if(!ib.to) {
				return 1;
			}

			new Date(ia.from) - new Date(ib.from);
		});

		// Group by day
		const ongoing = incidents.filter(({ to }) => to === null);
		const finished = incidents.filter(({ to }) => to !== null);
		const ongoing_date_groups = group_by_day(ongoing);
		const finished_date_groups = group_by_day(finished);

		const needs_titles = Boolean(ongoing.length && finished.length);

		return (
			<>
				<Title>Incident History</Title>
				{ needs_titles && <Title left as='h2' className={Styles.subtitle}>Ongoing</Title>}
				{ Boolean(ongoing.length) &&  
					<div>
						<IncidentTimeline monitors={monitors} groups={ongoing_date_groups}/>
					</div>
				}
				{ needs_titles && <Title left as='h2' className={Styles.subtitle}>Finished</Title>}
				{ Boolean(finished.length) && 
					<div>
						<IncidentTimeline monitors={monitors} groups={finished_date_groups}/>
					</div>
				}

				{
					!ongoing.length && !finished.length &&
					<Title as='h2'>No incidents 🎉</Title>
				}
			</>
		);
	});
}
