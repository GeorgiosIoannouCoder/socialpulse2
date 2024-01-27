const newMsgSound = (senderName) => {
  const sound = new Audio("/sound.mp3");

  sound && sound.play();

  if (senderName) {
    document.title = `New message from ${senderName}`;

    if (document.visibilityState === "visible") {
      setTimeout(() => {
        document.title = "Messages";
      }, 1000);
    }
  }
};

export default newMsgSound;
