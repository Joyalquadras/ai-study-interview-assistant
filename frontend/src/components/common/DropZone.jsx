import React, { useRef, useState } from 'react';

export const DropZone = ({ onFileSelected, accept = '.pdf', maxSize = 5 * 1024 * 1024 }) => {
  const inputRef = useRef();
  const [hover, setHover] = useState(false);

  const handleFiles = (file) => {
    if (!file) return;
    if (accept && !file.name.toLowerCase().endsWith(accept.replace('.', ''))) {
      return onFileSelected(null, 'Invalid file type');
    }
    if (file.size > maxSize) {
      return onFileSelected(null, 'File too large');
    }
    onFileSelected(file);
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setHover(true);
        }}
        onDragLeave={() => setHover(false)}
        onDrop={(e) => {
          e.preventDefault();
          setHover(false);
          const file = e.dataTransfer.files[0];
          handleFiles(file);
        }}
        onClick={() => inputRef.current.click()}
        className={`cursor-pointer border-2 border-dashed rounded-lg p-8 text-center ${
          hover ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
        }`}
      >
        <p className="text-gray-600">Drag & drop your PDF here, or click to browse</p>
        <p className="text-sm text-gray-400 mt-2">Only PDF files, max 5MB</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files[0])}
      />
    </div>
  );
};

export default DropZone;
