import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Copy, Download, Sparkles, Terminal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { generateScript } from '@/utils/aiHelpers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ScriptEditor = () => {
  const [script, setScript] = useState('#!/bin/bash\n\n# Your script here\n');
  const [apiKey, setApiKey] = useState(localStorage.getItem('GOOGLE_API_KEY') || '');
  const [userRequest, setUserRequest] = useState('');
  const [previewScript, setPreviewScript] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScript, setGeneratedScript] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setPreviewScript(script);
  }, [script]);

  useEffect(() => {
    if (isGenerating && generatedScript && currentIndex < generatedScript.length) {
      const timer = setTimeout(() => {
        setPreviewScript(generatedScript.substring(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 10);
      
      return () => clearTimeout(timer);
    } else if (currentIndex >= generatedScript.length && generatedScript) {
      setScript(generatedScript);
      setIsGenerating(false);
      setGeneratedScript('');
      setCurrentIndex(0);
      toast.success('Script updated successfully!');
    }
  }, [currentIndex, generatedScript, isGenerating]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(script);
      toast.success('Script copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy script');
    }
  };

  const downloadScript = () => {
    const blob = new Blob([script], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'script.sh';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success('Script downloaded!');
  };

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    localStorage.setItem('GOOGLE_API_KEY', value);
    toast.success('Google API key saved');
  };

  const analyzeScript = async () => {
    if (!userRequest.trim()) {
      toast.error('Please enter what changes you want to make to the script');
      return;
    }

    setIsGenerating(true);
    setCurrentIndex(0);
    toast.info('AI is analyzing your request...');
    
    try {
      const newScript = await generateScript(apiKey, userRequest, script);
      
      if (newScript) {
        setGeneratedScript(newScript);
      } else {
        toast.error('Could not generate appropriate script');
        setIsGenerating(false);
      }
    } catch (error) {
      console.error('AI Analysis error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to analyze script. Please check your API key and try again.');
      setIsGenerating(false);
    }
  };

  return (
    <div className="container max-w-7xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="w-6 h-6 text-primary" />
            Shell Script Creator
          </CardTitle>
          <CardDescription>
            Create and modify shell scripts with AI assistance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/70">Google API Key</label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => handleApiKeyChange(e.target.value)}
                placeholder="Enter Google API Key"
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/70">What would you like to do?</label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={userRequest}
                  onChange={(e) => setUserRequest(e.target.value)}
                  placeholder="E.g., 'Add menu for Browsers' or 'Add menu for Development Tools'"
                  className="flex-1"
                />
                <Button 
                  variant="default" 
                  onClick={analyzeScript} 
                  disabled={isGenerating}
                  className="shrink-0"
                >
                  <Sparkles className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                  {isGenerating ? 'Analyzing...' : 'AI Analysis'}
                </Button>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground/70">Editor</label>
                <div className="space-x-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadScript}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
              <Textarea
                value={script}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setScript(newValue);
                  setPreviewScript(newValue);
                }}
                className="min-h-[500px] font-mono bg-editor-bg text-editor-text p-4 resize-none"
                placeholder="Enter your shell script here..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/70">Live Preview</label>
              <Textarea
                value={previewScript}
                readOnly
                className={`min-h-[500px] font-mono ${
                  isGenerating ? 'bg-yellow-50 dark:bg-yellow-900/10' : 'bg-gray-100 dark:bg-gray-800'
                } text-editor-text p-4 resize-none transition-colors duration-300`}
              />
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Press Ctrl + S to save, Ctrl + Shift + C to copy
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScriptEditor;