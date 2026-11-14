import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, X, RefreshCw, Upload, AlertCircle, Loader2 } from 'lucide-react';

/**
 * CameraCaptureModal
 *
 * Instant in-app live camera capture modal for desktop/web browsers where
 * <input type="file" capture="environment" /> falls back to a file dialog.
 * Captures a JPEG File directly from the camera stream and cleans up tracks on close.
 */
export default function CameraCaptureModal({
  isOpen,
  slot = 1,
  onClose,
  onCapture,
  onFallbackToGallery,
}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [facingMode, setFacingMode] = useState('environment');
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // Ignore track stop errors
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(
    async (mode) => {
      stopStream();
      setError('');
      setIsStarting(true);

      if (!navigator?.mediaDevices?.getUserMedia) {
        setIsStarting(false);
        setError('Camera access is not supported in this browser. Please select an image from your gallery.');
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1600 },
            height: { ideal: 1200 },
          },
          audio: false,
        });

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
      } catch (err) {
        console.warn('[Camera Error]', err);
        if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
          setError('Camera permission was denied. Please allow camera access or choose a photo from your gallery.');
        } else if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError') {
          setError('No camera was detected on this device. Please choose a photo from your gallery.');
        } else {
          setError('Unable to start camera right now. Please choose a photo from your gallery.');
        }
      } finally {
        setIsStarting(false);
      }
    },
    [stopStream]
  );

  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode);
    } else {
      stopStream();
    }

    return () => {
      stopStream();
    };
  }, [isOpen, facingMode, startCamera, stopStream]);

  if (!isOpen) return null;

  const handleClose = () => {
    stopStream();
    onClose();
  };

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight || isCapturing) return;

    setIsCapturing(true);
    try {
      const maxDim = 1600;
      let width = video.videoWidth;
      let height = video.videoHeight;

      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          setIsCapturing(false);
          if (!blob) {
            setError('Failed to capture photo. Please try again.');
            return;
          }
          const fileName = `camera-image-${slot}-${Date.now()}.jpg`;
          const file = new File([blob], fileName, { type: 'image/jpeg' });
          stopStream();
          onCapture(file);
          onClose();
        },
        'image/jpeg',
        0.9
      );
    } catch {
      setIsCapturing(false);
      setError('Failed to capture photo. Please try again.');
    }
  };

  const handleSwitchCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F2D25]/80 backdrop-blur-xs">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Take Photo for Image ${slot}`}
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-[#E6DFCE] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EFE9DA] bg-gradient-to-r from-[#FBF8F1] via-white to-[#F7F3EA]/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#173F35] text-[#D4A64A] flex items-center justify-center border border-[#D4A64A]/40">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#292D2B]">
                Take Product Photo (Image {slot})
              </h3>
              <p className="text-[11px] text-[#555B58]">
                Capture directly from camera
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close camera"
            className="p-1.5 rounded-lg text-[#6F7571] hover:text-[#292D2B] hover:bg-[#FBF5E6] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Viewport */}
        <div className="p-4 space-y-4">
          <div className="relative rounded-xl overflow-hidden bg-[#0F2D25] aspect-4/3 flex items-center justify-center border border-[#E6DFCE]">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${error || isStarting ? 'opacity-0' : 'opacity-100'}`}
            />

            {isStarting && !error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-[#F7F3EA] gap-2">
                <Loader2 className="w-7 h-7 animate-spin text-[#D4A64A]" />
                <span className="text-xs font-medium text-[#B8CBC3]">Opening camera...</span>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center bg-[#0F2D25] text-[#F7F3EA] gap-3">
                <div className="w-11 h-11 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <p className="text-xs sm:text-sm text-[#E6DFCE] leading-relaxed max-w-xs">
                  {error}
                </p>
                {onFallbackToGallery && (
                  <button
                    type="button"
                    onClick={() => {
                      handleClose();
                      onFallbackToGallery();
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4A64A] to-[#C29236] text-[#173F35] text-xs font-bold hover:from-[#DFB359] hover:to-[#CE9D3E] transition-all cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload from Gallery</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleSwitchCamera}
              disabled={isStarting || Boolean(error)}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#E6DFCE] text-[#292D2B] hover:border-[#D4A64A] hover:bg-[#FCF9F2] disabled:opacity-40 text-xs font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Switch</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 rounded-xl border border-[#E6DFCE] text-[#292D2B] hover:border-[#D4A64A] hover:bg-[#FCF9F2] text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCapture}
                disabled={isStarting || isCapturing || Boolean(error)}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4A64A] to-[#C29236] hover:from-[#DFB359] hover:to-[#CE9D3E] disabled:opacity-40 text-[#173F35] text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                {isCapturing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Capturing...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    <span>Capture Photo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
