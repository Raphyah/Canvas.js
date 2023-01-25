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
				this.contextType = contextType;
				this.context = this.dom.getContext(contextType);
				if (startEvents) this.listenToEvents();
			}
			/**
				* Clears the entire canvas.
				*/
			clear() {
				this.context.clearRect(0, 0, this.width, this.height);
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


			/**
				* Initialize events on the canvas.
				*/
			listenToEvents() {
				const canvas = this.dom;
				canvas.addEventListener('touchstart', (evt) => {
					evt.preventDefault();

					this.details.start = Date.now();
					const touch = evt.touches[0];

					this.details.initPos.x =
						this.details.currentPos.x =
						touch.clientX * (this.width / this.dom.offsetWidth);

					this.details.initPos.y =
						this.details.currentPos.y =
						touch.clientY * (this.height / this.dom.offsetHeight);
				});
				canvas.addEventListener('touchmove', (evt) => {
					evt.preventDefault();

					const touch = evt.touches[0];

					this.details.currentPos.x =
						touch.clientX * (this.width / this.dom.offsetWidth);
					this.details.currentPos.y =
						touch.clientY * (this.height / this.dom.offsetHeight);
				});
				canvas.addEventListener('touchend', (evt) => {
					evt.preventDefault();

					this.details.end = Date.now();
					this.details.finalPos.x = this.details.currentPos.x;
					this.details.finalPos.y = this.details.currentPos.y;
					this.emitClick(canvas);
					this.details.currentPos.x = undefined;
					this.details.currentPos.y = undefined;
				});

				canvas.addEventListener('mousedown', (evt) => {
					this.details.start = Date.now();

					this.details.initPos.x =
						evt.offsetX * (this.width / this.dom.offsetWidth);

					this.details.initPos.y =
						evt.offsetY * (this.height / this.dom.offsetHeight);
				});
				canvas.addEventListener('mousemove', (evt) => {
					// console.log(evt.offsetX * (canvas.width / canvas.dom.offsetWidth));
					this.details.currentPos.x =
						evt.offsetX * (this.width / this.dom.offsetWidth);
					this.details.currentPos.y =
						evt.offsetY * (this.height / this.dom.offsetHeight);
				});
				canvas.addEventListener('mouseup', (evt) => {
					this.details.end = Date.now();
					this.details.finalPos.x = this.details.currentPos.x;
					this.details.finalPos.y = this.details.currentPos.y;
					if (evt.button === 0) { // Left click
						this.emitClick(canvas);
					}
					else if (evt.button === 1) { // Wheel click
						// 
					}
					else if (evt.button === 2) { // Right click
						// 
					}
					this.details.finalPos.x = undefined;
					this.details.finalPos.y = undefined;
				});
				canvas.addEventListener('mouseleave', (evt) => {
					this.details.currentPos.x = undefined;
					this.details.currentPos.y = undefined;
				});
				canvas.addEventListener('contextmenu', evt => {
					if (!this.forceContextDefault) evt.preventDefault();
				})

				const updatePosition = () => {
					this.emitOver(canvas);
					this.emitNotOver(canvas);
					requestAnimationFrame(updatePosition);
				};
				requestAnimationFrame(updatePosition);
			}


			details = {
				shouldExecute: false,
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
			};


			/**
				* Emit click/touch if found.
				* @param {Viewer} element The Canvas to be checked.
				*/
			emitClick() {
				ClickableObject.list.forEach((value) => {
					if (value.whenLeftClicked &&
						value.whenLeftClicked.constructor === Function &&
						value.wasClicked(this)
					) {
						value.whenLeftClicked();
					}
				});
				const co = this.details;
				co.initPos.x = co.initPos.y = co.finalPos.x = co.finalPos.y = undefined;
			}


			/**
				* Emit pointer over if found.
				* @param {Viewer} element The Canvas to be checked.
				*/
			emitOver() {
				ClickableObject.list.forEach((value) => {
					if (value.isUnder(this) && value.whenPointerOver) {
						value.whenPointerOver();
					}
				});
			}


			/**
				* Emit pointer not over if found.
				* @param {Viewer} element The Canvas to be checked.
				*/
			emitNotOver(element) {
				ClickableObject.list.forEach((value) => {
					if (!value.isUnder(this) && value.whenPointerNotOver) {
						value.whenPointerNotOver();
					}
				});
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
				* @param {Canvas} canvas The canvas to be added.
				*/
			appendTo(canvas) {
				this.defineCanvas(canvas);
				canvas.addChild(this);
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
			getCanvas(canvas) {
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
				const ctx = canvas.context;
				const useHoverColor = this.isUnder(canvas) && this.hoverEffect !== false;
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
    isUnder(element) {
      /**
       * TODO: This can have issues in the future. To avoid uneccessary iterations, each object can only exist in one canvas.
       */
			if (!this.canvas) return;
      const canvas = this.canvas;
      const details = canvas.details;

      const posNotUndefined = details.currentPos.x != undefined &&
        details.currentPos.y != undefined;

      return this.getCanvas(element) &&
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
				const details = canvas.details;

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
    isUnder(element) {
			if (!this.canvas) return;
      const canvas = this.canvas;
      const details = canvas.details;

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

      let res = this.getCanvas(element) &&
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
			wasClicked(element) {
				const canvas = this.canvas;
				const details = canvas.details;

				const posNotUndefined = details.initPos.x != undefined &&
					details.initPos.y != undefined;

				const initPos = (Math.pow(details.initPos.x - (this.x), 2) +
					Math.pow(details.initPos.y - (this.y), 2) <
					Math.pow(this.radius + this.lineWidth / 2, 2));

				const finalPos = (Math.pow(details.finalPos.x - (this.x), 2) +
					Math.pow(details.finalPos.y - (this.y), 2) <
					Math.pow(this.radius + this.lineWidth / 2, 2));

				return this.isUnder(element) && posNotUndefined && initPos && finalPos;
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
				ctx.arc(this.x, this.y,
					this.radius + (this.type === 'fill' ? this.lineWidth / 2 : 0),
					this.start, this.end);
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
				this.textAlign = 'start';
			}

			/**
				* Returns the text width after font changes.
				* @return {Number} The total width.
				*/
			getWidth() {
				const ctx = new OffscreenCanvas(0, 0).getContext('2d');
				ctx.save();
				ctx.font = `${this.font.size}px ${this.font.family}`;
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

			/**
				* Change the object rendered text.
				* @param {String} value The text to be displayed.
				*/
			setText(value) {
				this.text = value;
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
				ctx.textAlign = this.textAlign;
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
				if (!this.canvas) return;
				const ctx = this.canvas.context;
				ctx.save();
				{
					let hoverValue;
					const useHoverColor = this.isUnder(this.canvas) && this.hoverEffect !== false;
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

		return {
			Viewer,
			CanvasObject,
			ClickableObject,
			Color,
			Rect,
			Arc,
			TextBox,
			CanvasImage
		}
})();
