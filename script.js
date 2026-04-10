const API_KEY = "a042127787e378097217cfba3fdfcd54";

// Show elements
function show(id) {
  document.getElementById(id).classList.remove("hidden");
}

function hide(id) {
  document.getElementById(id).classList.add("hidden");
}

// Fetch weather by city
async function getWeather(cityName) {
  const city = cityName || document.getElementById("cityInput").value;

  if (!city) return;

  show("loading");
  hide("error");
  hide("weatherCard");

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );

    if (!res.ok) throw new Error("City not found");

    const data = await res.json();

    displayWeather(data);

    hide("loading");
    show("weatherCard");

  } catch (err) {
    hide("loading");
    show("error");
    document.getElementById("error").innerText = err.message;
  }
}

// Show weather UI
function displayWeather(data) {
  document.getElementById("city").innerText = data.name;
  document.getElementById("temp").innerText = Math.round(data.main.temp);
  document.getElementById("condition").innerText = data.weather[0].description;
  document.getElementById("humidity").innerText = data.main.humidity;
  document.getElementById("wind").innerText = data.wind.speed;

  const icon = data.weather[0].icon;
  document.getElementById("icon").src =
    `https://openweathermap.org/img/wn/${icon}@2x.png`;
}

// Geolocation weather
function getLocationWeather() {
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(async (position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    show("loading");
    hide("error");
    hide("weatherCard");

    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );

    const data = await res.json();

    displayWeather(data);

    hide("loading");
    show("weatherCard");
  });
}
