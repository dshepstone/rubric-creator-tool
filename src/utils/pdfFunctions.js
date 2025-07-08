export const generatePDF = (html) => {
  const newWindow = window.open('', '_blank');
  if (newWindow) {
    newWindow.document.write(html);
    newWindow.document.close();
    newWindow.focus();
    newWindow.print();
  }
};
