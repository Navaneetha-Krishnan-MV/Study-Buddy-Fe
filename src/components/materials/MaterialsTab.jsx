import { useEffect, useMemo, useState } from 'react';
import {
  getMaterialDownloadUrl,
  getMaterials,
  getSubjectUnits,
  uploadMaterial,
} from '../../api';
import { AlertCircle, Filter, Layers, Search, Upload, X } from '../icons/Icons';
import UnitAccordion from './UnitAccordion';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'pdf', label: 'PDFs' },
  { id: 'link', label: 'Links' },
  { id: 'image', label: 'Images' },
];

const MATERIAL_TYPES = [
  { id: 'pdf', label: 'PDF' },
  { id: 'image', label: 'Image' },
  { id: 'link', label: 'Link' },
];

function createInitialUploadForm(defaultUnitId = '') {
  return {
    unitId: defaultUnitId,
    type: 'pdf',
    name: '',
    teacherName: '',
    externalUrl: '',
    file: null,
  };
}

function formatDisplayDate(value) {
  if (!value) {
    return '-';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

function openResourceUrl(url, materialType) {
  if (!url) {
    return;
  }

  if (materialType === 'link') {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  anchor.click();
}

function isValidHttpUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export default function MaterialsTab({ selectedSubject }) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshTick, setRefreshTick] = useState(0);

  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadError, setDownloadError] = useState('');

  const [uploadUnits, setUploadUnits] = useState([]);
  const [loadingUploadUnits, setLoadingUploadUnits] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadForm, setUploadForm] = useState(() => createInitialUploadForm());

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 250);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [query]);

  useEffect(() => {
    setUploadSuccess('');
  }, [selectedSubject?.id]);

  useEffect(() => {
    let isCancelled = false;

    async function loadUploadUnits() {
      if (!selectedSubject) {
        setUploadUnits([]);
        setLoadingUploadUnits(false);
        setUploadForm(createInitialUploadForm());
        return;
      }

      setLoadingUploadUnits(true);

      try {
        const data = await getSubjectUnits(selectedSubject.id);
        if (isCancelled) {
          return;
        }

        const normalized = Array.isArray(data) ? data : [];
        setUploadUnits(normalized);
        setUploadForm((current) => {
          const unitIds = normalized.map((unit) => unit.id);
          const fallbackUnitId = normalized[0]?.id || '';
          const safeUnitId =
            current.unitId && unitIds.includes(current.unitId)
              ? current.unitId
              : fallbackUnitId;

          return {
            ...current,
            unitId: safeUnitId,
          };
        });
      } catch {
        if (isCancelled) {
          return;
        }
        setUploadUnits([]);
        setUploadForm(createInitialUploadForm());
      } finally {
        if (!isCancelled) {
          setLoadingUploadUnits(false);
        }
      }
    }

    loadUploadUnits();

    return () => {
      isCancelled = true;
    };
  }, [selectedSubject]);

  useEffect(() => {
    let isCancelled = false;

    async function loadMaterials() {
      if (!selectedSubject) {
        setUnits([]);
        setError('');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const data = await getMaterials(selectedSubject.id, {
          type: filter,
          q: debouncedQuery,
        });

        if (isCancelled) {
          return;
        }

        setUnits(Array.isArray(data) ? data : []);
      } catch (loadError) {
        if (isCancelled) {
          return;
        }
        setUnits([]);
        setError(loadError.message || 'Failed to load materials.');
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadMaterials();

    return () => {
      isCancelled = true;
    };
  }, [selectedSubject, filter, debouncedQuery, refreshTick]);

  const normalizedUnits = useMemo(
    () =>
      units.map((unit) => ({
        ...unit,
        files: (unit.files || []).map((file) => ({
          ...file,
          date: formatDisplayDate(file.date),
        })),
      })),
    [units],
  );

  const fileCount = normalizedUnits.reduce(
    (total, unit) => total + (unit.files?.length || 0),
    0,
  );

  const handleMaterialAction = async (material) => {
    if (!material?.id) {
      return;
    }

    setDownloadingId(material.id);
    setDownloadError('');

    try {
      const response = await getMaterialDownloadUrl(material.id);
      const url = response?.url;

      if (!url) {
        throw new Error('No download URL returned for this material.');
      }

      openResourceUrl(url, material.type);
    } catch (actionError) {
      setDownloadError(actionError.message || 'Failed to open material.');
    } finally {
      setDownloadingId(null);
    }
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setUploadError('');
    setUploading(false);
    setUploadForm(createInitialUploadForm(uploadUnits[0]?.id || ''));
  };

  const openUploadModal = () => {
    setUploadError('');
    setUploadSuccess('');
    setShowUploadModal(true);
  };

  const updateUploadFormField = (field, value) => {
    setUploadForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateUploadType = (value) => {
    setUploadForm((current) => ({
      ...current,
      type: value,
      file: value === 'link' ? null : current.file,
      externalUrl: value === 'link' ? current.externalUrl : '',
    }));
  };

  const handleSubmitUpload = async () => {
    if (!selectedSubject || uploading) {
      return;
    }

    const name = uploadForm.name.trim();
    const teacherName = uploadForm.teacherName.trim();

    if (!uploadForm.unitId) {
      setUploadError('Please choose a unit before uploading.');
      return;
    }

    if (!name) {
      setUploadError('Please provide a resource name.');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      if (uploadForm.type === 'link') {
        const externalUrl = uploadForm.externalUrl.trim();
        if (!externalUrl || !isValidHttpUrl(externalUrl)) {
          throw new Error('Please enter a valid link URL (http:// or https://).');
        }

        const payload = {
          subjectId: selectedSubject.id,
          unitId: uploadForm.unitId,
          name,
          type: 'link',
          externalUrl,
        };

        if (teacherName) {
          payload.teacherName = teacherName;
        }

        await uploadMaterial(payload);
      } else {
        if (!uploadForm.file) {
          throw new Error('Please attach a file to upload.');
        }

        const formData = new FormData();
        formData.append('subjectId', selectedSubject.id);
        formData.append('unitId', uploadForm.unitId);
        formData.append('name', name);
        formData.append('type', uploadForm.type);
        formData.append('file', uploadForm.file);

        if (teacherName) {
          formData.append('teacherName', teacherName);
        }

        await uploadMaterial(formData);
      }

      setUploadSuccess('Resource uploaded successfully.');
      setRefreshTick((current) => current + 1);
      closeUploadModal();
    } catch (uploadActionError) {
      const rawMessage =
        uploadActionError?.message || 'Failed to upload resource.';

      const friendlyMessage = rawMessage.includes('File storage not configured')
        ? 'File upload is not enabled on backend storage yet. You can still upload Link resources.'
        : rawMessage;

      setUploadError(friendlyMessage);
    } finally {
      setUploading(false);
    }
  };

  if (!selectedSubject) {
    return (
      <section className="py-24 text-center">
        <Layers size={42} className="mx-auto text-slate-600" />
        <p className="mt-3 text-sm text-slate-400">Select a subject to view uploaded materials.</p>
      </section>
    );
  }

  return (
    <section className="animate-[fade-in_220ms_ease-out] space-y-5">
      <header className="glass-card rounded-2xl p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Materials</h1>
            <p className="mt-1 text-sm text-slate-400">
              {selectedSubject.name} - {fileCount} matching files across {normalizedUnits.length} units
            </p>
          </div>

          <button
            type="button"
            onClick={openUploadModal}
            className="btn-primary text-sm"
            disabled={loadingUploadUnits || !uploadUnits.length}
            title={!uploadUnits.length ? 'No units available for upload.' : 'Upload a new resource'}
          >
            <Upload size={14} />
            {loadingUploadUnits ? 'Loading units...' : 'Upload resource'}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[220px] flex-1">
            {!query ? (
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
            ) : null}
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="    Search by file name"
              className="input-field pl-9"
            />
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
            <Filter size={14} className="ml-1 text-slate-400" />
            {FILTERS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setFilter(option.id)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                  filter === option.id
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {downloadError ? (
          <p className="mt-3 text-xs text-red-600">{downloadError}</p>
        ) : null}

        {uploadSuccess ? (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-green-200 bg-green-50 px-2.5 py-1 text-xs text-green-700">
            <AlertCircle size={13} />
            {uploadSuccess}
          </div>
        ) : null}
      </header>

      {loading ? (
        <div className="glass-card rounded-2xl py-16 text-center text-slate-400">Loading materials...</div>
      ) : error ? (
        <div className="glass-card rounded-2xl border border-red-200 bg-red-50 py-16 text-center text-red-700">
          {error}
        </div>
      ) : normalizedUnits.length ? (
        <div className="space-y-3">
          {normalizedUnits.map((unit, index) => (
            <UnitAccordion
              key={unit.unitId || unit.unitName || index}
              unitData={unit}
              defaultOpen={index === 0}
              onDownload={handleMaterialAction}
              downloadingId={downloadingId}
            />
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-2xl py-16 text-center text-slate-400">
          No materials matched this filter.
        </div>
      )}

      {showUploadModal ? (
        <UploadResourceModal
          selectedSubjectName={selectedSubject.name}
          units={uploadUnits}
          loadingUnits={loadingUploadUnits}
          uploading={uploading}
          error={uploadError}
          form={uploadForm}
          onClose={closeUploadModal}
          onSubmit={handleSubmitUpload}
          onFieldChange={updateUploadFormField}
          onTypeChange={updateUploadType}
          onFileChange={(file) => updateUploadFormField('file', file)}
        />
      ) : null}
    </section>
  );
}

function UploadResourceModal({
  selectedSubjectName,
  units,
  loadingUnits,
  form,
  uploading,
  error,
  onClose,
  onSubmit,
  onFieldChange,
  onTypeChange,
  onFileChange,
}) {
  const requiresFile = form.type !== 'link';
  const fileAccept = form.type === 'pdf' ? '.pdf,application/pdf' : 'image/*';

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/35 p-4 backdrop-blur-sm">
      <div className="glass-card w-full max-w-xl rounded-2xl p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Upload resource</h3>
            <p className="mt-1 text-sm text-slate-500">{selectedSubjectName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost px-2 py-2"
            aria-label="Close upload dialog"
          >
            <X size={15} />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600" htmlFor="upload-unit">
                Unit
              </label>
              <select
                id="upload-unit"
                value={form.unitId}
                onChange={(event) => onFieldChange('unitId', event.target.value)}
                className="input-field"
                disabled={loadingUnits || !units.length || uploading}
              >
                {units.length ? (
                  units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      Unit {unit.number} - {unit.name}
                    </option>
                  ))
                ) : (
                  <option value="">No units available</option>
                )}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600" htmlFor="upload-type">
                Type
              </label>
              <select
                id="upload-type"
                value={form.type}
                onChange={(event) => onTypeChange(event.target.value)}
                className="input-field"
                disabled={uploading}
              >
                {MATERIAL_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600" htmlFor="upload-name">
              Resource name
            </label>
            <input
              id="upload-name"
              value={form.name}
              onChange={(event) => onFieldChange('name', event.target.value)}
              className="input-field"
              placeholder="Example: Unit 1 Notes"
              disabled={uploading}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600" htmlFor="upload-teacher">
              Teacher name (optional)
            </label>
            <input
              id="upload-teacher"
              value={form.teacherName}
              onChange={(event) => onFieldChange('teacherName', event.target.value)}
              className="input-field"
              placeholder="Dr. Priya Sharma"
              disabled={uploading}
            />
          </div>

          {requiresFile ? (
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600" htmlFor="upload-file">
                File
              </label>
              <input
                key={form.type}
                id="upload-file"
                type="file"
                accept={fileAccept}
                className="input-field"
                onChange={(event) => onFileChange(event.target.files?.[0] || null)}
                disabled={uploading}
              />
              {form.file ? (
                <p className="mt-1 text-xs text-slate-600">Selected: {form.file.name}</p>
              ) : null}
            </div>
          ) : (
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600" htmlFor="upload-url">
                Link URL
              </label>
              <input
                id="upload-url"
                value={form.externalUrl}
                onChange={(event) => onFieldChange('externalUrl', event.target.value)}
                className="input-field"
                placeholder="https://example.com/resource"
                disabled={uploading}
              />
            </div>
          )}
        </div>

        {error ? (
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs text-red-700">
            <AlertCircle size={13} />
            {error}
          </div>
        ) : null}

        <div className="mt-5 flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-secondary text-sm" disabled={uploading}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary text-sm"
            onClick={onSubmit}
            disabled={uploading || loadingUnits || !units.length}
          >
            <Upload size={14} />
            {uploading ? 'Uploading...' : 'Upload resource'}
          </button>
        </div>
      </div>
    </div>
  );
}
