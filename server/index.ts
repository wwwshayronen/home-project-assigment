import express from "express";
import bodyParser = require("body-parser");
import { tempData } from "./temp-data";
import { serverAPIPort, APIPath } from "@fed-exam/config";
import { Ticket } from "../client/src/api";
import * as fs from "fs";
import lunr from "lunr";

console.log("starting server", { serverAPIPort, APIPath });

const app = express();

let PAGE_SIZE = 20;

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

  let returnData: Ticket[] | any;

  // search impelmentaition
  if (searchTerm) {
    returnData = searchData(searchTerm);
  } else {
    returnData = tempData;
    PAGE_SIZE = 20;
  }

  returnData = sortData(sortBy, returnData);

  const paginatedData = returnData.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return res.send({ paginatedData, totalItems: returnData.length });
});

const idx = lunr(function () {
  this.field("title");
  this.field("content");
  for (let i = 0; i < tempData.length; i++) {
    this.add(tempData[i]);
  }
});

function searchData(searchTerm: string) {
  const result = idx.search(searchTerm);

  return result.map((item) => {
    return tempData.find((ticket) => item.ref === ticket.id);
  });
}

function sortData(sortBy: string, data: Ticket[]) {
  // **REMARK** when dealing with millions of records, it is also possible to keep additional 3 ordered lists and use the required one, instead of making the sort at runtime

  // handel all cases of sorting, by default, send tickets list without sorting
  let sortFunction;

  switch (sortBy) {
    case "date":
      sortFunction = (a: any, b: any) => {
        const first: number = a.creationTime;
        const second: number = b.creationTime;

        return second - first;
      };
      break;
    case "email":
      sortFunction = (a: any, b: any) => {
        const first: string = a.userEmail;
        const second: string = b.userEmail;

        return first > second ? 1 : -1;
      };
      break;
    case "title":
      // sorting paginatedData ignoring special characters
      sortFunction = (a: any, b: any) => {
        const firstTitle = /[a-zA-Z]+/.exec(a.title);
        const secondTitle = /[a-zA-Z]+/.exec(b.title);
        if (firstTitle && secondTitle) {
          return firstTitle[0].localeCompare(secondTitle[0]);
        } else {
          return a.title - b.title;
        }
      };
      break;
  }
  if (sortFunction) {
    data = data.sort(sortFunction);
  }

  return data;
}

// PATCH: update json file
app.patch(APIPath, (req, res) => {
  // assign user new title and the index of the object in the array
  const newTitle = req.body[0];
  const objID = req.body[1];

  // apply changes to tempData
  const findObjectById = tempData.find((item) => item.id === objID);
  if (findObjectById) {
    findObjectById.title = newTitle;
  }

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
