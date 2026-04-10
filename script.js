document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("searchBtn");
  const input = document.getElementById("searchInput");
  const resultDiv = document.getElementById("movieResult");

  btn.addEventListener("click", searchMovie);
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") searchMovie();
  });

  async function searchMovie() {
    const query = input.value.trim();

    if (!query) {
      resultDiv.innerHTML = "❌ Type something";
      return;
    }

    resultDiv.innerHTML = "⏳ Loading...";

    try {
      const res = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (data.length === 0) {
        resultDiv.innerHTML = "❌ No result found";
        return;
      }

      resultDiv.innerHTML = data.map(item => {
        const show = item.show;
        return `
          <div class="card">
            <img src="${show.image ? show.image.medium : ''}">
            <h3>${show.name}</h3>
          </div>
        `;
      }).join("");

    } catch (err) {
      resultDiv.innerHTML = "⚠️ Error";
    }
  }
});
