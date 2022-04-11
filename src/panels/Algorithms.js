import React from 'react';
import { Panel, PanelHeader, Header, Button, Group, Div, FormItem, Select } from '@vkontakte/vkui';
import data from '../data.json';
import './Home.css';
import m from '../matrix.json';

var graph = m.matrix; // матрица смежности

var path = []; // маршрут
var pathLength; // длина маршрута

// алгоритм полного перебора

function CompleteBust() {
	AllPermutations(graph[0].length);
}

function AllPermutations(n) { // все перестановки длины n от 0 до (n-1)
	var arr = [];
	for (let i = 0; i < n; i++) {
		arr[i] = i;
	}
	var currentPathLength = checkPathLength(arr);
	if (currentPathLength < pathLength) {
		path = arr.slice();
		pathLength = currentPathLength;
	}
	while(NextPermutation(arr)) {
		currentPathLength = checkPathLength(arr);
		if (currentPathLength < pathLength) {
			path = arr.slice();
			pathLength = currentPathLength;
		}
	}
}

function NextPermutation(arr) { // создание следующей перестановки
	var end = arr.length - 1;
	var i = end;
	var j = end;
	while (i > 0 && arr[i] <= arr[i - 1]) {
		i--;
	}
	if (i == 0) {
		return false;
	} else {
		while (j > 0 && arr[j] <= arr[i - 1]) {
			j--;
		}
		Swap(i - 1, j, arr);
		Reverse(i, end, arr);
		return true;
	}
}

function Swap(first, second, arr) { // перестановка методом трех стаканов
	var buffer = arr[first];
	arr[first] = arr[second];
	arr[second] = buffer;
}

function Reverse(first, second, arr) { // реверсивная перестановка
	for (let i = first, j = second; i < j; i++, j--) {
	Swap(i, j, arr);
	}
}

function checkPathLength(arr) { // проверяет длину маршрута
	var currentLength = 0;
	for (let i = 1; i < arr.length; i++) {
		if (graph[arr[i - 1]][arr[i]] != -1) {
		currentLength += graph[arr[i - 1]][arr[i]];
		}
	}
	return currentLength;
}

// метод ближайшего соседа

var visited = []; // посещена ли вершина или нет
var currentPath = []; // текущий маршрут
var currentPathLength; // текущая длина маршрута

function GreedyAlgorithmStart() {
	for (let i = 0; i < graph.length; i++) {
		for (let j = 0; j < graph.length; j++) {
			visited[j] = false;
		}
		visited[i] = true;
		currentPath = [i];
		currentPathLength = 0;
		GreedyAlgorithm(i);
		if (currentPathLength < pathLength) {
			path = currentPath;
			pathLength = currentPathLength;
		}
	}
}

function GreedyAlgorithm(i) {
	if (isAllVisited()) {
		return;
	}
	var currentMinDistance = 9999;
	var currentMinEdge = -1;
	for (let j = 0; j < graph[i].length; j++) {
		if (graph[i][j] != -1 && !visited[j] && graph[i][j] < currentMinDistance) {
			currentMinDistance = graph[i][j];
			currentMinEdge = j;
		}
	}
	if (currentMinEdge != -1) {
		visited[currentMinEdge] = true;
		currentPath[currentPath.length] = currentMinEdge;
		currentPathLength += currentMinDistance;
		GreedyAlgorithm(currentMinEdge);
	}
}

function isAllVisited() { // посещены ли все вершины
	for (let i = 0; i < visited.length; i++) {
		if (!visited[i]) {
			return false;
		}
	}
	return true;
}

const TableHeader = () => {
	return(
		<thead>
			<tr>
			<td className="color"></td>
				{graph.map(function(t, index) {
                    return <td className="color"><b>{index}</b></td>
                })}
			</tr>
		</thead>
	)
}

const TableBody = () => {
	return(
		<tbody>
			{graph.map(function(r, index) {
				return (
					<tr>
						<td className="color"><b>{index}</b></td>
						{r.map(function(g) {
							if (g != -1) {
								return (<td>{g}</td>)
							} else {
								return (<td></td>)
							}
						})}
					</tr>
				)
			})}
		</tbody>
	)
}

class Home extends React.Component {

	constructor(props) {
		super(props);
		this.state = {algorithm: 0, path: "", length: ""};
		this.GetOptimalRoute = this.GetOptimalRoute.bind(this);
		this.ChangeAlgorithm = this.ChangeAlgorithm.bind(this);
		this.graph = graph;
		this.path = path;
		this.pathLength = pathLength;
	}

	ChangeAlgorithm(e) {
		var algorithm = e.target.value;
		this.setState({algorithm: algorithm});
		this.setState({path: "", length: ""});
	}

	GetOptimalRoute(e) {

		var algorithm = this.state.algorithm;
		if (algorithm == 1) {
			path = []; // маршрут
			pathLength = 9999; // длина маршрута
			var time = performance.now();
			CompleteBust(); // вызов алгоритма полного перебора
			time = performance.now() - time;
			console.log(time.toFixed(3) + " ms");  // выводим время работы алгоритма в мс
			var pathStr = path[0];
			for (let i = 1; i < path.length; i++) {
				pathStr += " - " + path[i];
			}
			this.setState({path: pathStr, length: pathLength});
		}
		if (algorithm == 2) {
			path = []; // маршрут
			pathLength = 9999; // длина маршрута
			currentPath = []; // текущий маршрут
			var time = performance.now(); // засекаем время
			GreedyAlgorithmStart(); // вызов метода ближайшего соседа
			time = performance.now() - time;
			console.log(time.toFixed(3) + " ms");  // выводим время работы алгоритма в мс
			var pathStr = path[0];
			for (let i = 1; i < path.length; i++) {
				pathStr += " - " + path[i];
			}
			this.setState({path: pathStr, length: pathLength});
		}
	}


	render() {
		return(
		<Panel className="panel">
			<Group header={<Header>Алгоритмы поиска оптимального пути</Header>}>
				<Div>
				<table>
					<TableHeader />
					<TableBody />
				</table>
				</Div>
				<FormItem top="Выберите алгоритм">
				<Select
					placeholder="Не выбран"
					options={data.algorithms.map(a => ({ label: a.name, value: a.id }))}
					id="algorithm"
					onChange={this.ChangeAlgorithm}
				/>
				<Button size="m" mode="secondary" className="btn" onClick={this.GetOptimalRoute}>
					Получить результат
				</Button>
				<p>Оптимальный маршрут: {this.state.path}</p>
				<p>Длина маршрута: {this.state.length}</p>
				</FormItem>
			</Group>
		</Panel>)
	}
};

export default Home;