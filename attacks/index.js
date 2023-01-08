
const CONTAINER = document.getElementById('container');
const ATTACKER = document.getElementById('attacker');
const TARGET = document.getElementById('target');
const TOTAL_PERCENT_LABEL = document.getElementById('total-percent');
const KEYFRAME_PERCENT_LABEL = document.getElementById('keyframe-percent');
const RELATIVE_DISTANCE_LABEL = document.getElementById('relative-distance');
const FROM_DISTANCE_LABEL = document.getElementById('from-distance');
const TO_DISTANCE_LABEL = document.getElementById('to-distance');

const ONE_SECOND = 1000;
const ATTACK_DURATION = ONE_SECOND * 0.5;
const MIN_ATTACK_DISTANCE = 100;

const KEYFRAMES = [
	[0.00,  0.00],
	[0.10, -0.25],
	[0.5,   1.25],
	[1.00,  0.00]
];

/*
const KEYFRAMES = [
	[0, 0],
	[1, 1]
];
*/

let LAST_TICK_TIME = Date.now();
let ATTACKING = false;
let START_TIME = 0;
let ATTACK_TIMER = 0;
let ATTACKER_X = ATTACKER.offsetLeft + (ATTACKER.offsetWidth / 2);
let ATTACKER_Y = ATTACKER.offsetTop + (ATTACKER.offsetHeight / 2);
let TARGET_X = TARGET.offsetLeft + (TARGET.offsetWidth / 2);
let TARGET_Y = TARGET.offsetTop + (TARGET.offsetTop / 2);
let TARGET_X_DIRECTION = 0;
let TARGET_Y_DIRECTION = 0;
let ATTACKER_X_DIRECTION = 0;
let ATTACKER_Y_DIRECTION = 0;
let MOVING = false;

function getSurroundingKeyframes(percent_through) {
	let index = KEYFRAMES.length;

	while (index--) {
		const keyframe = KEYFRAMES[index];

		if (keyframe[0] <= percent_through) {
			return [keyframe, KEYFRAMES[index + 1]];
		}
	}

	return [KEYFRAMES[0], KEYFRAMES[1]];
}

function getStartX() {
	return ATTACKER_X;
}

function getStartY() {
	return ATTACKER_Y;
}

function getEndX() {
	return TARGET_X;
}

function getEndY() {
	return TARGET_Y;
}

function getDistance(x1, y1, x2, y2) {
	return Math.sqrt(Math.pow(x2 - x1) + Math.pow(y2 - y1));
}

function getPointAtDistance(percent) {
	const distance = getDistance(ATTACKER_X, ATTACKER_Y, TARGET_X, TARGET_Y);

	if (distance < MIN_ATTACK_DISTANCE) {
		// WORKING HERE
	}

	const start_x = getStartX();
	const start_y = getStartY();
	const end_x = getEndX();
	const end_y = getEndY();
	const x = start_x + percent * (end_x - start_x);
	const y = start_y + percent * (end_y - start_y);

	return [x, y];
}

function tick() {
	requestAnimationFrame(tick);

	if (MOVING) {
		updateEntityDirections();
		updateEntityPositions();
	}

	if (ATTACKING) {
		updateAttack();
	}

	LAST_TICK_TIME = Date.now();
}

function performAttack() {
	ATTACKING = true;
	START_TIME = Date.now();
}

function randomBetween(min, max) {
	const delta = max - min;
	const offset = Math.random() * delta;

	return min + offset;
}

function randomValue(set) {
	const index = Math.floor(Math.random() * set.length);

	return set[index];
}

function updateEntityDirections() {
	if (Math.random() < 0.01) {
		TARGET_X_DIRECTION = randomValue([-1, 1]);
	}

	if (Math.random() < 0.01) {
		TARGET_Y_DIRECTION = randomValue([-1, 1]);
	}

	if (Math.random() < 0.01) {
		ATTACKER_X_DIRECTION = randomValue([-1, 1]);
	}

	if (Math.random() < 0.01) {
		ATTACKER_Y_DIRECTION = randomValue([-1, 1]);
	}
}

function updateEntityPositions() {
	updateTargetPosition();
	// updateAttackerPosition();
}

