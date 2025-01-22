import { NextResponse } from "next/server";
import fs from "fs";
import csv from "csv-parser";

async function parseCSV(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (error) => reject(error));
  });
}

function formatCSVData(data: any[]): string {
  return data
    .map((row, index) => {
      return `${index + 1}. ${row["Category"]}, ${row["Name"]}, ${
        row["Description"]
      }, ${row["Total Prize"]}, ${row["# Projects"]}, ${row["Breakdown"]}, ${
        row["Required to Complete"]
      }, ${row["What Does Success Look Like"]}, ${row["UI/UX Requirements"]}, ${
        row["How Being Judged"]
      }, ${row["What is Impact"]}, ${row["Resource Links"]}, ${
        row["Example Projects"]
      }, ${row["Jobs"]}, ${row["Sponsor Name"]}`;
    })
    .join("\n");
}

export async function GET() {
  // fetch the bounty data from csv file locally
  const bountyData = await parseCSV("bountyData.csv");
  const formattedData = formatCSVData(bountyData);

  return NextResponse.json(formattedData);
}
