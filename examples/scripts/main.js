const { Viewer, TextBox, Rect, Arc, CanvasImage } = Canvas;

const canvas = new Viewer();
canvas.appendTo(document.body);
canvas.setSize(canvas.dom.offsetWidth, canvas.dom.offsetHeight);

const bg = new Rect(0, 0, canvas.width, canvas.height).config(rect => {
	rect.color = 0;
	rect.hoverEffect = false;
	rect.appendTo(canvas);
});

const set1 = new Canvas.ObjectSet(25, 25);
set1.appendTo(canvas);
const set2 = new Canvas.ObjectSet(25, 25);
set2.appendTo(set1);
const set3 = new Canvas.ObjectSet(50, 50);
set3.appendTo(set2);
const testRect1 = new Canvas.Rect(0, 0, 25, 25).config(rect => {
	rect.color = 0xFF0000;
	rect.appendTo(set1);
});
const testRect2 = new Canvas.Rect(0, 0, 25, 25).config(rect => {
	rect.color = 0x00FF00;
	rect.appendTo(set2);
});
const testRect3 = new Canvas.Rect(0, 0, 25, 25).config(rect => {
	rect.color = 0x0000FF;
	rect.appendTo(set3);
});

const testEl = new Canvas.DOMElement('input', 0, 0);
testEl.appendTo(canvas);
// testEl.show();
testEl.y = canvas.height - testEl.dom.offsetHeight;

const ball = new Arc(-10, canvas.height / 2, 10).config(arc => {
	arc.type = 'fill';
	arc.color = 0xFFFFFF;
	arc.appendTo(canvas);
});

const pacman = new Arc(canvas.width / 2, canvas.height / 2, 50).config(arc => {
	const defaultColor = 0xFFFF00;
	arc.type = 'fill';
	arc.color = defaultColor;
	arc.hoverEffect = false;
	arc.startFrom = 'left';
	arc.whenLeftClicked = function() {
		arc.color = Math.floor(Math.random() * 0xFFFFFF);
	}
	arc.whenRightClicked = function() {
		arc.color = defaultColor;
	}
	arc.open = true;
	arc.appendTo(canvas);
});
canvas.whenKeyPressed = keys => {
	if (keys.KeyW) {
		// pacman.startFrom = 'top';
	} else if (keys.KeyD) {
		pacman.startFrom = 'right';
	} else if (keys.KeyS) {
		// pacman.startFrom = 'bottom'
	} else if (keys.KeyA) {
		pacman.startFrom = 'left';
	}
}

const positions = ['end', 'right', 'center', 'left', 'start'];
for (let index in positions) {
	const value = positions[index];
	new Canvas.TextBox('GitHub').config(text => {
		text.color = 0xFFFFFF;
		text.align = value;
		text.direction = 'rtl'
		text.setPos(canvas.width / 2, canvas.height - ((text.font.size) * (parseInt(index) + 1)));
		text.appendTo(canvas);
		text.whenLeftClicked = function () {
			console.log('clicked ' + value);
		}
	});
}

function update(ts) {
	const width = canvas.dom.offsetWidth;
	const height = canvas.dom.offsetHeight;
	if (canvas.width !== width || canvas.height !== height) {
		canvas.setSize(width, height);
		bg.setSize(width, height);
		pacman.x = canvas.width / 2;
		pacman.y = canvas.height / 2;
		ball.y = canvas.height / 2;
	}
	if (canvas.isActive()) {
		if (pacman.startFrom === 'right') {
			if (ball.x > -ball.radius) ball.x-=4;
		}
		else if (pacman.startFrom === 'left') {
			if (ball.x < canvas.width / 2) ball.x+=4;
			else if (ball.x > canvas.width / 2) ball.x = -ball.radius;
		}
	}
	if (pacman.open) {
		if (pacman.start < Math.PI * 0.25) {
			pacman.start += Math.PI * (2 / 90);
		}
		if (pacman.end > Math.PI * 1.75) {
			pacman.end -= Math.PI * (2 / 90);
		}

		if (pacman.start > Math.PI * 0.25) {
			pacman.start = Math.PI * 0.25;
		}
		if (pacman.end < Math.PI * 1.75) {
			pacman.end = Math.PI * 1.75;
		}

		if (pacman.start === Math.PI * 0.25 && pacman.end === Math.PI * 1.75) {
			pacman.open = false;
		}
	} else {
		if (pacman.start > 0) {
			pacman.start -= Math.PI * ( 2 / 90 );
		}
		if (pacman.end < Math.PI * 2) {
			pacman.end += Math.PI * (2 / 90);
		}

		if (pacman.start < 0) {
			pacman.start = 0;
		}
		if (pacman.end > Math.PI * 2) {
			pacman.end = Math.PI * 2;
		}

		if (pacman.start === 0 && pacman.end === Math.PI * 2) {
			pacman.open = true;
		}
	}
	if (pacman.hit(ball) && pacman.start === 0 && pacman.end === Math.PI * 2) {
		ball.x = -10;
	}
	canvas.clear();
	canvas.render();
	requestAnimationFrame(update);
}
requestAnimationFrame(update);
