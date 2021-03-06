let store = {
    rovers: [],
    photos: '',
    selectedRover: '',
}

// Add our markup to the page
const root = document.getElementById('root')

const updateStore = (store, newState) => {
    store = Object.assign(store, newState)
    render(root, store)
}

const render = async (root, state) => {
    root.innerHTML = App(state)
}

// Starting point
const App = (state) => {

    let { rovers } = state
    let { selectedRover } = state

    let markup = `
        <header></header>
                <h1>Mars Rovers</h1>
                ${appendNasaAttribute(Rovers)(rovers)}
                <div id="selected-rover">
                    ${selectedRover ? appendNasaAttribute(Rover)(selectedRover) : ''}
                </div>
       
        <footer></footer>
    `
    return markup
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)
})

// ------------------------------------------------------  COMPONENTS

// Displays the data for the Spirit, Curiosity, and Opportunity rovers.
const Rovers = (rovers) => {
    if (rovers.length == 0) {
        rovers = getRovers(store)
    }

    let markup = `<div class="rovers">`
    markup += rovers.map(rover => {
        let name = rover.get('name')
        return `
            <div>
                <img src="assets/images/${name.toLowerCase()}.jpg" alt="${name} rover" />
                <h2>${name} Rover</h2>
                <!-- Rover images from: 
                - Curiosity: https://mars.nasa.gov/msl/home/
                - Spirit: https://solarsystem.nasa.gov/missions/spirit/in-depth/
                - Opportunity: https://en.wikipedia.org/wiki/Opportunity_(rover)
                -->
                <p>${getTimeOnMars(rover.get('landing_date'))} days on Mars</p>
                <p><span class="label">Status:</span> ${rover.get('status')}</p>
                <p><span class="label">Launch date:</span> ${rover.get('launch_date')}</p>
                <p><span class="label">Land date:</span> ${rover.get('landing_date')}</p>
                
                <p>${rover.get('total_photos').toLocaleString()} photos with the most recent from ${rover.get('max_date')}</p>
                ${withLog(RoverButton)(name.toLowerCase())}
            </div>
    `
    }).join('')
    markup += `</div>`

    return markup
}

// Displays the images for the selected rover in a bootstrap slideshow.
const Rover = (selectedRover) => {

    // Photos is in the form of:
    // photos[0] is the name of the rover.
    // photos[1] contains the images for the rover.
    let { photos } = store

    if ((selectedRover && !photos) || photos.get(0) !== selectedRover) {
        getRover(store)
    }

    if (selectedRover && !photos) {
        return `<h3>No photos available</h3>`
    }

    let carouselIndicators = photos.get(1).map((photo, index) => {
        return `<li data-target="#carouselIndicators" data-slide-to="${index}" ${index === 0 ? 'class="active"' : ''}></li>`
    }).join('')

    let markup = `
        <h3>${photos.get(0)} Rover Images</h3>
        <div id="carouselIndicators" class="carousel slide" data-ride="carousel" data-interval="false">
          <ol class="carousel-indicators">
            ${carouselIndicators}
          </ol>
          <div class="carousel-inner">
          `

    markup += photos.get(1).map((photo, index) => {
        return `
            <div class="carousel-item ${index === 0 ? 'active' : ''}">
              <img class="d-block w-100" src="${photo.get('img_src')}" alt="First slide">
            </div>
    `
    }).join('')

    markup += `
        </div>
          <a class="carousel-control-prev" href="#carouselIndicators" role="button" data-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="sr-only">Previous</span>
          </a>
          <a class="carousel-control-next" href="#carouselIndicators" role="button" data-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="sr-only">Next</span>
          </a>
        </div>
    `

    return markup
}

// Button for choosing the rover.
const RoverButton = (rover) => {
    return `<button type="button" class="button-${rover}" onclick="loadSelectedRover('${rover}')">View Photos</button>`
}

// Contrived HOF for logging the addition of UI components.
const withLog = (fn) => {
    return (...args) => {
        console.log(`Adding button for ${args[0]}`)
        return fn(...args)
    }
}

// Contrived HOF for appending attribution to components.
const appendNasaAttribute = (fn) => {
    return (...args) => {
        return fn(...args) + '<p class="attribute">Brought to you by NASA APIs.</p>'
    }
}

function loadSelectedRover (rover) {
    updateStore(store, { selectedRover: rover })
}


// ------------------------------------------------------  API CALLS

// Gets info for all 3 rovers.
const getRovers = (state) => {
    let { rovers } = state

    fetch(`http://localhost:3000/rovers`)
        .then(res => res.json())
        .then(rovers => {
            let rovers_objects = rovers.map(rover => {
                return Immutable.Map({
                    landing_date: rover.landing_date,
                    launch_date: rover.launch_date,
                    name: rover.name,
                    status: rover.status,
                    total_photos: rover.total_photos,
                    max_date: rover.max_date
                })
            })

            let rovers_list = Immutable.List(rovers_objects)
            updateStore(store, { rovers: rovers_list })
        })
}

// Gets images for selected rover.
const getRover = (state) => {
    let { selectedRover } = state
    let { photos } = state

    fetch(`http://localhost:3000/rovers/${selectedRover}`)
        .then(res => res.json())
        .then(photos => {
            let photos_objects = photos[1].map(photo => {
                return Immutable.Map({
                    img_src: photo.img_src
                })
            })
            updateStore(store, { photos: Immutable.List([selectedRover, photos_objects]) })
        })
}

// Utility function for calculating how lon the rover is/was on Mars.
const getTimeOnMars = (landDate) => {
    return Math.round((new Date - Date.parse(landDate)) / 86400000)
}