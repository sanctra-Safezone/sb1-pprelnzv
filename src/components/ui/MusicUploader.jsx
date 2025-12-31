import React, { useState, useRef } from 'react';
import { X, Upload, Music, Check, Loader } from 'lucide-react';
import { C } from '../../lib/constants';
import { supabase } from '../../lib/supabase';
import { checkMusicUploadLimit, incrementMusicUploadCount } from '../../lib/ctyLimits';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_FORMATS = ['audio/mpeg', 'audio/mp3', 'audio/wav'];

export const MusicUploader = ({ isOpen, onClose, user, onUploadComplete }) => {
  const [file, setFile] = useState(null);
  const [trackName, setTrackName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadLimit, setUploadLimit] = useState(null);
  const fileInputRef = useRef(null);

  React.useEffect(() => {
    if (isOpen && user?.id) {
      checkMusicUploadLimit(user.id).then(setUploadLimit);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setError('');

    if (!ALLOWED_FORMATS.includes(selectedFile.type)) {
      setError('Only MP3 and WAV files are allowed');
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('File size must be less than 5MB');
      return;
    }

    setFile(selectedFile);
    setTrackName(selectedFile.name.replace(/\.[^/.]+$/, ''));
  };

  const handleUpload = async () => {
    if (!file || !trackName.trim() || !user?.id) return;

    if (!uploadLimit?.canUpload) {
      setError('Upload limit reached. Upgrade to upload more tracks.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const fileName = `${user.id}/custom-${Date.now()}.mp3`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('music')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('music')
        .getPublicUrl(fileName);

      await incrementMusicUploadCount(user.id);

      onUploadComplete?.({
        id: `custom-${Date.now()}`,
        label: trackName,
        file: publicUrl,
        icon: 'music'
      });

      setFile(null);
      setTrackName('');
      onClose();
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const canUpload = uploadLimit?.canUpload;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 480,
          background: 'rgba(10,15,13,0.98)',
          borderRadius: 24,
          border: '1px solid rgba(52,211,153,0.15)',
          overflow: 'hidden'
        }}
      >
        <div style={{
          padding: '24px 20px',
          borderBottom: `1px solid ${C.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(52,211,153,0.1) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(52,211,153,0.2)'
            }}>
              <Music size={24} color={C.emeraldLight} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 500, color: C.text }}>
                Upload Music
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: C.muted }}>
                {uploadLimit && `${uploadLimit.used}/${uploadLimit.limit} used`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'rgba(255,255,255,0.05)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: C.muted
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: 24 }}>
          {!canUpload ? (
            <div style={{
              padding: 24,
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 16,
              textAlign: 'center'
            }}>
              <p style={{ margin: 0, fontSize: 14, color: C.text }}>
                Free upload limit reached
              </p>
              <p style={{ margin: '8px 0 0', fontSize: 13, color: C.muted }}>
                Upgrade your plan to upload more custom tracks
              </p>
            </div>
          ) : (
            <>
              {!file ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    padding: 48,
                    border: `2px dashed ${C.border}`,
                    borderRadius: 16,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: 'rgba(16,185,129,0.05)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = C.emeraldLight}
                  onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
                >
                  <Upload size={40} color={C.emeraldLight} style={{ marginBottom: 16 }} />
                  <p style={{ margin: 0, fontSize: 15, color: C.text, fontWeight: 500 }}>
                    Click to select MP3 or WAV
                  </p>
                  <p style={{ margin: '8px 0 0', fontSize: 13, color: C.muted }}>
                    Max 5MB
                  </p>
                </div>
              ) : (
                <div style={{
                  padding: 20,
                  background: 'rgba(16,185,129,0.1)',
                  border: `1px solid ${C.emeraldLight}40`,
                  borderRadius: 16,
                  marginBottom: 20
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <Music size={24} color={C.emeraldLight} />
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: 14, color: C.text, fontWeight: 500 }}>
                        {file.name}
                      </p>
                      <p style={{ margin: '4px 0 0', fontSize: 12, color: C.muted }}>
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={() => setFile(null)}
                      style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        borderRadius: 8,
                        padding: 8,
                        cursor: 'pointer',
                        color: C.muted
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={trackName}
                    onChange={(e) => setTrackName(e.target.value)}
                    placeholder="Track name"
                    maxLength={50}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(0,0,0,0.3)',
                      border: `1px solid ${C.border}`,
                      borderRadius: 10,
                      color: C.text,
                      fontSize: 14,
                      outline: 'none'
                    }}
                  />
                </div>
              )}

              {error && (
                <div style={{
                  padding: 12,
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: 10,
                  marginTop: 16
                }}>
                  <p style={{ margin: 0, fontSize: 13, color: '#ef4444' }}>
                    {error}
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".mp3,.wav,audio/mpeg,audio/wav"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </>
          )}
        </div>

        {canUpload && file && (
          <div style={{
            padding: 20,
            borderTop: `1px solid ${C.border}`,
            display: 'flex',
            gap: 12
          }}>
            <button
              onClick={onClose}
              disabled={uploading}
              style={{
                flex: 1,
                padding: '14px 20px',
                background: 'rgba(255,255,255,0.05)',
                border: 'none',
                borderRadius: 12,
                color: C.text,
                fontSize: 14,
                fontWeight: 500,
                cursor: uploading ? 'not-allowed' : 'pointer',
                opacity: uploading ? 0.5 : 1
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!trackName.trim() || uploading}
              style={{
                flex: 1,
                padding: '14px 20px',
                background: !trackName.trim() || uploading
                  ? 'rgba(255,255,255,0.1)'
                  : `linear-gradient(135deg, ${C.emerald} 0%, ${C.emeraldDark} 100%)`,
                border: 'none',
                borderRadius: 12,
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                cursor: !trackName.trim() || uploading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              {uploading ? (
                <>
                  <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Upload
                </>
              )}
            </button>
          </div>
        )}

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};
