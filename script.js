document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("searchBtn");
  const input = document.getElementById("searchInput");
  const resultDiv = document.getElementById("movieResult");

  btn.addEventListener("click", searchMovie);
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") searchMovie();
  });

  async function searchMovie() {
    const movieName = input.value.trim();

    if (!movieName) {
      resultDiv.innerHTML = "❌ Please enter a name";
      return;
    }

    resultDiv.innerHTML = "⏳ Searching...";

    try {
      const res = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(movieName)}`);
      const data = await res.json();

      if (data.length === 0) {
        resultDiv.innerHTML = "❌ No result found";
        return;
      }

      const show = data[0].show;

      resultDiv.innerHTML = `
        <h2>${show.name}</h2>
        <img src="${show.image ? show.image.medium : ''}">
        <p><b>Language:</b> ${show.language}</p>
        <p><b>Genres:</b> ${show.genres.join(", ")}</p>
        <p><b>Rating:</b> ${show.rating.average || "N/A"}</p>
        <p>${show.summary || "No summary available"}</p>
      `;
    } catch (err) {
      resultDiv.innerHTML = "⚠️ Error fetching data";
    }
  }
});
