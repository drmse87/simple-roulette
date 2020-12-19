/**
 * Main roulette module.
 *
 * @module Roulette
 * @author drmse87
 * @version 1.0.3
 */

// Generate roulette template.
const rouletteTemplate = document.createElement('template')
rouletteTemplate.innerHTML = /* html */`
<style>
#container {
  text-align: center;
  user-select: none;
  height: 100vh;
  width: 100vw;
}

#bets {
    margin-left: 30%;
    height: 70%;
    width: 70%;
}

#wheel {
    float: left;
    height: 70%;
    width: 30%;
}

#wallet {
    background-color: green;
    border: 3px solid blue;
    width: 100%;
}

#buttons {
  position: absolute;
  width: 30%;
}

#wallet-status {
  background-image: linear-gradient(green, darkgreen);
}

#wallet-currently {
  height: 35px;
}

#wallet-markers {
  background-color: brown;
  border-top: 1px solid white;
  border-bottom: 1px solid white;
  height: 20px;
}

.headlines {
  color: white;
  font-size: 1.3em;
  margin: 0;
  padding: 0;
  text-shadow: 1px 1px black;
}

button {
  background-image: linear-gradient(#0D5D68, #02C1BC);
  border: 2px solid #89C1BC;
  border-radius: 10px;
  color: white;
  margin-left: 25px;
  margin-top: 5px;
  outline: none;
  padding: 5px 5px;
  text-align: center;
  text-decoration: none;
  transition: 0.75s;
}

button:hover {
  border: 2px solid #FED01A;
}

.credits {
  color: white;
}

.credits a {
  color: white;
  text-decoration: none;
}
</style>

<div id="container">
  <div id="wheel">
    <roulette-wheel></roulette-wheel>
  </div>

  <div id="bets">
    <roulette-board></roulette-board>
  </div>

  <div id="wallet">
    <div id="buttons">
      <button id="spin-wheel-button">Spin wheel</button>
      <button id="reset-bets-button">Reset bets</button>
    </div>

    <div id="wallet-status">
        <div id="wallet-currently" class="headlines"></div>
        <div id="wallet-markers" class="headlines"></div>
        <div id="wallet-betting-on" class="headlines"></div>
        <div id="wallet-betting" class="headlines"></div>
        <div id="wallet-win-or-lose" class="headlines"></div>
    </div>
    <p class="credits">App created by <a href="https://drmse87.github.io/">drmse87</a> (<a href="https://github.com/drmse87/drmse87.github.io/tree/master/roulette">source code here</a>). Roulette wheel and marker designed by <a href="https://www.freepik.com/free-vector/european-roulette-set_3948904.htm">macrovector (Freepik.com)</a>.</p>
  </div>
</div>
`

/**
 *  @class Roulette
 *  @classdesc roulette app.
 */
export default class Roulette extends window.HTMLElement {
/**
 * @constructor
 */
  constructor () {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(rouletteTemplate.content.cloneNode(true))
    this._allBets = {}
    this._money = 1000
    this._spinWheelButton = this.shadowRoot.querySelector('#spin-wheel-button')
    this._resetBetsButton = this.shadowRoot.querySelector('#reset-bets-button')
    this._rouletteBoard = this.shadowRoot.querySelector('roulette-board')
    this._rouletteWheel = this.shadowRoot.querySelector('roulette-wheel')
    this._walletBettingOn = this.shadowRoot.querySelector('#wallet-betting-on')
    this._walletBettingTotal = this.shadowRoot.querySelector('#wallet-betting')
    this._walletCurrently = this.shadowRoot.querySelector('#wallet-currently')
    this._walletMarkers = this.shadowRoot.querySelector('#wallet-markers')
    this._walletStatus = this.shadowRoot.querySelector('#wallet-status')
    this._walletWinOrLose = this.shadowRoot.querySelector('#wallet-win-or-lose')
    this._winningOdds = {
      'bet-area1': 3,
      'bet-area2': 3,
      'bet-area3': 3,
      'bet-black': 2,
      'bet-col1': 3,
      'bet-col2': 3,
      'bet-col3': 3,
      'bet-even': 2,
      'bet-high': 2,
      'bet-low': 2,
      'bet-number': 36,
      'bet-odd': 2,
      'bet-red': 2
    }
  }

  /**
   * Adding event listeners.
   */
  connectedCallback () {
    // First of all, fill wallet.
    this.fillWallet()
    this._walletCurrently.textContent = 'You have: ' + this._money

    // Event listeners for spin and reset buttons.
    this._resetBetsButton.addEventListener('click', this.resetBets.bind(this))
    this._spinWheelButton.addEventListener('click', this.spinWheel.bind(this))

    // Detect bets when a marker (in roulette marker component) is moved.
    this.addEventListener('betSummaryUpdate', this.detectBets.bind(this))

    // Get winning number from roulette wheel component.
    this.addEventListener('winningNumber', this.storeWinningNumber.bind(this))
  }

