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

    // 2. Get weather
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
    );

    const weatherData = await weatherRes.json();
    const w = weatherData.current_weather;

    document.getElementById("city").innerText = `${name}, ${country}`;
    document.getElementById("temp").innerText = Math.round(w.temperature);
    document.getElementById("condition").innerText = "Weather updated";
    document.getElementById("humidity").innerText = "N/A";
    document.getElementById("wind").innerText = w.windspeed;

    document.getElementById("icon").src =
      "https://openweathermap.org/img/wn/01d@2x.png";

    document.getElementById("loading").classList.add("hidden");
    document.getElementById("weatherCard").classList.remove("hidden");

  } catch (err) {
    document.getElementById("loading").classList.add("hidden");
    document.getElementById("error").classList.remove("hidden");
    document.getElementById("error").innerText = err.message;
  }
}
