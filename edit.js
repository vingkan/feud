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

let code = document.getElementById('code');
let question = document.getElementById('question');
let answers = document.getElementById('answers');

function showError(error) {
	console.error(error);
}

function rawToAnswers(raw) {
	return raw.trim().split('\n').map((line) => {
		let parts = line.split('\t');
		return {
			answer: parts[0],
			score: parseInt(parts[1], 10)
		}
	});
}

function confirmCode(code) {
	return new Promise((resolve, reject) => {
		db.ref(`rounds/${code}`).once('value', (snap) => {
			let val = snap.val();
			if (val) {
				let confirm = prompt(`Code ${code} already exists. Do you want to override it? (y)`);
				if (confirm.toLowerCase() === 'y') {
					resolve(true);
				} else {
					resolve(false);
				}
			} else {
				resolve(true);
			}
		}).catch(reject);
	});
}

function saveRound(round) {
	console.log(round);
}

let button = document.getElementById('save');
button.addEventListener('click', (e) => {
	console.log('clicked')
	if (!code.value) {
		showError(`No round code given.`);
	} else if (!question.value) {
		showError(`No round question given.`);
	} else if (!answers.value) {
		showError(`No round answers given.`);
	} else {
		console.log('ready')
		let round = {
			code: code.value,
			question: question.value,
			answers: rawToAnswers(answers.value || '')
		}
		confirmCode(round.code).then((confirmed) => {
			if (confirmed) {
				saveRound(round);
			}
		}).catch(console.error);
	}
});