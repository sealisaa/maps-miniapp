import React from 'react';
import { Panel, Group, Div, Avatar, Button } from '@vkontakte/vkui';
import './style.css';
import { Icon28Search } from '@vkontakte/icons';
import { Icon28PlaceOutline } from '@vkontakte/icons';
import { Icon56GhostOutline } from '@vkontakte/icons';
import { Icon28LocationOutline } from '@vkontakte/icons';

class Intro extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		return (
            <Panel id={this.props.id} centered="true">
                <Group>
                    <Div className='Intro'>
                        <Icon56GhostOutline fill="var(--accent)"/>
                        <h2>Привет! Это приложение для построения оптимальных маршрутов</h2>
                        <div className="FlexContainer" centered="true">
                            <Avatar className="AvatarIcon" style={{ background: 'var(--background_content)' }} size={28} shadow={false}><Icon28Search fill="var(--accent)" /></Avatar>
                            <div>Ищи места с помощью поиска или клика по карте</div>
                        </div>
                        <div className="FlexContainer">
                            <Avatar className="AvatarIcon" style={{ background: 'var(--background_content)' }} size={28} shadow={false}><Icon28PlaceOutline fill="var(--accent)" /></Avatar>
                            <div>Выбирай точки кликом по метке</div>
                        </div>
                        <div className="FlexContainer">
                            <Avatar className="AvatarIcon" style={{ background: 'var(--background_content)' }} size={28} shadow={false}><Icon28LocationOutline fill="var(--accent)" /></Avatar>
                            <div>Выбирай тип маршрута и планируй поездки или прогулки по городу</div>
                        </div>
                        <Button size="l" onClick={this.props.closeIntro}>
                            Ок, все понятно
                        </Button>
                    </Div>
                </Group>
            </Panel>
        )
	}
}

export default Intro;