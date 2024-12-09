const startButton = document.getElementById('startVideo');
const SnapButton = document.getElementById('drawImage');
const StopButton = document.getElementById('stopRecord');
const zoomSlider = document.getElementById('zoomSlider');
let mediaRecorder;
let chunks = []; 
let videoTrack;

const videoHolder = document.querySelector('#videoOne');
const canvas = document.querySelector('canvas');
const videoName = document.getElementById('vidName');

startButton.addEventListener('click', () => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
            videoHolder.srcObject = stream;
            
            videoTrack = stream.getVideoTracks()[0];
            
            mediaRecorder = new MediaRecorder(stream);
            chunks = [];

            mediaRecorder.ondataavailable = event => {
                if (event.data.size > 0) {
                    chunks.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' }); // Fixed "blob" to "Blob"
                const viName = videoName.value.trim() + '.webm';
                const vidURL = URL.createObjectURL(blob);
                const newVideo = document.createElement('video');
                newVideo.src = vidURL;
                newVideo.controls = true;
                document.body.appendChild(newVideo);

                stream.getTracks().forEach(track => {
                    track.stop();
                });
            };

            mediaRecorder.start(); // Moved mediaRecorder.start() outside onstop
        })
        .catch(error => {
            console.error('Error accessing media devices:', error);
        });
});

zoomSlider.addEventListener('input', (event) => {
    if (videoTrack) {
        const zoomLevel = event.target.value;

        // Check if zoom is supported
        const capabilities = videoTrack.getCapabilities();
        if (capabilities.zoom) {
            videoTrack.applyConstraints({
                advanced: [{ zoom: zoomLevel }]
            }).catch(error => {
                console.error('Error applying zoom:', error);
            });
        } else {
            alert('Zoom is not supported on this device.');
        }
    }
});

SnapButton.addEventListener('click', () => {
    canvas.width = videoHolder.videoWidth;
    canvas.height = videoHolder.videoHeight;
    canvas.getContext('2d').drawImage(videoHolder, 0, 0, canvas.width, canvas.height);
});

StopButton.addEventListener('click', () => {
    if (mediaRecorder) {
        mediaRecorder.stop();
    } else {
        console.error('No active media recorder to stop!');
    }
});

const senderVid = document.getElementById('vidFrom');
const receiverVideo = document.getElementById('tooVid');

senderVid.addEventListener('canplay', () => {
    let videoFeed; 
    const fps = 0; 
    
        if (senderVid.captureStream) {
            videoFeed = senderVid.captureStream(fps); 
        } else if (senderVid.mozCaptureStream) {
            videoFeed = senderVid.mozCaptureStream(fps); 
        } else {
            throw new Error('Your browser does not support video stream capture.');
        }
    
        receiverVideo.srcObject = videoFeed;
});
