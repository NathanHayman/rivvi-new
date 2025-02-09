import { dynamoDb } from "@/utils/aws";
import { logger } from "@/utils/logger";
import { prisma } from "@/utils/prisma";
import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import crypto from "crypto";
import { format } from "date-fns";
import { parsePhoneNumber } from "libphonenumber-js";

interface PatientData {
  firstName: string;
  lastName: string;
  phone: string;
  dob: string;
  [key: string]: any;
}

interface DeduplicationResult {
  isNew: boolean;
  patient: any;
  hash: string;
}

export class DeduplicationService {
  private readonly TABLE_NAME = process.env.DYNAMODB_DEDUP_TABLE!;

  async processPatient(
    data: PatientData,
    orgId: string
  ): Promise<DeduplicationResult> {
    try {
      // Clean and normalize data
      const cleanedData = await this.cleanPatientData(data);
      const hash = this.generateHash(cleanedData);

      // Check DynamoDB for existing hash
      const existing = await this.checkExistingHash(hash);
      if (existing) {
        // Get patient from RDS
        const patient = await prisma.patient.findUnique({
          where: { hash },
        });

        if (patient) {
          return {
            isNew: false,
            patient,
            hash,
          };
        }
      }

      // Create new patient in RDS
      const patient = await prisma.patient.create({
        data: {
          hash,
          firstName: cleanedData.firstName,
          lastName: cleanedData.lastName,
          phone: cleanedData.phone,
          dob: new Date(cleanedData.dob),
          orgId,
        },
      });

      // Store hash in DynamoDB
      await this.storeHash(hash, patient.id);

      return {
        isNew: true,
        patient,
        hash,
      };
    } catch (error) {
      logger.error(
        { error, data },
        "Error processing patient for deduplication"
      );
      throw error;
    }
  }

  async batchProcess(
    patients: PatientData[],
    orgId: string
  ): Promise<DeduplicationResult[]> {
    return Promise.all(
      patients.map((patient) => this.processPatient(patient, orgId))
    );
  }

  private async cleanPatientData(data: PatientData): Promise<PatientData> {
    // Clean name fields
    const firstName = this.cleanName(data.firstName);
    const lastName = this.cleanName(data.lastName);

    // Clean and format phone number
    const phoneNumber = parsePhoneNumber(data.phone, "US");
    if (!phoneNumber.isValid()) {
      throw new Error("Invalid phone number");
    }
    const phone = phoneNumber.format("E.164");

    // Parse and format date
    const dob = format(new Date(data.dob), "yyyy-MM-dd");

    return {
      ...data,
      firstName,
      lastName,
      phone,
      dob,
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

  private generateHash(data: PatientData): string {
    const hashString =
      `${data.firstName}|${data.lastName}|${data.phone}|${data.dob}`.toLowerCase();
    return crypto.createHash("sha256").update(hashString).digest("hex");
  }

  private async checkExistingHash(hash: string): Promise<boolean> {
    try {
      const response = await dynamoDb.send(
        new GetCommand({
          TableName: this.TABLE_NAME,
          Key: { hash },
        })
      );
      return !!response.Item;
    } catch (error) {
      logger.error({ error, hash }, "Error checking existing hash");
      return false;
    }
  }

  private async storeHash(hash: string, patientId: string): Promise<void> {
    try {
      await dynamoDb.send(
        new PutCommand({
          TableName: this.TABLE_NAME,
          Item: {
            hash,
            patientId,
            createdAt: new Date().toISOString(),
          },
        })
      );
    } catch (error) {
      logger.error({ error, hash, patientId }, "Error storing hash");
      throw error;
    }
  }

  async findDuplicates(orgId: string): Promise<any[]> {
    try {
      const duplicates = await prisma.patient.groupBy({
        by: ["hash"],
        where: {
          orgId,
        },
        having: {
          hash: {
            _count: {
              gt: 1,
            },
          },
        },
      });

      const duplicateHashes = duplicates.map((d: any) => d.hash);
      const duplicatePatients = await prisma.patient.findMany({
        where: {
          hash: {
            in: duplicateHashes,
          },
        },
        include: {
          calls: true,
          runs: true,
        },
      });

      return duplicatePatients;
    } catch (error) {
      logger.error({ error, orgId }, "Error finding duplicates");
      throw error;
    }
  }
}
