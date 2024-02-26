import axios from 'axios';

const playAudio = async ( text ) => {
  
  const voiceId = '21m00Tcm4TlvDq8ikWAM';

  const apiRequestOptions = {
    method: 'POST',
    url: `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    headers: {
      accept: 'audio/mpeg',
      'content-type': 'application/json',
      'xi-api-key': 'e4f62192ead2c018d1fb93f37d79809b',
    },
    data: {
      text: text,
    },
    responseType: 'blob', // To receive binary data in response
  };

  const apiResponse = await axios.request(apiRequestOptions);


  console.log("hello")
  const audio = new Audio(URL.createObjectURL(apiResponse.data));
  audio.play();

  await new Promise(resolve => {
    audio.addEventListener('ended', () => {
      resolve();
    });
  });
};

export { playAudio };