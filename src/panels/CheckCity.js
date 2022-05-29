import React from 'react';
import { Panel, Div, Button } from '@vkontakte/vkui';
import { Icon56PlaceOutline } from '@vkontakte/icons';
import bridge from '@vkontakte/vk-bridge';

class CheckCity extends React.Component {
	constructor(props) {
		super(props);
		this.state = {isLoaded: false, user: null};
	}

	componentDidMount() {
        bridge
            .send('VKWebAppGetUserInfo')
            .then(user => {
                this.setState({
                    isLoaded: true,
                    user: user
                });
            })
            .catch(() => {
            });
    }

	render() {
        if (this.state.user.city.title === "") {
            this.props.selectCity();
        }
	    if (this.state.isLoaded) {
	        return (
                <Panel className="panel" centered="true">
                    <Div className='Intro'>
                        <Icon56PlaceOutline fill="var(--accent)"/>
                        <h2>Ваш город: {this.state.user.city.title}</h2>
                        <Div className="flex-container">
                            <Button size="l" className="btn" onClick={(e) => this.props.confirmCity(e, this.state.user.city.title)}>Все верно</Button>
                            <Button size="l" mode="secondary" className="btn" onClick={this.props.selectCity}>Выбрать другой</Button>
                        </Div>
                    </Div>
                </Panel>
            )
	    } else {
	        return (
                <Panel className="panel">
                </Panel>
            )
	    }
	}
}

export default CheckCity;