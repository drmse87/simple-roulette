/**
 * Roulette wheel for the roulette app.
 *
 * @module RouletteWheel
 * @author drmse87
 * @version 1.0.3
 */

// Generate roulette wheel template.
const roulettewheelTemplate = document.createElement('template')
roulettewheelTemplate.innerHTML = /* html */`
<style>
#wheel-left {
    background-color: darkgreen;
    float: left;
    height: 100%;
    overflow: auto;
    width: 20%;
}

#wheel-hot-numbers-list {
    color: white;
    list-style-type: none;
    margin: 0;
    padding: 0;
}

#wheel-right {
    background-image: linear-gradient(to right, darkgreen, green);
    float: right;
    height: 100%;
    width: 80%;
}

#wheel-spinning {
    height: 70%;
}

#wheel-result {
    border-radius: 5px;
    color: white;
    font-size: 30px;
}

.spinning {
    animation: spin 3s linear infinite;
}

@keyframes spin {
    from {transform:rotate(0deg);}
    to {transform:rotate(360deg);}
}

.headlines {
    color: white;
    font-size: 1.2em;
    margin: 0;
    padding: 0;
    text-shadow: 1px 1px black;
}
</style>

<div id="wheel-left">
        <div id="wheel-hot-numbers">
            <p class="headlines">Hot numbers</p>
            <ul id="wheel-hot-numbers-list"></ul>
        </div>
    </div>

<div id="wheel-right">
        <div id="wheel-spinning"><img src="/roulette/img/wheel.png" id="wheel-pic" draggable="false"></div>
        <p class="headlines">Winning number</p>
        <div id="wheel-result"></div>
</div>`

/**
 *  @class RouletteWheel
 *  @classdesc roulette wheel.
 */
export default class RouletteWheel extends window.HTMLElement {
/**
 * @constructor
 */
  constructor () {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(roulettewheelTemplate.content.cloneNode(true))
    this._wheelLeftCol = this.shadowRoot.querySelector('#wheel-left')
    this._wheelHotNumbersList = this.shadowRoot.querySelector('#wheel-hot-numbers-list')
    this._wheelResult = this.shadowRoot.querySelector('#wheel-result')
    this._wheelPic = this.shadowRoot.querySelector('#wheel-pic')
  }

  /**
   * Adds event listeners for spinning and stopping wheel. But first store reference to host element.
   * Also contains work around for FF (where draggable="false" still generates ghost image).
   */
  connectedCallback () {
    this._rouletteGame = this.getRootNode().host
    this._wheelPic.ondragstart = () => { return false }

    this.addEventListener('startSpinning', this.startSpinning.bind(this))

    this.addEventListener('stopSpinning', this.stopSpinning.bind(this))
  }

  disconnectedCallback () {
    this.removeEventListener('startSpinning', this.startSpinning.bind(this))
    this.removeEventListener('stopSpinning', this.stopSpinning.bind(this))
  }

  /**
    * Starts spinning the wheel.
    * @event RouletteWheel#startSpinning
    * @memberof RouletteWheel
    */
  startSpinning () {
    this._wheelPic.classList.toggle('spinning')
  }

  /**
    * Stops spinning wheel and gets winning number".
    * @event RouletteWheel#stopSpinning
    * @memberof RouletteWheel
    * @fires winningNumber
    * @constant {Element} newHotNumber
    */
  stopSpinning (event) {
    // Stop the spinning animation.
    this._wheelPic.classList.toggle('spinning')

    // Get a random number from array of all numbers (td elements).
    this._allNumbersArray = Array.from(this._rouletteGame.shadowRoot.querySelector('roulette-board').shadowRoot.querySelectorAll('.number'))
    this._winningNumber = this._allNumbersArray[Math.floor(Math.random() * this._allNumbersArray.length)]

    // Lets add the winning number everywhere.
    this._wheelResult.textContent = this._winningNumber.textContent
    if (this._winningNumber.classList.contains('red')) {
      this._wheelResult.style.backgroundColor = 'red'
      this._winningColor = 'red'
    } else if (this._winningNumber.classList.contains('black')) {
      this._wheelResult.style.backgroundColor = 'black'
      this._winningColor = 'black'
    } else if (this._winningNumber.classList.contains('other')) {
      this._wheelResult.style.backgroundColor = 'green'
      this._winningColor = 'green'
    }

    // And to hot numbers list.
    const newHotNumber = document.createElement('li')
    newHotNumber.textContent = this._winningNumber.textContent
    newHotNumber.style.backgroundColor = this._winningColor
    this._wheelHotNumbersList.insertBefore(newHotNumber, this._wheelHotNumbersList.firstElementChild)
    this._wheelLeftCol.scrollTop = 0

    // Dispatch to main roulette module that there was a winning number.
    this._rouletteGame.dispatchEvent(new window.CustomEvent('winningNumber', { detail: this._winningNumber }))
  }
}

window.customElements.define('roulette-wheel', RouletteWheel)
