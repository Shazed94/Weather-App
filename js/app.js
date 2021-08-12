// Selectors
const searchInput = document.querySelector('.weather__search')
const city = document.querySelector('.weather__city')
const timeEl = document.getElementById('time');
const day = document.querySelector('.weather__day')
const humidity = document.querySelector('.weather__indicator--humidity>.value')
const wind = document.querySelector('.weather__indicator--wind>.value')
const pressure = document.querySelector('.weather__indicator--pressure>.value')
const sunrise = document.querySelector('.weather__indicator--sunrise>.value')
const sunset = document.querySelector('.weather__indicator--sunset>.value')
const image = document.querySelector('.weather__image')
const temp = document.querySelector('.weather__temperature>.value')
const forecastBlock = document.querySelector('.weather__forecast')
const suggestion = document.querySelector('#suggestions')

// Image Icpns Data  
const weatherImages = [
    {
        url: './images/clear-sky.png',
        ids: [800],
    },
    {
        url: './images/broken-clouds.png',
        ids: [803, 804],

    },
    {
        url: './images/few-clouds.png',
        ids: [801],

    },
    {
        url: './images/mist.png',
        ids: [701, 711, 721, 731, 741, 751, 761, 771, 781],

    },
    {
        url: './images/rain.png',
        ids: [501, 502, 503, 504],

    },
    {
        url: './images/scattered-clouds.png',
        ids: [802],

    },
    {
        url: './images/shower-rain.png',
        ids: [520, 521, 522, 531, 300, 301, 302, 310, 311, 312, 313, 314, 321],

    },
    {
        url: './images/snow.png',
        ids: [600, 601, 602, 611, 612, 613, 615, 616, 620, 621, 622],
    },
    {
        url: './images/thunderstorm.png',
        ids: [200, 201, 202, 210, 211, 212, 221, 230, 231, 232],
    },
]

//  Time 
// setInterval(() => {
//     var time = new Date();
//     var hour = time.getHours();
//     var minutes = time.getMinutes();
//     var TwentyFourHour = time.getHours();
//     var sec = time.getSeconds();
//     var mid = 'PM';
//     if (minutes < 10) {
//         minutes = "0" + minutes;
//     }
//     if (hour > 12) {
//         hour = hour - 12;
//     }
//     if (hour == 0) {
//         hour = 12;
//     }
//     if (TwentyFourHour < 12) {
//         mid = 'AM';
//     }
//     if (sec < 10) {
//         sec = "0" + sec;
//     }
//     timeEl.innerHTML = (hour + ':' + minutes + ':' + sec) + ' ' + `<span id="am-pm">${mid}</span>`

// }, 1000);


// API End Point
const weatherAPIKey = 'b993b611773bfd6583028a32f97bd319';
const weatherBaseEndPoint = `https://api.openweathermap.org/data/2.5/weather?units=metric&appid=${weatherAPIKey}`
const forecastBaseEndPoint = `https://api.openweathermap.org/data/2.5/forecast?units=metric&appid=${weatherAPIKey}`
const cityBaseEndPoint = `https://api.teleport.org/api/cities/?search=`
const timeZoneByCityEndPoint = `http://api.timezonedb.com/v2.1/get-time-zone?key=S5PNDK5JW6O2&format=json&by=position`

// Data fetch from server

// Get time zone from city
// const getTime = async () => {
//     const endPoint = `${timeZoneByCityEndPoint}`
//     const result = await fetch(endPoint)
//     // const time = result.json()

// }
// getTime()

//  Get weather data from city name
const getWeatherDataByCity = async (cityString) => {
    let city
    if (cityString.includes(',')) {
        city = cityString.slice(0, cityString.indexOf(',')) + cityString.slice(cityString.lastIndexOf(","))
    } else {
        city = cityString;
    }
    const endPoint = `${weatherBaseEndPoint}&q=${city}`
    let request = await fetch(endPoint)
    if (request.status !== 200) {
        alert('Invalid city request')
        searchInput.value = '';
        return
    }
    let data = await request.json()
    console.log(data);
    return data
}

