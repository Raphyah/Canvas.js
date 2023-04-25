/* exported Canvas */

/**
  * Object containing all the properties to render to a canvas. The following properties can be used:
  * ```typescript
  * Canvas.Viewer(contextType: string = '2d');
  * Canvas.CanvasObject(x: number, y: number, width: number, height: number);
  * Canvas.ClickableObject(x: number, y: number, width: number, height: number, whenLeftClicked: Function);
  * Canvas.Color(value: any);
  * Canvas.Rect(x: number, y: number, width: number, height: number, callback: Function = function () { });
  * Canvas.Arc(x: number, y: number, radius: number, start: number = 0, end: number = 2.5 * Math.PI, callback: Function = function () { });
  * Canvas.TextBox(text: string, x: number, y: number, fontSize: number = 10, callback: Function = function () { });
  * Canvas.CanvasImage(image: string, x: number, y: number, width: number, height: number, callback: Function = function () { });
  * ```
  */
const Canvas = (function () {
  /**
  * Create a new "Viewer".
  */
    class Viewer {
      children = [];
      /**
        * Initialize the canvas with a 2d, webgl or webgl2 context.
        * @param {String} contextType The context of the canvas. default: '2d'.
        */
      constructor(contextType = '2d', startEvents = true) {
        this.dom = document.createElement('canvas');
        this.dom.tabIndex = 0;
        this.dom.style.setProperty('outline', 'none', 'important');
        this.contextType = contextType;
        this.context = this.dom.getContext(contextType);
        if (startEvents) this.listenToEvents();
      }
      /**
        * Clears the entire canvas.
        */
      clear() {
        this.context.clearRect(0, 0, this.width, this.height);
        this.children.forEach(element => {
          element.propagateClear();
        });
      }
      /**
        * Adds a new EventListener to "canvas.dom".
        * @param {...any} args Event arguments
        */
      addEventListener(...args) {
        this.dom.addEventListener(...args);
      }
      /**
        * Sets the width of the canvas.
        * @param {Number} value The value in pixels of canvas width.
        */
      set width(value) {
        this.dom.width = value;
      }
      /**
        * Gets the width of the canvas.
        * @return {Number} The width of the canvas.
        */
      get width() {
        return this.dom.width;
      }
      /**
        * Sets the height of the canvas.
        * @param {Number} value The value in pixels of canvas height.
        */
      set height(value) {
        this.dom.height = value;
      }
      /**
        * Gets the height of the canvas.
        * @return {Number} The height of the canvas.
        */
      get height() {
        return this.dom.height;
      }
      /**
        * @return {CSSStyleDeclaration} CSS style element.
        */
      get style() {
        return this.dom.style;
      }
      /**
        * Sets the size of the canvas.
        * @param {Number} width The value in pixels of canvas width.
        * @param {Number} height The value in pixels of canvas height.
        * @param {Boolean} css Should resize CSS too?
        */
      setSize(width, height, css = false) {
        this.width = width;
        this.height = height;
        if (css) {
          this.style.width = width;
          this.style.height = height;
        }
      }

      /**
        * Adds a new element to the canvas and this canvas to the element.
        * @param {CanvasObject} element The canvas object to be added to the scene.
        */
      add(...elements) {
        elements.forEach(element => {
          if (element instanceof CanvasObject) {
            this.addChild(element);
            element.defineCanvas(this);
          }
        });
      }
      /**
        * Adds a new element to the canvas.
        * @param {CanvasObject} element The canvas object to be added to the scene.
        */
      addChild(element) {
        this.children.push(element);
      }

      /**
        * Search for a child canvas object on this canvas.
        * @param {CanvasObject} child The canvas object to be found.
        * @return {CanvasObject} The found canvas object.
        */
      getChild(child) {
        return this.children.find((value) => value == child);
      }

      isActive() {
        return document.activeElement === this.dom;
      }


      /**
        * Initialize events on the canvas.
        */
      listenToEvents() {
        const canvas = this.dom;
        canvas.addEventListener('touchstart', (evt) => {
          evt.preventDefault();

          this.details.pointer.start = Date.now();
          const touch = evt.touches[0];

          this.details.pointer.initPos.x =
            this.details.pointer.currentPos.x =
            touch.clientX * (this.width / this.dom.offsetWidth);

          this.details.pointer.initPos.y =
            this.details.pointer.currentPos.y =
            touch.clientY * (this.height / this.dom.offsetHeight);
        });
        canvas.addEventListener('touchmove', (evt) => {
          evt.preventDefault();

          const touch = evt.touches[0];

          this.details.pointer.currentPos.x =
            touch.clientX * (this.width / this.dom.offsetWidth);
          this.details.pointer.currentPos.y =
            touch.clientY * (this.height / this.dom.offsetHeight);
        });
        canvas.addEventListener('touchend', (evt) => {
          evt.preventDefault();

          this.details.pointer.end = Date.now();
          this.details.pointer.finalPos.x = this.details.pointer.currentPos.x;
          this.details.pointer.finalPos.y = this.details.pointer.currentPos.y;
          this.emitTouch(evt);
          this.details.pointer.currentPos.x = undefined;
          this.details.pointer.currentPos.y = undefined;
        });

        canvas.addEventListener('mousedown', (evt) => {
          this.details.pointer.start = Date.now();

          this.details.pointer.initPos.x =
            evt.offsetX * (this.width / this.dom.offsetWidth);

          this.details.pointer.initPos.y =
            evt.offsetY * (this.height / this.dom.offsetHeight);
        });
        canvas.addEventListener('mousemove', (evt) => {
          // console.log(evt.offsetX * (canvas.width / canvas.dom.offsetWidth));
          this.details.pointer.currentPos.x =
            evt.offsetX * (this.width / this.dom.offsetWidth);
          this.details.pointer.currentPos.y =
            evt.offsetY * (this.height / this.dom.offsetHeight);
        });
        canvas.addEventListener('mouseup', (evt) => {
          this.details.pointer.end = Date.now();
          this.details.pointer.finalPos.x = this.details.pointer.currentPos.x;
          this.details.pointer.finalPos.y = this.details.pointer.currentPos.y;
          this.emitClick(evt);
          this.details.pointer.finalPos.x = undefined;
          this.details.pointer.finalPos.y = undefined;
        });
        canvas.addEventListener('mouseleave', (evt) => {
          this.details.pointer.currentPos.x = undefined;
          this.details.pointer.currentPos.y = undefined;
        });

        // Keyboard events
        canvas.addEventListener('keydown', evt => {
          this.details.keyboard.keys[evt.key] = true;
        });
        canvas.addEventListener('keyup', evt => {
          this.details.keyboard.keys[evt.key] = false;
          this.emitKeyRelease(evt.key);
        });

        // Context events
        canvas.addEventListener('contextmenu', evt => {
          if (!this.forceContextDefault) evt.preventDefault();
        })

        const realTimeUpdate = () => {
          this.emitOver(canvas);
          this.emitNotOver(canvas);
          this.emitKeyPress();
          requestAnimationFrame(realTimeUpdate);
        };
        requestAnimationFrame(realTimeUpdate);
      }


      details = {
        keyboard: {
          keys: {},
        },
        pointer: {
          initPos: {
            x: undefined,
            y: undefined,
          },
          currentPos: {
            x: undefined,
            y: undefined,
          },
          finalPos: {
            x: undefined,
            y: undefined,
          },
          start: undefined,
          end: undefined,
          duration() {
            return this.end - this.start;
          },
        }
      };


      /**
        * Emit click/touch if found.
        * @param {Viewer} element The Canvas to be checked.
        */
      emitClick(evt) {
        const co = this.details.pointer;
        ClickableObject.list.forEach((value) => {
          if (value.lastTimeRendered > 1) return false;
          if (value.wasClicked(this)) {
            switch (evt.button) {
              case 0: // Left click
                if (value.whenLeftClicked &&
                  value.whenLeftClicked.constructor === Function) {
                  value.whenLeftClicked(co);
                }
                break;
              case 1: // Wheel click
                if (value.whenWheelClicked &&
                  value.whenWheelClicked.constructor === Function) {
                  value.whenWheelClicked(co);
                }
                break;
              case 2: // Right click
                if (value.whenRightClicked &&
                  value.whenRightClicked.constructor === Function) {
                  value.whenRightClicked(co);
                }
                break;
              default:
                console.error('A button was clicked but it was not a left, right or wheel click.')
                break;
            }
          }
        });
        co.initPos.x = co.initPos.y = co.finalPos.x = co.finalPos.y = undefined;
      }
      /**
        * Emit click/touch if found.
        * @param {Viewer} element The Canvas to be checked.
        */
      emitTouch(evt) {
        const co = this.details.pointer;
        ClickableObject.list.forEach((value) => {
          if (value.lastTimeRendered > 1) return false;
          if (value.wasClicked(this)) {
            if (evt.touches) { // Left click
              if (value.whenTouched &&
                value.whenTouched.constructor === Function) {
                value.whenTouched(co);
              }
            }
          }
        });
        co.initPos.x = co.initPos.y = co.finalPos.x = co.finalPos.y = undefined;
      }


      /**
        * Emit pointer over if found.
        * @param {Viewer} element The Canvas to be checked.
        */
      emitOver() {
        const co = this.details.pointer;
        ClickableObject.list.forEach((value) => {
          if (value.lastTimeRendered > 1) return false;
          if (value.isUnder() && value.whenPointerOver) {
            value.whenPointerOver(co);
          }
        });
      }


      /**
        * Emit pointer not over if found.
        * @param {Viewer} element The Canvas to be checked.
        */
      emitNotOver(element) {
        ClickableObject.list.forEach((value) => {
          if (value.lastTimeRendered > 1) return false;
          if (!value.isUnder() && value.whenPointerNotOver) {
            value.whenPointerNotOver();
          }
        });
      }


      /**
       * Emit keyboard keydown event
       */
      emitKeyPress() {
        CanvasObject.list.forEach(value => {
          if (value.whenKeyPressed) {
            value.whenKeyPressed(this.details.keyboard.keys);
          }
        })
      }
      /**
       * Emit keyboard keyup event
       */
      emitKeyRelease(key) {
        CanvasObject.list.forEach(value => {
          if (value.whenKeyReleased) {
            value.whenKeyReleased(key);
          }
        })
      }

      render() {
        this.children.forEach(element => {
          element.render();
        });
      }
    }
    /**
      * Create a new "CanvasObject".
      */
    class CanvasObject {
      static list = [];
      /**
        * Initialize the constructor.
        * @param {Number} x The "x" position of the element.
        * @param {Number} y The "y" position of the element.
        * @param {Number} width The width of the element.
        * @param {Number} height The height of the element.
        */
      constructor(x, y, width, height) {
        this.canvas = undefined;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = 0;
        this.lastTimeRendered = 2;
        this.maxTimeWithoutRendering = 65535;
        CanvasObject.list.push(this);
      }

      propagateClear() {
        if (this.lastTimeRendered < this.maxTimeWithoutRendering) {
          this.lastTimeRendered++;
        }
      }

      /**
        * Change the position of this object.
        * @param {Number} x The "x" position of the element.
        * @param {Number} y The "y" position of the element.
        */
      setPos(x, y) {
        this.x = x;
        this.y = y;
      }
      /**
        * Change the size of this object.
        * @param {Number} width The width of the element.
        * @param {Number} height The height of the element.
        */
      setSize(width, height) {
        this.width = width;
        this.height = height;
      }

      /**
        * Adds a canvas to this and sets this to canvas.
        * @param {Canvas} parent The canvas to be added.
        */
      appendTo(parent) {
        if (parent.constructor === Viewer) this.defineCanvas(parent);
        else if (parent.constructor === ObjectSet) this.defineCanvas(parent.canvas);
        parent.addChild(this);
      }
      /**
        * Adds a canvas to this object.
        * @param {Canvas} canvas The canvas to be added.
        */
      defineCanvas(canvas) {
        this.canvas = canvas;
      }

      /**
        * Search for a canvas on this object.
        * @param {Canvas} canvas The canvas to be found.
        * @return {Canvas} The found canvas.
        */
      getCanvas() {
        return this.canvas;
      }

      /**
        * Quickly configures the object.
        * @param {Function} callback The config callback to this object.
        * @return {CanvasObject} This CanvasObject.
        */
      config(callback) {
        if (callback.constructor === Function) callback(this);
        return this;
      }

      /**
        * a
        * @param {Canvas} canvas a
        */
      render(canvas) {
        this.lastTimeRendered = 0;
        const ctx = canvas.context;
        const useHoverColor = this.isUnder() && this.hoverEffect !== false;
        let hoverValue;
        if (useHoverColor === true) {
          if (this.hoverEffect === true) {
            const rgba = Color.getColor(this.color);

            rgba.red -= 64;
            rgba.green -= 64;
            rgba.blue -= 64;

            rgba.red = Math.abs(rgba.red);
            rgba.green = Math.abs(rgba.green);
            rgba.blue = Math.abs(rgba.blue);

            const fixed = Color.fixColor(rgba);

            hoverValue = Color.objectToNumber(fixed);
          } else if (this.hoverEffect.constructor === Number) {
            hoverValue = this.hoverEffect;
          }
        }
        // 16099787 15047099
        // 16711935 15663343
        ctx[`${this.type}Style`] = useHoverColor === false ?
          Color.fromInt(this.color) :
          Color.fromInt(hoverValue);
      }

      hit(target) {
        if (this.canvas === target.canvas) {
          const sLeft   = this.x,
                sRight  = this.x + this.width,
                sTop    = this.y,
                sBottom = this.y + this.height;
          const tLeft   = target.x,
                tRight  = target.x + target.width,
                tTop    = target.y,
                tBottom = target.y + target.height;
          let collision = true;
          if ((sBottom < tTop) ||
            (sTop > tBottom) ||
            (sRight < tLeft) ||
            (sLeft > tRight)) {
              collision = false;
            }
          return  collision;
        }
      }
    }
    /**
      * Creates a new ClickableObject.
      */
    class ClickableObject extends CanvasObject {
      static list = [];
      /**
        * Initialize the constructor.
        * @param {Number} x The "x" position of the element.
        * @param {Number} y The "y" position of the element.
        * @param {Number} width The width of the element.
        * @param {Number} height The height of the element.
        */
      constructor(x, y, width, height) {
        super(x, y, width, height);
        this.whenPointerOver = function () { };
        this.whenPointerNotOver = function () { };
        this.whenLeftClicked = function () { };
        this.whenRightClicked = function () { };
        this.whenWheelClicked = function () { };
        this.hoverEffect = true;
        ClickableObject.list.push(this);
      }

      /**
       * Check if user has moved/draged above something.
       * @param {Viewer} element The Canvas to be checked.
       * @return {Boolean} A boolean checking if there's anything below the pointer.
       */
      isUnder() {
        if (!this.canvas) return;
        const canvas = this.canvas;
        const details = canvas.details.pointer;

        const posNotUndefined = details.currentPos.x != undefined &&
          details.currentPos.y != undefined;

        return this.getCanvas() &&
          posNotUndefined &&
          details.currentPos.x >= this.x &&
          details.currentPos.y >= this.y &&
          details.currentPos.x <= this.x + this.width &&
          details.currentPos.y <= this.y + this.height;
      }
      /**
       * Check if use has clicked/touched something.
       * @param {Viewer} element The Canvas to be checked.
       * @return {Boolean} A boolean checking if there's anything below the pointer.
       */
      wasClicked(element) {
        if (!this.canvas) return;
        const canvas = this.canvas;
        const details = canvas.details.pointer;

        const posNotUndefined = details.initPos.x != undefined &&
          details.initPos.y != undefined;

        const initPos = details.initPos.x >= this.x &&
          details.initPos.y >= this.y &&
          details.initPos.x <= this.x + this.width &&
          details.initPos.y <= this.y + this.height;
        const finalPos = details.finalPos.x >= this.x &&
          details.finalPos.y >= this.y &&
          details.finalPos.x <= this.x + this.width &&
          details.finalPos.y <= this.y + this.height;

        return this.isUnder(element) &&
          posNotUndefined &&
          initPos && finalPos;
      }
    }
    /**
     * Create a color object.
     */
    class Color {
      /**
        * Initialize constructor.
        * @param {*} value Initialize.
        */
      constructor(value) {
        this.value = Color.getColor(value);
        this.alpha = 1;
      }

      /**
        * a
        * @param {String} value a
        * @return {Object} a
        */
      static hexToObject(value) {
        let red; let green; let blue; let alpha;
        const hex = new RegExp('#' +
          '([0-9a-fA-F]{2})' +
          '([0-9a-fA-F]{2})' +
          '([0-9a-fA-F]{2})' +
          '([0-9a-fA-F]{2})?');
        if (hex.test(value)) {
          const captured = value.match(hex);

          red = parseInt(captured[1], 16);
          green = parseInt(captured[2], 16);
          blue = parseInt(captured[3], 16);
          alpha = parseInt(captured[4] || 'FF', 16) / 255;
        } else return false;

        return { red, green, blue, alpha };
      }

      /**
        * a
        * @param {String} value a
        * @return {Object} a
        */
      static rgbToObject(value) {
        let red; let green; let blue; let alpha;

        const rgb = new RegExp(
          'rgba? *' +
          '\( *' +
          '(25[0-5]|2[0-4]\d|1?\d?\d)' +
          ' *, *' +
          '(25[0-5]|2[0-4]\d|1?\d?\d)' +
          ' *, *' +
          '(25[0-5]|2[0-4]\d|1?\d?\d)' +
          '(?: *, *' +
          '(1|0(?:\.\d+)?)' +
          ')? *\)');

        if (rgb.test(value)) {
          const captured = value.match(rgb);

          red = parseInt(captured[1]);
          green = parseInt(captured[2]);
          blue = parseInt(captured[3]);
          alpha = parseFloat(captured[4] || 1);
        } else return false;

        return { red, green, blue, alpha };
      }

      /**
        * a
        * @param {Object} value a
        * @return {Number}
        */
      static objectToNumber(value) {
        return (256 ** 2 * value.red) % (256 ** 3) +
          (256 * value.green) % (256 ** 2) +
          value.blue % 256;
      }

      /**
        * Get color from integer.
        * @param {Integer} value The value to be converted.
        * @return {String} The hex color
        */
      static fromInt(value) {
        return '#' + ('000000' + value.toString(16)).slice(-6);
      }

      /**
        * a
        * @param {Array} value a
        * @return {Array} a
        */
      static fixColor(value) {
        for (const x of ['red', 'green', 'blue']) {
          if (value[x] < 0) value[x] = 0;
        }
        return value;
      }
      /**
        * Get color from value.
        * @param {*} value The color in any format.
        * @return {Array} of colors in RGBA format.
        */
      static getColor(value) {
        let rgba;
        if (value.constructor === String) {
          rgba = Color.rgbToObject(value) || Color.hexToObject(value);
        } else if (value.constructor === Number) {
          rgba = Color.hexToObject(Color.fromInt(value));
        }
        const red = rgba.red;
        const green = rgba.green;
        const blue = rgba.blue;
        const alpha = rgba.alpha;
        return { red, green, blue, alpha };
      }
    }
    /**
      * Used to create a new Rect
      */
    class Rect extends ClickableObject {
      /**
        * Initialize the objects.
        * @param {Number} x The "x" position of the element.
        * @param {Number} y The "y" position of the element.
        * @param {Number} width The width of the element.
        * @param {Number} height The height of the element.
        * @param {Function} callback The settings callback.
        */
      constructor(x, y, width, height) {
        super(x, y, width, height);
        this.lineWidth = 1.0;
        this.type = 'fill';
      }

      /**
        * Render to the scene.
        */
      render() {
        if (!this.canvas) return;
        const ctx = this.canvas.context;
        ctx.save();
        ctx.lineWidth = this.lineWidth;

        super.render(this.canvas);

        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.closePath();
        ctx[this.type]();
        ctx.restore();
      }
    }
    /**
  * Create an "Arc".
  */
    class Arc extends ClickableObject {
      /**
        * Initialize the constructor.
        * @param {Number} x The "x" position of the element.
        * @param {Number} y The "y" position of the element.
        * @param {Number} radius The radius of the element.
        * @param {Number} start The start position of the arc.
        * @param {Number} end The end position of the arc.
        * @param {Function} callback The settings callback.
        */
      constructor(x, y, radius, start = 0, end = 2 * Math.PI) {
        super(x, y, radius * 2, radius * 2);
        this.radius = radius;
        this.startFrom = 'right';
        this.start = start;
        this.end = end;
        this.lineWidth = 1.0;
        this.type = 'stroke';
        this.lineToCenter = true;
        this.closePath = true;
      }

      /**
        * Check if user has moved/draged above something.
        * @param {Canvas} element The Canvas to be checked.
        * @return {Boolean} A boolean checking if there's anything below the pointer.
     */
    isUnder() {
      if (!this.canvas) return;
      const canvas = this.canvas;
      const details = canvas.details.pointer;

      const posNotUndefined = details.currentPos.x != undefined &&
        details.currentPos.y != undefined;

      const currXPos = Math.pow(details.currentPos.x - (this.x), 2);
      const currYPos = Math.pow(details.currentPos.y - (this.y), 2);

      const outerMatch = currXPos +
        currYPos <
        Math.pow(this.radius + this.lineWidth / 2, 2);

      const inMatch = currXPos +
        currYPos >
        Math.pow(this.radius - this.lineWidth / 2, 2);

      let res = this.getCanvas() &&
        posNotUndefined &&
        outerMatch;
      if (this.type !== 'fill') {
        res = res && inMatch;
      }
      return res;
    }

    /**
     * Check if user has clicked/touched something.
     * @param {Canvas} element The Canvas to be checked.
     * @return {Boolean} A boolean checking if there's anything below the pointer.
        */
      wasClicked() {
        const canvas = this.canvas;
        const details = canvas.details.pointer;

        const posNotUndefined = details.initPos.x != undefined &&
          details.initPos.y != undefined;

        const initPos = (Math.pow(details.initPos.x - (this.x), 2) +
          Math.pow(details.initPos.y - (this.y), 2) <
          Math.pow(this.radius + this.lineWidth / 2, 2));

        const finalPos = (Math.pow(details.finalPos.x - (this.x), 2) +
          Math.pow(details.finalPos.y - (this.y), 2) <
          Math.pow(this.radius + this.lineWidth / 2, 2));

        return this.isUnder() && posNotUndefined && initPos && finalPos;
      }

      /**
        * Change the arc angle.
        * @param {Number} start The start of the arc angle.
        * @param {Number} end The end of the arc angle.
        */
      setAngle(start, end) {
        this.start = start;
        this.end = end;
      }

      hit(target) {
        if (this.canvas === target.canvas) {
          const posNotUndefined = target.x != undefined &&
            target.y != undefined;

          const currXPos = Math.pow(target.x - (this.x), 2);
          const currYPos = Math.pow(target.y - (this.y), 2);

          const outerMatch = currXPos +
            currYPos <
            Math.pow(this.radius + this.lineWidth / 2, 2);

          const inMatch = currXPos +
            currYPos >
            Math.pow(this.radius - this.lineWidth / 2, 2);

          let res = this.getCanvas() &&
            posNotUndefined &&
            outerMatch;
          if (this.type !== 'fill') {
            res = res && inMatch;
          }
          return res;
        }
      }

      /**
        * Render to the scene.
        */
      render() {
        if (!this.canvas) return;
        if (this.width < this.radius * 2) this.width = this.radius * 2;
        if (this.height < this.radius * 2) this.height = this.radius * 2;
        const ctx = this.canvas.context;
        ctx.save();
        ctx.lineWidth = this.lineWidth;

        super.render(this.canvas);

        ctx.beginPath();
        if (this.lineToCenter) ctx.lineTo(this.x, this.y);
        const startFrom = this.startFrom.constructor === String ? this.startFrom.toLowerCase() : this.startFrom;
        let offset =  startFrom === 'bottom' ? Math.PI * 0.5 :
                      startFrom === 'left' ? Math.PI :
                      startFrom === 'top' ? Math.PI * -0.5 :
                      startFrom.constructor === Number ? startFrom : 0;
        ctx.arc(this.x, this.y,
          this.radius + (this.type === 'fill' ? this.lineWidth / 2 : 0),
          offset + this.start, offset + this.end);
        if (this.closePath) ctx.closePath();
        ctx[this.type]();
        ctx.restore();
      }
    }
    /**
      * Used to create a new TextBox
      */
    class TextBox extends ClickableObject {
      /**
        * Initialize the objects.
        * @param {String} text The text to be displayed.
        * @param {Number} x The "x" position of the element.
        * @param {Number} y The "y" position of the element.
        * @param {Number} fontSize The font size in pixel.
        * @param {Function} callback The settings callback.
        */
      constructor(text, x, y, fontSize = 10) {
        super(x, y, undefined, fontSize);
        this.text = text;
        this.type = 'fill';
        this.font = {
          size: fontSize,
          family: 'sans-serif',
        };
        this.baseline = 'alphabetic';
        this.align = 'start';
        this.width = this.getWidth();
      }

      /**
        * Returns the text width after font changes.
        * @return {Number} The total width.
        */
      getWidth() {
        const ctx = new OffscreenCanvas(0, 0).getContext('2d');
        ctx.save();
        ctx.font = `${this.font.size}px ${this.font.family}`;
        ctx.textBaseline = this.baseline;
        ctx.textAlign = this.align;
        this.width = ctx.measureText(this.text).width;
        ctx.restore();
        return this.width;
      }

      /**
        * Returns the text height after font changes.
        * @return {Number} The total height.
        */
      getHeight() {
        return this.font.size;
      }

      __getHeight() {
        const canvas = new OffscreenCanvas(0, 0);
        const ctx = canvas.getContext('2d');
        ctx.save();
        ctx.font = `${this.font.size}px ${this.font.family}`;
        ctx.textBaseline = this.baseline;
        ctx.textAlign = this.align;
        const val = ctx.measureText(this.text);
        ctx.restore();
        return val;
      }

      /**
        * Change the object rendered text.
        * @param {String} value The text to be displayed.
        */
      setText(value) {
        this.text = value;
      }

      /**
       * Check if user has moved/draged above something.
       * @param {Viewer} element The Canvas to be checked.
       * @return {Boolean} A boolean checking if there's anything below the pointer.
       */
      isUnder() {
        if (!this.canvas) return;
        const canvas = this.canvas;
        const details = canvas.details.pointer;

        const posNotUndefined = details.currentPos.x != undefined &&
          details.currentPos.y != undefined;

        const y = this.y +
        (this.baseline === 'top'        ? 0                     :
         this.baseline === 'hanging'    ? -this.getHeight() / 4 :
         this.baseline === 'middle'     ? -this.getHeight() / 2 :
         this.baseline === 'alphabetic' ? -this.getHeight()     :
                                          -this.getHeight());
        const height = y + this.getHeight();
        this.align;

        return this.getCanvas() &&
          posNotUndefined &&
          details.currentPos.x >= this.x &&
          details.currentPos.y >= y &&
          details.currentPos.x <= this.x + this.width &&
          details.currentPos.y <= height;
      }
      /**
       * Check if use has clicked/touched something.
       * @param {Viewer} element The Canvas to be checked.
       * @return {Boolean} A boolean checking if there's anything below the pointer.
       */
      wasClicked(element) {
        if (!this.canvas) return;
        const canvas = this.canvas;
        const details = canvas.details.pointer;

        const posNotUndefined = details.initPos.x != undefined &&
          details.initPos.y != undefined;

        const initPos = details.initPos.x >= this.x &&
          details.initPos.y >= this.y &&
          details.initPos.x <= this.x + this.width &&
          details.initPos.y <= this.y + this.height;
        const finalPos = details.finalPos.x >= this.x &&
          details.finalPos.y >= this.y &&
          details.finalPos.x <= this.x + this.width &&
          details.finalPos.y <= this.y + this.height;

        return this.isUnder(element) &&
          posNotUndefined &&
          initPos && finalPos;
      }

      /**
        * Render to the scene.
        */
      render() {
        if (!this.canvas) return;
        if (this.height < this.font.size) this.height = this.font.size;
        const ctx = this.canvas.context;
        ctx.save();

        super.render(this.canvas);

        ctx.font = `${this.font.size}px ${this.font.family}`;
        ctx.textBaseline = this.baseline;
        ctx.textAlign = this.align;
        ctx[`${this.type}Text`](this.text, this.x, this.y);
        ctx.restore();
      }
    }
    /**
      * Used to create a new Image
      */
    class CanvasImage extends ClickableObject {
      /**
        * Initialize the objects.
        * @param {Number} x The "x" position of the element.
        * @param {Number} y The "y" position of the element.
        * @param {Number} width The width of the element.
        * @param {Number} height The height of the element.
        * @param {Function} callback The settings callback.
        */
      constructor(image, x, y, width, height) {
        super(x, y, width, height);
        this.image = new Image();
        this.image.src = image;
        this.lineWidth = 1.0;
        this.type = 'stroke';
      }

      /**
        * Returns when image is loaded.
        * @param {Function} callback The action to do when loaded.
        */
      set onload(callback) {
        this.image.onload = callback;
      }

      /**
        * Render to the scene.
        */
      render() {
        this.lastTimeRendered = 0;
        if (!this.canvas) return;
        const ctx = this.canvas.context;
        ctx.save();
        {
          let hoverValue;
          const useHoverColor = this.isUnder() && this.hoverEffect !== false;
          if (useHoverColor === true) {
            if (this.hoverEffect === true) {
              hoverValue = 0.5;
            } else if (this.hoverEffect.constructor === Number) {
              hoverValue = this.hoverEffect;
            }
          }
          if (useHoverColor) ctx.filter = `brightness(${hoverValue})`;
        }
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        ctx.restore();
      }
    }

    // Source: https://newbedev.com/is-it-possible-to-get-the-non-enumerable-inherited-property-names-of-an-object
    function walkProtoChain(obj, callback) {
      const proto = Object.getPrototypeOf(obj);
      const inherited = (proto) ? walkProtoChain(proto, callback) : [];
        return [...new Set(callback(obj).concat(inherited))];
      }
      function getOwnNonEnumPropertyNames(obj) {
        return Object.getOwnPropertyNames(obj)
          .filter(p => !obj.propertyIsEnumerable(p));
      }
      function getAllPropertyNames(obj) {
        return walkProtoChain(obj, Object.getOwnPropertyNames);
      }
      function getAllEnumPropertyNames(obj) {
        return walkProtoChain(obj, Object.keys);
      }
      function getAllNonEnumPropertyNames(obj) {
        return walkProtoChain(obj, getOwnNonEnumPropertyNames);
        }

    const objs = getAllPropertyNames(Image.prototype);
    for (let x of objs) {
      if ([
        ...getAllPropertyNames(CanvasImage.prototype),
        'x', 'y', 'width', 'height'
      ].includes(x)) {
        continue;
      }
      const descriptors = Object.getOwnPropertyDescriptor(CanvasImage.prototype, x);
      if (!descriptors) {
        Object.defineProperty(CanvasImage.prototype, x, {
          get: function () {
            return this.image[x];
          },
          set: function (value) {
            this.image[x] = value;
          }
        });
      }
    }

    class Path extends ClickableObject {
      constructor() {
        this.path = [];
      }
      add(...elements) {
        for (let i in elements) {
          const element = elements[i];
          if (element && element.constructor === Line) {
            element.disablePath();
          }
        }
      }
    }
    class Line extends ClickableObject {
      constructor(x, y, width, height) {
        // 
      }
    }

    class ObjectSet extends CanvasObject {
      static list = [];
      constructor() {
        super();
        this.children = [];
        ObjectSet.list.push(this);
      }

      propagateClear() {
        this.children.forEach(element => {
          element.propagateClear();
        });
      }
      /**
        * Adds a new element to the canvas and this canvas to the element.
        * @param {CanvasObject} element The canvas object to be added to the scene.
        */
      add(...elements) {
        elements.forEach(element => {
          if (element instanceof CanvasObject) {
            this.addChild(element);
            element.defineCanvas(this);
          }
        });
      }
      /**
        * Adds a new element to the canvas.
        * @param {CanvasObject} element The canvas object to be added to the scene.
        */
      addChild(element) {
        this.children.push(element);
      }

      /**
        * Search for a child canvas object on this canvas.
        * @param {CanvasObject} child The canvas object to be found.
        * @return {CanvasObject} The found canvas object.
        */
      getChild(child) {
        return this.children.find((value) => value == child);
      }
      render() {
        this.children.forEach(element => {
          element.render();
        });
      }
    }

    return {
      Viewer,
      CanvasObject,
      ClickableObject,
      Color,
      Rect,
      Arc,
      TextBox,
      CanvasImage,
      ObjectSet
    }
})();
