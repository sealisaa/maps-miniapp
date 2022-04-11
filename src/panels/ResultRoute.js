import React from 'react';
import { Panel } from '@vkontakte/vkui';

function getDistanceMap() {
}

class ResultRoute extends React.Component {
	constructor(props) {
		super(props);
		console.log(this.props.places);
	}

	render() {
		return(
		<Panel className="panel">
		    <div>Тут будет маршрут</div>
		</Panel>)
	}
};

export default ResultRoute;