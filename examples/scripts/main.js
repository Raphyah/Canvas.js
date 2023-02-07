(function() {
  const { Viewer, TextBox, Rect, Arc, CanvasImage } = Canvas;

  const canvas = new Viewer();
  document.body.appendChild(canvas.dom);
  canvas.setSize(canvas.dom.offsetWidth, canvas.dom.offsetHeight);

  const bg = new Rect(0, 0, canvas.width, canvas.height).config(rect => {
    rect.color = 0;
    rect.hoverEffect = false;
    rect.appendTo(canvas);
  });

  const baseText = new TextBox('Test', 0, 32, 32).config(txt => {
    txt.color = 0xFFFFFF;
    txt.baseline = 'bottom';
    console.log(txt.__getHeight());
    txt.appendTo(canvas);
  });
  new TextBox('Test', baseText.getWidth() * 1, 32, 32).config(txt => {
    txt.color = 0xFFFFFF;
    txt.baseline = 'ideographic';
    console.log(txt.__getHeight());
    txt.appendTo(canvas);
  });
  new TextBox('Test', baseText.getWidth() * 2, 32, 32).config(txt => {
    txt.color = 0xFFFFFF;
    txt.__getHeight();
    txt.appendTo(canvas);
  });
  new TextBox('Test', baseText.getWidth() * 3, 32, 32).config(txt => {
    txt.color = 0xFFFFFF;
    txt.baseline = 'middle';
    console.log(txt.__getHeight());
    txt.appendTo(canvas);
  });
  new TextBox('Test', baseText.getWidth() * 4, 32, 32).config(txt => {
    txt.color = 0xFFFFFF;
    txt.baseline = 'hanging';
    console.log(txt.__getHeight());
    txt.appendTo(canvas);
  });
  new TextBox('Test', baseText.getWidth() * 5, 32, 32).config(txt => {
    txt.color = 0xFFFFFF;
    txt.baseline = 'top';
    txt.align = 'right';
    console.log(txt.__getHeight());
    txt.appendTo(canvas);
  });

  const textRect = new Rect(0, 32, canvas.width, 1).config(rect => {
    rect.color = 0xFFFFFF;
    rect.appendTo(canvas);
  });
  
  const ball = new Arc(-10, canvas.height / 2, 10).config(arc => {
    arc.type = 'fill';
    arc.color = 0xFFFFFF;
    arc.appendTo(canvas);
  });

  const pacman = new Arc(canvas.width / 2, canvas.height / 2, 50).config(arc => {
    arc.type = 'fill';
    arc.color = 0xFFFF00;
    arc.hoverEffect = false;
    arc.startFrom = 'left';
    arc.whenKeyPressed = keys => {
      if (keys.w) {
        arc.startFrom = 'top';
      } else if (keys.d) {
        arc.startFrom = 'right';
      } else if (keys.s) {
        arc.startFrom = 'bottom'
      } else if (keys.a) {
        arc.startFrom = 'left';
      }
    }
    arc.whenRightClicked = function() {
      arc.color = Math.floor(Math.random() * 0xFFFFFF);
    }
    arc.open = true;
    arc.appendTo(canvas);
  });

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
    if (ball.x < canvas.width / 2) ball.x+=4;
    else if (ball.x > canvas.width / 2) ball.x = -10;
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
})()