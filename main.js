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

let question = `Name a restaurant that failed a food inspection this year.`;
let answers = `
SUBWAY	52
DUNKIN DONUTS	20
MCDONALD'S	16
POTBELLY SANDWICH WORKS	9
BURGER KING	8
POPEYES	7
WENDY'S	7
MCDONALDS	7
CHINA CAFE	7
LAS ISLAS MARIAS	7
HAROLD'S CHICKEN SHACK	6
FRESHII	6
`.trim().split('\n').map((line) => {
	let parts = line.split('\t');
	return {
		answer: parts[0],
		score: parseInt(parts[1], 10)
	}
});

console.log(answers);

initRound({
	question: question,
	answers: answers
}, {
	maxAnswers: 10,
	splitAt: 5
});




