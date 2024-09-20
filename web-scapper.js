const axios = require("axios");
const cheerio = require("cheerio");

async function scrapeJobData(jobType) {
  try {
    // URL dinamis berdasarkan jobType
    const url = `https://id.jobstreet.com/id/${jobType}-jobs`;

    // Mengambil halaman web
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Mengambil konten dari tag <script> yang berisi window.SEEK_REDUX_DATA
    let scriptContent = "";
    $("script").each((index, element) => {
      const script = $(element).html();
      if (script.includes("window.SEEK_REDUX_DATA")) {
        scriptContent = script;
      }
    });

    // Tambahkan logging untuk debug
    // console.log('Script Content:', scriptContent);

    // Ambil hanya bagian yang mengandung "window.SEEK_REDUX_DATA"
    const startIndex = scriptContent.indexOf("window.SEEK_REDUX_DATA = ");
    if (startIndex !== -1) {
      let jsonString = scriptContent.slice(startIndex + 24); // Panjang "window.SEEK_REDUX_DATA = "
      const endIndex = jsonString.indexOf("};") + 1; // Tambah 1 untuk menutup objek
      jsonString = jsonString.slice(0, endIndex);

      // Tambahkan logging untuk debug
      // console.log('Extracted JSON:', jsonString);

      try {
        const config = JSON.parse(jsonString);

        // Ambil data jobs dari config
        if (
          config &&
          config.results &&
          config.results.results &&
          config.results.results.jobs
        ) {
          return config.results.results.jobs;
        } else {
          return { message: "No jobs found." };
        }
      } catch (parseError) {
        console.error("Failed to parse JSON:", parseError);
        return { message: "Failed to parse SEEK_REDUX_DATA." };
      }
    } else {
      return { message: "SEEK_REDUX_DATA not found." };
    }
  } catch (error) {
    console.error("Error:", error);
    throw new Error("Error scraping data");
  }
}

module.exports = { scrapeJobData };
