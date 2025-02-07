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
      if (!record.name) {
        errors.push(`Row ${rowNumber}: Missing required field 'name'`);
      }
      if (!record.description) {
        errors.push(`Row ${rowNumber}: Missing required field 'description'`);
      }
      if (!record.prizeAmount) {
        errors.push(`Row ${rowNumber}: Missing required field 'prizeAmount'`);
      }

      if (record.name && record.description && record.prizeAmount) {
        const bounty: Bounty = {
          name: record.name,
          description: record.description || "",
          trackId: record.prizeAmount,
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
