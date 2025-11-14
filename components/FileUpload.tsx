
import React, { useState, useCallback } from 'react';
import { UploadedFile } from '../types';
import UploadIcon from './icons/UploadIcon';
import FileIcon from './icons/FileIcon';

interface FileUploadProps {
    onFilesChange: (files: UploadedFile[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFilesChange }) => {
    const [dragging, setDragging] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

    const handleFileRead = (file: File): Promise<UploadedFile> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target && typeof event.target.result === 'string') {
                    resolve({ name: file.name, content: event.target.result });
                } else {
                    reject(new Error('Failed to read file content.'));
                }
            };
            reader.onerror = () => reject(new Error('Error reading file.'));
            reader.readAsText(file);
        });
    };

    const processFiles = useCallback(async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        
        const fileList = Array.from(files);
        setUploadedFiles(fileList);

        try {
            const fileContents = await Promise.all(fileList.map(handleFileRead));
            onFilesChange(fileContents);
        } catch (error) {
            console.error(error);
            // Handle file read error UI
        }
    }, [onFilesChange]);

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
        processFiles(e.dataTransfer.files);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        processFiles(e.target.files);
    };

    return (
        <div className="flex flex-col items-center">
            <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`w-full p-8 border-2 border-dashed rounded-xl transition-colors duration-300 ${dragging ? 'border-indigo-400 bg-slate-700/50' : 'border-slate-600 bg-slate-800/50'}`}
            >
                <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    multiple
                    onChange={handleFileSelect}
                />
                <label htmlFor="file-upload" className="flex flex-col items-center text-center cursor-pointer">
                    <UploadIcon className="w-12 h-12 text-slate-400 mb-4" />
                    <p className="font-semibold text-slate-300">
                        Drag & drop files here or <span className="text-indigo-400">browse</span>
                    </p>
                    <p className="text-sm text-slate-500 mt-1">Supports text-based files like code (.js, .py, .css), documents (.txt, .md), etc.</p>
                </label>
            </div>
            {uploadedFiles.length > 0 && (
                <div className="w-full mt-6">
                    <h3 className="font-semibold text-lg mb-2">Uploaded Files:</h3>
                    <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {uploadedFiles.map((file, index) => (
                            <li key={index} className="flex items-center bg-slate-700 p-2 rounded-md">
                                <FileIcon className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                                <span className="text-slate-300 truncate">{file.name}</span>
                                <span className="ml-auto text-xs text-slate-500 shrink-0">{(file.size / 1024).toFixed(2)} KB</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default FileUpload;
