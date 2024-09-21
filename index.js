const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");
const userInfoContainer = document.querySelector(".user-info-container");
const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm ]");
const loadingScreen = document.querySelector(".loading-container");

//initially variables needed
let currentTab = userTab;
const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";
currentTab.classList.add("current-tab");
getfromSessionStorage();


function switchTab(clickedTab){
    if(currentTab != clickedTab){
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");

        if(!searchForm.classList.contains("active")){
            //kya search form vala container invisible hai , if yes then make it visible
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        else{
            //me pehle search vale tab tha ab mujhe , ab your weather tab visible karana hai
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            //ab hum your weather vale tab pe hai so hume weather display karana hoga , so let's check local storage 
            //first for coordinates , if have saved them there
            getfromSessionStorage();
        }
    }
}

userTab.addEventListener("click",() => {
    //pass clicked tab as input
    switchTab(userTab);
});

searchTab.addEventListener("click",() => {
    //pass clicked tab as input
    switchTab(searchTab);
});

//it check if coordinates are already present in session storage
// The sessionStorage object let you store key/value pairs in the browser and it stores data for only one session.
//means data is deleted when the browser is closed
function getfromSessionStorage(){
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates){
        //agar local coordinates nahi mile
        grantAccessContainer.classList.add("active");
    }
    else{
        const coordinates = JSON.parse(localCoordinates);   //Use the JavaScript function JSON.parse() to convert json sring into a JavaScript object
        fetchUserWeatherInfo(coordinates);
    }
}

const apiErrorContainer = document.querySelector(".api-error-container");

async function fetchUserWeatherInfo(coordinates){
    const {lat,lon} = coordinates;
    //make grant continer invisible
    grantAccessContainer.classList.remove("active");
    //make loader visible
    loadingScreen.classList.add("active");

    //API call
    try{
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
          );
        const data = await response.json();
        if (!data.sys) {
            throw data;
        }
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        apiErrorContainer.classList.remove("active");
        renderWeatherInfo(data);
    }
    catch(err){
        loadingScreen.classList.remove("active");
        apiErrorContainer.classList.add("active");
    }
}

function renderWeatherInfo(weatherInfo){
    //firstly we have to fetch the elements

    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    //fetch values from weatherInfo object and put it in UI elements
    cityName.innerText = weatherInfo?.name;           // ?. --> optional chaining operator
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.main;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity} %`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all} %`;
}

function getLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition);   //here showPosition is a call back function
    }
    else{
        //show an elert for no geolocation support available
    }
}

function showPosition(position) {
    const userCoordinates = {
      lat: position.coords.latitude,
      lon: position.coords.longitude,
    };
    //here we store the coordinates in session storage , store as user-coordinates
    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}    

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click",getLocation);


// search weather handling ---->

const searchInput = document.querySelector("[data-searchInput");

searchForm.addEventListener("submit",(e) => {
    e.preventDefault();
    let cityName = searchInput.value;

    if(cityName === "") 
        return;
    else
        fetchSearchWeatherInfo(cityName);
        searchInput.value = "";
});

async function fetchSearchWeatherInfo(city){
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();
        if (!data.sys) {
            throw data;
        }
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        apiErrorContainer.classList.remove("active");
        renderWeatherInfo(data);
    }
    catch(err){
        loadingScreen.classList.remove("active");
        apiErrorContainer.classList.add("active");
    }
}