function updateTargetPosition() {
	const elapsed_time = Date.now() - LAST_TICK_TIME;
	const distance = elapsed_time * 0.1;
	const x_increment = distance * TARGET_X_DIRECTION;
	const y_increment = distance * TARGET_Y_DIRECTION;
	const half_width = TARGET.offsetWidth / 2;
	const half_height = TARGET.offsetHeight / 2;

	TARGET_X += x_increment;
	TARGET_Y += y_increment;

	const min_x = half_width;
	const min_y = half_height;
	const max_x = CONTAINER.offsetWidth - half_width;
	const max_y = CONTAINER.offsetHeight - half_height;

	if (TARGET_X < min_x) {
		TARGET_X = min_x;
		TARGET_X_DIRECTION *= -1;
	} else if (TARGET_X > max_x) {
		TARGET_X = max_x;
		TARGET_X_DIRECTION *= -1;
	}

	if (TARGET_Y < min_y) {
		TARGET_Y = min_y;
		TARGET_Y_DIRECTION *= -1;
	} else if (TARGET_Y > max_y) {
		TARGET_Y = max_y;
		TARGET_Y_DIRECTION *= -1;
	}

	const left = TARGET_X - half_width;
	const top = TARGET_Y - half_height;

	TARGET.style.left = `${left}px`;
	TARGET.style.top = `${top}px`;
}

function updateAttackerPosition() {
	const elapsed_time = Date.now() - LAST_TICK_TIME;
	const distance = elapsed_time * 0.1;
	const x_increment = distance * ATTACKER_X_DIRECTION;
	const y_increment = distance * ATTACKER_Y_DIRECTION;

	ATTACKER_X += x_increment;
	ATTACKER_Y += y_increment;

	if (ATTACKER_X < MIN_X) {
		ATTACKER_X = MIN_X;
	} else if (ATTACKER_X > MAX_X) {
		ATTACKER_X = MAX_X;
	}

	if (ATTACKER_Y < MIN_Y) {
		ATTACKER_Y = MIN_Y;
	} else if (ATTACKER_Y > MAX_Y) {
		ATTACKER_Y = MAX_Y;
	}

	const left = ATTACKER_X - (ATTACKER.offsetWidth / 2);
	const top = ATTACKER_Y - (ATTACKER.offsetHeight / 2);

	ATTACKER.style.left = `${left}px`;
	ATTACKER.style.top = `${top}px`;
}

function updateAttack() {
	const elapsed_time = Date.now() - START_TIME;

	if (elapsed_time >= ATTACK_DURATION) {
		ATTACKING = false;
		scheduleNextAttack(ONE_SECOND * 2);
		return;
	}

	const total_percent_through = elapsed_time / ATTACK_DURATION;
	const keyframes = getSurroundingKeyframes(total_percent_through);
	const [previous_keyframe, next_keyframe] = keyframes;
	const keyframe_duration = next_keyframe[0] - previous_keyframe[0];
	const relative_percent_start = total_percent_through - previous_keyframe[0];
	const percent_through_keyframe = relative_percent_start / keyframe_duration;
	const keyframe_distance = next_keyframe[1] - previous_keyframe[1];
	const relative_distance = keyframe_distance * percent_through_keyframe + previous_keyframe[1];
	const [x, y] = getPointAtDistance(relative_distance);

	TOTAL_PERCENT_LABEL.innerHTML = total_percent_through.toFixed(2);
	KEYFRAME_PERCENT_LABEL.innerHTML = percent_through_keyframe.toFixed(2);
	RELATIVE_DISTANCE_LABEL.innerHTML = relative_distance.toFixed(2);
	FROM_DISTANCE_LABEL.innerHTML = previous_keyframe[1];
	TO_DISTANCE_LABEL.innerHTML = next_keyframe[1];

	// ATTACKER_X = x;
	// ATTACKER_Y = y;

	const left = x - (ATTACKER.offsetWidth / 2);
	const top = y - (ATTACKER.offsetHeight / 2);

	ATTACKER.style.left = `${left}px`;
	ATTACKER.style.top = `${top}px`;
}

function scheduleNextAttack(delay) {
	clearTimeout(ATTACK_TIMER);
	ATTACK_TIMER = setTimeout(performAttack, delay);
}

tick();
scheduleNextAttack(0);

function handleMousemove(event) {
	const x = event.pageX - CONTAINER.offsetLeft;
	const y = event.pageY - CONTAINER.offsetTop;

	const left = x - (ATTACKER.offsetWidth / 2);
	const top = y - (ATTACKER.offsetHeight / 2);

	ATTACKER_X = x;
	ATTACKER_Y = y;

	ATTACKER.style.left = `${left}px`;
	ATTACKER.style.top = `${top}px`;
}

function handleMouseup(event) {
	window.removeEventListener('mousemove', handleMousemove);
	window.removeEventListener('mouseup', handleMouseup);
}

function handleAttackerMousedown(event) {
	window.addEventListener('mousemove', handleMousemove, false);
	window.addEventListener('mouseup', handleMouseup, false);
}

function handleTargetClick(event) {
	MOVING = !MOVING;
	TARGET.classList.toggle('moving');
}

ATTACKER.addEventListener('mousedown', handleAttackerMousedown, false);
TARGET.addEventListener('click', handleTargetClick, false);
