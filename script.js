async function getWeather() {
  const city = document.getElementById("cityInput").value;
  if (!city) return;

  document.getElementById("loading").classList.remove("hidden");
  document.getElementById("error").classList.add("hidden");
  document.getElementById("weatherCard").classList.add("hidden");

  try {
    // 1. Get latitude & longitude (Open-Meteo geocoding)
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`
    );
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error("City not found");
    }

    const { latitude, longitude, name, country } = geoData.results[0];

    // 2. Get weather data (Open-Meteo)
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
    );
    const weatherData = await weatherRes.json();

    const w = weatherData.current_weather;

    document.getElementById("city").innerText = `${name}, ${country}`;
    document.getElementById("temp").innerText = Math.round(w.temperature);
    document.getElementById("wind").innerText = w.windspeed + " km/h";

    // Open-Meteo has no icons → simple mapping
    let condition = "Clear";
    if (w.weathercode >= 45) condition = "Cloudy";
    if (w.weathercode >= 51) condition = "Rainy";
    if (w.weathercode >= 71) condition = "Snow";
    if (w.weathercode >= 95) condition = "Storm";

    document.getElementById("condition").innerText = condition;
    document.getElementById("humidity").innerText = "N/A";

    document.getElementById("icon").src =
      "https://cdn-icons-png.flaticon.com/512/1163/1163661.png";

    document.getElementById("loading").classList.add("hidden");
    document.getElementById("weatherCard").classList.remove("hidden");

  } catch (err) {
    document.getElementById("loading").classList.add("hidden");
    document.getElementById("error").classList.remove("hidden");
    document.getElementById("error").innerText = err.message;
  }
}
