import { getHost } from '../../../hooks/host';
import {
	Title,
	TimelineItem,
	Incident,
	PerformanceTrackerGroup,
	Section
} from '../../../components';

import Styles from './page.module.css';

const get_page_data = () => {
	const host = getHost();
	// 720 min = 12h, we get 2 points per day => 60 points
	const url = `${process.env.NEXT_PUBLIC_API_URL}/${host}/performance?aggregate_min=720`;
	return fetch(url).then(response => {
		if(!response.ok) {
			throw new Error('Impossible to fetch incidents');
		}

		return response.json();
	});
};

export default function Performance() {
	return get_page_data().then(({ page, performance_trackers }) => {
		const flattened_performance_trackers = Object.values(performance_trackers).reduce((agg, tracker) => {
			const display_config = tracker.display_config;
			const flattened_tracker = {
				...tracker,
				...display_config
			};

			// We mutate the data to pass it down as is
			agg[tracker.id] = flattened_tracker;
			return agg;
		}, {});

		const trackers = Object.values(flattened_performance_trackers);

		// Very important
		const { performance: sections } = page;

		let tracker_ids_in_sections = sections?.map(({ components }) => {
			return components.map(({ performance_trackers=[]}) => {
				return performance_trackers.map(({ id }) => id);
			}).flat();
		}).flat();
		tracker_ids_in_sections = new Set(tracker_ids_in_sections || []);

		const trackers_without_section = trackers.filter(tracker => !tracker_ids_in_sections.has(tracker.id));

		const projects_sections_map = trackers_without_section.reduce((agg, tracker) => {
			if(!tracker.project) {
				return agg;
			}

			agg[tracker.project] = agg[tracker.project] || {
				title: tracker.project,
				components: []
			};

			const reversed_components = [...agg[tracker.project].components].reverse();
			const [last_component] = reversed_components;
			if(!last_component || last_component.performance_trackers.length > 1) {
				agg[tracker.project].components.push({
					type: 'performance-tracker',
					title: null,
					performance_trackers: [{
						id: tracker.id,
						width: 2,
					}]
				});

				return agg;
			}

			// we mutate the data
			last_component.performance_trackers.push({
				id: tracker.id,
				width: 2
			});

			return agg;
		}, {});

		const project_sections = Object.values(projects_sections_map);

		const standalone_trackers = trackers_without_section.filter(tracker => !tracker.project).map(tracker => {
			return {
				...tracker,
				width: 2
			};
		});
		// TODO:
		// - filter by "on section"
		// - filter by project
		// - filter by none

		return (
			<>
				<Title>Performance Trackers</Title>
				{
					sections?.map((section, i) => {
						return <Section
							to={null}
							from={null}
							key={section.title || i}
							section={section}
							monitors={[]}
							performance_trackers={flattened_performance_trackers}
						/>
					})
				}
				{
					project_sections.map((section, i) => {
						return <Section
							to={null}
							from={null}
							key={section.title || i}
							section={section}
							monitors={[]}
							performance_trackers={flattened_performance_trackers}
						/>
					})
				}
				{
					Boolean(standalone_trackers.length) &&
					<PerformanceTrackerGroup trackers={standalone_trackers}/>
				}
				{
					!trackers.length &&
					<Title as='h2'>No performance trackers yet ⚡️</Title>
				}
			</>
		);
	});
}
