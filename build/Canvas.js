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
   * Functions that are going to be used by multiple classes.
   * __add(...elements) is used for Viewer and ObjectSet.
   * __renderSet() is used for Viewer and ObjectSet.
   */
  /**
   * Adds a new element to the canvas and this canvas to the element.
   * @param {CanvasObject} element The canvas object to be added to the scene.
   */
  function __add(...elements) {
    elements.forEach(element => {
      if (element instanceof CanvasObject) {
        /*this.addChild(element);
        element.defineSet(this);
        element.defineCanvas(this);*/
        element.appendTo(this);
      }
    });
  }
  /**
   * Render items to the canvas.
   */
  function __renderSet() {
    this.children.forEach(element => {
      if (element.constructor === ObjectSet ||
        (element.getTrueXPos() + element.getWidth()) >= 0 && (element.getTrueYPos() + element.getHeight()) >= 0 &&
        (element.getTrueXPos()) <= this.canvas.width && (element.getTrueYPos()) <= this.canvas.height) {
        element.render();
      }
    });
  }

  /***********************************
   ************** BEGIN **************
   ********** Error classes **********
   ***********************************/
  class TimedOutError extends Error {
    constructor(...args) {
      super(...args);
      this.name = 'TimedOutError';
    }
  }
  /***********************************
   *************** END ***************
   ********** Error classes **********
   ***********************************/

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
      this.container = document.createElement('div');
      this.container.style.position = 'relative';
      this.container.style.display = 'inline-block';
      this.container.style.width = '100%';
      this.container.style.height = '100%';
      this.container.style.margin = 0;
      this.container.style.padding = 0;
      this.dom = document.createElement('canvas');
      this.dom.tabIndex = 0;
      this.dom.style.setProperty('outline', 'none', 'important');
      this.dom.style.verticalAlign = 'middle';
      this.container.appendChild(this.dom);
      this.contextType = contextType;
      this.context = this.dom.getContext(contextType);
      if (startEvents) this.listenToEvents();
      this.canvas = this;
      this.keyboardEvents = true;
      this.keyboardMode = 'game';
    }

    appendTo(element) {
      element.appendChild(this.container);
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
        // evt.preventDefault();

        this.details.pointer.start = Date.now();
        const touch = evt.touches[0];

        this.details.pointer.initPos.x =
          this.details.pointer.currentPos.x =
            touch.clientX * (this.width / canvas.offsetWidth);

        this.details.pointer.initPos.y =
          this.details.pointer.currentPos.y =
            touch.clientY * (this.height / canvas.offsetHeight);
      }, {passive: true});
      canvas.addEventListener('touchmove', (evt) => {
        // evt.preventDefault();

        const touch = evt.touches[0];

        this.details.pointer.currentPos.x =
          touch.clientX * (this.width / canvas.offsetWidth);
        this.details.pointer.currentPos.y =
          touch.clientY * (this.height / canvas.offsetHeight);
      }, {passive: true});
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
          evt.offsetX * (this.width / canvas.offsetWidth);

        this.details.pointer.initPos.y =
          evt.offsetY * (this.height / canvas.offsetHeight);
      });
      canvas.addEventListener('mousemove', (evt) => {
        // console.log(evt.offsetX * (canvas.width / canvas.dom.offsetWidth));
        this.details.pointer.currentPos.x =
          evt.offsetX * (this.width / canvas.offsetWidth);
        this.details.pointer.currentPos.y =
          evt.offsetY * (this.height / canvas.offsetHeight);
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
        if (this.keyboardEvents) {
          switch (this.keyboardMode) {
            case 'game':
              if (!this.details.keyboard.keys[evt.code]) {
                this.details.keyboard.keys[evt.code] = true;
                this.details.keyboard.keysPressed++;
              }
              break;
            case 'text':
            default:
              if (!this.details.keyboard.keys[evt.key]) {
                this.details.keyboard.keys[evt.key] = true;
                this.details.keyboard.keysPressed++;
              }
              break;
          }
        }
      });
      canvas.addEventListener('keyup', evt => {
        if (this.keyboardEvents) {
          switch (this.keyboardMode) {
            case 'game':
              if (this.details.keyboard.keys[evt.code]) {
                this.details.keyboard.keys[evt.code] = false;
                this.details.keyboard.keysPressed--;
              }
              break;
            case 'text':
            default:
              if (this.details.keyboard.keys[evt.key]) {
                this.details.keyboard.keys[evt.key] = false;
                this.details.keyboard.keysPressed--;
              }
              break;
          }
          if (this.details.keyboard.keysPressed < 0) {
            this.details.keyboard.keysPressed = 0;
          }
        }
        this.emitKeyRelease(evt);
      });

      // Context events
      canvas.addEventListener('contextmenu', evt => {
        if (!this.forceContextDefault) evt.preventDefault();
      });

      const realTimeUpdate = () => {
        this.emitOver(canvas);
        this.emitNotOver(canvas);
        if (this.details.keyboard.keysPressed) this.emitKeyPress();
        requestAnimationFrame(realTimeUpdate);
      };
      requestAnimationFrame(realTimeUpdate);
    }

    details = {
      keyboard: {
        keysPressed: 0,
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
              console.warning('A button was clicked but it was not a left, right or wheel click.');
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
        if (this.whenKeyPressed) {
          this.whenKeyPressed(this.details.keyboard.keys);
        }
      })
    }

    /**
     * Emit keyboard keyup event
     */
    emitKeyRelease(evt) {
      CanvasObject.list.forEach(value => {
        if (this.whenKeyReleased) {
          this.whenKeyReleased(evt.key);
        }
      })
    }
  }
  Object.defineProperties(Viewer.prototype, {
    add: {
      value: __add
    },
    render: {
      value: __renderSet
    }
  });

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
      this.objectSet = undefined;
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.color = 0;
      this.lastTimeRendered = 2;
      this.maxTimeWithoutRendering = 65535;
      this.rotation = 0;
      this.orbit = 0;
      CanvasObject.list.push(this);
    }

    getWidth() {
      return this.width;
    }

    getHeight() {
      return this.height;
    }

    getTrueXPos() {
      let masterX = 0;
      if (this.objectSet?.getTrueXPos) masterX = this.objectSet.getTrueXPos();
      return this.x + masterX;
    }

    getTrueYPos() {
      let masterY = 0;
      if (this.objectSet?.getTrueYPos) masterY = this.objectSet.getTrueYPos();
      return this.y + masterY;
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
      else if (parent.constructor === ObjectSet) {
        this.defineSet(parent);
        this.defineCanvas(parent.canvas);
      }
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
     * Adds an ObjectSet to this object.
     */
    defineSet(objectSet) {
      this.objectSet = objectSet;
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
    applyHoverEffect(canvas) {
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
      ctx[`${this.type}Style`] = useHoverColor === false ?
        Color.hexFromInt(this.color) :
        Color.hexFromInt(hoverValue);
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
        if ((sBottom < tTop) || (sTop > tBottom) || (sRight < tLeft) || (sLeft > tRight)) {
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

      const currentPos = details.currentPos.x >= super.getTrueXPos() &&
        details.currentPos.y >= super.getTrueYPos() &&
        details.currentPos.x <= super.getTrueXPos() + this.width &&
        details.currentPos.y <= super.getTrueYPos() + this.height;

      return this.getCanvas() &&
        posNotUndefined &&
        currentPos;
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

      const initPos = details.initPos.x >= super.getTrueXPos() &&
        details.initPos.y >= super.getTrueYPos() &&
        details.initPos.x <= super.getTrueXPos() + this.width &&
        details.initPos.y <= super.getTrueYPos() + this.height;

      const finalPos = details.finalPos.x >= super.getTrueXPos() &&
        details.finalPos.y >= super.getTrueYPos() &&
        details.finalPos.x <= super.getTrueXPos() + this.width &&
        details.finalPos.y <= super.getTrueYPos() + this.height;

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
     * @param {*} value The value of the color to be used. It can be a RGB or RGBA string, a hexadecimal color string or an integer.
     */
    constructor(value) {
      this.value = Color.getColor(value);
      this.alpha = 1;
    }

    /**
     * Converts a hexadecimal color string to an object.
     * @param {String} value The hexadecimal color code string.
     * @return {Object} Object with the values of red, green, blue and alpha.
     */
    static hexToObject(value) {
      // TODO: change the code so it'll be able to convert integers too, or simply create a new static function for it.
      let red, green, blue, alpha;
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
     * Converts a RGB or RGBA string to an object.
     * @param {String} value The RGB or RGBA string.
     * @return {Object} Object with the values of red, green, blue and alpha.
     */
    static rgbToObject(value) {
      const rgbaPattern = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*((?:1|0(?:\.\d*)?|\.\d+)))?\s*\)$/;
      const matches = rgbaPattern.exec(value);

      if (matches) {
        const red = Math.min(255, Math.max(0, parseInt(matches[1], 10)));
        const green = Math.min(255, Math.max(0, parseInt(matches[2], 10)));
        const blue = Math.min(255, Math.max(0, parseInt(matches[3], 10)));
        const alpha = Math.min(1, Math.max(0, parseFloat(matches[4])));

        return { red, green, blue, alpha };
      }
    }

    /**
     * Converts an object to an integer matching the color.
     * @param {Object} value An object with the red, green and blue channels.
     * @return {Number} A integer between 0 and 16777215.
     */
    static objectToNumber(value) {
      return (256 ** 2 * value.red) % (256 ** 3) +
        (256 * value.green) % (256 ** 2) +
        value.blue % 256;
    }

    /**
     * Get color from integer.
     * @param {Integer} value A integer between 0 and 16777215 to be converted.
     * @return {String} The hexadecimal code value matching the value.
     */
    static hexFromInt(value) {
      return '#' + ('000000' + value.toString(16)).slice(-6);
    }

    static objectFromInt(value) {
      const red = Math.floor(value / (256 ** 3));
      const green = Math.floor((value % (256 ** 3)) / (256 ** 2));
      const blue = Math.floor((value % (256 ** 2)) / 256);
      const alpha = ((value % 256) / 255).toFixed(2);

      return { red, green, blue, alpha };
    }

    /**
     * a
     * @param {Array} value a
     * @return {Array} a
     */
    static fixColor(value = {red: 0, green: 0, blue: 0}) {
      const obj = {};
      for (const x in value) {
        if (value[x] < 0) obj[x] = 0;
        else if (['red', 'green', 'blue'].includes(x) && value[x] > 255) {
          obj[x] = 255;
        } else if (x === 'alpha' && value[x] > 1) {
          obj[x] = 1;
        } else obj[x] = value[x];
      }
      return obj;
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
        rgba = Color.hexToObject(Color.hexFromInt(value));
      }
      const red = rgba.red, green = rgba.green, blue = rgba.blue, alpha = rgba.alpha;
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

      super.applyHoverEffect(this.canvas);

      ctx.beginPath();
      ctx.rect(super.getTrueXPos(), super.getTrueYPos(), this.width, this.height);
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

    get width() {
      return this.radius * 2;
    }
    set width(value) {
      this.radius = value / 2;
    }
    get height() {
      return this.radius * 2;
    }
    set height(value) {
      this.radius = value / 2;
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

      const currXPos = Math.pow(details.currentPos.x - (super.getTrueXPos()), 2);
      const currYPos = Math.pow(details.currentPos.y - (super.getTrueYPos()), 2);

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

      const initPos = (Math.pow(details.initPos.x - (super.getTrueXPos()), 2) +
        Math.pow(details.initPos.y - (super.getTrueYPos()), 2) <
        Math.pow(this.radius + this.lineWidth / 2, 2));

      const finalPos = (Math.pow(details.finalPos.x - (super.getTrueXPos()), 2) +
        Math.pow(details.finalPos.y - (super.getTrueYPos()), 2) <
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

        const currXPos = Math.pow(target.getTrueXPos() - (super.getTrueXPos()), 2);
        const currYPos = Math.pow(target.getTrueYPos() - (super.getTrueYPos()), 2);

        const outerMatch = currXPos +
          currYPos < Math.pow(this.radius + this.lineWidth / 2, 2);

        const inMatch = currXPos +
          currYPos > Math.pow(this.radius - this.lineWidth / 2, 2);

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

      super.applyHoverEffect(this.canvas);

      ctx.beginPath();
      if (this.lineToCenter) ctx.lineTo(super.getTrueXPos(), super.getTrueYPos());
      const startFrom = this.startFrom.constructor === String ? this.startFrom.toLowerCase() : this.startFrom;
      let offset = 0;
      switch (startFrom) {
        case 'bottom':
          offset = Math.PI * 0.5;
          break;
        case 'left':
          offset = Math.PI;
          break;
        case 'top':
          offset = Math.PI * -0.5;
          break;
        default:
          if (startFrom.constructor === Number) {
            offset = startFrom;
          }
          break;
      }
      ctx.arc(super.getTrueXPos(), super.getTrueYPos(),
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
    #offscr_canvas = new OffscreenCanvas(0, 0);
    #offscr_ctx = this.#offscr_canvas.getContext('2d');

    /**
     * Initialize the objects.
     * @param {String} text The text to be displayed.
     * @param {Number} x The "x" position of the element.
     * @param {Number} y The "y" position of the element.
     * @param {Number} fontSize The font size in pixel.
     * @param {Function} callback The settings callback.
     */
    constructor(text, x, y, fontSize = 10) {
      super(x, y);
      this.text = text;
      this.type = 'fill';
      this.font = {
        size: fontSize,
        family: 'sans-serif',
      };
      this.baseline = 'alphabetic';
      this.align = 'start';
      this.direction = 'ltr';
    }

    set width(width) {
      if (this.font) {
        const targetWidth = width;
        const canvasWidth = this.canvas.width;

        let minFontSize = 1;
        let maxFontSize = canvasWidth;

        while (maxFontSize - minFontSize > 1) {
          const fontSize = Math.floor((minFontSize + maxFontSize) / 2);
          const textWidth = this.getWidth(fontSize);
          if (textWidth < targetWidth) {
            minFontSize = fontSize;
          } else {
            maxFontSize = fontSize;
          }
        }

        this.font.size = minFontSize;
      }
    }

    get width() {
      return this.getWidth();
    }

    set height(height) {
      if (this.font) this.font.size = height;
    }

    get height() {
      return this.font.size;
    }

    getTrueXPos() {
      const ctx = this.#offscr_ctx;
      ctx.save();
      ctx.font = `${this.font.size}px ${this.font.family}`;
      ctx.textBaseline = this.baseline;
      ctx.textAlign = this.align;

      const metrics = ctx.measureText(this.text);
      let x = super.getTrueXPos();
      if (this.align === 'center') {
        x -= metrics.width / 2;
      } else if (this.align === 'right') {
        x -= metrics.width;
      } else if (this.align === 'start') {
        if (this.direction === 'rtl') {
          x -= metrics.width;
        }
      } else if (this.align === 'end') {
        if (this.direction != 'rtl') {
          x -= metrics.width;
        }
      }
      ctx.restore();
      return x;
    }

    getTrueYPos() {
      const ctx = this.#offscr_ctx;
      ctx.save();
      ctx.font = `${this.font.size}px ${this.font.family}`;
      ctx.textBaseline = this.baseline;
      const metrics = ctx.measureText(this.text);
      let y = super.getTrueYPos();
      if (this.baseline !== 'top') {
        y -= metrics.fontBoundingBoxAscent;
        switch (this.baseline) {
          case 'ideographic':
            y += metrics.fontBoundingBoxDescent;
            break;
          case 'bottom':
            y += metrics.actualBoundingBoxDescent / 2;
            break;
        }
      }
      ctx.restore();
      return y;
    }

    /**
     * Returns the text width after font changes.
     * @return {Number} The total width.
     */
    getWidth(fontSize, fontFamily) {
      const ctx = this.#offscr_ctx;
      ctx.save();
      ctx.font = `${fontSize ?? this.font.size}px ${fontFamily ?? this.font.family}`;
      const width = ctx.measureText(this.text).width;
      ctx.restore();
      return width;
    }

    /**
     * Returns the text height after font changes.
     * @return {Number} The total height.
     */
    getHeight() {
      return this.font.size;
    }

    __getHeight() {
      const canvas = this.#offscr_ctx;
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

      const x = this.getTrueXPos();
      const y = this.getTrueYPos();
      const height = this.getHeight();

      const currentPos = details.currentPos.x >= x &&
        details.currentPos.y >= y &&
        details.currentPos.x <= x + this.width &&
        details.currentPos.y <= y + height;

      return this.getCanvas() &&
        posNotUndefined &&
        currentPos;
    }

    wasClicked(element) {
      if (!this.canvas) return;
      const canvas = this.canvas;
      const details = canvas.details.pointer;

      const posNotUndefined = details.initPos.x != undefined &&
        details.initPos.y != undefined;

      const x = this.getTrueXPos();
      const y = this.getTrueYPos();

      const initPos = details.initPos.x >= x &&
        details.initPos.y >= y &&
        details.initPos.x <= x + this.width &&
        details.initPos.y <= y + this.height;
      const finalPos = details.finalPos.x >= x &&
        details.finalPos.y >= y &&
        details.finalPos.x <= x + this.width &&
        details.finalPos.y <= y + this.height;

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

      super.applyHoverEffect(this.canvas);

      ctx.font = `${this.font.size}px ${this.font.family}`;
      ctx.textBaseline = this.baseline;
      ctx.textAlign = this.align;
      ctx.direction = this.direction;
      ctx[`${this.type}Text`](this.text, super.getTrueXPos(), super.getTrueYPos());
      ctx.restore();
    }
  }

  /**
   * Used to create a new Image
   */
  class CanvasImage extends ClickableObject {
    maxLoopIterations = 100;
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
      if (image) {
        if (image.constructor === HTMLImageElement) {
          this.image = image;
        } else if (image.constructor === SpriteSet) {
          this.sprites = image;
          this.changeImageElement(this.sprites.getImage());
        } else if (image.constructor === String) {
          this.image.src = image;
        }
      }
      this.lineWidth = 1.0;
      this.type = 'stroke';
    }

    changeImageElement(image) {
      if (image.constructor != HTMLImageElement) return;
      this.image = image;
    }

    /**
     * Returns when image is loaded.
     * @param {Function} callback The action to do when loaded.
     */
    set onload(callback) {
      if (this.image) {
        if (this.image.constructor === HTMLImageElement) {
          this.image.onload = callback;
        }
      }
    }

    spritesReady() { return this.sprites.setReady() }

    step(frames = 1) {
      if (!this.sprites) return;
      this.sprites.step(frames);
      this.changeImageElement(this.sprites.getImage());
    }
    random() {
      return new Promise((resolve, reject) => {
        this.sprites.random()
          .then(() => {
            this.changeImageElement(this.sprites.getImage());
            resolve(true);
          })
          .catch(error => reject(error));
      })
    }

    imageReady() {
      return new Promise((resolve, reject) => {
        let timesLooped = 0;
        const checker = () => {
          if (this.image?.naturalWidth && this.image?.naturalHeight) {
            clearInterval(interval);
            resolve(true);
          }
          timesLooped++;

          if (timesLooped > this.maxLoopIterations) {
            clearInterval(interval);
            reject(new TimedOutError(`Loop stack exceed the max amount of maxLoopIterations (${this.maxLoopIterations}).`));
          }
        }
        const interval = setInterval(checker, 1000 / 15);
      });
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
      ctx.drawImage(this.image, super.getTrueXPos(), super.getTrueYPos(), this.width, this.height);
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
  // Source: https://newbedev.com/is-it-possible-to-get-the-non-enumerable-inherited-property-names-of-an-object

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

  class SpriteSet {
    maxLoopIterations = 100;
    #currentSet;
    #currentImage;
    /**
     * Add a set of images to be displayed on a CanvasImage object.
     * @param {Object} spriteSet The images to be added to the set.
     */
    constructor(spriteSet) {
      this.set = {};
      this.addSet(spriteSet);
    }
    get currImg() {
      return this.#currentImage;
    }
    /**
     * Add sets of sprites to the SpriteSet.
     * @param {Object} spriteSet The sets to be added.
     */
    addSet(spriteSet) {
      for (let animation in spriteSet) {
        if (!this.#currentSet) this.#currentSet = animation;
        this.set[animation] = [];
        for (let image of spriteSet[animation]) {
          this.insert(animation, image);
        }
      }
    }
    insert(animation, image) {
      if (!this.#currentImage) this.#currentImage = 0;
      if (image.constructor === HTMLImageElement) {
        this.set[animation].push(image);
      } else {
        const el = new Image();
        el.src = image;
        this.set[animation].push(el);
      }
    }
    imgSetExists() {
      return this.set?.[this.#currentSet]?.[this.#currentImage];
    }
    getImage() {
      if (!this.imgSetExists()) return false;
      return this.set[this.#currentSet][this.#currentImage];
    }
    setReady() {
      // const imgSetExists = this.imgSetExists;
      return new Promise((resolve, reject) => {
        let timesLooped = 0;
        const checker = () => {
          if (typeof this.#currentImage === 'number' && this.imgSetExists()) {
            clearInterval(interval);
            resolve(true);
          }
          timesLooped++;

          if (timesLooped > this.maxLoopIterations) {
            clearInterval(interval);
            reject(new TimedOutError(`Loop stack exceed the max amount of ${this.maxLoopIterations}.`));
          }
        }
        const interval = setInterval(checker, 1000 / 15);
      });
    }
    step(frames = 1) {
      this.setReady()
        .then(() => {
          this.#currentImage += frames;
          const totalItems = this.set[this.#currentSet].length;
          if (totalItems <= this.#currentImage) {
            this.#currentImage -= totalItems;
          } else if (this.#currentImage < 0) {
            this.#currentImage += totalItems;
          }
        })
        .catch();
    }
    random() {
      return new Promise((resolve, reject) => {
        this.setReady()
        .then(() => {
          this.#currentImage = Math.floor(Math.random() * this.set[this.#currentSet].length);
          resolve(this.#currentImage);
        })
        .catch(error => reject(error));
      });
    }
  }

  class Path extends ClickableObject {
    constructor() {
      super();
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
      super(x, y, width, height);
    }
  }

  class ObjectSet extends CanvasObject {
    static list = [];

    constructor(x = 0, y = 0) {
      super(x, y);
      this.children = [];
      ObjectSet.list.push(this);
    }

    getTotalWidth() {
      let totalWidth = 0;
      for (const value of this.children) {
        let size = value.x + value.getWidth();
        if (size > totalWidth) totalWidth = size;
      }
      return totalWidth;
    }

    getTotalHeight() {
      let totalHeight = 0;
      for (const value of this.children) {
        let size = value.y + value.getHeight();
        if (size > totalHeight) totalHeight = size;
      }
      return totalHeight;
    }

    propagateClear() {
      this.children.forEach(element => {
        element.propagateClear();
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
  }
  Object.defineProperties(ObjectSet.prototype, {
    add: {
      value: __add
    },
    render: {
      value: __renderSet
    }
  });

  class DOMElement {
    #x;
    #y;
    constructor(element, x, y) {
      this.canvas = undefined;
      this.#x = x;
      this.#y = y;
      this.dom = document.createElement(element);
      this.style.display = 'none';
      this.style.position = 'absolute';
      this.style.left = `${x}px`;
      this.style.top = `${y}px`;
    }
    appendTo(canvas) {
      const container = canvas.container;
      container.appendChild(this.dom);
      this.canvas = canvas;
    }
    set x(value) {
      this.#x = value;
      this.style.left = `${value}px`;
    }
    get x() {
      return this.#x;
    }
    set y(value) {
      this.#y = value;
      this.style.top = `${value}px`;
    }
    get y() {
      return this.#y;
    }
    get style() {
      return this.dom.style;
    }
    show() {
      this.style.display = 'block';
    }
    hide() {
      this.style.display = 'none';
    }
    get hidden() {
      return this.style.display === 'none';
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
    SpriteSet,
    ObjectSet,
    DOMElement
  }
})();
