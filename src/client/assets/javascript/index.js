// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

// The store will hold all information needed globally
var store = {
	track_id: undefined,
	player_id: undefined,
	race_id: undefined,
	race_started: false
}

// We need our javascript to wait until the DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
	onPageLoad()
	setupClickHandlers()
})

async function onPageLoad() {
	try {
		getTracks()
			.then(tracks => {
				const html = renderTrackCards(tracks)
				renderAt('#tracks', html)
			})

		getRacers()
			.then((racers) => {
				const html = renderRacerCars(racers)
				renderAt('#racers', html)
			})
	} catch (error) {
		console.log("Problem getting tracks and racers ::", error.message)
		console.error(error)
	}
}

function setupClickHandlers() {
	document.addEventListener('click', function (event) {
		const { target } = event

		// Race track form field
		if (target.matches('.card.track')) {
			handleSelectTrack(target)
		}

		// Podracer form field
		if (target.matches('.card.podracer')) {
			handleSelectPodRacer(target)
		}

		// Submit create race form
		if (target.matches('#submit-create-race')) {
			event.preventDefault()

			// start race
			handleCreateRace()
		}

		// Handle acceleration click
		if (target.matches('#gas-peddle')) {
			handleAccelerate(target)
		}

	}, false)
}

async function delay(ms) {
	try {
		return await new Promise(resolve => setTimeout(resolve, ms));
	} catch (error) {
		console.log("an error shouldn't be possible here")
		console.log(error)
	}
}
// ^ PROVIDED CODE ^ DO NOT REMOVE

// This async function controls the flow of the race, add the logic and error handling
async function handleCreateRace() {
	console.log("handleCreateRace");
	// TO.DO - Get player_id and track_id from the store
	const { player_id, track_id } = store;

	// const race = TO.DO - invoke the API call to create the race, then save the result
	let raceRsp;
	try {
		raceRsp = await createRace(player_id, track_id);
		console.log(raceRsp);
		// render starting UI
		renderAt('#race', renderRaceStartView(raceRsp.Track));

		// TO.DO - update the store with the race id
		store.race_id = raceRsp.ID - 1;
	}
	catch (err) {
		console.log("Problem with createRace ", err);
		return;
	}

	// The race has been created, now start the countdown
	// TO.DO - call the async function runCountdown
	await runCountdown();
	// TO.DO - call the async function startRace
	await startRace(store.race_id);
	store.race_started = true;
	// TO.DO - call the async function runRace
	await runRace(store.race_id);
}

function runRace(raceID) {
	console.log("runRace");
	return new Promise(resolve => {
		// TO.DO - use Javascript's built in setInterval method to get race info every 500ms
		const raceInterval = window.setInterval(async () => {
			let res;
			try {
				res = await getRace(raceID);
			}
			catch (err) {
				console.log(console.log("Problem with getRacers request::", err));
				window.clearInterval(raceInterval); // to stop the interval from repeating
				return;
			}
			console.log(res);
			if (res.status == "in-progress") {
				/* 
					TO.DO - if the race info status property is "in-progress", update the leaderboard by calling:
			
				*/
				renderAt('#leaderBoard', raceProgress(res.positions));
			}
			else if (res.status == "finished") {
				/* 
					TO.DO - if the race info status property is "finished", run the following:
			
				*/
				store.race_started = false;
				window.clearInterval(raceInterval) // to stop the interval from repeating
				renderAt('#race', resultsView(res.positions)) // to render the results view
				resolve(res) // resolve the promise
			}
		}, 500);
	})
	// remember to add error handling for the Promise
}

async function runCountdown() {
	console.log("runCountdown");
	try {
		// wait for the DOM to load
		// await delay(1000)
		let timer = 3

		return new Promise(resolve => {
			// TO.DO - use Javascript's built in setInterval method to count down once per second
			const intervalId = window.setInterval(() => {
				// run this DOM manipulation to decrement the countdown for the user
				document.getElementById('big-numbers').innerHTML = --timer
				if (timer == 0) {
					// TO.DO - if the countdown is done, clear the interval, resolve the promise, and return
					window.clearInterval(intervalId);
					document.getElementById('big-numbers').innerHTML = "GO!!!";
					resolve();
				}
			}, 1000);
		})
	} catch (error) {
		console.log(error);
	}
}

