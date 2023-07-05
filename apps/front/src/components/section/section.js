import { Monitor } from '../monitor/monitor';
import { PerformanceTrackerGroup } from '../performance-tracker/performance-tracker';

import { StatusIcon } from '../status-icon/status-icon';
import { Tag } from '../tag/tag';
import { classnames, useStatus } from '../../hooks';

import Styles from './section.module.css';

const SectionComponent = ({ from, to, component, monitors, performance_trackers }) => {
	const { title, monitors: component_monitors, performance_trackers: section_performance_trackers, type } = component;
	
	if(type === 'monitor' || !type) {
		const section_monitors = component_monitors.map(mid => monitors[mid]).filter(e => e);
		return section_monitors.map(monitor => {
			return <Monitor key={monitor.id} from={from} to={to} monitor={monitor}/>
		});
	}

	if(type === 'performance-tracker') {
		const component_trackers = section_performance_trackers.map(({ id, chart, width=4, unit, nok, ok }) => {
			if(!performance_trackers[id]?.points?.length) {
				return null;
			}

			const tracker = performance_trackers[id];

			// Make sure we prioritize page config
			return {
				...tracker,
				chart: chart || tracker.display_config?.chart,
				width: width || tracker.display_config?.width,
				unit: unit || tracker.display_config?.unit,
				nok: nok || tracker.display_config?.nok,
				ok: ok || tracker.display_config?.ok
			};
		}).filter(e => e);

		return (
			<PerformanceTrackerGroup trackers={component_trackers}/>
		);
	}

	return null;
};

export const Box = ({ className, children }) => {
	return (
		<div className={classnames(className, Styles.box)}>
			{children}
		</div>
	);
}

const STATUS_NAME = {
	up: 'Online',
	down: 'Unresponsive',
	maintenance: 'Maintenance'
};

export const Section = ({ from, to, section, monitors, performance_trackers }) => {
	const { title, components } = section;
	const all_monitor_ids = components.map(c => c.monitors).flat();
	const section_monitors = Array.from(new Set(all_monitor_ids)).map(mid => monitors[mid]).filter(e => e);

	const some_monitors = components.some(component => !component.type || component.type === 'monitor');

	const status = useStatus({
		up: section_monitors.every(monitor => monitor?.currently_up)
	});

	return (
		<Box>
			<div>
				<h2 className={Styles.title}>
					<span>{title}</span>

					{
						some_monitors &&
						<Tag className={Styles.tag}>
							<StatusIcon className={Styles['title-icon']} status={status} small/>
							<span className={Styles['tag-text']}>{ STATUS_NAME[status] }</span>
						</Tag>
					}
				</h2>
				{
					components.map((component, index) => {
						return <SectionComponent
							to={to}
							from={from}
							key={component.title || index}
							component={component}
							monitors={monitors}
							performance_trackers={performance_trackers}
						/>
					})
				}
			</div>
		</Box>
	);
}
