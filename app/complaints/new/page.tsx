"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, MapPin, Upload, X } from "lucide-react";
import MapComponent from "@/components/map-component";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"];

const formSchema = z.object({
  category: z.string({
    required_error: "Please select a complaint category.",
  }),
  subcategory: z.string().optional(),
  subject: z
    .string()
    .min(5, {
      message: "Subject must be at least 5 characters.",
    })
    .max(100, {
      message: "Subject must not exceed 100 characters.",
    }),
  description: z
    .string()
    .min(20, {
      message: "Description must be at least 20 characters.",
    })
    .max(1000, {
      message: "Description must not exceed 1000 characters.",
    }),
  address: z.string().min(5, {
    message: "Please provide a valid address.",
  }),
  latitude: z.string(),
  longitude: z.string(),
  // File validation will be handled separately
});

export default function NewComplaintPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading");
  const [files, setFiles] = useState<File[]>([]);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [complaintId, setComplaintId] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "",
      subcategory: "",
      subject: "",
      description: "",
      address: "",
      latitude: "",
      longitude: "",
    },
  });

  const selectedCategory = form.watch("category");

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setStatus(user ? "authenticated" : "unauthenticated");
    };
    getUser();
  }, []);

  // Get subcategories based on selected category
  const getSubcategories = (category: string) => {
    switch (category) {
      case "roads":
        return [
          "Potholes",
          "Damaged Footpath",
          "Waterlogging",
          "Street Lights",
          "Other",
        ];
      case "water":
        return [
          "Water Supply",
          "Leakage",
          "Quality Issues",
          "Billing",
          "Other",
        ];
      case "sanitation":
        return [
          "Garbage Collection",
          "Sewage Issues",
          "Public Toilets",
          "Drainage",
          "Other",
        ];
      case "health":
        return [
          "Hospital Services",
          "Medical Camps",
          "Disease Outbreak",
          "Other",
        ];
      default:
        return [];
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const newErrors: string[] = [];

    // Validate files
    selectedFiles.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        newErrors.push(`${file.name} exceeds the maximum file size of 5MB.`);
      }

      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        newErrors.push(
          `${file.name} has an unsupported file type. Only JPG, PNG, and PDF are allowed.`
        );
      }
    });

    if (newErrors.length === 0) {
      setFiles((prev) => [...prev, ...selectedFiles]);
    }

    setFileErrors(newErrors);

    // Reset the input
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMapClick = (lat: number, lng: number, address: string) => {
    form.setValue("latitude", lat.toString());
    form.setValue("longitude", lng.toString());
    form.setValue("address", address);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (fileErrors.length > 0) {
      return;
    }

    if (status !== "authenticated") {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit a complaint.",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    setIsSubmitting(true);

    try {
      // Get Supabase session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // Submit complaint data with Authorization header
      const response = await fetch("/api/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          title: values.subject,
          category: values.category,
          subcategory: values.subcategory,
          description: values.description,
          address: values.address,
          latitude: values.latitude,
          longitude: values.longitude,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit complaint");
      }

      const data = await response.json();

      // If there are files, upload them
      if (files.length > 0) {
        const formData = new FormData();
        formData.append("complaintId", data.complaintId);
        files.forEach((file) => {
          formData.append("files", file);
        });

        const uploadResponse = await fetch("/api/attachments", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          const error = await uploadResponse.json();
          throw new Error(error.message || "Failed to upload attachments");
        }
      }

      setComplaintId(data.complaintId);
      setShowSuccess(true);
      toast({
        title: "Complaint Submitted",
        description: "Your complaint has been submitted successfully.",
      });
    } catch (error) {
      console.error("Error submitting complaint:", error);
      toast({
        title: "Submission Failed",
        description:
          error instanceof Error ? error.message : "Failed to submit complaint",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="container max-w-3xl mx-auto py-10 px-4">
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-700">
              Complaint Submitted Successfully
            </CardTitle>
            <CardDescription className="text-green-600">
              Your complaint has been registered with the following details:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white p-4 rounded-md border border-green-200">
              <p className="font-medium">
                Complaint ID: <span className="text-lg">{complaintId}</span>
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Please save this ID for future reference. You can use it to
                track the status of your complaint.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Button asChild className="flex-1">
                <a href={`/complaints/${complaintId}`}>
                  View Complaint Details
                </a>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <a href="/complaints">View All My Complaints</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Lodge a New Complaint</CardTitle>
          <CardDescription>
            Provide details about your complaint to help us address it
            effectively
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Category <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="roads">
                            Roads & Infrastructure
                          </SelectItem>
                          <SelectItem value="water">Water Supply</SelectItem>
                          <SelectItem value="sanitation">
                            Sanitation & Waste
                          </SelectItem>
                          <SelectItem value="health">
                            Health Services
                          </SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="electricity">
                            Electricity
                          </SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedCategory &&
                  getSubcategories(selectedCategory).length > 0 && (
                    <FormField
                      control={form.control}
                      name="subcategory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subcategory</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a subcategory" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {getSubcategories(selectedCategory).map((sub) => (
                                <SelectItem key={sub} value={sub.toLowerCase()}>
                                  {sub}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
              </div>

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Subject <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Brief title of your complaint"
                        {...field}
                        maxLength={100}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a short, descriptive title for your complaint
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Description <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detailed description of your complaint"
                        {...field}
                        rows={5}
                        maxLength={1000}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide specific details about the issue, including when
                      it started and how it affects you
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-medium mb-2">
                    Location <span className="text-destructive">*</span>
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag the marker on the map to pinpoint the exact location of
                    the issue
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Address <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter address or landmark"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            aria-label="Use current location"
                          >
                            <MapPin className="h-4 w-4" />
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="h-[300px] w-full rounded-md border overflow-hidden">
                  <MapComponent onLocationSelect={handleMapClick} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitude</FormLabel>
                        <FormControl>
                          <Input {...field} readOnly />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Longitude</FormLabel>
                        <FormControl>
                          <Input {...field} readOnly />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-medium mb-2">Evidence</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload photos or documents related to your complaint
                    (optional)
                  </p>
                </div>

                <div className="grid gap-4">
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="file-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          JPG, PNG or PDF (max 5MB per file)
                        </p>
                      </div>
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        accept=".jpg,.jpeg,.png,.pdf"
                        multiple
                        onChange={handleFileChange}
                        aria-label="Upload evidence files"
                      />
                    </label>
                  </div>

                  {fileErrors.length > 0 && (
                    <div className="text-destructive text-sm">
                      {fileErrors.map((error, index) => (
                        <p key={index}>{error}</p>
                      ))}
                    </div>
                  )}

                  {files.length > 0 && (
                    <div className="grid gap-2">
                      {files.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                        >
                          <div className="flex items-center">
                            <div className="ml-2 text-sm">
                              <p className="font-medium truncate max-w-[200px]">
                                {file.name}
                              </p>
                              <p className="text-gray-500">
                                {(file.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFile(index)}
                            aria-label={`Remove ${file.name}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Submit Complaint
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
