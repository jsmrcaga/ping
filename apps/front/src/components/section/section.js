import { Monitor } from '../monitor/monitor';

import { StatusIcon } from '../status-icon/status-icon';
import { Tag } from '../tag/tag';
import { classnames, useStatus } from '../../hooks';

import Styles from './section.module.css';

const SectionComponent = ({ from, to, component, monitors }) => {
	const { title, monitors: component_monitors, type } = component;
	
	const section_monitors = component_monitors.map(mid => monitors[mid]).filter(e => e);
	return section_monitors.map(monitor => {
		return <Monitor key={monitor.id} from={from} to={to} monitor={monitor}/>
	});
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

export const Section = ({ from, to, section, monitors }) => {
	const { title, components } = section;
	const all_monitors = components.map(({ monitors }) => monitors).flat();
	const section_monitors = Array.from(new Set(all_monitors));

	const status = useStatus({
		up: section_monitors.every(monitor => monitor.currently_up)
	});

	return (
		<Box>
			<div>
				<h2 className={Styles.title}>
					<span>{title}</span>

					<Tag className={Styles.tag}>
						<StatusIcon className={Styles['title-icon']} status={status} small/>
						<span className={Styles['tag-text']}>{ STATUS_NAME[status] }</span>
					</Tag>
				</h2>
				{
					components.map((component, index) => {
						return <SectionComponent
							to={to}
							from={from}
							key={component.title || index}
							component={component}
							monitors={monitors}
						/>
					})
				}
			</div>
		</Box>
	);
}
