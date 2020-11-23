const SVG_NS = "http://www.w3.org/2000/svg";

class DialMeter extends HTMLElement {
  constructor() {
    super();

    // parameters
    this.value = 0;
    this.radius = 45;
    this.strokeWidth = 10;
    this._center = [50, 50];

    // init shadow DOM
    const shadow = this.attachShadow({mode: 'open'});

    // create and attach STYLE element to shadow DOM
    const style = document.createElement('style');
    style.textContent = `:host { display: block; }`;
    shadow.appendChild(style);
    
    // create and attach DIV element to shadow DOM
    const div = document.createElement('div');
    shadow.appendChild(div);

    // create and attach SVG element
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0, 0, 100, 100");
    div.appendChild(svg);

    // create and attach SVG sub-elements
    this._bgArc = document.createElementNS(SVG_NS, "path");
    this._bgArc.setAttribute("stroke", "gray");
    this._bgArc.setAttribute("fill", "transparent");

    this._fgArc = document.createElementNS(SVG_NS, "path");
    this._fgArc.setAttribute("stroke", "blue");
    this._fgArc.setAttribute("fill", "transparent");
    svg.appendChild(this._bgArc);
    svg.appendChild(this._fgArc);
  }

  static get observedAttributes() {
    return ['value', 'class', 'style'];
  }

  updateStyles() {

    const styles = window.getComputedStyle(this);

    if (styles.getPropertyValue('--stroke-width')) {
      this.strokeWidth = styles.getPropertyValue('--stroke-width');
      this._bgArc.setAttribute("stroke-width", this.strokeWidth);
      this._fgArc.setAttribute("stroke-width", this.strokeWidth);
    }

    if (styles.getPropertyValue('--radius')) {
      const rad = styles.getPropertyValue('--radius');
      if (Number.isNaN(Number.parseInt(rad))) {
        console.log("dial-meter: invalid value of style '--radius'");
      } else {
        this.radius = rad;
      }
    }
    if (styles.getPropertyValue('color')) {
      this._fgArc.setAttribute("stroke",
                               styles.getPropertyValue('color'));
    }
    if (styles.getPropertyValue('--inactive-color')) {
      this._bgArc.setAttribute("stroke",
                               styles.getPropertyValue('--inactive-color'));
    }

  }

  draw() {
    // get and reqularize styles
    this.updateStyles();

    // get and regularize "value" attribute
    const val = Number.parseInt(this.getAttribute('value'));
    if (Number.isNaN(val)) {
      console.log("dial-meter: invalid value of attribute 'value'");
      this.value = 0;
    }
    else if (val > 100) {
      this.value = 100;
    } else if (val < 0) {
      this.value = 0;
    } else {
      this.value = val;
    }
    const deg = (240.0 - 3.0 * this.value);
    this._drawArc(240, -60, this._bgArc);
    this._drawArc(240, deg, this._fgArc);
  }

  connectedCallback() {
    this.draw();
  }

  attributeChangedCallback() {
    this.draw();
  }

  adoptedCallback() {
    this.draw();
  }

  _drawArc(startDeg, endDeg, target) {
    const begin = this._degreeToPosition(startDeg, this._center[0],
                                         this._center[1], this.radius);
    const end = this._degreeToPosition(endDeg, this._center[0],
                                       this._center[1], this.radius);
    const isLarge = (endDeg > 60) ? 0 : 1;
    const d = `M ${begin[0]} ${begin[1]} A ${this.radius} ${this.radius} 0 ${isLarge} 1 ${end[0]} ${end[1]}`;
    target.setAttribute("d", d);
  }

  _degreeToPosition(degree, cx, cy, radius) {
    const rad = degree * Math.PI / 180.0;
    const x = cx + radius * Math.cos(rad);
    const y = cy - radius * Math.sin(rad);
    return [x, y];
  }

}

customElements.define("dial-meter", DialMeter);

