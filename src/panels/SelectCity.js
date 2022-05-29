import React from 'react';
import { Panel, Div, Button, CustomSelect } from '@vkontakte/vkui';
import { Icon56PlaceOutline } from '@vkontakte/icons';
import citiesJSON from './cities.json';

let citiesArr = citiesJSON.response.items;
let citiesSet = new Set();
for (let i = 0; i < citiesArr.length; i++) {
    citiesSet.add({
        label: citiesArr[i].title,
        description: citiesArr[i].title,
        value: citiesArr[i].title,
    });
}

class SelectCity extends React.Component {
	constructor(props) {
		super(props);
		this.state = {isLoaded: false, btnDisabled: true, city: null};
	}

	render() {
	    return (
	        <Panel className="panel" centered="true">
                <Div className='Intro'>
                    <Icon56PlaceOutline fill="var(--accent)"/>
                    <h2>Выберите город</h2>
                    <Div className="flex-container">
                        <CustomSelect
                            placeholder="Введите название города"
                            searchable="true"
                            options={Array.from(citiesSet)}
                            onChange={(e) => {
                                this.setState({btnDisabled: false, city: e.target.value});
                            }}
                        />
                        <Button size="l" className="btn" disabled={this.state.btnDisabled} onClick={(e) => this.props.confirmCity(e, this.state.city)}>Готово</Button>
                    </Div>
                </Div>
            </Panel>
	    )
	}
}

export default SelectCity;