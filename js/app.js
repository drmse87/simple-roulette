/**
 * Importing the Roulette app.
 *
 * @author drmse87
 * @version 1.0.3
 * @requires module:Roulette
 * @requires module:RouletteBoard
 * @requires module:RouletteMarker
 * @requires module:RouletteWheel
 *
 */

import './roulette.js'
import './roulette-board.js'
import './roulette-marker.js'
import './roulette-wheel.js'

window.addEventListener('load', event => {
  document.querySelector('#loader').style.display = 'none'
})
