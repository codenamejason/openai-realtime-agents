import { CsvError, parse } from "csv-parse";
import { promises as fs } from "fs";
import { Bounty, BountyResult } from "@/app/types/bounty";

export class CSVParser {
  private filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  async parseBounties(): Promise<BountyResult> {
    try {
      const fileContent = await fs.readFile(this.filePath, "utf-8");

      return new Promise((resolve, reject) => {
        parse(
          fileContent,
          {
            columns: true,
            skip_empty_lines: true,
          },
          (error: CsvError | undefined, records: any[]) => {
            if (error) {
              reject(new Error(`Failed to parse CSV: ${error.message}`));

              return;
            }

            const validationResult = this.validateAndTransformRecords(records);
            resolve(validationResult);
          }
        );
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        isValid: false,
        errors: [`Failed to read CSV file: ${errorMessage}`],
        bounties: [],
      };
    }
  }

  private validateAndTransformRecords(records: any[]): BountyResult {
    const errors: string[] = [];
    const bounties: Bounty[] = [];

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const rowNumber = i + 2; // Adding 2 to account for 0-based index and header row

      // Check required fields
      // Based on the ETH Denver 2025 Bounty CSV file, the required fields are:
      // Category,Name,Description,Total Prize,# Projects,Breakdown,Required to Complete,What Does Success Look Like,UI/UX Requirements,How Being Judged,What is Impact,Resource Links,Example Projects,Jobs,Sponsor Name,
      if (!record.Category) {
        errors.push(`Row ${rowNumber}: Missing required field 'Category'`);
      }
      if (!record.Name) {
        errors.push(`Row ${rowNumber}: Missing required field 'Name'`);
      }
      if (!record.Description) {
        errors.push(`Row ${rowNumber}: Missing required field 'Description'`);
      }
      if (!record.TotalPrize) {
        errors.push(`Row ${rowNumber}: Missing required field 'Total Prize'`);
      }
      if (!record.Breakdown) {
        errors.push(`Row ${rowNumber}: Missing required field 'Breakdown'`);
      }
      if (!record.RequiredtoComplete) {
        errors.push(
          `Row ${rowNumber}: Missing required field 'Required to Complete'`
        );
      }
      if (!record.WhatDoesSuccessLookLike) {
        errors.push(
          `Row ${rowNumber}: Missing required field 'What Does Success Look Like'`
        );
      }
      if (!record.UIUXRequirements) {
        errors.push(
          `Row ${rowNumber}: Missing required field 'UI/UX Requirements'`
        );
      }
      if (!record.HowBeingJudged) {
        errors.push(
          `Row ${rowNumber}: Missing required field 'How Being Judged'`
        );
      }
      if (!record.WhatIsImpact) {
        errors.push(
          `Row ${rowNumber}: Missing required field 'What is Impact'`
        );
      }
      if (!record.ResourceLinks) {
        errors.push(
          `Row ${rowNumber}: Missing required field 'Resource Links'`
        );
      }
      if (!record.ExampleProjects) {
        errors.push(
          `Row ${rowNumber}: Missing required field 'Example Projects'`
        );
      }
      // if (!record.Jobs) {
      //   errors.push(`Row ${rowNumber}: Missing required field 'Jobs'`);
      // }
      if (!record.SponsorName) {
        errors.push(`Row ${rowNumber}: Missing required field 'Sponsor Name'`);
      }

      if (
        record.Category &&
        record.Name &&
        record.Description &&
        record.TotalPrize &&
        record.Breakdown &&
        record.RequiredtoComplete &&
        record.WhatDoesSuccessLookLike &&
        record.UIUXRequirements &&
        record.HowBeingJudged &&
        record.WhatIsImpact &&
        record.ResourceLinks &&
        record.ExampleProjects &&
        // record.Jobs &&
        record.SponsorName
      ) {
        const bounty: Bounty = {
          name: record.Name,
          description: record.Description || "",
          trackId: record.TotalPrize,
        };
        bounties.push(bounty);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      bounties: errors.length === 0 ? bounties : [],
    };
  }
}
