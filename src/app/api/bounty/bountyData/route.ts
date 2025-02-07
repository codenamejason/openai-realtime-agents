import { NextResponse } from "next/server";
import { CSVParser } from "@/app/services/csv/csv-parser";

export async function GET() {
  // fetch the bounty data from csv file locally
  const csvParser = new CSVParser("../../data/bountyData.csv");
  const bountyData = await csvParser.parseBounties();

  return NextResponse.json(bountyData);
}