  /**
   * Remove these event listeners when element is removed from DOM.
   */
  disconnectedCallback () {
    this._resetBetsButton.removeEventListener('click', this.resetBets.bind(this))
    this._spinWheelButton.removeEventListener('click', this.spinWheel.bind(this))
    this.removeEventListener('betSummaryUpdate', this.detectBets.bind(this))
    this.removeEventListener('winningNumber', this.storeWinningNumber.bind(this))
  }

  /**
    * Watches the money attribute for changes.
    * @static
    * @readonly
    * @memberof PwdWindow
    */
  static get observedAttributes () {
    return ['money']
  }

  /**
   * Whenever the money attribute changes, do this.
   *
   * @param {any} name of the attribute
   * @param {any} oldValue
   * @param {any} newValue
   * @memberof Roulette
   */
  attributeChangedCallback (name, oldValue, newValue) {
    if (name === 'money') {
      this._money = Number(newValue)
      this.resetBets()
    }
  }

  /**
    * Fills the wallet with roulette markers depending on current money, first removing old.
    * @method Roulette#fillWallet
    * @memberof Roulette
    * @constant {Number} markerCost
    * @constant {Element} newMarker
    */
  fillWallet () {
    this.shadowRoot.querySelectorAll('roulette-marker').forEach(c => {
      c.remove()
    })

    if (this._money > 0) {
      let currentMoney = this._money
      const markerCost = 100

      while (currentMoney > 0) {
        const newMarker = document.createElement('roulette-marker')

        this._walletMarkers.appendChild(newMarker)
        currentMoney -= markerCost
      }
    }
  }

  /**
    * Every time a roulette marker is moved, this method is run.
    * @method Roulette#detectBets
    * @memberof Roulette
    * @constant {Element[]} allPossibleBets
    * @constant {Element[]} allMarkers
    * @constant {Element[]} detectedBetsForCurrentMarker
    * @constant {Object} currentBetProps
    * @constant {Object} currentMarkerProps
    */
  detectBets () {
    // Only detects bets when wheel is not spinning.
    if (this._spinInProgress) { return }

    // First clear out old bets.
    this.restoreBetsBoard()

    // Then go through all markers.
    const allMarkers = this.shadowRoot.querySelectorAll('roulette-marker')
    const allPossibleBets = this._rouletteBoard.shadowRoot.querySelectorAll('td')
    allMarkers.forEach(c => {
      const detectedBetsForCurrentMarker = []

      // Go through all possible bets for current marker.
      allPossibleBets.forEach((b) => {
        const currentBetProps = b.getBoundingClientRect()
        const currentMarkerProps = c.getBoundingClientRect()

        // If marker is overlapping any cells, it is a possible bet.
        if (!((currentMarkerProps.right) < currentBetProps.left ||
            currentMarkerProps.left > currentBetProps.right ||
            currentMarkerProps.bottom < currentBetProps.top ||
            currentMarkerProps.top > currentBetProps.bottom)) {
          detectedBetsForCurrentMarker.push(b)
        }
      })

      // Check if all detected bets are valid.
      detectedBetsForCurrentMarker.forEach((b, i) => {
        // For single bets.
        if (detectedBetsForCurrentMarker[i].classList.contains('singlebet') && detectedBetsForCurrentMarker.length === 1) {
          this._allBets[b.id] ? this._allBets[b.id] += 100 : this._allBets[b.id] = 100
        }

        // For numbers (split bet amount depending on how many numbers).
        if (detectedBetsForCurrentMarker.every(b => b.classList.contains('number')) && !detectedBetsForCurrentMarker[i].classList.contains('singlebet')) {
          this._allBets[b.id] ? this._allBets[b.id] += (100 / detectedBetsForCurrentMarker.length) : this._allBets[b.id] = (100 / detectedBetsForCurrentMarker.length)
        }
      })
    })

    // Change opacity on current bets.
    if (Object.entries(this._allBets).length !== 0) {
      Object.keys(this._allBets).forEach(b => {
        this._rouletteBoard.shadowRoot.getElementById(b).style.opacity = 0.75

        // For area bets.
        Object.keys(this._winningOdds).forEach(ab => {
          if (b === ab && ab !== 'bet-number') {
            this._rouletteBoard.shadowRoot.querySelectorAll('.' + ab.substring(4)).forEach(abc => {
              abc.style.opacity = 0.75
            })
          }
        })
      })

      // Print what we are betting on and how much.
      for (const [b, m] of Object.entries(this._allBets)) {
        this._walletBettingOn.textContent += 'Betting ' + m + ' on ' + b.substring(4).toUpperCase() + '. '
      }
      this._walletBettingTotal.textContent = 'Total bet amount: ' + Object.values(this._allBets).reduce((a, b) => (a + b))
    }
  }

