import React from 'react';
import { Panel, PanelHeader, Group } from '@vkontakte/vkui';
import './style.css';
import citiesJSON from './cities.json';

class Intro extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		return (
            <Panel className="panel">
            </Panel>
        )
	}
};

export default Intro;