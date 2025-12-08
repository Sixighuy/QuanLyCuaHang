/**
 * Format số tiền theo định dạng Việt Nam
 * @param {number} amount - Số tiền cần format
 * @param {boolean} showCurrency - Có hiển thị đơn vị tiền tệ không (mặc định: true)
 * @returns {string} - Chuỗi đã được format
 */
export const formatPrice = (amount, showCurrency = true) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return showCurrency ? '0 ₫' : '0';
  }

  // Chuyển sang số nếu là chuỗi
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  // Format với dấu chấm phân cách hàng nghìn
  const formatted = new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount);

  return showCurrency ? `${formatted} ₫` : formatted;
};

/**
 * Format số tiền với định dạng ngắn gọn (K, M, B)
 * @param {number} amount - Số tiền cần format
 * @returns {string} - Chuỗi đã được format
 */
export const formatPriceShort = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0 ₫';
  }

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (numAmount >= 1000000000) {
    return `${(numAmount / 1000000000).toFixed(1)}B ₫`;
  } else if (numAmount >= 1000000) {
    return `${(numAmount / 1000000).toFixed(1)}M ₫`;
  } else if (numAmount >= 1000) {
    return `${(numAmount / 1000).toFixed(1)}K ₫`;
  }

  return formatPrice(numAmount);
};

