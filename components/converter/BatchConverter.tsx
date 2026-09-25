"use client";

import React, { useState } from "react";
import { FileUploader } from "@/components/tools/FileUploader";
import { FormatSelector } from "./FormatSelector";
import { BatchQueue, BatchItem } from "@/components/tools/BatchQueue";
import { getAllFormats, getFormatById } from "@/lib/converter/formatRegistry";
import { detectFileFormat } from "@/lib/converter/detector";
import { defaultBrowserProvider } from "@/lib/converter/providers/browser/browserProvider";

export function BatchConverter() {
  const [files, setFiles] = useState<File[]>([]);
  const [targetFormatId, setTargetFormatId] = useState<string>("webp");
  const [queueItems, setQueueItems] = useState<BatchItem<File, Blob>[]>([]);

  // When files change, prepare queue
  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles);
    setQueueItems(
      newFiles.map((file, i) => ({
        id: `batch_${i}_${file.name}`,
        file,
        name: file.name,
        size: file.size,
        status: "pending",
        progress: 0,
      }))
    );
  };

  const outputFormats = getAllFormats().filter((f) => f.canOutput && f.status !== "COMING_SOON");

  const processBatchItem = async (
    file: File,
    item: BatchItem<File, Blob>
  ): Promise<{ result: Blob; outputSize?: number }> => {
    const detected = await detectFileFormat(file);
    const res = await defaultBrowserProvider.convert({
      id: item.id,
      file,
      inputFormat: detected.format.id,
      outputFormat: targetFormatId,
    });
    return {
      result: res.blob,
      outputSize: res.outputSize,
    };
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-6 bg-card border border-border rounded-2xl shadow-sm">
      <FileUploader
        accept="*/*"
        multiple={true}
        maxFiles={30}
        files={files}
        onFilesChange={handleFilesChange}
        title="Batch File Converter"
        description="Upload up to 30 files to convert concurrently"
      />

      {files.length > 0 && (
        <div className="space-y-4 pt-2 border-t border-border">
          <div className="max-w-xs">
            <FormatSelector
              availableFormats={outputFormats}
              selectedFormatId={targetFormatId}
              onSelectFormat={setTargetFormatId}
              label="Convert All To"
            />
          </div>

          <BatchQueue<File, Blob>
            items={queueItems}
            onItemsChange={setQueueItems}
            processor={processBatchItem}
            downloadFilenameGenerator={(item) => {
              const baseName = item.name.replace(/\.[^/.]+$/, "");
              return `${baseName}.${targetFormatId}`;
            }}
            zipFilename={`converted_batch_${targetFormatId}.zip`}
            title="Batch Conversion Queue"
            actionButtonLabel={`Convert All to ${targetFormatId.toUpperCase()}`}
          />
        </div>
      )}
    </div>
  );
}
