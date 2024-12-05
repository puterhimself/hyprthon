import type { OurFileRouter } from "~/app/api/uploadthing/core";
import { generateReactHelpers } from "@uploadthing/react";
import {
	generateUploadButton,
	generateUploadDropzone,
} from "@uploadthing/react";

export const UploadDropzone = generateUploadDropzone<OurFileRouter>();
export const UploadButton = generateUploadButton<OurFileRouter>();
export const { useUploadThing, uploadFiles } =
	generateReactHelpers<OurFileRouter>();
