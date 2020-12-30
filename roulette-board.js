/**
 * Roulette board for the roulette app.
 *
 * @module RouletteBoard
 * @author drmse87
 * @version 1.0.3
 */

// Generate roulette board template.
const rouletteboardTemplate = document.createElement('template')
rouletteboardTemplate.innerHTML = /* html */`
<style>
#bets-board {
    width: 100%;
    height: 100%;
}

td {
    border: 1px solid white;
    color: white;
}

.other {
    background-image: linear-gradient(to right, green , darkgreen);
    text-shadow: 1px 1px black;
}

.red {
    background-color: red;
    background-image: linear-gradient(to right, red , DarkRed);
}

.black {
    background-color: black;
    background-image: none;
}

.fillercell {
    background-image: linear-gradient(to right, green , darkgreen);
}
</style>

<table id="bets-board" cellspacing="0" cellpadding="0">
<tr>
    <td id="bet-0" class="number other even singlebet" colspan="5">0</td>
</tr>
<tr>
    <td class="other singlebet" id="bet-low" rowspan="2">Low (1-18)</td>
    <td class="other singlebet" id="bet-area1" rowspan="4">1-12</td>
    <td class="number red col1 area1 low odd" id="bet-1">1</td>
    <td class="number black col2 area1 low even" id="bet-2">2</td>
    <td class="number red col3 area1 low odd" id="bet-3">3</td>
</tr>
<tr>
    <td class="number black col1 area1 low even" id="bet-4">4</td>
    <td class="number red col2 area1 low odd" id="bet-5">5</td>
    <td class="number black col3 area1 low even" id="bet-6">6</td>
</tr>
<tr>
    <td class="other singlebet" id="bet-even" rowspan="2">Even</td>
    <td class="number red col1 area1 low odd" id="bet-7">7</td>
    <td class="number black col2 area1 low even" id="bet-8">8</td>
    <td class="number red col3 area1 low odd" id="bet-9">9</td>
</tr>
<tr>
    <td class="number black col1 area1 low even" id="bet-10">10</td>
    <td class="number black col2 area1 low odd" id="bet-11">11</td>
    <td class="number red col3 area1 low even" id="bet-12">12</td>
</tr>
<tr>
    <td class="other red singlebet" id="bet-red" rowspan="2">Red</td>
    <td class="other singlebet" id="bet-area2" rowspan="4">13-24</td>
    <td class="number black col1 area2 low odd" id="bet-13">13</td>
    <td class="number red col2 area2 low even" id="bet-14">14</td>
    <td class="number black col3 area2 low odd" id="bet-15">15</td>
</tr>
<tr>
    <td class="number red col1 area2 low even" id="bet-16">16</td>
    <td class="number black col2 area2 low odd" id="bet-17">17</td>
    <td class="number red col3 area2 low even" id="bet-18">18</td>
</tr>
<tr>
    <td class="other black singlebet" id="bet-black" rowspan="2">Black</td>
    <td class="number red col1 area2 high odd" id="bet-19">19</td>
    <td class="number black col2 area2 high even" id="bet-20">20</td>
    <td class="number red col3 area2 high odd" id="bet-21">21</td>
</tr>
<tr>
    <td class="number black col1 area2 high even" id="bet-22">22</td>
    <td class="number red col2 area2 high odd" id="bet-23">23</td>
    <td class="number black col3 area2 high even" id="bet-24">24</td>
</tr>
<tr>
    <td class="other singlebet" id="bet-odd" rowspan="2">Odd</td>
    <td class="other singlebet" id="bet-area3" rowspan="4">25-36</td>
    <td class="number red col1 area3 high odd" id="bet-25">25</td>
    <td class="number black col2 area3 high even" id="bet-26">26</td>
    <td class="number red col3 area3 high odd" id="bet-27">27</td>
</tr>
<tr>
    <td class="number black col1 area3 high even" id="bet-28">28</td>
    <td class="number black col2 area3 high odd" id="bet-29">29</td>
    <td class="number red col3 area3 high even" id="bet-30">30</td>
</tr>
<tr>
    <td class="other singlebet" id="bet-high" rowspan="2">High (19-36)</td>
    <td class="number black col1 area3 high odd" id="bet-31">31</td>
    <td class="number red col2 area3 high even" id="bet-32">32</td>
    <td class="number black col3 area3 high odd" id="bet-33">33</td>
</tr>
<tr>
    <td class="number red col1 area3 high even" id="bet-34">34</td>
    <td class="number black col2 area3 high odd" id="bet-35">35</td>
    <td class="number red col3 area3 high even" id="bet-36">36</td>
</tr>
<tr>
    <td colspan="2" class="fillercell"></td>
    <td class="other singlebet" id="bet-col1">Col 1</td>
    <td class="other singlebet" id="bet-col2">Col 2</td>
    <td class="other singlebet" id="bet-col3">Col 3</td>
</tr>
</table>`

/**
 *  @class RouletteBoard
 *  @classdesc roulette board.
 */
export default class RouletteBoard extends window.HTMLElement {
/**
 * @constructor
 */
  constructor () {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(rouletteboardTemplate.content.cloneNode(true))
  }
}

window.customElements.define('roulette-board', RouletteBoard)
