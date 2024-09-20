const express = require("express");
const path = require("path");
const ExcelJS = require("exceljs");
const moment = require("moment");
const { Op } = require("sequelize");
const cors = require("cors");
const sequelize = require("./database");
const Jobs = require("./models/Jobs");
const { scrapeJobData } = require("./web-scapper");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require(path.join(
  __dirname,
  "api-docs",
  "swagger.json"
));

const app = express();
const PORT = 3000;
app.use(express.json());

// Sync dengan database
sequelize.sync().then(() => {
  console.log("Database synchronized");
});

// Atur CORS untuk mengizinkan localhost:5173
app.use(
  cors({
    origin: "http://localhost:5173", // Ganti dengan port React (Vite)
  })
);

// Swagger UI setup
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Endpoint untuk mengekspor data ke Excel

app.get("/export-excel", async (req, res) => {
  try {
    // Ambil data dari database
    const jobs = await Jobs.findAll({ order: [["id", "ASC"]] });

    // Buat workbook dan worksheet baru
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Jobs Data");

    // Tambahkan header pada file Excel
    worksheet.columns = [
      { header: "No", key: "no", width: 10 },
      // { header: 'ID', key: 'id', width: 10 },
      { header: "Tag", key: "tag", width: 20 },
      { header: "Company Name", key: "company_name", width: 30 },
      { header: "Job Location", key: "job_location", width: 20 },
      { header: "Title", key: "title", width: 30 },
      { header: "Classification", key: "classification", width: 25 },
      { header: "Subclassification", key: "subclassification", width: 25 },
      { header: "Salary", key: "salary", width: 15 },
      { header: "Work Type", key: "work_type", width: 15 },
      { header: "Teaser", key: "teaser", width: 40 },
      { header: "Work Arrangements", key: "work_arrangements", width: 30 },
      { header: "Other Info", key: "other_info", width: 40 },
      {
        header: "Date",
        key: "date",
        width: 20,
        style: { numFmt: "yyyy-mm-dd hh:mm:ss" },
      },
    ];

    // Set header row to bold
    worksheet.getRow(1).font = { bold: true };
    // Tambahkan data dari database ke worksheet
    jobs.forEach((job, index) => {
      worksheet.addRow({
        no: index + 1,
        // id: job.id,
        tag: job.tag,
        company_name: job.company_name,
        job_location: job.job_location,
        title: job.title,
        classification: job.classification,
        subclassification: job.subclassification,
        salary: job.salary,
        work_type: job.work_type,
        teaser: job.teaser,
        work_arrangements: job.work_arrangements,
        other_info: job.other_info,
        date: job.date,
      });
    });

    // Set the response header for Excel download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=jobs-data.xlsx");

    // Tulis file ke response
    await workbook.xlsx.write(res);
    res.status(200).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Read (GET)
// app.get("/", async (req, res) => {
//   try {
//     const jobs = await Jobs.findAll();
//     res.json(jobs);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// Read with keyword search (GET)
app.get("/search", async (req, res) => {
  const { keyword } = req.query; // Ambil keyword dari query parameter

  try {
    let jobs;
    res.set("Cache-Control", "no-store"); // Nonaktifkan cache untuk memastikan selalu return 200
    // Lanjutkan proses untuk mengembalikan data
    if (keyword === "All") {
      jobs = await Jobs.findAll({
        order: [["id", "ASC"]], // Urutkan hasil berdasarkan ID
      });
    } else {
      const keywordsArray = keyword.split(" "); // Pisahkan keyword berdasarkan spasi
      jobs = await Jobs.findAll({
        where: {
          [Op.and]: keywordsArray.map((kw) => ({
            tag: { [Op.like]: `%${kw}%` },
          })),
        },
        order: [["id", "ASC"]],
      });
    }

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Read by id (GET)
app.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const jobs = await Jobs.findByPk(id);
    if (jobs != null) {
      res.json(jobs);
    } else {
      res.status(404).send("Job not found");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete (DELETE)
app.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Jobs.findByPk(id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    await job.destroy();
    res.status(200).json({ message: "Job deleted successfully", job });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create (POST)
app.post("/", async (req, res) => {
  // Validasi data yang diperlukan
  if (
    !req.body.tag ||
    !req.body.company_name ||
    !req.body.job_location ||
    !req.body.title ||
    !req.body.date
  ) {
    return res.status(400).json({ error: "Required fields missing" });
  }

  try {
    const job = await Jobs.create({
      tag: req.body.tag,
      company_name: req.body.company_name,
      job_location: req.body.job_location,
      title: req.body.title,
      classification: req.body.classification,
      subclassification: req.body.subclassification,
      salary: req.body.salary,
      work_type: req.body.work_type,
      teaser: req.body.teaser,
      work_arrangements: req.body.work_arrangements,
      other_info: req.body.other_info,
      date: moment(req.body.date).format("YYYY-MM-DD HH:mm:ss"),
    });
    res.status(201).json({ message: "Job created successfully", job });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update (PUT)
app.put("/:id", async (req, res) => {
  const jobId = req.params.id;

  // Validasi data yang diperlukan
  if (
    !req.body.tag ||
    !req.body.company_name ||
    !req.body.job_location ||
    !req.body.title ||
    !req.body.date
  ) {
    return res.status(400).json({ error: "Required fields missing" });
  }

  try {
    const job = await Jobs.findByPk(jobId);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    await job.update({
      tag: req.body.tag,
      company_name: req.body.company_name,
      job_location: req.body.job_location,
      title: req.body.title,
      classification: req.body.classification,
      subclassification: req.body.subclassification,
      salary: req.body.salary,
      work_type: req.body.work_type,
      teaser: req.body.teaser,
      work_arrangements: req.body.work_arrangements,
      other_info: req.body.other_info,
      date: req.body.date,
    });

    res.status(200).json({ message: "Job updated successfully", job });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/scrape-filter-data/:tag", async (req, res) => {
  const tag = req.params.tag;

  try {
    const jobs = await scrapeJobData(tag);
    const filteredData = jobs.map((job) => {
      // const filteredData = jobDataArray.map(job => {
      const {
        bulletPoints,
        classification: { description: classificationDescription },
        advertiser: { description: advertiserDescription },
        company_name,
        location,
        jobLocation: { label: jobLocationLabel },
        listingDate,
        salary,
        subClassification: { description: subClassificationDescription },
        workType,
        workArrangements: { data: workArrangementsData },
        title,
        teaser,
      } = job;

      const workArrangementsLabels = workArrangementsData
        ? workArrangementsData.map((item) => item.label.text)
        : [];

      return {
        bulletPoints,
        classificationDescription,
        advertiserDescription,
        company_name,
        location,
        jobLocationLabel,
        listingDate,
        salary,
        subClassificationDescription,
        workType,
        workArrangementsLabels,
        title,
        teaser,
        tag: tag,
      };
    });

    // Simpan setiap job yang telah difilter ke dalam database
    for (const job of filteredData) {
      await Jobs.create({
        tag: job.tag,
        company_name: job.advertiserDescription
          ? job.advertiserDescription
          : job.company_name,
        job_location: job.jobLocationLabel,
        title: job.title,
        classification: job.classificationDescription,
        subclassification: job.subClassificationDescription,
        salary: job.salary,
        work_type: job.workType,
        teaser: job.teaser,
        work_arrangements: job.workArrangementsLabels.join(", "),
        other_info: job.bulletPoints.join(", "),
        date: moment(job.listingDate).format("YYYY-MM-DD HH:mm:ss"),
      });
    }

    res.status(200).json(filteredData);
  } catch (error) {
    console.error("Error:", error.message); // Tampilkan pesan error
    res
      .status(500)
      .json({ error: "Error scraping or saving data", detail: error.message });
  }
});
// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});

module.exports = app;
