import { useCallback, useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import * as tf from '@tensorflow/tfjs';
import {
  AlertCircle,
  Database,
  ImagePlus,
  LoaderCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  Upload,
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5555';
const FACE_MATCH_THRESHOLD = 0.55;

const createImageElement = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to read image: ${src}`));
    image.src = src;
  });

const getFaceDescriptor = async (imageSource) => {
  const image =
    typeof imageSource === 'string'
      ? await createImageElement(imageSource)
      : await faceapi.bufferToImage(imageSource);

  const detection = await faceapi
    .detectSingleFace(image, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  return detection?.descriptor ?? null;
};

const FaceMatch = () => {
  const [modelsReady, setModelsReady] = useState(false);
  const [loadingModels, setLoadingModels] = useState(true);
  const [databaseImages, setDatabaseImages] = useState([]);
  const [databaseDescriptors, setDatabaseDescriptors] = useState([]);
  const [loadingDatabase, setLoadingDatabase] = useState(false);
  const [uploadingDatabaseImage, setUploadingDatabaseImage] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [samplePreview, setSamplePreview] = useState('');
  const [matches, setMatches] = useState([]);
  const [bestMatch, setBestMatch] = useState(null);
  const [statusMessage, setStatusMessage] = useState('Load the face models to begin matching.');
  const [error, setError] = useState('');

  const samplePreviewRef = useRef('');

  useEffect(() => {
    const loadModels = async () => {
      setLoadingModels(true);
      setError('');

      try {
        // Set backend priority with fallback
        try {
          await tf.setBackend('webgl');
        } catch (e) {
          console.warn('WebGL backend not available, falling back to CPU', e);
          await tf.setBackend('cpu');
        }

        // Wait for backend to be ready
        await tf.ready();
        console.log('TensorFlow.js backend initialized:', tf.getBackend());

        const modelUrl = '/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(modelUrl),
          faceapi.nets.faceLandmark68Net.loadFromUri(modelUrl),
          faceapi.nets.faceRecognitionNet.loadFromUri(modelUrl),
        ]);

        setModelsReady(true);
        setStatusMessage('Models loaded. Fetching and indexing database faces...');
      } catch (loadError) {
        console.error('Model loading failed:', loadError);
        setError('Unable to load face-recognition models from /public/models.');
        setStatusMessage('Model load failed.');
      } finally {
        setLoadingModels(false);
      }
    };

    loadModels();
  }, []);

  useEffect(() => {
    return () => {
      if (samplePreviewRef.current) {
        URL.revokeObjectURL(samplePreviewRef.current);
      }
    };
  }, []);

  const fetchDatabaseImages = useCallback(async () => {
    setLoadingDatabase(true);
    setError('');
    setStatusMessage('Fetching database faces...');

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/face/database`);
      if (!response.ok) {
        throw new Error('Failed to fetch database images');
      }

      const payload = await response.json();
      const images = payload.data ?? [];
      setDatabaseImages(images);
      setStatusMessage(
        images.length
          ? `Indexing ${images.length} database image${images.length > 1 ? 's' : ''}...`
          : 'Database is empty. Upload reference images to begin matching.',
      );

      const descriptors = [];
      for (const image of images) {
        try {
          const descriptor = await getFaceDescriptor(image.url);
          if (descriptor) {
            descriptors.push({ ...image, descriptor });
          }
        } catch (descriptorError) {
          console.warn(`Skipping ${image.filename}:`, descriptorError);
        }
      }

      setDatabaseDescriptors(descriptors);
      setStatusMessage(
        descriptors.length
          ? `Database ready. ${descriptors.length} face${descriptors.length > 1 ? 's are' : ' is'} available for comparison.`
          : 'No detectable faces were found in the database images yet.',
      );
    } catch (fetchError) {
      console.error('Database fetch failed:', fetchError);
      setDatabaseImages([]);
      setDatabaseDescriptors([]);
      setError('Unable to fetch database images from the backend.');
      setStatusMessage('Database fetch failed.');
    } finally {
      setLoadingDatabase(false);
    }
  }, []);

  useEffect(() => {
    if (!modelsReady) {
      return;
    }

    fetchDatabaseImages();
  }, [fetchDatabaseImages, modelsReady]);

  const handleDatabaseUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    setUploadingDatabaseImage(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_BASE_URL}/api/v1/face/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload database image');
      }

      await fetchDatabaseImages();
    } catch (uploadError) {
      console.error('Upload failed:', uploadError);
      setError('Unable to upload image into the face database.');
    } finally {
      setUploadingDatabaseImage(false);
    }
  };

  const handleSampleSelect = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    if (!modelsReady) {
      setError('Face-recognition models are still loading.');
      return;
    }

    if (!databaseDescriptors.length) {
      setError('Add at least one valid face image to the database before comparing.');
      return;
    }

    if (samplePreviewRef.current) {
      URL.revokeObjectURL(samplePreviewRef.current);
    }

    const previewUrl = URL.createObjectURL(file);
    samplePreviewRef.current = previewUrl;
    setSamplePreview(previewUrl);
    setComparing(true);
    setError('');
    setMatches([]);
    setBestMatch(null);
    setStatusMessage('Extracting face descriptor from the sample image...');

    try {
      const sampleDescriptor = await getFaceDescriptor(file);
      if (!sampleDescriptor) {
        throw new Error('No face found in the sample image');
      }

      const rankedMatches = databaseDescriptors
        .map((entry) => {
          const distance = faceapi.euclideanDistance(sampleDescriptor, entry.descriptor);
          const similarity = Math.max(0, (1 - distance / FACE_MATCH_THRESHOLD) * 100);

          return {
            ...entry,
            distance,
            similarity: Number(similarity.toFixed(2)),
            isConfidentMatch: distance <= FACE_MATCH_THRESHOLD,
          };
        })
        .sort((left, right) => left.distance - right.distance);

      setMatches(rankedMatches);
      setBestMatch(rankedMatches[0] ?? null);

      if (rankedMatches[0]) {
        setStatusMessage(
          rankedMatches[0].isConfidentMatch
            ? `Best match found: ${rankedMatches[0].filename}`
            : `Closest result found, but it is above the confidence threshold.`,
        );
      } else {
        setStatusMessage('Comparison completed, but no database entries were available.');
      }
    } catch (compareError) {
      console.error('Face comparison failed:', compareError);
      setError(
        compareError.message === 'No face found in the sample image'
          ? 'No clear face was detected in the sample image. Try a sharper frontal image.'
          : 'Unable to compare the sample image with the face database.',
      );
      setStatusMessage('Comparison failed.');
    } finally {
      setComparing(false);
    }
  };

  const topMatches = matches.slice(0, 5);

  return (
    <div className="min-h-[calc(100vh-73px)] bg-[#0B0D0F] text-[#E0E0E0] p-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-[#121417] border border-[#1F2227] rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-6 border-b border-[#1F2227] pb-4">
              <div className="p-2 bg-[#0078D4]/10 rounded-lg">
                <ShieldCheck size={20} className="text-[#0078D4]" />
              </div>
              <div>
                <h2 className="font-semibold tracking-wide uppercase">Face Match</h2>
                <p className="text-xs text-[#777] mt-1">Compare a sample image against the saved face database.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-[#1F2227] bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-[#555] mb-2">System Status</div>
                <div className="flex items-start gap-3 text-sm">
                  {(loadingModels || loadingDatabase || comparing || uploadingDatabaseImage) && (
                    <LoaderCircle size={18} className="mt-0.5 text-[#0078D4] animate-spin shrink-0" />
                  )}
                  {!(loadingModels || loadingDatabase || comparing || uploadingDatabaseImage) && (
                    <Database size={18} className="mt-0.5 text-[#0078D4] shrink-0" />
                  )}
                  <span className="text-[#C8CDD2]">{statusMessage}</span>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 text-sm text-red-300 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <label className="block">
                <span className="text-xs font-mono text-[#555] uppercase tracking-widest mb-3 block">Add To Database</span>
                <span className="w-full py-4 px-4 rounded-xl border border-dashed border-[#2B3138] bg-black/20 hover:border-[#0078D4]/60 transition-colors flex items-center justify-center gap-3 cursor-pointer">
                  <Upload size={18} className="text-[#0078D4]" />
                  {uploadingDatabaseImage ? 'Uploading...' : 'Upload database face'}
                </span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                  onChange={handleDatabaseUpload}
                  disabled={uploadingDatabaseImage || loadingModels}
                />
              </label>

              <label className="block">
                <span className="text-xs font-mono text-[#555] uppercase tracking-widest mb-3 block">Compare Sample</span>
                <span className="w-full py-4 px-4 rounded-xl bg-[#0078D4] hover:bg-[#0086ED] transition-colors flex items-center justify-center gap-3 cursor-pointer text-white font-semibold">
                  <Search size={18} />
                  {comparing ? 'Comparing...' : 'Choose sample image'}
                </span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                  onChange={handleSampleSelect}
                  disabled={comparing || loadingModels || loadingDatabase || !databaseDescriptors.length}
                />
              </label>

              <button
                type="button"
                onClick={fetchDatabaseImages}
                disabled={loadingModels || loadingDatabase}
                className="w-full py-3 rounded-xl border border-[#1F2227] hover:border-[#0078D4]/60 bg-black/20 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <RefreshCw size={16} className={loadingDatabase ? 'animate-spin text-[#0078D4]' : 'text-[#0078D4]'} />
                Refresh database index
              </button>
            </div>
          </div>

          <div className="bg-[#121417] border border-[#1F2227] rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-5">
              <ImagePlus size={18} className="text-[#0078D4]" />
              <h3 className="font-semibold uppercase tracking-wide">Sample Preview</h3>
            </div>

            <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-[#1F2227] bg-black flex items-center justify-center">
              {samplePreview ? (
                <img src={samplePreview} alt="Sample face" className="w-full h-full object-cover" />
              ) : (
                <div className="text-[#444] text-sm px-6 text-center">No sample selected yet.</div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-[#121417] border border-[#1F2227] rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between gap-4 mb-6 border-b border-[#1F2227] pb-4">
              <div>
                <h2 className="font-semibold tracking-wide uppercase">Best Match</h2>
                <p className="text-xs text-[#777] mt-1">The closest result from `backend/database_faces` appears here.</p>
              </div>
              <div className="text-xs font-mono text-[#555] uppercase tracking-widest">
                Indexed Faces: {databaseDescriptors.length} / Raw Images: {databaseImages.length}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-2xl overflow-hidden border border-[#1F2227] bg-black aspect-[4/5] flex items-center justify-center">
                {bestMatch ? (
                  <img src={bestMatch.url} alt={bestMatch.filename} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-[#444] text-sm px-6 text-center">Run a comparison to see the closest database result.</div>
                )}
              </div>

              <div className="rounded-2xl border border-[#1F2227] bg-black/20 p-5 flex flex-col justify-between">
                {bestMatch ? (
                  <>
                    <div className="space-y-4">
                      <div>
                        <div className="text-xs uppercase tracking-[0.2em] text-[#555] mb-2">Filename</div>
                        <div className="text-lg font-semibold break-all">{bestMatch.filename}</div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-[0.2em] text-[#555] mb-2">Distance</div>
                        <div className="text-2xl font-bold text-[#0078D4]">{bestMatch.distance.toFixed(4)}</div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-[0.2em] text-[#555] mb-2">Estimated Similarity</div>
                        <div className="text-2xl font-bold">{bestMatch.similarity}%</div>
                      </div>
                    </div>

                    <div
                      className={`mt-6 px-4 py-3 rounded-xl border text-sm ${
                        bestMatch.isConfidentMatch
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/10 border-amber-500/20 text-amber-200'
                      }`}
                    >
                      {bestMatch.isConfidentMatch
                        ? 'This result is inside the confidence threshold and should be treated as the strongest candidate.'
                        : 'This is the closest result available, but it falls outside the confidence threshold.'}
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-center text-[#555] text-sm">
                    Upload database images, then compare a sample to get the closest match.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-[#121417] border border-[#1F2227] rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-semibold tracking-wide uppercase">Top Results</h2>
                <p className="text-xs text-[#777] mt-1">Closest database entries ordered by distance.</p>
              </div>
              <div className="text-xs font-mono text-[#555] uppercase tracking-widest">Threshold: {FACE_MATCH_THRESHOLD}</div>
            </div>

            {topMatches.length ? (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {topMatches.map((match) => (
                  <div key={match.filename} className="rounded-2xl border border-[#1F2227] overflow-hidden bg-black/20">
                    <div className="aspect-[4/3] bg-black">
                      <img src={match.url} alt={match.filename} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="font-medium text-sm break-all">{match.filename}</div>
                      <div className="text-xs text-[#9AA2AA]">Distance: {match.distance.toFixed(4)}</div>
                      <div className="text-xs text-[#9AA2AA]">Similarity: {match.similarity}%</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#2B3138] py-12 text-center text-[#555] text-sm">
                No comparison results yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceMatch;
