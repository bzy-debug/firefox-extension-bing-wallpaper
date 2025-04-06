function getUILanguage() {
  return browser.i18n.getUILanguage() || "en-US";
}

function getDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

async function getWallpaper() {
  const today = getDate();
  const cache = localStorage.getItem(today);
  if (cache) {
    return JSON.parse(cache);
  } else {
    try {
      const uiLanguage = getUILanguage();
      const api = `https://bing.biturl.top/?resolution=UHD&format=json&index=0&mkt=${uiLanguage}`;
      const json = await fetch(api, { mode: "cors" }).then((r) => r.json());
      localStorage.setItem(today, JSON.stringify(json));
      localStorage.setItem("last", today);
      return json;
    } catch {
      const last = localStorage.getItem("last");
      console.error("Error fetching wallpaper, using last cached wallpaper.");
      if (last) {
        return JSON.parse(localStorage.getItem(last));
      } else {
        throw new Error("No cached wallpaper available.");
      }
    }
  }
}

// input: George Peabody Library, Baltimore, Maryland (© Wim Wiskerke/Alamy)
// output: { location: "George Peabody Library, Baltimore, Maryland", copyright: "© Wim Wiskerke/Alamy" }
function parseCopyright(copyright) {
  const parts = copyright.split(" (");
  return {
    location: parts[0],
    copyright: parts[1].slice(0, -1),
  };
}

const wallpaper = await getWallpaper();

app.style.backgroundImage = `url(${wallpaper.url})`;

const c = parseCopyright(wallpaper.copyright);

copyright.href = wallpaper.copyright_link;
copyright.innerHTML = `<span class="location">${c.location}</span><br><span>${c.copyright}</span>`;
