import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, RotateCcw, Check, X, Upload, Zap } from 'lucide-react';

export const CameraScanner = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState('');
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [captured, setCaptured] = useState(false);
  const [showHaptic, setShowHaptic] = useState(false);

  useEffect(() => {
    startCamera();
    return () => { stopCamera(); };
  }, []);

  const startCamera = async () => {
    setError('');
    setPhoto(null);
    setCaptured(false);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false
      });
      setStream(mediaStream);
      setPermissionGranted(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError("Camera access blocked (requires HTTPS). Use your phone camera below:");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setPhoto(dataUrl);
      setCaptured(true);
      stopCamera();
      // Haptic feedback
      setShowHaptic(true);
      setTimeout(() => setShowHaptic(false), 500);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
        setCaptured(true);
        setError('');
        setShowHaptic(true);
        setTimeout(() => setShowHaptic(false), 500);
      };
      reader.readAsDataURL(file);
    }
  };

  const recapture = () => {
    setPhoto(null);
    setCaptured(false);
    startCamera();
  };

  const handleUsePhoto = () => {
    if (photo) {
      onCapture(photo);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl"
    >
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col relative">
        <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

        {/* Haptic Flash Overlay */}
        <AnimatePresence>
          {showHaptic && (
            <motion.div
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 z-20 bg-white/40 pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/90 backdrop-blur-sm">
          <h3 className="text-md font-bold text-white flex items-center gap-2">
            <Camera className="h-4 w-4 text-indigo-400" />
            Camera Scanner
          </h3>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => { stopCamera(); onClose(); }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </motion.button>
        </div>

        {/* Camera Feed */}
        <div className="relative aspect-[4/3] bg-black flex items-center justify-center overflow-hidden">
          {error ? (
            <div className="p-6 text-center text-slate-300 space-y-4">
              <Camera className="h-12 w-12 mx-auto text-indigo-400" />
              <p className="text-xs font-semibold leading-relaxed max-w-sm text-slate-400">{error}</p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/30 mx-auto"
              >
                <Camera className="h-4 w-4" />
                Open Phone Camera
              </motion.button>
            </div>
          ) : photo ? (
            <img src={photo} alt="Captured" className="w-full h-full object-cover" />
          ) : (
            <div className="relative w-full h-full">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              
              {/* Scanning Overlay - Corner Reticles */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Scanning line */}
                <div className="absolute left-[15%] right-[15%] top-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-scan-line shadow-lg shadow-indigo-500/50" />
                
                {/* Four corner brackets */}
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M5,5 L25,5 M5,5 L5,25" stroke="rgba(99,102,241,0.6)" strokeWidth="2" fill="none" />
                  <path d="M95,5 L75,5 M95,5 L95,25" stroke="rgba(99,102,241,0.6)" strokeWidth="2" fill="none" />
                  <path d="M5,95 L25,95 M5,95 L5,75" stroke="rgba(99,102,241,0.6)" strokeWidth="2" fill="none" />
                  <path d="M95,95 L75,95 M95,95 L95,75" stroke="rgba(99,102,241,0.6)" strokeWidth="2" fill="none" />
                </svg>

                {/* Center reticle */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-16 w-16 rounded-full border-2 border-indigo-500/40">
                    <div className="h-full w-full rounded-full border border-indigo-500/20 animate-pulse-slow" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Footer */}
        <div className="p-5 bg-slate-950/90 backdrop-blur-sm border-t border-slate-800 flex justify-center gap-4">
          {!error && !photo && permissionGranted && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={capturePhoto}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
            >
              <Camera className="h-4 w-4" />
              Capture Photo
            </motion.button>
          )}

          {photo && (
            <>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={recapture}
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm rounded-2xl flex items-center gap-2 transition-all"
              >
                <RotateCcw className="h-4 w-4" />
                Retake
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleUsePhoto}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-sm rounded-2xl flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
              >
                <Zap className="h-4 w-4" />
                Use Photo
              </motion.button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};
