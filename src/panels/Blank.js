import React from 'react';
import { Panel } from '@vkontakte/vkui';
import './style.css';

class Blank extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		return (
            <Panel className="panel">
            </Panel>
        )
	}
}

export default Blank;