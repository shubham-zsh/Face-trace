import { useCallback, useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import {
  AlertCircle,
  Database,
  Folder,
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
  try {
    const image =
      typeof imageSource === 'string'
        ? await createImageElement(imageSource)
        : await faceapi.bufferToImage(imageSource);

    // Add a small delay to ensure TensorFlow.js backend is ready
    await new Promise(resolve => setTimeout(resolve, 100));

    const detection = await faceapi
      .detectSingleFace(image, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    return detection?.descriptor ?? null;
  } catch (error) {
    console.error('Face detection failed:', error);
    throw new Error(`Face detection error: ${error.message}`);
  }
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
        // Check browser compatibility first
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

        if (!gl) {
          throw new Error('WebGL is not supported in this browser. Face recognition requires WebGL acceleration. Try using Chrome, Firefox, or Safari.');
        }

        console.log('✓ WebGL is supported');

        // Try to access and configure face-api.js's internal TensorFlow.js
        if (faceapi.tf && faceapi.tf.setBackend) {
          try {
            await faceapi.tf.setBackend('webgl');
            await faceapi.tf.ready();
            console.log('✓ TensorFlow.js backend:', faceapi.tf.getBackend());
          } catch (backendError) {
            console.warn('WebGL backend setup failed, will use default:', backendError);
          }
        } else {
          console.warn('Cannot access face-api.js TensorFlow instance directly');
        }

        const modelUrl = '/models';

        // Load models with individual error handling
        try {
          await faceapi.nets.tinyFaceDetector.loadFromUri(modelUrl);
          console.log('✓ TinyFaceDetector loaded');
        } catch (err) {
          throw new Error(`Failed to load TinyFaceDetector: ${err.message}`);
        }

        try {
          await faceapi.nets.faceLandmark68Net.loadFromUri(modelUrl);
          console.log('✓ FaceLandmark68Net loaded');
        } catch (err) {
          throw new Error(`Failed to load FaceLandmark68Net: ${err.message}`);
        }

        try {
          await faceapi.nets.faceRecognitionNet.loadFromUri(modelUrl);
          console.log('✓ FaceRecognitionNet loaded');
        } catch (err) {
          throw new Error(`Failed to load FaceRecognitionNet: ${err.message}`);
        }

        setModelsReady(true);
        setStatusMessage('Models loaded. Fetching and indexing database faces...');
      } catch (loadError) {
        console.error('Model loading failed:', loadError);
        setError(`Unable to load face-recognition models: ${loadError.message}`);
        setStatusMessage('Model load failed. Check console for details.');
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

  const handleDatabaseUpload = async (event, isFolder = false) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';

    if (!files.length) {
      return;
    }

    setUploadingDatabaseImage(true);
    setError('');

    try {
      let successCount = 0;
      let failCount = 0;
      const totalFiles = files.length;

      setStatusMessage(
        `Uploading ${totalFiles} image${totalFiles > 1 ? 's' : ''}... (0/${totalFiles})`
      );

      // Upload files sequentially to avoid overwhelming the server
      for (let i = 0; i < files.length; i++) {
        try {
          const formData = new FormData();
          formData.append('image', files[i]);

          const response = await fetch(`${API_BASE_URL}/api/v1/face/upload`, {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            successCount++;
          } else {
            failCount++;
            console.warn(`Failed to upload ${files[i].name}`);
          }

          setStatusMessage(
            `Uploading ${totalFiles} image${totalFiles > 1 ? 's' : ''}... (${i + 1}/${totalFiles})`
          );
        } catch (fileError) {
          failCount++;
          console.warn(`Error uploading ${files[i].name}:`, fileError);
        }
      }

      // Refresh database after all uploads complete
      await fetchDatabaseImages();

      // Show upload summary
      if (failCount === 0) {
        setStatusMessage(
          `Successfully uploaded ${successCount} image${successCount > 1 ? 's' : ''} to database.`
        );
      } else {
        setError(
          `Uploaded ${successCount}/${totalFiles} images. ${failCount} failed.`
        );
      }
    } catch (uploadError) {
      console.error('Upload failed:', uploadError);
      setError('Unable to upload images to the face database.');
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
                <>
                  <div className="flex items-start gap-2 text-sm text-red-300 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>

                  {error.includes('WebGL') || error.includes('TensorFlow') || error.includes('backend') ? (
                    <div className="text-xs text-[#777] bg-black/20 p-3 rounded-lg border border-[#1F2227]">
                      <p className="font-semibold text-[#999] mb-2">Troubleshooting steps:</p>
                      <ul className="space-y-1 list-disc list-inside">
                        <li>Try refreshing the page</li>
                        <li>Use Chrome, Firefox, or Safari (latest versions)</li>
                        <li>Check if hardware acceleration is enabled in browser</li>
                        <li>Try a different device if the issue persists</li>
                        <li>Clear browser cache and reload</li>
                      </ul>
                    </div>
                  ) : null}
                </>
              )}

              <div>
                <span className="text-xs font-mono text-[#555] uppercase tracking-widest mb-3 block">Add To Database</span>
                <div className="grid grid-cols-2 gap-2">
                  {/* Single/Multiple Files Upload */}
                  <label className="block">
                    <span className="w-full py-3 px-3 rounded-xl border border-dashed border-[#2B3138] bg-black/20 hover:border-[#0078D4]/60 transition-colors flex items-center justify-center gap-2 cursor-pointer">
                      <Upload size={16} className="text-[#0078D4]" />
                      <span className="text-sm">
                        {uploadingDatabaseImage ? 'Uploading...' : 'Add Images'}
                      </span>
                    </span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      multiple
                      className="hidden"
                      onChange={(e) => handleDatabaseUpload(e, false)}
                      disabled={uploadingDatabaseImage || loadingModels}
                    />
                  </label>

                  {/* Folder Upload */}
                  <label className="block">
                    <span className="w-full py-3 px-3 rounded-xl border border-dashed border-[#2B3138] bg-black/20 hover:border-[#0078D4]/60 transition-colors flex items-center justify-center gap-2 cursor-pointer">
                      <Folder size={16} className="text-[#0078D4]" />
                      <span className="text-sm">
                        {uploadingDatabaseImage ? 'Uploading...' : 'Add Folder'}
                      </span>
                    </span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      webkitdirectory
                      directory
                      multiple
                      className="hidden"
                      onChange={(e) => handleDatabaseUpload(e, true)}
                      disabled={uploadingDatabaseImage || loadingModels}
                    />
                  </label>
                </div>
                <p className="text-xs text-[#555] mt-2">
                  Select multiple images or an entire folder to bulk upload
                </p>
              </div>

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
