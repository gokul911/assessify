import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

const FaceDetection = ({handleViolationUpdate}) => {
  const videoRef = useRef();
  const canvasRef = useRef();
  const dragRef = useRef();

  const [status, setStatus] = useState("🕵️ Waiting for detection...");
  const [showWebcam, setShowWebcam] = useState(true);
  const [noFaceCount, setNoFaceCount] = useState(0);
  const [multiFaceCount, setMultiFaceCount] = useState(0);
  const [position, setPosition] = useState({ x: 1370, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const loadModelsAndStart = async () => {
      const MODEL_URL = '/models';
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
  
      // Start the video if it's not already started
      if (!videoRef.current.srcObject) {
        navigator.mediaDevices.getUserMedia({ video: true })
          .then((stream) => {
            videoRef.current.srcObject = stream;
          })
          .catch((err) => {
            console.error("Error accessing webcam:", err);
            setStatus("🚫 Cannot access webcam");
          });
      }
    };
  
    if (showWebcam) {
      loadModelsAndStart();
    }
  }, [showWebcam]);
  

  useEffect(() => {
    const interval = setInterval(async () => {
      if (
        showWebcam &&
        videoRef.current &&
        videoRef.current.readyState === 4 &&
        canvasRef.current
      ) {
        const detections = await faceapi.detectAllFaces(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        );

        const canvas = canvasRef.current;
        const displaySize = {
          width: videoRef.current.videoWidth,
          height: videoRef.current.videoHeight,
        };

        faceapi.matchDimensions(canvas, displaySize);
        const resizedDetections = faceapi.resizeResults(detections, displaySize);

        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetections);

        if (detections.length === 0) {
          setStatus("⚠️ No face detected");
          setNoFaceCount(prev => {
          const updated = prev + 1;
          handleViolationUpdate(updated, multiFaceCount);
          return updated;
          });
        } else if (detections.length > 1) {
            setStatus("⚠️ Multiple faces detected");
            setMultiFaceCount(prev => {
            const updated = prev + 1;
            handleViolationUpdate(noFaceCount, updated);
            return updated;
            });
            
        } else {
          setStatus("✅ Face detected");
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [showWebcam]);

  // Drag handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - offset.x,
        y: e.clientY - offset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <>
        <div style={{ fontSize: '25px', marginTop: '4px', color: 'white' }}>
            <p>🚫 No Face Count: {noFaceCount}</p>
            <p>👥 Multiple Face Count: {multiFaceCount}</p>
        </div>

      <button
        onClick={() => setShowWebcam(prev => !prev)}
        style={{
          position: 'fixed',
          top: '0px',
          right: '20px',
          zIndex: 10000,
          padding: '6px 12px',
          fontSize: '14px',
          backgroundColor: showWebcam ? '#e74c3c' : '#2ecc71',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
        }}
      >
        {showWebcam ? 'Hide Webcam' : 'Show Webcam'}
      </button>

      {showWebcam && (
        <div
          ref={dragRef}
          onMouseDown={handleMouseDown}
          style={{
            position: 'fixed',
            top: `${position.y}px`,
            left: `${position.x}px`,
            width: '300px',
            height: '250px',
            zIndex: 9999,
            border: '2px solid #ccc',
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 0 10px rgba(0,0,0,0.5)',
            backgroundColor: '#000',
            cursor: 'move',
            userSelect: 'none'
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            width="300"
            height="250"
            style={{ position: 'absolute', top: 0, left: 0 }}
          />
          <canvas
            ref={canvasRef}
            width="300"
            height="250"
            style={{ position: 'absolute', top: 0, left: 0 }}
          />
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            backgroundColor: '#000000cc',
            color: 'white',
            padding: '4px 8px',
            fontSize: '12px',
            borderTopRightRadius: '8px',
          }}>
            {status}
          </div>
        </div>
      )}
    </>
  );
};

export default FaceDetection;
