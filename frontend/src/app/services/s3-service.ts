const apiUrl = "http://localhost:3002/api/v1";

export async function getSignedPutUrl(imageData: {
  fileName: string;
  contentType: string;
}) {
  const response = await fetch(`${apiUrl}/s3/get-signed-put-url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(imageData),
  });
  return response.json();
}

export async function uploadFileOnS3(signedPutUrl: string, file: File) {
  const response = await fetch(signedPutUrl, {
    method: "PUT",
    body: file,
  });

  if (!response.ok) {
    console.error("Failed to upload file on S3");
    throw new Error("Failed to upload file on S3");
  }

  return true;
}