function handleSelectPodRacer(target) {
	console.log("handleSelectPodRacer");
	console.log("selected a pod", target.id)

	// remove class selected from all racer options
	const selected = document.querySelector('#racers .selected')
	if (selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')

	// TO.DO - save the selected racer to the store
	store.player_id = parseInt(target.id);
}

function handleSelectTrack(target) {
	console.log("handleSelectTrack");
	console.log("selected a track", target.id)

	// remove class selected from all track options
	const selected = document.querySelector('#tracks .selected')
	if (selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')

	// TO.DO - save the selected track id to the store
	store.track_id = parseInt(target.id);
}

function handleAccelerate() {
	console.log("handleAccelerate");
	console.log("accelerate button clicked")
	// TODO - Invoke the API call to accelerate
	for (let i = 0; i < 100; i++)//I think this line is the most important...
		if (store.race_started)
			accelerate(store.race_id);
}

// HTML VIEWS ------------------------------------------------
// Provided code - do not remove

function renderRacerCars(racers) {
	console.log("renderRacerCars");
	if (!racers.length) {
		return `
			<h4>Loading Racers...</4>
		`
	}

	const results = racers.map(renderRacerCard).join('')

	return `
		<ul id="racers">
			${results}
		</ul>
	`
}

function renderRacerCard(racer) {
	console.log("renderRacerCard");
	const { id, driver_name, top_speed, acceleration, handling } = racer

	return `
		<li class="card podracer" id="${id}">
			<h3>${driver_name}</h3>
			<p>${top_speed}</p>
			<p>${acceleration}</p>
			<p>${handling}</p>
		</li>
	`
}

function renderTrackCards(tracks) {
	console.log("renderTrackCards");
	if (!tracks.length) {
		return `
			<h4>Loading Tracks...</4>
		`
	}

	const results = tracks.map(renderTrackCard).join('')

	return `
		<ul id="tracks">
			${results}
		</ul>
	`
}

function renderTrackCard(track) {
	console.log("renderTrackCard");
	const { id, name } = track

	return `
		<li id="${id}" class="card track">
			<h3>${name}</h3>
		</li>
	`
}

function renderCountdown(count) {
	console.log("renderCountdown");
	return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers">${count}</p>
	`
}

function renderRaceStartView(track, racers) {
	console.log("renderRaceStartView");
	return `
		<header>
			<h1>Race: ${track.name}</h1>
		</header>
		<main id="two-columns">
			<section id="leaderBoard">
				${renderCountdown(3)}
			</section>

			<section id="accelerate">
				<h2>Directions</h2>
				<p>Click the button as fast as you can to make your racer go faster!</p>
				<button id="gas-peddle">Click Me To Win!</button>
			</section>
		</main>
		<footer></footer>
	`
}

function resultsView(positions) {
	console.log("resultsView");
	positions.sort((a, b) => (a.final_position > b.final_position) ? 1 : -1)

	return `
		<header>
			<h1>Race Results</h1>
		</header>
		<main>
			${raceProgress(positions)}
			<a href="/race">Start a new race</a>
		</main>
	`
}

function raceProgress(positions) {
	console.log("raceProgress");
	let userPlayer = positions.find(e => e.id === store.player_id)
	userPlayer.driver_name += " (you)"

	positions = positions.sort((a, b) => (a.segment > b.segment) ? -1 : 1)
	let count = 1

	const results = positions.map(p => {
		return `
			<tr>
				<td>
					<h3>${count++} - ${p.driver_name}</h3>
				</td>
			</tr>
		`
	})

	return `
		<main>
			<h3>Leaderboard</h3>
			<section id="leaderBoard">
				${results}
			</section>
		</main>
	`
}

function renderAt(element, html) {
	console.log("renderAt");
	const node = document.querySelector(element)

	node.innerHTML = html
}

// ^ Provided code ^ do not remove


// API CALLS ------------------------------------------------

const SERVER = 'http://localhost:8000'

function defaultFetchOpts() {
	console.log("defaultFetchOpts");
	return {
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': SERVER,
		},
	}
}

// TODO - Make a fetch call (with error handling!) to each of the following API endpoints 

function getTracks() {
	console.log("getTracks");
	// GET request to `${SERVER}/api/tracks`
	return fetch(`${SERVER}/api/tracks`).then(resp => resp.json()).catch(err => console.log(console.log("Problem with getTracks request::", err)));
}

function getRacers() {
	console.log("getRacers");
	// GET request to `${SERVER}/api/cars`
	return fetch(`${SERVER}/api/cars`).then(resp => resp.json());
}

function createRace(player_id, track_id) {
	console.log("createRace");
	player_id = parseInt(player_id)
	track_id = parseInt(track_id)
	const body = { player_id, track_id }

	return fetch(`${SERVER}/api/races`, {
		method: 'POST',
		...defaultFetchOpts(),
		dataType: 'jsonp',
		body: JSON.stringify(body)
	})
		.then(res => res.json())
		// .then(res => console.log(res))
		.catch(err => console.log("Problem with createRace request::", err))
}

function getRace(id) {
	console.log("getRace");
	// GET request to `${SERVER}/api/races/${id}`
	return fetch(`${SERVER}/api/races/${id}`).then(resp => resp.json()).catch(err => console.log(console.log("Problem with getRace request::", err)));
}

function startRace(id) {
	console.log("startRace");
	return fetch(`${SERVER}/api/races/${id}/start`, {
		method: 'POST',
		...defaultFetchOpts(),
	})
		.then(res => res.json())
		.catch(err => console.log("Problem with startRace request::", err))
}

function accelerate(id) {
	console.log("accelerate");
	// POST request to `${SERVER}/api/races/${id}/accelerate`
	// options parameter provided as defaultFetchOpts
	// no body or datatype needed for this request
	return fetch(`${SERVER}/api/races/${id}/accelerate`, {
		method: 'POST',
		...defaultFetchOpts(),
	})
		// .then(res => res.json())
		.catch(err => console.log("Problem with accelerate request::", err))
}
