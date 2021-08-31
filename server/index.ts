import express from "express";
import bodyParser = require("body-parser");
import { tempData } from "./temp-data";
import { serverAPIPort, APIPath } from "@fed-exam/config";
import { Ticket } from "../client/src/api";
import * as fs from "fs";

console.log("starting server", { serverAPIPort, APIPath });

const app = express();

const PAGE_SIZE = tempData.length;

app.use(bodyParser.json());

app.use((_, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  next();
});

// GET: get all tickets / sort tickets
app.get(APIPath, (req, res) => {
  // @ts-ignore
  const page: number = req.query.page || 1;
  const sortBy: string | any = req.query.sortBy || "";
  const searchTerm: string | any = req.query.superSearch;

  const paginatedData = tempData.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  // search impelmentaition
  if (searchTerm) {
    const searchResult = paginatedData.filter(
      (item) =>
        item.title.includes(searchTerm) || item.content.includes(searchTerm)
    );
    console.log("searchResult: ", searchResult.length);
    return res.send(searchResult);
  }

  // handel all cases of sorting, by default, send tickets list without sorting
  switch (sortBy) {
    case "date":
      const dataSortedByDate: Ticket[] = paginatedData.sort((a, b) => {
        const first: number = a.creationTime;
        const second: number = b.creationTime;

        return second - first;
      });
      console.log(dataSortedByDate);
      res.send(dataSortedByDate);
      break;
    case "email":
      const dataSortedByEmail: Ticket[] = paginatedData.sort((a, b) => {
        const first: string = a.userEmail;
        const second: string = b.userEmail;

        return first > second ? 1 : -1;
      });
      res.send(dataSortedByEmail);
      break;
    case "title":
      // sorting paginatedData ignoring special characters
      const dataSortedByTitle: Ticket[] = paginatedData.sort(function (
        a: any,
        b: any
      ) {
        const firstTitle = /[a-zA-Z]+/.exec(a.title);
        const secondTitle = /[a-zA-Z]+/.exec(b.title);
        if (firstTitle && secondTitle) {
          return firstTitle[0].localeCompare(secondTitle[0]);
        } else {
          return a.title - b.title;
        }
      });
      res.send(dataSortedByTitle);
      break;
    default:
      // send back list without sorting
      res.send(paginatedData);
      break;
  }
});

// PATCH: update json file
app.patch(APIPath, (req, res) => {
  // assign user new title and the index of the object in the array
  const newTitle = req.body[0];
  const objIndex = req.body[1];

  // apply changes to tempData
  tempData[objIndex].title = newTitle;

  // write changes to temp-data.json file
  fs.writeFile("./data.json", JSON.stringify(tempData), (err) => {
    if (err) {
      console.log(err);
    } else {
    }
  });

  return res.send(tempData);
});

app.listen(serverAPIPort);
console.log("server running", serverAPIPort);
