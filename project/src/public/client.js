let store = {
    rovers: '',
    photos: '',
    selectedRover: '',
}

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (store, newState) => {
    store = Object.assign(store, newState)
    render(root, store)
}

const render = async (root, state) => {
    root.innerHTML = App(state)
}

// create content
const App = (state) => {
    let { rovers } = state
    let { photos } = state
    let { selectedRover } = state

    let markup = `
        <header></header>
               
                ${Rovers(rovers)}
                ${selectedRover ? Rover(selectedRover) : ''}
       
        <footer></footer>
    `
    return markup
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)
})


// ------------------------------------------------------  COMPONENTS

const RoverButton = (rover) => {
    return `<button type="button" id="button-${rover}" onclick="loadSelectedRover(${rover})">View Photos</button>`
}

function loadSelectedRover (rover) {
    //let { selectedRover } = state
    //selectedRover => updateStore(store, { rover })
    render(root, store)
}

const Rovers = (rovers) => {
    if (!rovers) {
        getRovers(store)
    }

    let markup = `<div class="rovers">`
    markup += rovers.map(rover => {
        let name = rover.name
        return `
            <div>
                <img src="assets/images/${name.toLowerCase()}.jpg" alt="${name} rover" />
                <h2>${name} Rover</h2>
                <!-- Rover images from: 
                - Curiosity: https://mars.nasa.gov/msl/home/
                - Spirit: https://solarsystem.nasa.gov/missions/spirit/in-depth/
                - Opportunity: https://en.wikipedia.org/wiki/Opportunity_(rover)
                -->
                <p>${getTimeOnMars(rover.landing_date)} days on Mars</p>
                <p>${rover.launch_date}</p>
                <p>${rover.landing_date}</p>
                <p>${rover.status}</p>
                <p>${rover.total_photos.toLocaleString()} photos with the most recent from ${rover.max_date}</p>
                ${RoverButton(name.toLowerCase())}
            </div>
    `
    }).join('')
    markup += `</div>`

    return markup
}

const Rover = (selectedRover) => {

    if (!selectedRover) {
        getRover(store)
    }

    //let { photos } = state

    //console.log(photos[1])

    let carouselIndicators = photos[1].map((photo, index) => {
      return `<li data-target="#carouselExampleIndicators" data-slide-to="${index}" ${index === 0 ? 'class="active"' : ''}></li>`
    }).join('')

    let markup = `
        <div id="carouselExampleIndicators" class="carousel slide" data-ride="carousel" data-interval="false">
          <ol class="carousel-indicators">
        
            ${carouselIndicators}
          </ol>
          <div class="carousel-inner">
          `

    markup += photos[1].map((photo, index) => {
        return `
            <div class="carousel-item ${index === 0 ? 'active' : ''}">
              <img class="d-block w-100" src="${photo.img_src}" alt="First slide">
            </div>
    `
    }).join('')

    markup += `
        </div>
          <a class="carousel-control-prev" href="#carouselExampleIndicators" role="button" data-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="sr-only">Previous</span>
          </a>
          <a class="carousel-control-next" href="#carouselExampleIndicators" role="button" data-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="sr-only">Next</span>
          </a>
        </div>
    `

    return markup
}


// ------------------------------------------------------  API CALLS

// Example API call

const getRovers = (state) => {
    let { rovers } = state

    fetch(`http://localhost:3000/rovers`)
        .then(res => res.json())
        .then(rovers => updateStore(store, { rovers }))

    return rovers.rovers
}

const getRover = (state) => {
    let { selectedRover } = state

    fetch(`http://localhost:3000/rovers/${selectedRover}`)
        .then(res => res.json())
        .then(photos => updateStore(store, {photos}))

    return photos

}


const getTimeOnMars = (landDate) => {
    return Math.round((new Date - Date.parse(landDate)) / 86400000)
}