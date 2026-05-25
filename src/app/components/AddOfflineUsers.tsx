import { useState } from 'react';
import { Upload, Download, CheckCircle2, AlertCircle, FileText, Clock } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function AddOfflineUsers() {
  const { t } = useTheme();
  const [csvData, setCsvData]       = useState('');
  const [importing, setImporting]   = useState(false);
  const [importDone, setImportDone] = useState(false);

  const inputStyle: React.CSSProperties = {
    background: t.inputBg,
    border: `1px solid ${t.inputBorder}`,
    borderRadius: '8px',
    color: t.inputText,
    fontSize: '13px',
    outline: 'none',
  };

  const handleImport = () => {
    if (!csvData.trim()) { alert('Please paste CSV data first'); return; }
    setImporting(true);
    setTimeout(() => {
      setImporting(false);
      setImportDone(true);
      setTimeout(() => setImportDone(false), 3000);
      setCsvData('');
    }, 1200);
  };

  const downloadTemplate = () => {
    const template = `name,email,moderator_email,status\nJohn Doe,john@example.com,sarah@example.com,active\nJane Smith,jane@example.com,michael@example.com,active`;
    const blob = new Blob([template], { type: 'text/csv' });
    const url  = window.URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'presidy_user_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const rowCount = csvData.trim() ? csvData.split('\n').length - 1 : 0;

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6" style={{ background: t.bg, minHeight: '100%', transition: 'background 0.2s' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontFamily: 'Syne, sans-serif', color: t.text, fontSize: 'clamp(18px, 5vw, 22px)', fontWeight: 700 }}>
          Add Offline Users
        </h2>
        <p className="mt-1 text-xs sm:text-sm" style={{ color: t.textMuted }}>
          Bulk import users from CSV file or paste data directly
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* Instructions card */}
        <div className="rounded-lg sm:rounded-xl p-4 sm:p-6" style={{ background: t.surface, border: `1px solid ${t.border}`, transition: 'background 0.2s' }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(212,168,67,0.1)' }}>
              <Upload size={16} style={{ color: '#D4A843' }} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold" style={{ color: t.text }}>Import Instructions</h3>
              <p className="text-xs mt-0.5" style={{ color: t.textMuted }}>Follow these steps</p>
            </div>
          </div>

          <ol className="space-y-3 sm:space-y-4 mb-6">
            {[
              { n: '01', title: 'Download CSV Template',  desc: 'Get the template with required columns pre-filled'  },
              { n: '02', title: 'Fill in User Data',      desc: 'Add: name, email, moderator email, and status'     },
              { n: '03', title: 'Paste CSV Below',        desc: 'Copy the CSV content and paste it in the text area' },
              { n: '04', title: 'Import Users',           desc: 'Click import to add all users to the platform'     },
            ].map((step) => (
              <li key={step.n} className="flex gap-3">
                <span
                  className="flex-shrink-0 w-6 sm:w-7 h-6 sm:h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{ background: 'rgba(212,168,67,0.1)', color: '#D4A843' }}
                >
                  {step.n}
                </span>
                <div className="pt-0.5 min-w-0">
                  <p className="text-xs sm:text-sm font-medium" style={{ color: t.text }}>{step.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: t.textMuted }}>{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>

          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all hover:opacity-80 w-full sm:w-auto justify-center"
            style={{ background: t.surfaceHover, border: `1px solid ${t.border}`, color: t.textSub }}
          >
            <Download size={14} />
            <span>Download CSV Template</span>
          </button>
        </div>

        {/* Format example card */}
        <div className="rounded-lg sm:rounded-xl p-4 sm:p-6" style={{ background: t.surface, border: `1px solid ${t.border}`, transition: 'background 0.2s' }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(82,196,160,0.1)' }}>
              <FileText size={16} style={{ color: '#52C4A0' }} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold" style={{ color: t.text }}>CSV Format Example</h3>
              <p className="text-xs mt-0.5" style={{ color: t.textMuted }}>Required columns & format</p>
            </div>
          </div>

          <div
            className="rounded-lg p-3 sm:p-4 mb-5 font-mono text-xs overflow-x-auto"
            style={{ background: t.surfaceHover, border: `1px solid ${t.borderSub}` }}
          >
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              <span style={{ color: '#D4A843' }}>name</span>,
              <span style={{ color: '#D4A843' }}>email</span>,
              <span style={{ color: '#D4A843' }}>moderator_email</span>,
              <span style={{ color: '#D4A843' }}>status</span>{'\n'}
              <span style={{ color: t.textSub }}>John Doe,john@example.com,sarah@example.com,active{'\n'}</span>
              <span style={{ color: t.textSub }}>Jane Smith,jane@example.com,michael@example.com,active</span>
            </pre>
          </div>

          <p className="text-xs font-semibold mb-3" style={{ color: t.textFaint, letterSpacing: '0.06em' }}>REQUIRED COLUMNS</p>
          <div className="space-y-2">
            {[
              { col: 'name',             desc: "User's full name"              },
              { col: 'email',            desc: "User's email address"          },
              { col: 'moderator_email',  desc: "Assigned moderator's email"    },
              { col: 'status',           desc: '"active" or "inactive"'        },
            ].map((item) => (
              <div key={item.col} className="flex items-center gap-2 text-xs">
                <CheckCircle2 size={13} style={{ color: '#52C4A0', flexShrink: 0 }} />
                <code
                  className="px-1.5 py-0.5 rounded font-mono text-xs"
                  style={{ background: 'rgba(212,168,67,0.1)', color: '#D4A843' }}
                >
                  {item.col}
                </code>
                <span style={{ color: t.textMuted }} className="truncate">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Paste area */}
      <div className="rounded-lg sm:rounded-xl p-4 sm:p-6" style={{ background: t.surface, border: `1px solid ${t.border}`, transition: 'background 0.2s' }}>
        <h3 className="text-sm font-semibold mb-4" style={{ color: t.text }}>Paste CSV Data</h3>
        <textarea
          value={csvData}
          onChange={(e) => setCsvData(e.target.value)}
          placeholder={'Paste your CSV data here...\n\nname,email,moderator_email,status\nJohn Doe,john@example.com,sarah@example.com,active'}
          rows={7}
          style={{
            ...inputStyle,
            width: '100%',
            padding: '14px',
            resize: 'none',
            fontFamily: 'monospace',
            lineHeight: '1.6',
          } as React.CSSProperties}
          onFocus={(e) => { e.target.style.borderColor = t.inputBorderFocus; }}
          onBlur={(e)  => { e.target.style.borderColor = t.inputBorder; }}
        />

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            {csvData.trim() ? (
              <>
                <AlertCircle size={13} style={{ color: '#D4A843' }} />
                <span className="text-xs" style={{ color: t.textMuted }}>
                  <span style={{ color: '#D4A843', fontWeight: 600 }}>{rowCount}</span> rows detected
                </span>
              </>
            ) : (
              <span className="text-xs" style={{ color: t.textFaint }}>No data pasted yet</span>
            )}
          </div>

          {importDone && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)' }}>
              <CheckCircle2 size={13} style={{ color: '#4ade80' }} />
              <span className="text-xs font-medium" style={{ color: '#4ade80' }}>Import queued successfully!</span>
            </div>
          )}

          <div className="flex gap-3 ml-auto w-full sm:w-auto">
            <button
              onClick={() => setCsvData('')}
              disabled={!csvData}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all disabled:opacity-30"
              style={{ background: t.surfaceHover, border: `1px solid ${t.border}`, color: t.textSub }}
            >
              Clear
            </button>
            <button
              onClick={handleImport}
              disabled={!csvData.trim() || importing}
              className="flex items-center gap-2 px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all disabled:opacity-50 justify-center flex-1 sm:flex-none"
              style={{ background: 'linear-gradient(135deg, #D4A843, #B8882A)', color: '#000' }}
            >
              <Upload size={14} />
              <span>{importing ? 'Importing...' : 'Import Users'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent imports */}
      <div className="rounded-lg sm:rounded-xl p-4 sm:p-5" style={{ background: t.surface, border: `1px solid ${t.border}`, transition: 'background 0.2s' }}>
        <p className="text-xs font-semibold mb-4" style={{ color: t.textFaint, letterSpacing: '0.06em' }}>RECENT IMPORTS</p>
        <div className="space-y-2 sm:space-y-3">
          {[
            { count: 145, time: '2 hours ago' },
            { count: 89,  time: '1 day ago'   },
            { count: 312, time: '3 days ago'  },
          ].map((item, i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg"
              style={{ background: t.surfaceHover, border: `1px solid ${t.borderSub}` }}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <CheckCircle2 size={14} style={{ color: '#4ade80' }} />
                <span className="text-xs sm:text-sm" style={{ color: t.textSub }}>
                  <span style={{ color: t.text, fontWeight: 600 }}>{item.count}</span> users imported successfully
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Clock size={11} style={{ color: t.textFaint }} />
                <span className="text-xs" style={{ color: t.textFaint }}>{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
