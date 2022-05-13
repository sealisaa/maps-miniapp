import React from 'react';
import { Panel, PanelHeader, Group } from '@vkontakte/vkui';
import './style.css';
import citiesJSON from './cities.json';

var citiesArr = citiesJSON.response.items;
var citiesSet = new Set();
for (let i = 0; i < citiesArr.length; i++) {
    citiesSet.add(citiesArr[i].title);
}

class ChooseCity extends React.Component {
	constructor(props) {
		super(props);
		console.log(this.props);
		this.fetchedUser = this.props.fetchedUser;
		console.log(this.fetchedUser);
	}
	render() {
		return (
            <Panel className="panel">
                <PanelHeader>Choose city</PanelHeader>
                <Group>
                </Group>
            </Panel>
        )
	}
};

export default ChooseCity;