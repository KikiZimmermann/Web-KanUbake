function showPopup(message, type = 'error') {
  const popup = document.getElementById('popup');
  const popupMessage = document.getElementById('popupMessage');
  
  popupMessage.textContent = message;
  popup.classList.remove('success', 'error');
  popup.classList.add('show', type);
  
  setTimeout(() => {
      popup.classList.remove('show');
  }, 2000);
}