import { Ticket } from "../client/src/api";
import * as fs from "fs";
const data: any = fs.readFileSync("./data.json");
const parseData = JSON.parse(data);
console.log("temp data: ", parseData);
export const tempData = parseData as Ticket[];
