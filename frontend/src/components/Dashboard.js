// components/Dashboard.js - Fixed version with proper input handling
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  BarChart3, 
  Building2, 
  Search, 
  FileText, 
  TrendingUp, 
  Globe, 
  Briefcase,
  ChevronRight,
  Upload,
  RefreshCw,
  Star,
  ArrowUpRight,
  Layers,
  AlertCircle,
  CheckCircle,
  X,
  Download,
  History,
  Settings,
  Clock,
  Database,
  Filter,
  Trash2,
  Eye,
  RotateCcw,
  BookOpen,
  Zap,
  Target,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

// Move tab components outside Dashboard to prevent re-creation on each render
const MarketExplorerTab = ({ 
  marketInput, setMarketInput, loading, error, analyzeCompleteMarket, analyzeMarket,
  globalMd, setGlobalMd, verticalData, setVerticalData, horizontalData, setHorizontalData,
  marketAnalyzed, verticalEntries, horizontalEntries, selectedVertical, setSelectedVertical,
  selectedHorizontal, setSelectedHorizontal, handleSegmentSelection, segmentDetails, 
  segmentCompanies, loadingSegment, ActionButton, LoadingSpinner, ErrorDisplay, 
  FormattedContent, TrendingUp, Globe, Layers, Target, BarChart3, Download, setError,
  RefreshCw, sidebarOpen, setSidebarOpen, sidebarData, AnalysisSidebar, Building2
}) => (
  <div className="space-y-8">
    {/* Analysis Sidebar */}
    <AnalysisSidebar 
      isOpen={sidebarOpen}
      data={sidebarData}
      onClose={() => setSidebarOpen(false)}
    />
    
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <BarChart3 className="w-6 h-6 text-blue-600 mr-3" />
        Market Sub-Segment Explorer
      </h2>
      
      {/* Market Input Form */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <div className="lg:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter a market (e.g. AI, Plastics, EV Batteries)
          </label>
          <input
            type="text"
            value={marketInput}
            onChange={(e) => setMarketInput(e.target.value)}
            placeholder="e.g., Electric Vehicles, AI Healthcare, Renewable Energy"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && marketInput.trim()) {
                analyzeCompleteMarket(marketInput);
              }
            }}
          />
        </div>
        <div className="flex items-end">
          <ActionButton 
            onClick={() => analyzeCompleteMarket(marketInput)}
            loading={loading}
            disabled={!marketInput.trim()}
            icon={TrendingUp}
          >
            Analyze Market
          </ActionButton>
        </div>
      </div>

      {/* Individual Analysis Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <ActionButton 
          onClick={() => analyzeMarket(marketInput, 'global')}
          loading={loading}
          disabled={!marketInput.trim()}
          variant="secondary"
          icon={Globe}
        >
          Global Overview
        </ActionButton>
        <ActionButton 
          onClick={() => analyzeMarket(marketInput, 'vertical')}
          loading={loading}
          disabled={!marketInput.trim()}
          variant="secondary"
          icon={Layers}
        >
          Vertical Segments
        </ActionButton>
        <ActionButton 
          onClick={() => analyzeMarket(marketInput, 'horizontal')}
          loading={loading}
          disabled={!marketInput.trim()}
          variant="secondary"
          icon={Target}
        >
          Horizontal Markets
        </ActionButton>
      </div>

      {error && <ErrorDisplay error={error} onRetry={() => setError(null)} />}
      {loading && <LoadingSpinner message="Analyzing market data..." />}

      {/* Results Display */}
      {globalMd && (
        <FormattedContent
          content={globalMd}
          title={`Market Overview - ${marketAnalyzed}`}
          analysisType="global"
          onClose={() => setGlobalMd(null)}
        />
      )}

      {verticalData && (
        <FormattedContent
          content={verticalData}
          title="🏗️ Vertical Sub-markets"
          analysisType="vertical"
          onClose={() => setVerticalData(null)}
        />
      )}

      {horizontalData && (
        <FormattedContent
          content={horizontalData}
          title=" Horizontal Sub-markets"
          analysisType="horizontal"
          onClose={() => setHorizontalData(null)}
        />
      )}

      {/* Download Button */}
      {(globalMd || verticalData || horizontalData) && (
        <div className="mt-6">
          <ActionButton
            onClick={() => {
              const content = `# Market Analysis: ${marketAnalyzed}\n\n${globalMd || ''}\n\n${verticalData || ''}\n\n${horizontalData || ''}`;
              const blob = new Blob([content], { type: 'text/markdown' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${marketAnalyzed?.replace(' ', '_') || 'market'}_analysis.md`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            variant="secondary"
            icon={Download}
          >
            Download Markdown
          </ActionButton>
        </div>
      )}
    </div>
    
    

    {/* Radio Button Style Market Entry Selection */}
    
  </div>
); 

const PdfInsightTab = ({ 
  uploadedPdfName, pdfChunks, handlePdfUpload, pdfQuery, setPdfQuery, queryPdf, 
  loading, error, pdfResponses, copyToClipboard, formatContent, ActionButton, 
  LoadingSpinner, ErrorDisplay, Upload, FileText, Search, Copy, Download 
}) => (
  <div className="space-y-8">
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <FileText className="w-6 h-6 text-blue-600 mr-3" />
        PDF-Based Market Insights
      </h2>

      {/* Current PDF Info */}
      {uploadedPdfName && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-900">Currently loaded: {uploadedPdfName}</p>
              <p className="text-sm text-blue-700">Chunks available: {pdfChunks.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* File Upload */}
      <div 
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors mb-6"
        onDrop={(e) => {
          e.preventDefault();
          const files = Array.from(e.dataTransfer.files).filter(file => file.type === 'application/pdf');
          if (files.length > 0) handlePdfUpload(files);
        }}
        onDragOver={(e) => e.preventDefault()}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Upload PDF Document</h3>
        <p className="text-gray-600 mb-4">Drag and drop a PDF file here, or click to browse</p>
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => handlePdfUpload(e.target.files)}
          className="hidden"
          id="pdf-upload"
        />
        <label htmlFor="pdf-upload">
          <ActionButton variant="secondary" icon={Upload}>
            Select PDF File
          </ActionButton>
        </label>
      </div>

      {/* Query Form */}
      {pdfChunks.length > 0 && (
        <div className="border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ask Your PDF</h3>
          <div className="flex space-x-4">
            <input
              type="text"
              value={pdfQuery}
              onChange={(e) => setPdfQuery(e.target.value)}
              placeholder="Enter a question to ask your uploaded PDF..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && queryPdf()}
            />
            <ActionButton
              onClick={queryPdf}
              loading={loading}
              disabled={!pdfQuery.trim()}
              icon={Search}
            >
              Ask
            </ActionButton>
          </div>
        </div>
      )}

      {loading && <LoadingSpinner message="Querying your uploaded PDF..." />}
      {error && <ErrorDisplay error={error} />}

      {/* Q&A History */}
      {pdfResponses.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📚 Previous Questions & Answers</h3>
          <div className="space-y-4">
            {pdfResponses.map((qa, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Q{index + 1}: {qa.question}</h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">{qa.timestamp}</span>
                    <button
                      onClick={() => copyToClipboard(qa.answer)}
                      className="text-gray-400 hover:text-gray-600"
                      title="Copy answer"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div 
                  className="bg-gray-50 rounded p-3 mt-2 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: formatContent(qa.answer) }}
                />
                <div className="mt-2">
                  <ActionButton
                    onClick={() => {
                      const blob = new Blob([qa.answer], { type: 'text/markdown' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `pdf_response_${index + 1}.md`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    variant="secondary"
                    size="sm"
                    icon={Download}
                  >
                    Download Response
                  </ActionButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

const MAExplorerTab = ({ 
  maMarket, setMaMarket, maTimeframe, setMaTimeframe, searchMADeals, loading, error,
  maResults, setMaResults, ActionButton, LoadingSpinner, ErrorDisplay, FormattedContent,
  Briefcase, Search 
}) => (
  <div className="space-y-8">
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <Briefcase className="w-6 h-6 text-blue-600 mr-3" />
        Mergers & Acquisitions Explorer
      </h2>

      <p className="text-gray-600 mb-6">Explore recent M&A activity related to the market.</p>

      {/* Search Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Market or Industry
          </label>
          <input
            type="text"
            value={maMarket}
            onChange={(e) => setMaMarket(e.target.value)}
            placeholder="e.g., Fintech, Healthcare AI, Clean Energy"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timeframe
          </label>
          <select
            value={maTimeframe}
            onChange={(e) => setMaTimeframe(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option>Last 6 months</option>
            <option>Last year</option>
            <option>Last 2 years</option>
            <option>Last 5 years</option>
          </select>
        </div>
        <div className="flex items-end">
          <ActionButton
            onClick={searchMADeals}
            loading={loading}
            disabled={!maMarket.trim()}
            icon={Search}
          >
            Search M&A Activity
          </ActionButton>
        </div>
      </div>

      {loading && <LoadingSpinner message="Searching for M&A activity..." />}
      {error && <ErrorDisplay error={error} />}

      {/* Results */}
      {maResults && !loading && (
        <FormattedContent
          content={maResults}
          title=" M&A Analysis Results"
          onClose={() => setMaResults(null)}
        />
      )}
    </div>
  </div>
);

const ComparePdfTab = ({
  comparisonFiles,
  setComparisonFiles,
  comparisonPrompt,
  setComparisonPrompt,
  comparisonResults,
  setComparisonResults,
  enableWebSearch,
  setEnableWebSearch,
  webSearchPrompt,
  setWebSearchPrompt,
  loading,
  setLoading,
  error,
  setError,
  ActionButton,
  LoadingSpinner,
  ErrorDisplay,
  formatContent,
  apiCall
}) => {
  const handlePdfComparisonUpload = (files) => {
    if (!files || files.length === 0) return;
  
    const pdfFiles = Array.from(files).filter(file => file.type === "application/pdf");
    
    // Append to existing files, ensuring max 5 unique PDFs
    setComparisonFiles(prev => {
      const combined = [...prev, ...pdfFiles];
      // Remove duplicates by name
      const unique = combined.filter(
        (file, index, self) => index === self.findIndex(f => f.name === file.name)
      );
      return unique.slice(0, 5); // limit to 5
    });
  };
  

  const runComparison = async () => {
    if (!comparisonFiles || comparisonFiles.length < 2) {
      setError("Please upload at least two PDFs to compare.");
      return;
    }
    if (!comparisonPrompt.trim()) {
      setError("Please enter a prompt for comparison.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      comparisonFiles.forEach(file => formData.append("files", file));
      formData.append("prompt", comparisonPrompt);

      // Backend should return { filename: result } dictionary
      const response = await apiCall("/documents/compare", "POST", formData, true);
      const comparisonDict = response.data.comparison_results;
      let results = { ...comparisonDict };

      if (enableWebSearch) {
        const webPrompt = webSearchPrompt.trim() || comparisonPrompt;
        const webResponse = await apiCall("/research/web-insights", "POST", { 
          query: webPrompt, 
          search_depth: "standard", 
          focus_area: "general" 
          });
        results[" Web Search Insights"] = webResponse.data || "⚠️ No web results.";
      }

      setComparisonResults(results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearComparisonData = () => {
    setComparisonFiles([]);
    setComparisonPrompt("");
    setComparisonResults(null);
    setWebSearchPrompt("");
    setEnableWebSearch(false);
    setError(null);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          Compare Multiple PDFs
        </h2>

        

        {/* Web search toggle */}
        <div className="mb-4 flex items-center space-x-2">
          <input
            type="checkbox"
            checked={enableWebSearch}
            onChange={(e) => setEnableWebSearch(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded"
          />
          <label className="text-sm font-medium text-gray-700">Enable Web Search</label>
        </div>

        {enableWebSearch && (
          <input
            type="text"
            value={webSearchPrompt}
            onChange={(e) => setWebSearchPrompt(e.target.value)}
            placeholder="Enter a web search prompt (optional)"
            className="w-full px-4 py-3 mb-6 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        )}

        {/* File upload */}
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors mb-6"
          onDrop={(e) => {
            e.preventDefault();
            const files = Array.from(e.dataTransfer.files).filter(file => file.type === "application/pdf");
            if (files.length > 0) handlePdfComparisonUpload(files);
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          <h3 className="text-lg font-medium text-gray-900 mb-2">Upload up to 5 PDFs</h3>
          <p className="text-gray-600 mb-4">Drag & drop or click to browse</p>
          <input
            type="file"
            accept=".pdf"
            multiple
            onChange={(e) => handlePdfComparisonUpload(e.target.files)}
            className="hidden"
            id="compare-pdf-upload"
          />
          <label htmlFor="compare-pdf-upload">
            <ActionButton variant="secondary">Select PDF Files</ActionButton>
          </label>
        </div>
        {/* Show selected files */}
        {comparisonFiles.length > 0 && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="font-medium text-blue-900 mb-2">
              Selected PDFs ({comparisonFiles.length}/5):
            </p>
            <ul className="text-sm text-blue-800 list-disc ml-6 space-y-1">
              {comparisonFiles.map((file, idx) => (
                <li key={idx}>{file.name}</li>
              ))}
            </ul>
            <p className="text-xs text-blue-600 mt-2">
              These files will be uploaded when you click <strong>Compare PDFs</strong>.
            </p>
          </div>
        )}

        {/* Prompt input */}
        {comparisonFiles.length > 0 && (
          <input
            type="text"
            value={comparisonPrompt}
            onChange={(e) => setComparisonPrompt(e.target.value)}
            placeholder="Enter a comparison prompt (e.g. 'Compare market sizes')"
            className="w-full px-4 py-3 mb-6 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        )}

        {loading && <LoadingSpinner message="Analyzing and comparing PDFs..." />}
        {error && <ErrorDisplay error={error} />}

        <div className="flex space-x-4">
          <ActionButton
            onClick={runComparison}
            loading={loading}
            disabled={comparisonFiles.length < 2 || !comparisonPrompt.trim()}
          >
            Compare PDFs
          </ActionButton>
          <ActionButton variant="secondary" onClick={clearComparisonData}>
            Clear Comparison Data
          </ActionButton>
        </div>
        {comparisonResults && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Comparison Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(comparisonResults).map(([filename, result], idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50 overflow-auto max-h-96">
                  <h4 className="font-medium text-gray-900 mb-2">{filename}</h4>
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: formatContent(result) }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const HistoryTab = (props) => {
  const {
    marketHistory,
    pdfHistory,
    popularMarkets,
    loadHistory,
    loading,
    error,
    ActionButton,
    LoadingSpinner,
    ErrorDisplay,
    apiCall,              
    showToast,           
    setGlobalMd,
    setVerticalData,
    setHorizontalData,
    setMarketAnalyzed,
    setActiveTab,
    setUploadedPdfName,
    setPdfChunks,
    setCurrentPdfId,
    setPdfResponses,
    setMarketHistory,
    setPdfHistory      
  } = props;

  // 🟢 Here you can define helper functions
  const deleteHistoryItem = async (type, idOrName) => {
    try {
      const endpoint = type === "market"
        ? `/history/delete-market/${idOrName}`
        : `/history/delete-pdf/${idOrName}`;
  
      const res = await apiCall(endpoint, "DELETE");
  
      if (res.success) {
        showToast(`${type === "market" ? "Market analysis" : "PDF session"} deleted!`, "success");
        if (type === "market") {
          setMarketHistory(prev => prev.filter(item => item.id !== idOrName));
        } else {
          setPdfHistory(prev => prev.filter(item => item.pdf_id !== idOrName));
        }
      } else {
        showToast(`Delete failed: ${res.error || "Unknown error"}`, "error");
      }
    } catch (err) {
      console.error("Delete error:", err);
      showToast(`Failed to delete: ${err.message || err.toString()}`, "error");
    }
  };
  

  // 🟢 This is the actual return
  return (
  <div className="space-y-8">
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <History className="w-6 h-6 text-blue-600 mr-3" />
        History Browser
      </h2>

      <ActionButton onClick={loadHistory} loading={loading}>
        Refresh History
      </ActionButton>

      {loading && <LoadingSpinner message="Loading history..." />}
      {error && <ErrorDisplay error={error} />}

      {/* Market Analysis History */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Market Analysis History</h3>
        {marketHistory.length === 0 ? (
          <p className="text-gray-600">No history yet.</p>
        ) : (
          <ul className="space-y-2">
            {marketHistory.map((item, idx) => (
              <li
                key={idx}
                className="border p-3 rounded-lg text-gray-800 hover:bg-blue-50 cursor-pointer transition-colors"
                onClick={async () => {
                  try {
                    const res = await apiCall(`/restore/market-analysis/${encodeURIComponent(item.market_name)}`, 'POST');
                    if (res.success) {
                      setGlobalMd(res.data.global || null);
                      setVerticalData(res.data.vertical || null);
                      setHorizontalData(res.data.horizontal || null);
                      setMarketAnalyzed(item.market_name);
                      setActiveTab('market-explorer');
                      showToast(`Restored market analysis for ${item.market_name}`, 'success');
                    }
                  } catch (err) {
                    showToast(`Failed to restore: ${err.message}`, 'error');
                  }
                }}
              >
                <strong>{item.market_name}</strong> – {item.query_type}  
                <div className="text-xs text-gray-500">{item.created_at}</div>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); 
                    deleteHistoryItem("market", item.id);
                  }}
                  className="ml-3 text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50"
                  title="Delete this history"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* PDF History */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">PDF Sessions</h3>
        {pdfHistory.length === 0 ? (
          <p className="text-gray-600">No PDFs uploaded yet.</p>
        ) : (
          <ul className="space-y-2">
            {pdfHistory.map((item, idx) => (
              <li
                key={idx}
                className="border p-3 rounded-lg text-gray-800 hover:bg-blue-50 cursor-pointer transition-colors"
                onClick={async () => {
                  try {
                    const res = await apiCall(`/restore/pdf-session/${item.pdf_id}`, 'POST');
                    if (res.success) {
                      setUploadedPdfName(item.file_name);
                      setPdfChunks(res.data.chunks || []);
                      setCurrentPdfId(item.pdf_id);
                      setPdfResponses(res.data.qa_history || []);
                      setActiveTab('pdf-insight');
                      showToast(`Restored PDF session: ${item.file_name}`, 'success');
                    }
                  } catch (err) {
                    showToast(`Failed to restore: ${err.message}`, 'error');
                  }
                }}
              >
                <strong>{item.file_name}</strong> – {item.chunks_count} chunks  
                <div className="text-xs text-gray-500">{item.processed_at}</div>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); 
                    deleteHistoryItem("pdf", item.pdf_id);
                  }}
                  className="ml-3 text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50"
                  title="Delete this history"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>

        )}
      </div>

      {/* Popular Markets */}
      
    </div>
  </div>
);
};

const AdminDashboardTab = ({
  dbStats,
  analytics,
  setDbStats,
  setAnalytics,
  loadAdminData,
  loading,
  error,
  ActionButton,
  LoadingSpinner,
  ErrorDisplay
}) => {
  const [lastRefresh, setLastRefresh] = React.useState(null);

  React.useEffect(() => {
    const interval = setInterval(() => {
      loadAdminData();
      setLastRefresh(new Date().toLocaleTimeString());
    }, 30000);

    return () => clearInterval(interval);
  }, [loadAdminData]);

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Settings className="w-6 h-6 text-blue-600 mr-3" />
          Admin Dashboard
        </h2>

        <div className="flex items-center justify-between mb-4">
          <ActionButton
            onClick={() => { loadAdminData(); setLastRefresh(new Date().toLocaleTimeString()); }}
            loading={loading}
          >
            Refresh Admin Data
          </ActionButton>
          {lastRefresh && (
            <p className="text-sm text-gray-500">
              Last refresh: {lastRefresh}
            </p>
          )}
        </div>

        {loading && <LoadingSpinner message="Loading admin data..." />}
        {error && <ErrorDisplay error={error} />}

        {/* Database Stats as Colored Cards */}
        {dbStats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            <div className="bg-blue-100 p-6 rounded-xl shadow flex flex-col items-start">
              <Database className="w-8 h-8 text-blue-600 mb-2" />
              <p className="text-gray-600 text-sm">Market Cache Count</p>
              <h3 className="text-2xl font-bold text-blue-900">{dbStats.market_cache_count}</h3>
            </div>
            <div className="bg-green-100 p-6 rounded-xl shadow flex flex-col items-start">
              <FileText className="w-8 h-8 text-green-600 mb-2" />
              <p className="text-gray-600 text-sm">PDF History</p>
              <h3 className="text-2xl font-bold text-green-900">{dbStats.pdf_history_count}</h3>
            </div>
            <div className="bg-yellow-100 p-6 rounded-xl shadow flex flex-col items-start">
              <Briefcase className="w-8 h-8 text-yellow-600 mb-2" />
              <p className="text-gray-600 text-sm">M&A Searches</p>
              <h3 className="text-2xl font-bold text-yellow-900">{dbStats.ma_searches_count}</h3>
            </div>
            <div className="bg-purple-100 p-6 rounded-xl shadow flex flex-col items-start">
              <Database className="w-8 h-8 text-purple-600 mb-2" />
              <p className="text-gray-600 text-sm">DB Size (MB)</p>
              <h3 className="text-2xl font-bold text-purple-900">{dbStats.db_size_mb?.toFixed(2)}</h3>
            </div>
          </div>
        )}

        {/* Total Events Summary */}
        {analytics && (
          <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-gray-700 text-sm">
              Total Events: <strong>{analytics.total_events || 0}</strong>
            </p>
            
          </div>
        )}
      </div>
    </div>
  );
};



const Dashboard = () => {
  // Main state
  const [activeTab, setActiveTab] = useState('market-explorer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Enhanced Market Analysis State
  const [marketInput, setMarketInput] = useState('');
  const [marketResults, setMarketResults] = useState(null);
  const [marketAnalyzed, setMarketAnalyzed] = useState(null);
  const [globalMd, setGlobalMd] = useState(null);
  const [verticalData, setVerticalData] = useState(null);
  const [horizontalData, setHorizontalData] = useState(null);
  const [popularMarkets, setPopularMarkets] = useState([]);
  const [selectedVertical, setSelectedVertical] = useState('');
  const [selectedHorizontal, setSelectedHorizontal] = useState('');
  
  // New state for segment details
  const [segmentDetails, setSegmentDetails] = useState({});
  const [segmentCompanies, setSegmentCompanies] = useState({});
  const [loadingSegment, setLoadingSegment] = useState(null);
  
  // New state for sidebar analysis results
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarData, setSidebarData] = useState({
    marketName: '',
    analysisType: '',
    metrics: '',
    companies: '',
    loading: false
  });
  
  // PDF State
  const [uploadedPdfs, setUploadedPdfs] = useState([]);
  const [pdfChunks, setPdfChunks] = useState([]);
  const [pdfQuery, setPdfQuery] = useState('');
  const [pdfResponses, setPdfResponses] = useState([]);
  const [currentPdfId, setCurrentPdfId] = useState(null);
  const [uploadedPdfName, setUploadedPdfName] = useState('');
  
  // M&A State
  const [maMarket, setMaMarket] = useState('');
  const [maTimeframe, setMaTimeframe] = useState('Last 2 years');
  const [maResults, setMaResults] = useState(null);
  const [recentMaSearches, setRecentMaSearches] = useState([]);
  
  // PDF Comparison State
  const [comparisonFiles, setComparisonFiles] = useState([]);
  const [comparisonPrompt, setComparisonPrompt] = useState('');
  const [comparisonResults, setComparisonResults] = useState(null);
  const [enableWebSearch, setEnableWebSearch] = useState(false);
  const [webSearchPrompt, setWebSearchPrompt] = useState('');
  
  // History State
  const [historyType, setHistoryType] = useState('All');
  const [historySearch, setHistorySearch] = useState('');
  const [marketHistory, setMarketHistory] = useState([]);
  const [pdfHistory, setPdfHistory] = useState([]);
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);
  
  // Admin State
  const [dbStats, setDbStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  
  // API Configuration
  //const API_BASE_URL = 'http://127.0.0.1:8000/api';
  const API_BASE_URL = "https://market-research-website.onrender.com/api";

  // Toast notification system
  const showToast = (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transform transition-all duration-300 ${
      type === 'success' ? 'bg-green-500' : 
      type === 'error' ? 'bg-red-500' : 
      type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  };

  // Enhanced API call helper with better error handling
  const apiCall = async (endpoint, method = 'GET', data = null, isFormData = false) => {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const config = { method, mode: 'cors' };
  
      if (data) {
        if (isFormData) {
          config.body = data;
        } else {
          config.headers = { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          };
          config.body = JSON.stringify(data);
        }
      } else {
        config.headers = { 'Accept': 'application/json' };
      }
  
      const response = await fetch(url, config);
      const result = await response.json().catch(() => ({})); // prevent parse crash
  
      if (!response.ok) {
        const errorMessage = result.detail || result.message || `HTTP ${response.status}`;
        throw new Error(errorMessage);
      }
  
      return result;
    } catch (error) {
      console.error('API call error:', error);
      showToast(`API Error: ${error.message || error.toString()}`, 'error');
      throw error;
    }
  };
  

  // Enhanced utility function to extract market entries from analysis results
  const extractMarketEntries = (analysisData) => {
    if (!analysisData) return [];
    
    // Try to extract market names from different possible formats
    const lines = analysisData.split('\n');
    const entries = [];
    
    lines.forEach(line => {
      // Look for numbered lists, bullet points, or table rows with market names
      const patterns = [
        /^\d+\.\s*\*\*([^*]+)\*\*/,  // "1. **Market Name**"
        /^\d+\.\s*([^-\n]+?)(?:\s*-|\s*$)/,  // "1. Market Name -" or "1. Market Name"
        /^\*\s*\*\*([^*]+)\*\*/,     // "* **Market Name**"
        /^\-\s*\*\*([^*]+)\*\*/,     // "- **Market Name**"
        /^\|\s*([^|]+?)\s*\|/,       // Table format "|Market Name|"
      ];
      
      for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match && match[1]) {
          const entry = match[1].trim();
          if (entry.length > 2 && entry.length < 100 && !entries.includes(entry)) {
            entries.push(entry);
          }
        }
      }
    });
    
    return entries.slice(0, 10); // Limit to 10 entries
  };

  // Memoized market entries to prevent re-renders
  const verticalEntries = useMemo(() => extractMarketEntries(verticalData), [verticalData]);
  const horizontalEntries = useMemo(() => extractMarketEntries(horizontalData), [horizontalData]);

  // Enhanced format text content for better display with tables and links
  const formatContent = (content, analysisType = 'general') => {
    if (!content) return '';
    
    let formatted = content;
    
    // First, handle markdown-style links [text](url) before other URL processing
    formatted = formatted.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g, 
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline inline-flex items-center">$1 <svg class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a>'
    );
    
    // Handle tables (with clickable functionality based on analysis type)
    formatted = formatTables(formatted, analysisType);
    
    // Convert remaining bare URLs to clickable links (but avoid URLs that are already in <a> tags)
    formatted = formatted.replace(
      /(?<!href="|">)(https?:\/\/[^\s<>"{}|\\^`[\]]+)(?![^<]*<\/a>)/g, 
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline inline-flex items-center">$1 <svg class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a>'
    );
    
    // Convert email addresses to clickable links
    formatted = formatted.replace(
      /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
      '<a href="mailto:$1" class="text-blue-600 hover:text-blue-800 underline">$1</a>'
    );
    
    // Convert markdown-like formatting to HTML
    formatted = formatted
      // Bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      // Italic text
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-800">$1</em>')
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 border border-gray-200 rounded-lg p-4 text-sm font-mono overflow-x-auto my-4"><code>$1</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono">$1</code>')
      // Headers
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold text-gray-900 mt-6 mb-3 pb-2 border-b border-gray-200">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold text-gray-900 mt-8 mb-4 pb-2 border-b-2 border-gray-300">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-gray-900 mt-8 mb-6 pb-3 border-b-2 border-blue-200">$1</h1>')
      // Blockquotes
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 italic text-gray-700">$1</blockquote>');
    
    // Handle lists with proper nesting
    formatted = formatLists(formatted);
    
    // Handle line breaks and paragraphs
    formatted = formatted
      .replace(/\n\n/g, '</p><p class="mb-4 text-gray-700 leading-relaxed">')
      .replace(/\n/g, '<br/>');
    
    // Wrap in paragraph tags if not already wrapped
    if (!formatted.includes('<p class=') && !formatted.includes('<table') && !formatted.includes('<h1') && !formatted.includes('<h2') && !formatted.includes('<h3')) {
      formatted = '<p class="mb-4 text-gray-700 leading-relaxed">' + formatted + '</p>';
    }
    
    return formatted;
  };

  // Helper function to format tables with clickable functionality
  const formatTables = (content, analysisType = 'general') => {
    // Split content by lines to process tables
    const lines = content.split('\n');
    let result = [];
    let inTable = false;
    let tableRows = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check if this line looks like a table row (contains | characters)
      if (line.includes('|') && line.split('|').length >= 3) {
        if (!inTable) {
          inTable = true;
          tableRows = [];
        }
        tableRows.push(line);
      } else {
        // If we were in a table and now we're not, process the collected table
        if (inTable) {
          result.push(processTableRows(tableRows, analysisType));
          tableRows = [];
          inTable = false;
        }
        result.push(line);
      }
    }
    
    // Handle case where table is at the end
    if (inTable && tableRows.length > 0) {
      result.push(processTableRows(tableRows, analysisType));
    }
    
    return result.join('\n');
  };

  // Helper function to process table rows into HTML with clickable entries
  const processTableRows = (rows, analysisType) => {
    if (rows.length === 0) return '';
    
    let html = '<div class="overflow-x-auto my-6"><table class="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">';
    
    rows.forEach((row, index) => {
      // Skip separator rows (like |---|---|)
      if (row.includes('---')) return;
      
      const cells = row.split('|').map(cell => cell.trim()).filter(cell => cell !== '');
      
      if (cells.length === 0) return;
      
      // First row is typically header
      if (index === 0) {
        html += '<thead class="bg-gray-50"><tr>';
        cells.forEach(cell => {
          html += `<th class="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider border-b border-gray-200">${cell}</th>`;
        });
        html += '</tr></thead><tbody class="divide-y divide-gray-200">';
      } else {
        html += '<tr class="hover:bg-gray-50 transition-colors">';
        cells.forEach((cell, cellIndex) => {
          // Handle markdown links in table cells
          let formattedCell = cell.replace(
            /\[([^\]]+)\]\(([^)]+)\)/g, 
            '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">$1</a>'
          );
          
          // Handle any remaining bare URLs
          formattedCell = formattedCell.replace(
            /(?<!href="|">)(https?:\/\/[^\s<>"{}|\\^`[\]]+)(?![^<]*<\/a>)/g, 
            '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">$1</a>'
          );
          
          // Make first column clickable ONLY for vertical/horizontal analysis (not global)
          if (cellIndex === 0 && formattedCell.trim() && !formattedCell.includes('<a href') && 
              (analysisType === 'vertical' || analysisType === 'horizontal')) {
            const cleanCell = formattedCell.replace(/\*\*/g, '').trim();
            if (cleanCell.length > 2) {
              html += `<td class="px-4 py-3 text-sm border-b border-gray-100"><button data-market-name="${cleanCell}" data-analysis-type="${analysisType}" class="clickable-market-entry text-left w-full text-blue-700 hover:text-blue-900 hover:bg-blue-50 px-2 py-1 rounded transition-colors font-medium" title="Click to analyze ${cleanCell}">${formattedCell} <span class="text-xs text-gray-500 ml-1"></span></button></td>`;

            } else {
              html += `<td class="px-4 py-3 text-sm text-gray-700 border-b border-gray-100">${formattedCell}</td>`;
            }
          } else {
            html += `<td class="px-4 py-3 text-sm text-gray-700 border-b border-gray-100">${formattedCell}</td>`;
          }
        });
        html += '</tr>';
      }
    });
    
    html += '</tbody></table></div>';
    return html;
  };

  
  // Helper function to format lists
  const formatLists = (content) => {
    // Handle numbered lists
    content = content.replace(/^(\d+\.\s+.*)$/gm, (match, item) => {
      return `<li class="ml-6 mb-2 text-gray-700">${item.replace(/^\d+\.\s+/, '')}</li>`;
    });
    
    // Handle bullet lists
    content = content.replace(/^([-*]\s+.*)$/gm, (match, item) => {
      return `<li class="ml-6 mb-2 text-gray-700 list-disc">${item.replace(/^[-*]\s+/, '')}</li>`;
    });
    
    // Wrap consecutive list items in ul/ol tags
    content = content.replace(/(<li[^>]*>.*<\/li>\s*)+/gs, (match) => {
      const hasNumbers = match.includes('1.') || match.includes('2.') || match.includes('3.');
      const listType = hasNumbers ? 'ol' : 'ul';
      return `<${listType} class="my-4 space-y-1">${match}</${listType}>`;
    });
    
    return content;
  };

  // Load initial data
  const loadInitialData = useCallback(async () => {
    try {
      await apiCall('/health');
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Market Analysis Functions
  const analyzeMarket = async (market, analysisType = 'global') => {
    setLoading(true);
    setError(null);
    try {
      let endpoint = '';
      switch (analysisType) {
        case 'global':
          endpoint = '/market/global-overview';
          break;
        case 'vertical':
          endpoint = '/market/vertical-segments';
          break;
        case 'horizontal':
          endpoint = '/market/horizontal-markets';
          break;
        default:
          endpoint = '/market/global-overview';
      }
      
      const response = await apiCall(endpoint, 'POST', { market });
      
      if (analysisType === 'global') {
        setGlobalMd(response.data);
        setMarketAnalyzed(market);
        showToast('Global market analysis completed!', 'success');
      } else if (analysisType === 'vertical') {
        setVerticalData(response.data);
        showToast('Vertical segments analysis completed!', 'success');
      } else if (analysisType === 'horizontal') {
        setHorizontalData(response.data);
        showToast('Horizontal markets analysis completed!', 'success');
      }
      
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const analyzeCompleteMarket = async (market) => {
    setLoading(true);
    setError(null);
    try {
      showToast('Running complete market analysis...', 'info');
      
      const [globalResponse, verticalResponse, horizontalResponse] = await Promise.all([
        apiCall('/market/global-overview', 'POST', { market }),
        apiCall('/market/vertical-segments', 'POST', { market }),
        apiCall('/market/horizontal-markets', 'POST', { market })
      ]);
      
      setGlobalMd(globalResponse.data);
      setVerticalData(verticalResponse.data);
      setHorizontalData(horizontalResponse.data);
      setMarketAnalyzed(market);
      
      showToast('Complete market analysis finished!', 'success');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const analyzeSubmarket = async (submarket, type) => {
    console.log(`Starting analysis for submarket: "${submarket}" of type: ${type}`);
    setLoadingSegment(submarket);
    try {
      // Get detailed metrics and companies - fix API parameter names
      console.log('Making API calls...');
      const [metricsResponse, companiesResponse] = await Promise.all([
        apiCall('/market/detailed-metrics', 'POST', { market: submarket }), // Fixed: use 'market' not 'submarket'
        apiCall('/company/top-companies', 'POST', { submarket: submarket })  // This one is correct
      ]);
      
      console.log('Metrics response:', metricsResponse);
      console.log('Companies response:', companiesResponse);
      
      // Store the results with proper formatting
      setSegmentDetails(prev => ({
        ...prev,
        [submarket]: formatContent(metricsResponse.data)
      }));
      
      setSegmentCompanies(prev => ({
        ...prev,
        [submarket]: formatContent(companiesResponse.data)
      }));
      
      showToast(`Analysis completed for: ${submarket}`, 'success');
    } catch (error) {
      console.error('Error in analyzeSubmarket:', error);
      setError(error.message);
      showToast(`Failed to analyze: ${submarket}`, 'error');
    } finally {
      setLoadingSegment(null);
    }
  };

  // Function to handle segment selection and auto-trigger API calls (for radio buttons)
  const handleSegmentSelection = async (segment, type) => {
    if (!segment) return;
    
    if (type === 'vertical') {
      setSelectedVertical(segment);
    } else {
      setSelectedHorizontal(segment);
    }
    
    // Always fetch fresh data when a segment is selected
    await analyzeSubmarket(segment, type);
  };

  // Function to handle table cell clicks for analysis (for clickable tables)
  const analyzeFromTable = useCallback(async (marketName, analysisType) => {
    console.log(`Analyzing from table: ${marketName} (${analysisType})`);
    
    // Open sidebar and show loading
    setSidebarOpen(true);
    setSidebarData({
      marketName,
      analysisType,
      metrics: '',
      companies: '',
      loading: true
    });
    
    try {
      // Make API calls
      const [metricsResponse, companiesResponse] = await Promise.all([
        apiCall('/market/detailed-metrics', 'POST', { market: marketName }),
        apiCall('/company/top-companies', 'POST', { submarket: marketName })
      ]);
      
      // Update sidebar with results
      setSidebarData({
        marketName,
        analysisType,
        metrics: formatContent(metricsResponse.data),
        companies: formatContent(companiesResponse.data),
        loading: false
      });
      
      showToast(`Analysis completed for: ${marketName}`, 'success');
    } catch (error) {
      console.error('Error in analyzeFromTable:', error);
      setSidebarData(prev => ({
        ...prev,
        loading: false,
        metrics: '<p class="text-red-600">⚠️ Failed to load metrics</p>',
        companies: '<p class="text-red-600">⚠️ Failed to load company data</p>'
      }));
      showToast(`Failed to analyze: ${marketName}`, 'error');
    }
  }, [apiCall, formatContent, showToast]);

  // Set up event delegation for clickable table entries
  useEffect(() => {
    const handleTableClick = (event) => {
      // Check if clicked element or its parent is a clickable market entry
      const button = event.target.closest('.clickable-market-entry');
      if (button) {
        const marketName = button.getAttribute('data-market-name');
        const analysisType = button.getAttribute('data-analysis-type');
        if (marketName && analysisType) {
          analyzeFromTable(marketName, analysisType);
        }
      }
    };

    document.addEventListener('click', handleTableClick);
    return () => {
      document.removeEventListener('click', handleTableClick);
    };
  }, [analyzeFromTable]);

  // PDF Functions
  const handlePdfUpload = async (files) => {
    if (!files || files.length === 0) return;
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', files[0]);

      const response = await apiCall('/documents/upload-and-split', 'POST', formData, true);
      
      setPdfChunks(response.data.chunks);
      setUploadedPdfName(files[0].name);
      setCurrentPdfId(response.data.pdf_id || Date.now());
      
      showToast(`PDF processed into ${response.data.chunks.length} chunks!`, 'success');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const queryPdf = async () => {
    if (!pdfQuery.trim() || pdfChunks.length === 0) return;
    
    setLoading(true);
    try {
      const response = await apiCall('/documents/query', 'POST', {
        query: pdfQuery,
        file_chunks: pdfChunks
      });

      const newQA = {
        question: pdfQuery,
        answer: response.data,
        timestamp: new Date().toLocaleString()
      };

      setPdfResponses(prev => [newQA, ...prev]);
      setPdfQuery('');
      
      showToast('PDF query completed!', 'success');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // M&A Functions
  const searchMADeals = async () => {
    if (!maMarket.trim()) return;
    
    setLoading(true);
    try {
      const response = await apiCall('/ma/analyze-deals', 'POST', {
        market: maMarket,
        timeframe: maTimeframe
      });

      setMaResults(response.data);
      showToast('M&A analysis completed!', 'success');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Copy to clipboard function
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied to clipboard!', 'success');
    } catch (error) {
      showToast('Failed to copy to clipboard', 'error');
    }
  };

  // UI Components
  const TabButton = ({ id, icon: Icon, label, active, onClick, badge = null }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
        active 
          ? 'bg-blue-600 text-white shadow-lg' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
      {badge && (
        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
          {badge}
        </span>
      )}
    </button>
  );

  const ActionButton = ({ onClick, children, variant = 'primary', icon: Icon, loading: isLoading, disabled = false, size = 'md' }) => {
    const sizeClasses = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3',
      lg: 'px-8 py-4 text-lg'
    };

    return (
      <button
        onClick={onClick}
        disabled={isLoading || disabled}
        className={`flex items-center space-x-2 ${sizeClasses[size]} rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 ${
          variant === 'primary' 
            ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg' 
            : variant === 'secondary'
            ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            : variant === 'success'
            ? 'bg-green-500 hover:bg-green-600 text-white'
            : variant === 'danger'
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        } ${isLoading || disabled ? 'opacity-75 cursor-not-allowed' : 'hover:shadow-xl'}`}
      >
        {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : Icon && <Icon className="w-4 h-4" />}
        <span>{children}</span>
      </button>
    );
  };

  const LoadingSpinner = ({ message = "Processing your request..." }) => (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">{message}</p>
        <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
      </div>
    </div>
  );

  const ErrorDisplay = ({ error, onRetry }) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
      <div className="flex items-center space-x-3">
        <AlertCircle className="w-6 h-6 text-red-600" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-800">Error</h3>
          <p className="text-red-600 mt-1">{error}</p>
        </div>
        {onRetry && (
          <ActionButton onClick={onRetry} variant="danger" size="sm">
            Retry
          </ActionButton>
        )}
      </div>
    </div>
  );

  const FormattedContent = ({ content, title, onClose, showCopy = true, analysisType = 'general' }) => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 mt-6 overflow-hidden">
      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
          {title}
        </h3>
        <div className="flex space-x-2">
          {showCopy && (
            <button
              onClick={() => copyToClipboard(typeof content === 'string' ? content : JSON.stringify(content, null, 2))}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-white transition-colors"
              title="Copy to clipboard"
            >
              <Copy className="w-4 h-4" />
            </button>
          )}
          {onClose && (
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
      <div className="p-6">
        {(analysisType === 'vertical' || analysisType === 'horizontal') && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 flex items-center">
              <Target className="w-4 h-4 mr-2" />
              <strong>💡 Tip:</strong> Click on any market name in the first column of tables below to get detailed analysis in the sidebar!
            </p>
          </div>
        )}
        <div 
          className="prose prose-blue max-w-none"
          style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            lineHeight: '1.6'
          }}
          dangerouslySetInnerHTML={{ 
            __html: formatContent(typeof content === 'string' ? content : JSON.stringify(content, null, 2), analysisType)
          }}
        />
      </div>
    </div>
  );

  // Sidebar Component for Market Analysis Results
  const AnalysisSidebar = ({ isOpen, data, onClose }) => (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed right-0 top-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
                Market Analysis
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {data.marketName} • {data.analysisType} segment
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-1 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {data.loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Analyzing {data.marketName}...</p>
                  <p className="text-sm text-gray-500 mt-2">Fetching metrics and company data</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Metrics Section */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-blue-600" />
                    📈 Market Metrics
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: data.metrics || "<p class='text-gray-500'>No metrics available</p>" }}
                    />
                  </div>
                </div>
                
                {/* Companies Section */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Building2 className="w-4 h-4 mr-2 text-green-600" />
                    🏢 Top Companies
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: data.companies || "<p class='text-gray-500'>No company data available</p>" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  const content = `# ${data.marketName} Analysis\n\n## Metrics\n${data.metrics}\n\n## Companies\n${data.companies}`;
                  const blob = new Blob([content], { type: 'text/markdown' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${data.marketName.replace(' ', '_')}_analysis.md`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
              <button
                onClick={() => copyToClipboard(`${data.marketName}\n\nMetrics:\n${data.metrics}\n\nCompanies:\n${data.companies}`)}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium flex items-center justify-center"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // Tab configuration with stable component references
  const tabsConfig = [
    { id: 'market-explorer', label: 'Market Sub-Segment Explorer', icon: BarChart3 },
    { id: 'pdf-insight', label: 'File-PDF Market Insight', icon: FileText },
    { id: 'ma-explorer', label: 'M&A Explorer', icon: Briefcase },
    { id: 'compare', label: 'Compare Multiple PDFs', icon: Layers },
    { id: 'history', label: 'History Browser', icon: History },
    { id: 'admin', label: 'Admin Dashboard', icon: Settings }
  ];

  // Render the active tab content
  const renderActiveTab = () => {
    const sharedProps = {
      loading, error, setError, ActionButton, LoadingSpinner, ErrorDisplay, FormattedContent,
      formatContent, copyToClipboard, showToast
    };

    switch (activeTab) {
      case 'market-explorer':
        return (
          <MarketExplorerTab
            marketInput={marketInput}
            setMarketInput={setMarketInput}
            analyzeCompleteMarket={analyzeCompleteMarket}
            analyzeMarket={analyzeMarket}
            globalMd={globalMd}
            setGlobalMd={setGlobalMd}
            verticalData={verticalData}
            setVerticalData={setVerticalData}
            horizontalData={horizontalData}
            setHorizontalData={setHorizontalData}
            marketAnalyzed={marketAnalyzed}
            verticalEntries={verticalEntries}
            horizontalEntries={horizontalEntries}
            selectedVertical={selectedVertical}
            setSelectedVertical={setSelectedVertical}
            selectedHorizontal={selectedHorizontal}
            setSelectedHorizontal={setSelectedHorizontal}
            handleSegmentSelection={handleSegmentSelection}
            segmentDetails={segmentDetails}
            segmentCompanies={segmentCompanies}
            loadingSegment={loadingSegment}
            TrendingUp={TrendingUp}
            Globe={Globe}
            Layers={Layers}
            Target={Target}
            BarChart3={BarChart3}
            Download={Download}
            RefreshCw={RefreshCw}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            sidebarData={sidebarData}
            AnalysisSidebar={AnalysisSidebar}
            Building2={Building2}
            {...sharedProps}
          />
        );
      
      case 'pdf-insight':
        return (
          <PdfInsightTab
            uploadedPdfName={uploadedPdfName}
            pdfChunks={pdfChunks}
            handlePdfUpload={handlePdfUpload}
            pdfQuery={pdfQuery}
            setPdfQuery={setPdfQuery}
            queryPdf={queryPdf}
            pdfResponses={pdfResponses}
            Upload={Upload}
            FileText={FileText}
            Search={Search}
            Copy={Copy}
            Download={Download}
            {...sharedProps}
          />
        );
      
      case 'ma-explorer':
        return (
          <MAExplorerTab
            maMarket={maMarket}
            setMaMarket={setMaMarket}
            maTimeframe={maTimeframe}
            setMaTimeframe={setMaTimeframe}
            searchMADeals={searchMADeals}
            maResults={maResults}
            setMaResults={setMaResults}
            Briefcase={Briefcase}
            Search={Search}
            {...sharedProps}
          />
        );
      case 'compare':
        return (
          <ComparePdfTab
            comparisonFiles={comparisonFiles}
            setComparisonFiles={setComparisonFiles}
            comparisonPrompt={comparisonPrompt}
            setComparisonPrompt={setComparisonPrompt}
            comparisonResults={comparisonResults}
            setComparisonResults={setComparisonResults}
            enableWebSearch={enableWebSearch}
            setEnableWebSearch={setEnableWebSearch}
            webSearchPrompt={webSearchPrompt}
            setWebSearchPrompt={setWebSearchPrompt}
            loading={loading}
            setLoading={setLoading}
            error={error}
            setError={setError}
            ActionButton={ActionButton}
            LoadingSpinner={LoadingSpinner}
            ErrorDisplay={ErrorDisplay}
            formatContent={formatContent}
            apiCall={apiCall}
          />
        );
        case 'history':
          return (
            <HistoryTab
              marketHistory={marketHistory}
              pdfHistory={pdfHistory}
              popularMarkets={popularMarkets}
              loadHistory={async () => {
                setLoading(true);
                try {
                  const [mh, ph, pm] = await Promise.all([
                    apiCall('/history/market-analysis', 'POST', { limit: 20 }),
                    apiCall('/history/pdf-sessions', 'POST', { limit: 20 }),
                    apiCall('/history/popular-markets', 'GET')
                  ]);
                  setMarketHistory(mh.data || []);
                  setPdfHistory(ph.data || []);
                  setPopularMarkets(pm.data || []);
                } finally {
                  setLoading(false);
                }
              }}
              loading={loading}
              error={error}
              ActionButton={ActionButton}
              LoadingSpinner={LoadingSpinner}
              ErrorDisplay={ErrorDisplay}
              apiCall={apiCall}
              showToast={showToast}
              setGlobalMd={setGlobalMd}
              setVerticalData={setVerticalData}
              setHorizontalData={setHorizontalData}
              setMarketAnalyzed={setMarketAnalyzed}
              setActiveTab={setActiveTab}
              setUploadedPdfName={setUploadedPdfName}
              setPdfChunks={setPdfChunks}
              setCurrentPdfId={setCurrentPdfId}
              setPdfResponses={setPdfResponses}
              setMarketHistory={setMarketHistory}
              setPdfHistory={setPdfHistory}
            />
          );
        
        case 'admin':
          return (
            <AdminDashboardTab
              dbStats={dbStats}
              analytics={analytics}
              setDbStats={setDbStats}
              setAnalytics={setAnalytics}
              loadAdminData={async () => {
                setLoading(true);
                try {
                  const [db, an] = await Promise.all([
                    apiCall('/admin/database-stats', 'GET'),
                    apiCall('/admin/analytics', 'GET')
                  ]);
                  setDbStats(db.data || {});
                  setAnalytics(an.data || {});
                  
                } finally {
                  setLoading(false);
                }
              }}
              loading={loading}
              error={error}
              ActionButton={ActionButton}
              LoadingSpinner={LoadingSpinner}
              ErrorDisplay={ErrorDisplay}
            />
          );
          
        
          
        
      
      default:
        return (
          <div className="space-y-8">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900">Coming Soon</h2>
              <p className="text-gray-600">This tab is under development.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Analysis Sidebar */}
      <AnalysisSidebar 
        isOpen={sidebarOpen}
        data={sidebarData}
        onClose={() => setSidebarOpen(false)}
      />
      
      {/* Add custom styles for enhanced formatting */}
      <style jsx>{`
        .prose h1 { @apply text-2xl font-bold text-gray-900 mt-8 mb-6 pb-3 border-b-2 border-blue-200; }
        .prose h2 { @apply text-xl font-bold text-gray-900 mt-8 mb-4 pb-2 border-b-2 border-gray-300; }
        .prose h3 { @apply text-lg font-semibold text-gray-900 mt-6 mb-3 pb-2 border-b border-gray-200; }
        .prose p { @apply mb-4 text-gray-700 leading-relaxed; }
        .prose ul { @apply my-4 space-y-1; }
        .prose ol { @apply my-4 space-y-1; }
        .prose li { @apply ml-6 mb-2 text-gray-700; }
        .prose table { @apply min-w-full bg-white border border-gray-200 rounded-lg shadow-sm my-6; }
        .prose th { @apply px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider border-b border-gray-200 bg-gray-50; }
        .prose td { @apply px-4 py-3 text-sm text-gray-700 border-b border-gray-100; }
        .prose tr:hover { @apply bg-gray-50 transition-colors; }
        .prose a { @apply text-blue-600 hover:text-blue-800 underline; }
        .prose code { @apply bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono; }
        .prose pre { @apply bg-gray-100 border border-gray-200 rounded-lg p-4 text-sm font-mono overflow-x-auto my-4; }
        .prose blockquote { @apply border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 italic text-gray-700; }
        .prose strong { @apply font-semibold text-gray-900; }
        .prose em { @apply italic text-gray-800; }
      `}</style>

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Market Research Intelligence Platform</h1>
            </div>
            <div className="text-sm text-gray-500">
              {/*Professional React UI • Enhanced formatting & tables*/}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto py-2">
            {tabsConfig.map(tab => (
              <TabButton
                key={tab.id}
                id={tab.id}
                icon={tab.icon}
                label={tab.label}
                active={activeTab === tab.id}
                onClick={setActiveTab}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderActiveTab()}
      </div>

      {/* Clear All Session Data Button */}
      <div className="fixed bottom-4 right-4">
        <ActionButton
          onClick={() => {
            // Clear all state
            setMarketInput('');
            setMarketResults(null);
            setGlobalMd(null);
            setVerticalData(null);
            setHorizontalData(null);
            setPdfResponses([]);
            setPdfChunks([]);
            setMaResults(null);
            setComparisonResults(null);
            setError(null);
            setSelectedVertical('');
            setSelectedHorizontal('');
            setSegmentDetails({});
            setSegmentCompanies({});
            setLoadingSegment(null);
            setSidebarOpen(false);
            showToast('All session data cleared!', 'success');
          }}
          variant="secondary"
          size="sm"
          icon={Trash2}
        >
          Clear Session Data
        </ActionButton>
      </div>
    </div>
  );
};

export default Dashboard;