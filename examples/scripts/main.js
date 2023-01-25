(function() {
  const { Viewer, TextBox, Rect, Arc, CanvasImage } = Canvas;

  const canvas = new Viewer();
  document.body.appendChild(canvas.dom);
  canvas.setSize(canvas.dom.offsetWidth, canvas.dom.offsetHeight);

  const mainPageArc = new Arc(16, 16, 16).config(arc => {
    arc.type = 'fill';
    arc.lineToCenter = false;
    arc.whenLeftClicked = function() {
      window.open('https://raphyah.github.io/');
    }
    arc.appendTo(canvas);
  });
  const raphyahsMainPage = new TextBox('R', 32 / 4, 32 / 8, 32).config(textbox => {
    textbox.color = 0xFFFFFF;
    textbox.font.family = 'monospace';
    textbox.baseline = 'top';
    textbox.appendTo(canvas);
  });
  const title = new TextBox('Canvas.js Example', 32, 0, 32).config(textbox => {
    textbox.color = 0;
    textbox.baseline = 'top';
    textbox.appendTo(canvas);
  });

  function update(ts) {
    if (canvas.width !== canvas.dom.offsetWidth || canvas.height !== canvas.dom.offsetHeight) {
      canvas.setSize(canvas.dom.offsetWidth, canvas.dom.offsetHeight);
    }
    canvas.clear();
    canvas.render();
    requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
})()