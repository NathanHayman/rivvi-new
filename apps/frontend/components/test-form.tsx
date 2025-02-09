"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Progress } from "@workspace/ui/components/progress";
import { cn } from "@workspace/ui/lib/utils";
import { UploadIcon } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface TestFormProps {
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  campaignId: string;
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export default function TestForm({ setShowModal, campaignId }: TestFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processedDataStats, setProcessedDataStats] = useState<{
    rows: number;
    calls: number;
  } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  console.log(campaignId);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    try {
      setIsUploading(true);

      // TODO: Implement file upload to S3
      // 1. Get presigned URL
      // 2. Upload file
      // 3. Wait for processing completion
      // 4. Get processed stats

      // Simulated progress for now
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 500);

      // Simulate processing completion
      setTimeout(() => {
        setProcessedDataStats({
          rows: 1000,
          calls: 500,
        });
        setIsUploading(false);
        setUploadProgress(0);
        setCurrentStep(2); // Move to final step
      }, 5000);
    } catch (error) {
      console.error("Error uploading file:", error);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (currentStep === 0) {
      setCurrentStep(1);
    } else if (currentStep === 2) {
      try {
        // TODO: Create new run with the processed data
        // const response = await createRun({
        //   name: values.name,
        //   campaignId,
        //   // other necessary data
        // });
        console.log("Creating run with name:", values.name);

        // Redirect to the run page
        // router.push(`/runs/${response.runId}`);

        setShowModal(false);
      } catch (error) {
        console.error("Error creating run:", error);
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="pb-10">
          <div className="relative">
            <div className="absolute left-0 top-[10px] w-full">
              <div className="absolute left-0 h-1 w-full">
                <div className="absolute h-full w-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${((currentStep + 1) / 3) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {currentStep === 0 && (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name your run</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter run name" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is the name that will be displayed in the run list.
                  </FormDescription>
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit">Next</Button>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-base font-semibold tracking-tight">
                Upload Your Data
              </h2>
              <p className="text-sm text-muted-foreground">
                Upload your CSV file to begin processing
              </p>
            </div>
            <div
              className={cn(
                "border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center transition-colors",
                !isUploading && "hover:border-muted-foreground/50"
              )}
            >
              <input
                type="file"
                accept=".csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                className="hidden"
                id="file-upload"
                disabled={isUploading}
              />
              <label
                htmlFor="file-upload"
                className={cn(
                  "cursor-pointer flex flex-col items-center justify-center",
                  isUploading && "cursor-not-allowed opacity-50"
                )}
              >
                <UploadIcon className="w-8 h-8 mb-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {isUploading
                    ? "Uploading..."
                    : "Click to upload or drag and drop"}
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  CSV files only
                </span>
              </label>
            </div>
            {isUploading && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Uploading and processing...
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}
          </div>
        )}

        {currentStep === 2 && processedDataStats && (
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-base font-semibold tracking-tight">
                Begin Your Run
              </h2>
              <p className="text-sm text-muted-foreground">
                Review your data and start the run
              </p>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <h3 className="font-medium mb-2">Processed Data Summary</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Total Rows: {processedDataStats.rows}</p>
                <p>Total Calls: {processedDataStats.calls}</p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit">Begin Run</Button>
            </div>
          </div>
        )}
      </form>
    </Form>
  );
}
