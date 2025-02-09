import { s3Client } from "@/utils/aws";
import { logger } from "@/utils/logger";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import crypto from "crypto";
import { format } from "date-fns";
import { parsePhoneNumber } from "libphonenumber-js";
import { read, utils } from "xlsx";

const dynamoDb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

interface ProcessedData {
  validRows: any[];
  invalidRows: any[];
  patients: Map<string, any>;
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
}

export class ExcelProcessor {
  private readonly REQUIRED_FIELDS = ["firstName", "lastName", "phone", "dob"];

  async processFile(
    s3Key: string,
    campaignId: string,
    orgId: string
  ): Promise<ProcessedData> {
    try {
      // Get file from S3
      const response = await s3Client.send(
        new GetObjectCommand({
          Bucket: process.env.S3_BUCKET_RAW,
          Key: s3Key,
        })
      );

      const buffer = await response.Body?.transformToByteArray();
      if (!buffer) throw new Error("Failed to read file from S3");

      // Read Excel file
      const workbook = read(buffer);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = utils.sheet_to_json(worksheet);

      const processedData = await this.processRows(rows, orgId);

      // Store processed data in S3
      const processedKey = `processed/${orgId}/${campaignId}/${Date.now()}.json`;
      await s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.S3_BUCKET_PROCESSED,
          Key: processedKey,
          Body: JSON.stringify({
            validRows: processedData.validRows,
            invalidRows: processedData.invalidRows,
            stats: {
              totalRecords: processedData.totalRecords,
              validRecords: processedData.validRecords,
              invalidRecords: processedData.invalidRecords,
            },
          }),
          ContentType: "application/json",
        })
      );

      return processedData;
    } catch (error) {
      logger.error({ error, s3Key }, "Error processing Excel file");
      throw error;
    }
  }

  private async processRows(
    rows: any[],
    orgId: string
  ): Promise<ProcessedData> {
    const validRows: any[] = [];
    const invalidRows: any[] = [];
    const patients = new Map<string, any>();
    let totalRecords = rows.length;
    let validRecords = 0;
    let invalidRecords = 0;

    for (const row of rows) {
      const processedRow = await this.processRow(row, orgId);
      if (processedRow.isValid) {
        validRows.push(processedRow.data);
        validRecords++;

        // Store unique patients by hash
        const patientHash = this.generatePatientHash(processedRow.data);
        if (!patients.has(patientHash)) {
          const existingPatient = await this.checkExistingPatient(patientHash);
          patients.set(patientHash, {
            hash: patientHash,
            id: existingPatient?.id || crypto.randomUUID(),
            firstName: processedRow.data.firstName,
            lastName: processedRow.data.lastName,
            phone: processedRow.data.phone,
            dob: processedRow.data.dob,
            isExisting: !!existingPatient,
          });
        }
      } else {
        invalidRows.push({ ...row, errors: processedRow.errors });
        invalidRecords++;
      }
    }

    return {
      validRows,
      invalidRows,
      patients,
      totalRecords,
      validRecords,
      invalidRecords,
    };
  }

  private async processRow(
    row: any,
    orgId: string
  ): Promise<{
    isValid: boolean;
    data?: any;
    errors?: string[];
  }> {
    const errors: string[] = [];
    const processedData: any = {};

    // Check required fields
    for (const field of this.REQUIRED_FIELDS) {
      if (!row[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Process phone number
    if (row.phone) {
      try {
        const phoneNumber = parsePhoneNumber(row.phone, "US");
        if (!phoneNumber.isValid()) {
          errors.push("Invalid phone number");
        } else {
          processedData.phone = phoneNumber.format("E.164");
        }
      } catch {
        errors.push("Invalid phone number format");
      }
    }

    // Process name fields
    if (row.firstName) {
      processedData.firstName = this.cleanName(row.firstName);
    }
    if (row.lastName) {
      processedData.lastName = this.cleanName(row.lastName);
    }

    // Process DOB
    if (row.dob) {
      try {
        const date = new Date(row.dob);
        if (isNaN(date.getTime())) {
          errors.push("Invalid date of birth");
        } else {
          processedData.dob = format(date, "yyyy-MM-dd");
        }
      } catch {
        errors.push("Invalid date format");
      }
    }

    // Copy additional fields (campaign-specific)
    for (const key in row) {
      if (!this.REQUIRED_FIELDS.includes(key)) {
        processedData[key] = row[key];
      }
    }

    // Add organization ID
    processedData.orgId = orgId;

    return {
      isValid: errors.length === 0,
      data: errors.length === 0 ? processedData : undefined,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  private cleanName(name: string): string {
    return name
      .trim()
      .replace(/\s+/g, " ") // Remove extra spaces
      .replace(/[^a-zA-Z\s-]/g, "") // Remove special characters except hyphen
      .toLowerCase()
      .replace(/(?:^|\s|-)\S/g, (letter) => letter.toUpperCase()); // Capitalize first letter of each word
  }

  private generatePatientHash(data: any): string {
    const hashString =
      `${data.firstName}|${data.lastName}|${data.phone}|${data.dob}`.toLowerCase();
    return crypto.createHash("sha256").update(hashString).digest("hex");
  }

  private async checkExistingPatient(hash: string) {
    try {
      const response = await dynamoDb.send(
        new GetCommand({
          TableName: process.env.DYNAMODB_DEDUP_TABLE,
          Key: { hash },
        })
      );
      return response.Item;
    } catch (error) {
      logger.error({ error, hash }, "Error checking existing patient");
      return null;
    }
  }
}
