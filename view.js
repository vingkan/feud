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

let tbody = document.getElementById('tbody');

db.ref(`rounds`).on('value', (snap) => {
	let val = snap.val() || {};
	let html = ``;
	for (let code in val) {
		let round = val[code] || {};
		let row = `
			<tr>
				<td>${round.question}</td>
				<td>${round.answers.reduce((sum, a) => {return sum + a.score}, 0)}</td>
				<td>${round.answers.length}</td>
				<td>
					<a href="./index.html?code=${round.code}" class="button is-success is-outlined is-disabled">${round.code}</a>
				</td>
			</tr>
		`;
		html += row;
	}
	tbody.innerHTML = html;
})