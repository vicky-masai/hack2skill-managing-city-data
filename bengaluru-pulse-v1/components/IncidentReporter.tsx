
import React, { useState, useCallback, useRef } from 'react';
import { analyzeIncident } from '../services/geminiService';
import { IncidentReport } from '../types';
import Spinner from './Spinner';
import { UploadCloudIcon, CheckCircleIcon, XIcon, LightbulbIcon, ShieldCheckIcon } from './icons';

interface IncidentReporterProps {
  isOpen: boolean;
  onClose: () => void;
}

const IncidentReporter: React.FC<IncidentReporterProps> = ({ isOpen, onClose }) => {
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<IncidentReport | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        // result contains the base64 string, remove the prefix
        const base64String = (reader.result as string).split(',')[1];
        setImageBase64(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetState = useCallback(() => {
    setDescription('');
    setImage(null);
    setImageBase64(null);
    setIsLoading(false);
    setError(null);
    setReport(null);
    if(fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSubmit = async () => {
    if (!description || !imageBase64) {
      setError('Please provide both a description and an image.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setReport(null);

    try {
      const result = await analyzeIncident(imageBase64, description);
      setReport(result);
    } catch (err) {
      console.error('Error analyzing incident:', err);
      setError('Failed to analyze the incident. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-brand-bg-light rounded-2xl shadow-xl w-full max-w-2xl transform transition-all max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold">Report a City Incident</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-white">
            <XIcon />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {report ? (
            <div className="text-center">
              <CheckCircleIcon className="mx-auto h-16 w-16 text-status-green" />
              <h3 className="mt-4 text-2xl font-bold">Report Analyzed</h3>
              <p className="mt-2 text-brand-text-secondary">Our AI agent has processed your report.</p>
              <div className="mt-6 text-left bg-brand-surface p-4 rounded-lg space-y-4">
                  <div>
                      <h4 className="font-semibold text-brand-text-secondary">Incident Category</h4>
                      <p className="text-lg font-medium text-brand-text-primary">{report.category}</p>
                  </div>
                  <div>
                      <h4 className="font-semibold text-brand-text-secondary">AI Summary</h4>
                      <p className="text-lg font-medium text-brand-text-primary">{report.summary}</p>
                  </div>
                  <div className="bg-brand-primary/10 p-4 rounded-lg flex items-center gap-4">
                    <ShieldCheckIcon className="h-8 w-8 text-brand-primary flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-brand-primary">Suggested Action</h4>
                      <p className="text-brand-text-primary">Forwarding this report to the <span className="font-bold">{report.suggestedDepartment}</span> for review.</p>
                    </div>
                  </div>
              </div>
              <button onClick={handleClose} className="mt-8 w-full bg-brand-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-500 transition-colors">
                Close
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="description" className="font-medium text-brand-text-secondary">Describe the incident</label>
                <textarea
                  id="description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., 'A large tree has fallen and is blocking the road near the bus stop.'"
                  className="w-full bg-brand-surface border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-brand-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="font-medium text-brand-text-secondary">Upload a Photo</label>
                <div 
                  className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer hover:border-brand-primary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="space-y-1 text-center">
                    {image ? (
                        <p className="text-brand-text-primary font-medium">{image.name}</p>
                    ) : (
                        <>
                        <UploadCloudIcon className="mx-auto h-12 w-12 text-gray-500" />
                        <p className="text-sm text-gray-500">
                          <span className="font-semibold text-brand-primary">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-600">PNG, JPG, GIF up to 10MB</p>
                        </>
                    )}
                  </div>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>
              {error && <p className="text-status-red text-sm">{error}</p>}
              <div className="flex items-start gap-3 bg-yellow-500/10 p-4 rounded-lg">
                <LightbulbIcon className="h-6 w-6 text-status-yellow flex-shrink-0 mt-1" />
                <p className="text-yellow-300 text-sm">Your geo-location will be automatically included with the report for accurate plotting and response.</p>
              </div>
              <button onClick={handleSubmit} disabled={isLoading || !description || !image} className="w-full flex justify-center items-center gap-3 bg-brand-secondary text-white font-bold py-3 px-6 rounded-lg hover:bg-green-500 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                {isLoading ? <><Spinner /> Analyzing Incident...</> : 'Submit Report with AI Analysis'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IncidentReporter;