// Get forecast by City Id
const getForecastByCityId = async (id) => {
    const endPoint = `${forecastBaseEndPoint}&id=${id}`
    const result = await fetch(endPoint)
    const forecast = await result.json()
    const forecastList = forecast.list
    // console.log(forecastList);
    const dailyTemp = [];
    forecastList.forEach((day) => {
        let date = new Date(day.dt_txt.replace(' ', 'T'))
        let hours = date.getHours()
        if (hours === 12) {
            dailyTemp.push(day)
        }
    })
    updateForecast(dailyTemp)
}

const weatherForCity = async (city) => {
    let data = await getWeatherDataByCity(city)
    let cityId = data.id
    console.log(cityId);
    updateCurrentWeather(data)
    getForecastByCityId(cityId)
}

const init = () => {
    weatherForCity('dhaka')
    // document.body.style.filter = 'blur(0)'
}

init()

//  Search Funtionality 
searchInput.addEventListener('keydown', async (e) => {
    const cityName = searchInput.value;
    if (e.keyCode === 13) {
        weatherForCity(cityName)
        searchInput.value = ''
    }
})

// City Suggestions Funtionality
searchInput.addEventListener('input', async () => {
    const endPoint = cityBaseEndPoint + searchInput.value
    const request = await fetch(endPoint)
    const result = await request.json()
    const cityList = result._embedded['city:search-results']
    suggestion.innerHTML = ''
    const length = cityList.length > 7 ? 7 : cityList.length
    for (let i = 0; i < length; i++) {
        const option = document.createElement('option')
        option.value = cityList[i].matching_full_name
        suggestion.appendChild(option)
    }
})


// Render Funtionality
// Updating the current weather value 
const updateCurrentWeather = (data) => {
    console.log(data);
    city.textContent = `${data.name}, ${data.sys.country}`
    day.textContent = dayOfWeek();
    humidity.textContent = data.main.humidity;
    wind.textContent = `${calculateWindDirection(data.wind.deg)}, ${data.wind.speed}`
    pressure.textContent = data.main.pressure;
    temp.textContent = data.main.temp >= 0 ? `${Math.round(data.main.temp)}` : `-${Math.round(data.main.temp)}`
    let sunriseTime = new Date((data.sys.sunrise) * 1000)
    let sunsetTime = new Date((data.sys.sunset) * 1000)
    let sunriseHours = sunriseTime.getHours().toString()
    let sunriseMinutes = sunriseTime.getMinutes().toString()
    let sunsetHours = sunsetTime.getHours().toString()
    let sunsetMinutes = sunsetTime.getMinutes().toString()
    if (sunriseHours > 12) {
        sunriseHours = sunriseHours - 12;
    }
    if (sunsetHours > 12) {
        sunsetHours = sunsetHours - 12;
    }
    sunrise.textContent = `Sunrise: ${sunriseHours}:${sunriseMinutes}`
    sunset.textContent = `Sunset: ${sunsetHours}:${sunsetMinutes}`
    const imageId = data.weather[0].id
    weatherImages.forEach(obj => {
        if (obj.ids.includes(imageId)) {
            image.src = obj.url
        }
    })
}

// Updating the five-day forecast
const updateForecast = async (data) => {
    console.log(data);
    forecastBlock.innerHTML = ''
    data.forEach((day) => {
        let iconUrl = `http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`
        // console.log(day);
        let dayName = dayOfWeek(day.dt * 1000)
        let temp = day.main.temp >= 0 ? `${Math.round(day.main.temp)}` : `-${Math.round(day.main.temp)}`
        let forecastElem = `
                <article class="weather__forecast__item">
                    <img
                        src="${iconUrl}"
                        alt="${day.weather[0].description}"
                        class="weather__forecast__icon"
                    />
                    <h3 class="weather__forecast__day">${dayName}</h3>
                    <p class="weather__forecast__temperature">
                        <span class="value">${temp}</span> &deg;C<br>
                      
                    </p>
                </article>`;
        forecastBlock.insertAdjacentHTML('beforeend', forecastElem);
    })
}

//  Calculating day of week
const dayOfWeek = (dt = new Date().getTime()) => {

    return new Date(dt).toLocaleDateString('en-EN', { weekday: 'long' })
}

// Calculating wind direction 
const calculateWindDirection = (degree) => {
    if (degree > 45 && degree <= 135) {
        return "East"
    } else if (degree > 135 && degree <= 225) {
        return "South"
    } else if (degree > 225 && degree <= 315) {
        return "West"
    } else {
        return "North"
    }
}