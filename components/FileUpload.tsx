import React, { useState, useCallback, useEffect } from 'react';
import { UploadedFile } from '../types';
import UploadIcon from './icons/UploadIcon';
import FileIcon from './icons/FileIcon';
import ClipboardIcon from './icons/ClipboardIcon';

interface FileUploadProps {
    onFilesChange: (files: UploadedFile[]) => void;
}

interface DisplayFile {
    name: string;
    size: number;
    isNote?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFilesChange }) => {
    const [dragging, setDragging] = useState(false);
    const [localFiles, setLocalFiles] = useState<File[]>([]);
    const [pastedText, setPastedText] = useState('');
    const [displayFiles, setDisplayFiles] = useState<DisplayFile[]>([]);

    const handleFileRead = useCallback((file: File): Promise<UploadedFile> => {
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
    }, []);

    useEffect(() => {
        const processAllInputs = async () => {
            try {
                const fileContents = await Promise.all(localFiles.map(handleFileRead));
                
                const allInputs: UploadedFile[] = [...fileContents];
                const allDisplayFiles: DisplayFile[] = localFiles.map(f => ({ name: f.name, size: f.size }));

                if (pastedText.trim()) {
                    allInputs.push({ name: 'Pasted Notes.txt', content: pastedText });
                    allDisplayFiles.push({ name: 'Pasted Notes.txt', size: new Blob([pastedText]).size, isNote: true });
                }

                setDisplayFiles(allDisplayFiles);
                onFilesChange(allInputs);
            } catch (error) {
                 console.error("Error processing files:", error);
            }
        };
        processAllInputs();
    }, [localFiles, pastedText, onFilesChange, handleFileRead]);


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
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setLocalFiles(prevFiles => [...prevFiles, ...Array.from(e.dataTransfer.files)]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
         if (e.target.files && e.target.files.length > 0) {
            setLocalFiles(prevFiles => [...prevFiles, ...Array.from(e.target.files!)]);
        }
    };

    return (
        <div className="flex flex-col items-center">
            {/* File Upload Section */}
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
                    <p className="text-sm text-slate-500 mt-1">Supports text-based files like code, documents, etc.</p>
                </label>
            </div>
            
            {/* Separator */}
            <div className="w-full flex items-center justify-center my-6">
                <div className="flex-grow border-t border-slate-700"></div>
                <span className="flex-shrink mx-4 text-slate-500 text-sm font-semibold">OR</span>
                <div className="flex-grow border-t border-slate-700"></div>
            </div>

            {/* Paste Text Section */}
            <div className="w-full">
                 <label htmlFor="paste-area" className="flex items-center gap-2 mb-2 font-semibold text-slate-300">
                    <ClipboardIcon className="w-5 h-5 text-slate-400" />
                    <span>Add Notes or Paste Text</span>
                </label>
                <textarea
                    id="paste-area"
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="Paste your content here..."
                    className="w-full h-32 p-3 bg-slate-800 border-2 border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-slate-300 resize-y"
                />
            </div>

            {displayFiles.length > 0 && (
                <div className="w-full mt-6">
                    <h3 className="font-semibold text-lg mb-2">Content to Analyze:</h3>
                    <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {displayFiles.map((file, index) => (
                            <li key={index} className="flex items-center bg-slate-700 p-2 rounded-md">
                                {file.isNote ? 
                                    <ClipboardIcon className="w-5 h-5 text-cyan-400 mr-3 shrink-0" /> :
                                    <FileIcon className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                                }
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