'use client';
import React, { useState } from 'react';
import { json } from 'stream/consumers';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first!');
      return;
    }

    
    // const blob = new Blob([selectedFile], { type: 'audio/wav' });
    // console.log('blob', blob);
    const formData = new FormData();
    formData.append('file', selectedFile);
 

    try {
      const response = await fetch('/api/uploadSound', {
 
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('File uploaded successfully!');
      } else {
        alert('File upload failed!');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file!');
    }
  };

  
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-white">
        <div>
      <input type="file" onChange={handleFileChange} typeof='wav' />
      <button className='bg-green-400 p-5 text-black' onClick={handleUpload}>
        Start
      </button>
    </div>
    </main>
  );
}
