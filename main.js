let config = {
	apiKey: "AIzaSyCilKAuu-_n20WUwgE8cYpWQBFgtJi113o",
	authDomain: "feud-9002e.firebaseapp.com",
	databaseURL: "https://feud-9002e.firebaseio.com",
	projectId: "feud-9002e",
	storageBucket: "",
	messagingSenderId: "832727110519"
};
let FirebaseApp = firebase.initializeApp(config);
let db = FirebaseApp.database();

let params = getQueryParams(document.location.search);

function getQueryParams(qs) {
	qs = qs.split('+').join(' ');
	var params = {},
		tokens,
		re = /[?&]?([^=]+)=([^&]*)/g;
	while (tokens = re.exec(qs)) {
		params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
	}
	return params;
}

function getAnswersHTML(list, inopt) {
	let opts = inopt || {};
	let splitPoint = opts.splitAt || 4;
	let max = opts.maxAnswers || 8;
	let letters = opts.maxLetters || 18;
	let html = `<div class="tile is-parent is-vertical">`;
	let lastScore = Infinity;
	let lastRank = 0;
	list = list.sort((a, b) => {
		return b.score - a.score;
	}).filter((r, ridx) => {
		return ridx < max;
	}).map((r) => {
		if (r.score < lastScore) {
			lastScore = r.score;
			lastRank++;
		}
		r.rank = lastRank;
		return r;
	}).forEach((item, idx) => {
		if (idx === splitPoint) {
			html += `
				</div>
				<div class="tile is-parent is-vertical">
			`;
		}
		html += `
			<div class="tile is-parent is-horizontal notification is-answer is-warning">
				<div class="tile is-1">
					<span class="title is-2">${item.rank}</span>
				</div>
				<div class="tile is-9">
					<span class="title is-2" data-answer="${item.answer.substr(0, letters)}"></span>
				</div>
				<div class="tile is-2">
					<span class="title is-2" data-score="${item.score}"></span>
				</div>
			</div>
		`;
	});
	html += `</div>`;
	return html;
}

let header = document.getElementById('question');
let board = document.getElementById('board');
let counter = document.getElementById('score');
let reveal = document.getElementById('reveal');

function flipAnswer(div) {
	let answerSpan = div.querySelector('[data-answer]');
	let scoreSpan = div.querySelector('[data-score]');
	div.classList.remove('is-warning');
	div.classList.add('is-success');
	let answer = answerSpan.dataset.answer;
	answerSpan.innerText = answer;
	let score = scoreSpan.dataset.score;
	scoreSpan.innerText = score;
	return parseInt(score, 10);
}

function flipAll() {
	let divs = board.querySelectorAll('.is-answer');
	let sum = Array.from(divs).reduce((agg, div) => {
		return agg + flipAnswer(div);
	}, 0);
	counter.innerText = sum;
}

function initRound(round) {
	let html = getAnswersHTML(round.answers, round.display);
	header.innerText = round.question;
	board.innerHTML = html;
	let totalScore = 0;
	let shownMap = {};
	Array.from(board.querySelectorAll('.is-answer')).forEach((div, idx) => {
		div.addEventListener('click', (e) => {
			if (!(idx in shownMap)) {
				shownMap[idx] = true;
				let score = flipAnswer(div);
				totalScore += score;
				counter.innerText = totalScore;
			}
		});
	});
	reveal.addEventListener('click', (e) => {
		flipAll();
	});
}

function startGameWithCode(code) {
	db.ref(`rounds/${code}`).once('value', (snap) => {
		let round = snap.val();
		if (round) {
			initRound(round, {
				maxAnswers: 10,
				splitAt: 5
			});
		}
	}).catch(console.error);
}

if (params.code) {
	startGameWithCode(params.code);
} else {
	vex.dialog.prompt({
		message: 'Enter a round code.',
		callback: (code) => {
			if (code) {
				startGameWithCode(code);
			}
		}
	});
}
