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

let codeInput = document.getElementById('code');
let questionInput = document.getElementById('question');
let answersInput = document.getElementById('answers');

function showError(error) {
	vex.dialog.alert(error);
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

function answersToRaw(list) {
	return list.map((r) => {
		let line = [r.answer, r.score + ''].join('\t');
		return line;
	}).join('\n');
}

function confirmCode(code) {
	return new Promise((resolve, reject) => {
		db.ref(`rounds/${code}`).once('value', (snap) => {
			let val = snap.val();
			if (val) {
				vex.dialog.confirm({
					message: `Code ${code} already exists. Do you want to override it?`,
					callback: (confirm) => {
						if (confirm) {
							resolve(true);
						} else {
							resolve(false);
						}
					}
				});
			} else {
				resolve(true);
			}
		}).catch(reject);
	});
}

function saveRound(round) {
	return db.ref(`rounds/${round.code}`).set(round);
}

function getRound(code) {
	return new Promise((resolve, reject) => {
		db.ref(`rounds/${code}`).once('value', (snap) => {
			let val = snap.val();
			if (val) {
				resolve(val);
			} else {
				reject(`No data at: rounds/${round.code}`);
			}
		}).catch(reject);
	});
}

let load = document.getElementById('load');
load.addEventListener('click', (e) => {
	vex.dialog.prompt({
		message: 'Enter a round code.',
		callback: (code) => {
			if (code) {
				getRound(code).then((round) => {
					codeInput.value = code;
					questionInput.value = round.question;
					answersInput.value = answersToRaw(round.answers);
				}).catch(console.error);
			}
		}
	});
});

let button = document.getElementById('save');
button.addEventListener('click', (e) => {
	if (!codeInput.value) {
		showError(`No round code given.`);
	} else if (!questionInput.value) {
		showError(`No round question given.`);
	} else if (!answersInput.value) {
		showError(`No round answers given.`);
	} else {
		let round = {
			code: codeInput.value,
			question: questionInput.value,
			answers: rawToAnswers(answersInput.value || '')
		}
		confirmCode(round.code).then((confirmed) => {
			if (confirmed) {
				saveRound(round).then((done) => {
					vex.dialog.alert(`Saved round ${round.code}!`);
				}).catch(console.error);
			}
		}).catch(console.error);
	}
});