  /**
    * Restores the bets board, emptying old bets and restoring text content.
    * @method Roulette#restoreBetsBoard
    * @memberof Roulette
    */
  restoreBetsBoard () {
    for (const b in this._allBets) {
      if (Object.prototype.hasOwnProperty.call(this._allBets, b)) {
        delete this._allBets[b]
      }
    }

    this._rouletteBoard.shadowRoot.querySelectorAll('td').forEach(b => {
      b.style.opacity = 1
    })

    this._walletCurrently.textContent = 'You have: ' + this._money
    this._walletBettingTotal.textContent = ''
    this._walletBettingOn.textContent = ''
  }

  /**
    * Player has placed bets, now spin the wheel.
    * @event Roulette#spinWheel
    * @memberof Roulette
    * @fires startSpinning
    * @fires stopSpinning
    */
  spinWheel () {
    if (Object.entries(this._allBets).length !== 0 && !this._spinInProgress) {
      // Tell roulette wheel component to start the actual spinning.
      this._rouletteWheel.dispatchEvent(new window.CustomEvent('startSpinning'))

      // Update status: wheel is spinning, empty old win or lose result, restore opacity for all cells.
      this._spinInProgress = true
      this._walletWinOrLose.textContent = ''
      this._rouletteBoard.shadowRoot.querySelectorAll('td').forEach(b => {
        b.style.opacity = 1
      })

      setTimeout(() => {
        // After five seconds stop spinning.
        this._rouletteWheel.dispatchEvent(new window.CustomEvent('stopSpinning'))

        // Lets see if we won by generating winning bets array from winning number classes. Also put the winning number there.
        const winningBets = Array.from(this._winningNumber.classList).map(c => 'bet-' + c)
        const winningNumberAsBet = 'bet-' + this._winningNumber.textContent
        winningBets.splice(winningBets.indexOf('bet-number'), 1, winningNumberAsBet)

        // So were there any winning bets?
        let totalMoneyWon = 0
        let moneyWonForCurrentBet
        winningBets.forEach(b => {
          if (Object.hasOwnProperty.call(this._allBets, b)) {
            if (b === winningNumberAsBet) {
              moneyWonForCurrentBet = this._allBets[winningNumberAsBet] * this._winningOdds['bet-number']
            } else {
              moneyWonForCurrentBet = this._allBets[b] * this._winningOdds[b]
            }

            totalMoneyWon += moneyWonForCurrentBet
            this._walletWinOrLose.textContent += 'Winning bet ' + b.substring(4).toUpperCase() + ' (won ' + (moneyWonForCurrentBet - this._allBets[b]) + '). '
          }
        })

        // Subtract cost of bet from total money won.
        totalMoneyWon -= Object.values(this._allBets).reduce((a, b) => a + b)
        this._money += totalMoneyWon

        // Print how much was won.
        this._walletWinOrLose.textContent += '+/-: ' + totalMoneyWon + '.'
        if (totalMoneyWon > 0) {
          this._walletStatus.style.backgroundImage = 'linear-gradient(green, darkgreen)'
        } else {
          this._walletStatus.style.backgroundImage = 'linear-gradient(red, DarkRed)'
        }

        // If enough money for another round, then go, else game is over.
        if (this._money > 0) {
          this.fillWallet()
        } else {
          this._walletWinOrLose.textContent = 'No more money! Game over! Play again? Click File, settings and choose starting money.'
        }
        // Anyhow restore bets board and status.
        this.restoreBetsBoard()
        this._spinInProgress = false
      }, 3000)
    } else {
      // If no bets were placed.
      if (this._spinInProgress) {
        this._walletWinOrLose.textContent = 'Wait for current round to finish.'
      } else {
        this._walletWinOrLose.textContent = 'Place your bets.'
      }
    }
  }

  /**
    * Gets winning number from wheel component.
    * @event Roulette#storeWinningNumber
    * @memberof Roulette
    */
  storeWinningNumber (event) {
    this._winningNumber = event.detail
  }

  /**
    * When clicking reset button, board is reset and wallet filled, only allowed when wheel is not spinning.
    * @event Roulette#resetBets
    * @memberof Roulette
    */
  resetBets () {
    if (this._spinInProgress) { return }

    this.restoreBetsBoard()
    this.fillWallet()

    this._walletCurrently.textContent = 'You have: ' + this._money
    this._walletWinOrLose.textContent = ''
  }
}

window.customElements.define('roulette-app', Roulette)
