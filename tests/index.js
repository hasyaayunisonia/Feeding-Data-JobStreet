const express = require("express");
const app = require("../server"); // Adjust this path to where your Express app is exported
const Jobs = require("../models/Jobs");
const { scrapeJobData } = require("../web-scapper");
const request = require("supertest");
const chai = require("chai");
const sinon = require("sinon");
const axios = require("axios");

const { expect } = chai;

describe("API Tests", () => {
  let server;

  before(() => {
    server = app.listen(4000); // Start the server on a different port for testing
  });

  after(() => {
    server.close(); // Close the server after tests
  });

  describe("GET /search", () => {
    it("should search jobs based on keyword", async () => {
      const keyword = "Tag1";
      const findAllStub = sinon
        .stub(Jobs, "findAll")
        .resolves([{ tag: "Tag1" }]);

      const res = await request(server).get(`/search?keyword=${keyword}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an("array");
      expect(res.body[0]).to.have.property("tag", "Tag1");

      findAllStub.restore(); // Restore the original method
    });
  });

  describe("GET /export-excel", () => {
    it("should export data to an Excel file", async () => {
      // Mock Jobs.findAll
      const findAllStub = sinon
        .stub(Jobs, "findAll")
        .resolves([{ id: 1, tag: "Tag1" }]);

      const res = await request(server).get("/export-excel");

      expect(res.status).to.equal(200);
      expect(res.header["content-type"]).to.include(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      findAllStub.restore(); // Restore the original method
    });
  });

  describe("GET /:id", () => {
    // Read by id
    it("should get a job by id", async () => {
      const job = await Jobs.create({
        tag: "Java",
        company_name: "PT Java Tech",
        job_location: "Jakarta",
        title: "Java Developer",
        classification: "IT",
        subclassification: "Developer",
        salary: "10000000",
        work_type: "Full-Time",
        teaser: "Looking for experienced Java Developer.",
        work_arrangements: "Remote",
        other_info: "Java, Spring",
        date: "2024-09-17T00:00:00Z",
      });
      const response = await request(app).get(`/${job.id}`);
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property("company_name", "PT Java Tech");
    });
  });
  describe("POST /", () => {
    it("should create a new job", async () => {
      const response = await request(app).post("/").send({
        tag: "Java",
        company_name: "PT Java Tech",
        job_location: "Jakarta",
        title: "Java Developer",
        classification: "IT",
        subclassification: "Developer",
        salary: "10000000",
        work_type: "Full-Time",
        teaser: "Looking for experienced Java Developer.",
        work_arrangements: "Remote",
        other_info: "Java, Spring",
        date: "2024-09-17T00:00:00Z",
      });
      expect(response.status).to.equal(201);
      expect(response.body.message).to.equal("Job created successfully");
    });
  });

  describe("PUT /:id", () => {
    // Update
    it("should update a job by id", async () => {
      const job = await Jobs.create({
        tag: "Java",
        company_name: "PT Java Tech",
        job_location: "Jakarta",
        title: "Java Developer",
        classification: "IT",
        subclassification: "Developer",
        salary: "10000000",
        work_type: "Full-Time",
        teaser: "Looking for experienced Java Developer.",
        work_arrangements: "Remote",
        other_info: "Java, Spring",
        date: "2024-09-17T00:00:00Z",
      });
      const response = await request(app).put(`/${job.id}`).send({
        tag: "Java",
        company_name: "PT Java Advanced",
        job_location: "Jakarta",
        title: "Senior Java Developer",
        classification: "IT",
        subclassification: "Senior Developer",
        salary: "15000000",
        work_type: "Full-Time",
        teaser: "Looking for senior Java Developer with leadership skills.",
        work_arrangements: "Remote",
        other_info: "Java, Spring, Leadership",
        date: "2024-09-17T00:00:00Z",
      });
      expect(response.status).to.equal(200);
      expect(response.body.message).to.equal("Job updated successfully");
    });
  });

  describe("DELETE /:id", () => {
    // Delete
    it("should delete a job by id", async () => {
      const job = await Jobs.create({
        tag: "Java",
        company_name: "PT Java Tech",
        job_location: "Jakarta",
        title: "Java Developer",
        classification: "IT",
        subclassification: "Developer",
        salary: "10000000",
        work_type: "Full-Time",
        teaser: "Looking for experienced Java Developer.",
        work_arrangements: "Remote",
        other_info: "Java, Spring",
        date: "2024-09-17T00:00:00Z",
      });
      const response = await request(app).delete(`/${job.id}`);
      expect(response.status).to.equal(200);
      expect(response.body.message).to.equal("Job deleted successfully");
    });
  });

  describe("GET /scrape-filter-data/:tag", function () {
    it("should return filtered job data for a valid tag", function (done) {
      request(app)
        .get("/scrape-filter-data/.Net Core") // Use a valid tag
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err);

          // console.log('Response Body:', res.body); // Log the response body

          const data = res.body;

          // Validate that the response is an array
          expect(data).to.be.an("array").that.is.not.empty;

          // Validate the structure of each item in the array
          data.forEach((item) => {
            expect(item).to.have.property("bulletPoints").that.is.an("array");
            expect(item)
              .to.have.property("classificationDescription")
              .that.is.a("string");
            expect(item)
              .to.have.property("advertiserDescription")
              .that.is.a("string");
            expect(item).to.have.property("location").that.is.a("string");
            expect(item)
              .to.have.property("jobLocationLabel")
              .that.is.a("string");
            expect(item).to.have.property("listingDate").that.is.a("string");
            expect(item).to.have.property("salary").that.is.a("string");
            expect(item)
              .to.have.property("subClassificationDescription")
              .that.is.a("string");
            expect(item).to.have.property("workType").that.is.a("string");
            expect(item)
              .to.have.property("workArrangementsLabels")
              .that.is.an("array");
            expect(item).to.have.property("title").that.is.a("string");
            expect(item).to.have.property("teaser").that.is.a("string");
            expect(item).to.have.property("tag").that.is.a("string");
          });

          done();
        });
    });
  });
});
