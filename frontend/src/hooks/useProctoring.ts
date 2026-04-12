import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { exams } from '../api';

const HOSTNAME = window.location.hostname;
const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || `http://${HOSTNAME}:5000`;

export function useProctoring(examId: string, isSecondary = false, proctoringLevel?: 'none' | 'primary' | 'both') {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [pairingCode, setPairingCode] = useState<string>('');
  const [isPrimaryConnected, setIsPrimaryConnected] = useState(false);
  const [isSecondaryConnected, setIsSecondaryConnected] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!examId) return;
    
    const s = io(SOCKET_URL);
    setSocket(s);

    s.on('connect', () => {
      s.emit('join-exam-room', examId);
      
      if (!isSecondary) {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        setPairingCode(code);
        s.emit('register-device-code', { code, roomId: examId });
      }
    });

    return () => {
      s.disconnect();
    };
  }, [examId, isSecondary]);

  useEffect(() => {
    const initCamera = async () => {
      try {
        if (!isSecondary && !proctoringLevel) {
           return; // Wait until exam proctoring configuration is fetched
        }
        if (!isSecondary && proctoringLevel === 'none') {
           return;
        }

        let stream;
        try {
           stream = await navigator.mediaDevices.getUserMedia({ 
             video: isSecondary ? { facingMode: 'environment' } : true, 
             audio: false 
           });
           streamRef.current = stream;
        } catch (e) {
           console.warn("Primary constraint failed, falling back to basic video.", e);
           stream = await navigator.mediaDevices.getUserMedia({ 
             video: true, 
             audio: false 
           });
           streamRef.current = stream;
        }
        
        if (localVideoRef.current && stream) {
          localVideoRef.current.srcObject = stream;
          setIsPrimaryConnected(true);
        }

        // WebRTC Setup (MVP: Primary device waits for offer from Secondary, Admin waits for offer from both)
        // For simplicity, let's just make the secondary device create an offer to the primary device.
        if (isSecondary && socket) {
          const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
          });
          peerConnection.current = pc;

          stream.getTracks().forEach(track => pc.addTrack(track, stream));

          pc.onicecandidate = (event) => {
            if (event.candidate) {
              socket.emit('webrtc-ice-candidate', { roomId: examId, candidate: event.candidate, senderId: socket.id, isSecondary: true });
            }
          };

          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('webrtc-offer', { roomId: examId, offer, senderId: socket.id, isSecondary: true });

          socket.on('webrtc-answer', async ({ answer, isSecondary: ansSecondary }) => {
            if (!ansSecondary && peerConnection.current?.signalingState !== 'stable') {
                await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(answer));
            }
          });

          socket.on('webrtc-ice-candidate', async ({ candidate, isSecondary: candSecondary }) => {
            if (!candSecondary && peerConnection.current) {
              await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
            }
          });
        }
      } catch (err: any) {
        console.error("Failed to access camera", err);
        setCameraError(err.message || String(err));
        if (!isSecondary) {
          exams.recordProctorLog(examId, { eventType: 'camera-error', details: String(err) });
        }
      }
    };

    if (socket) {
       initCamera();
    }

    return () => {
       if (streamRef.current) {
         streamRef.current.getTracks().forEach(t => t.stop());
       }
       if (peerConnection.current) {
         peerConnection.current.close();
       }
    };
  }, [socket, examId, isSecondary, proctoringLevel]);

  // Primary device receives offer from Secondary
  useEffect(() => {
    if (!socket || isSecondary) return;

    const handleOffer = async ({ offer, isSecondary: incomingSecondary }: any) => {
      if (!incomingSecondary) return; // Primary only answers to secondary in this MVP topology

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      peerConnection.current = pc;

      pc.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
          setIsSecondaryConnected(true);
        }
      };

      pc.onicecandidate = (event) => {
         if (event.candidate) {
            socket.emit('webrtc-ice-candidate', { roomId: examId, candidate: event.candidate, senderId: socket.id, isSecondary: false });
         }
      };

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
      socket.emit('webrtc-answer', { roomId: examId, answer, senderId: socket.id, isSecondary: false });
    };

    const handleCandidate = async ({ candidate, isSecondary: incomingSecondary }: any) => {
       if (incomingSecondary && peerConnection.current) {
         await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
       }
    };

    socket.on('webrtc-offer', handleOffer);
    socket.on('webrtc-ice-candidate', handleCandidate);

    return () => {
      socket.off('webrtc-offer', handleOffer);
      socket.off('webrtc-ice-candidate', handleCandidate);
    };
  }, [socket, examId, isSecondary]);

  const logEvent = async (eventType: string, details?: string) => {
    try {
      await exams.recordProctorLog(examId, { eventType, details });
      socket?.emit('proctor-event', { roomId: examId, eventType, details, timestamp: new Date() });
    } catch (e) {
      console.error(e);
    }
  };

  return { localVideoRef, remoteVideoRef, logEvent, pairingCode, isPrimaryConnected, isSecondaryConnected, cameraError };
}
