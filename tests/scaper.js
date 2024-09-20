const express = require("express");
const request = require("supertest");
const app = require("../server"); // Adjust path accordingly
const { expect } = require("chai");

// describe('GET /scrape/:jobType', function() {
//     it('should return job data for a valid jobType', function(done) {
//         request(app)
//             .get('/scrape/menari')
//             .expect(200)
//             .end(function(err, res) {
//                 if (err) return done(err);
//                 const body = res.body;
//                 if (!Array.isArray(body)) return done(new Error('Response body is not an array'));
//                 if (!body[0].hasOwnProperty('id')) return done(new Error('Job item does not have id'));
//                 if (!body[0].hasOwnProperty('title')) return done(new Error('Job item does not have title'));
//                 if (!body[0].hasOwnProperty('companyName')) return done(new Error('Job item does not have company'));
//                 done();
//             });
//     });

//     // it('should return an error message for invalid jobType', function(done) {
//     //     request(app)
//     //         .get('/scrape/invalidjobtype')
//     //         .expect(500)
//     //         .end(function(err, res) {
//     //             if (err) return done(err);
//     //             if (res.text !== 'Error scraping data') return done(new Error('Unexpected error message'));
//     //             done();
//     //         });
//     // });
// });

// describe("GET /scrape-filter-data/:jobType", function () {
//   it("should return filtered job data for a valid jobType", function (done) {
//     request(app)
//       .get("/scrape-filter-data/.Net Core") // Use a valid jobType
//       .expect(200)
//       .end(function (err, res) {
//         if (err) return done(err);

//         // console.log('Response Body:', res.body); // Log the response body

//         const data = res.body;

//         // Validate that the response is an array
//         expect(data).to.be.an("array").that.is.not.empty;

//         // Validate the structure of each item in the array
//         data.forEach((item) => {
//           expect(item).to.have.property("bulletPoints").that.is.an("array");
//           expect(item)
//             .to.have.property("classificationDescription")
//             .that.is.a("string");
//           expect(item)
//             .to.have.property("advertiserDescription")
//             .that.is.a("string");
//           expect(item).to.have.property("location").that.is.a("string");
//           expect(item).to.have.property("jobLocationLabel").that.is.a("string");
//           expect(item).to.have.property("listingDate").that.is.a("string");
//           expect(item).to.have.property("salary").that.is.a("string");
//           expect(item)
//             .to.have.property("subClassificationDescription")
//             .that.is.a("string");
//           expect(item).to.have.property("workType").that.is.a("string");
//           expect(item)
//             .to.have.property("workArrangementsLabels")
//             .that.is.an("array");
//           expect(item).to.have.property("title").that.is.a("string");
//           expect(item).to.have.property("teaser").that.is.a("string");
//           expect(item).to.have.property("tag").that.is.a("string");
//         });

//         done();
//       });
//   });
//   // it('should return an error message for an invalid jobType', function(done) {
//   //     request(app)
//   //         .get('/scrape-filter-data/invalid  jobtype')
//   //         .expect(500)
//   //         .end(function(err, res) {
//   //             if (err) return done(err);

//   //             const response = res.body;

//   //             expect(response).to.have.property('error', 'Error scraping or saving data');
//   //             done();
//   //         });
//   // });
// });
