async function getWeather() {
  const city = document.getElementById("cityInput").value;
  if (!city) return;

  document.getElementById("loading").classList.remove("hidden");
  document.getElementById("error").classList.add("hidden");
  document.getElementById("weatherCard").classList.add("hidden");

  try {
    // 1. Get latitude/longitude from city
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`);
    const geoData = await geoRes.json();

    if (!geoData.results) throw new Error("City not found");

    const { latitude, longitude, name, country } = geoData.results[0];

    // 2. Get weather (OpenWeather API)
    const API_KEY = "d13b18bc552a46f7b5791716261004";

    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
    );

    const weatherData = await weatherRes.json();

    document.getElementById("city").innerText = `${name}, ${country}`;
    document.getElementById("temp").innerText = Math.round(weatherData.main.temp);
    document.getElementById("condition").innerText = weatherData.weather[0].main;
    document.getElementById("humidity").innerText = weatherData.main.humidity + "%";
    document.getElementById("wind").innerText = weatherData.wind.speed;

    const iconCode = weatherData.weather[0].icon;
    document.getElementById("icon").src =
      `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    document.getElementById("loading").classList.add("hidden");
    document.getElementById("weatherCard").classList.remove("hidden");

  } catch (err) {
    document.getElementById("loading").classList.add("hidden");
    document.getElementById("error").classList.remove("hidden");
    document.getElementById("error").innerText = err.message;
  }
}
