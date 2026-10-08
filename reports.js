const buttons = document.querySelectorAll('[data-type], #pdfBtn, #excelBtn');

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    const type = button.dataset.type || button.id;
    const message = {
      pdfBtn: 'PDF export started successfully.',
      excelBtn: 'Excel export started successfully.',
      pdf: 'PDF report generated.',
      excel: 'Excel workbook exported.',
      email: 'Archive email queued.'
    };

    const toast = document.createElement('div');
    toast.textContent = message[type] || 'Report action completed.';
    toast.style.position = 'fixed';
    toast.style.right = '20px';
    toast.style.bottom = '20px';
    toast.style.padding = '12px 16px';
    toast.style.borderRadius = '999px';
    toast.style.background = 'rgba(9, 15, 29, 0.9)';
    toast.style.border = '1px solid rgba(111, 231, 255, 0.3)';
    toast.style.color = '#f4f7ff';
    toast.style.boxShadow = '0 12px 28px rgba(0,0,0,0.22)';
    toast.style.zIndex = '1000';
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 2200);
  });
});
