/**
 * Roulette marker for the roulette app.
 *
 * @module RouletteMarker
 * @author drmse87
 * @version 1.0.3
 */

// Generate roulette marker template.
const markerTemplate = document.createElement('template')
markerTemplate.innerHTML = /* html */`
<style>
:host {
    position: absolute;
}

#marker {
    display: block;
}
</style>

<img src="/roulette/img/marker.png" id="marker" draggable="false">
`

/**
 *  @class RouletteMarker
 *  @classdesc roulette marker.
 */
export default class RouletteMarker extends window.HTMLElement {
/**
 * @constructor
 */
  constructor () {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(markerTemplate.content.cloneNode(true))
    this._markerPic = this.shadowRoot.querySelector('#marker')
  }

  /**
   * Adds event listeners for when marker is moved and released, also contains workaround for FF (where draggable="false" still generates ghost image).
   */
  connectedCallback () {
    this.addEventListener('mousedown', this.moveMarker.bind(this))
    this.ondragstart = () => { return false }
    this.addEventListener('mouseup', this.refreshBets)
  }

  /**
   * Removes the same event listeners if element is removed from DOM.
   */
  disconnectedCallback () {
    this.removeEventListener('mousedown', this.moveMarker.bind(this))
    this.removeEventListener('mouseup', this.refreshBets)
  }

  /**
    * Moves the roulette marker.
    * @event RouletteMarker#moveMarker
    * @memberof RouletteMarker
    * @constant {Element} rouletteApp
    * @constant {Object} markerProps
    * @constant {Number} mouseposWindowDifferenceX
    * @constant {Number} mouseposWindowDifferenceY
    */
  moveMarker (event) {
    const rouletteApp = this.getRootNode().host
    const markerProps = this.getBoundingClientRect()
    const mouseposWindowDifferenceX = event.clientX - markerProps.x
    const mouseposWindowDifferenceY = event.clientY - markerProps.y

    /**
    * Does the actual moving.
    * @function moveTo
    * @inner
    */
    const moveTo = (event) => {
      this.style.left = event.clientX - mouseposWindowDifferenceX + 'px'
      this.style.top = event.clientY - mouseposWindowDifferenceY + 'px'
    }

    rouletteApp.addEventListener('mousemove', moveTo)
    rouletteApp.addEventListener('mouseup', event => {
      rouletteApp.removeEventListener('mousemove', moveTo)
    })
  }

  /**
    * Notifies Roulette main module that marker has been released and bets should be detected.
    * @event RouletteMarker#refreshBets
    * @memberof RouletteMarker
    * @fires betSummaryUpdate
    */
  refreshBets () {
    this.getRootNode().host.dispatchEvent(new window.CustomEvent('betSummaryUpdate'))
  }
}

window.customElements.define('roulette-marker', RouletteMarker)
