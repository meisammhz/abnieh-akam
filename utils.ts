export const toPersianDigits = (num: number | string): string => {
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num
    .toString()
    .replace(/\d/g, (x) => farsiDigits[parseInt(x)]);
};

export const formatCurrency = (amount: number): string => {
  // Convert to Toman string with commas
  const withCommas = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return toPersianDigits(withCommas);
};

export const getCurrentShamsiDate = (): string => {
  // Simple approximation or hardcoded for demo, a real app would use jalaali-js
  // Let's assume current date is roughly 1403
  const date = new Date();
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', calendar: 'persian' } as any;
  return new Intl.DateTimeFormat('fa-IR', options).format(date);
};