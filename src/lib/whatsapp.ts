/** Turns a phone number as typed in settings ("+91 93245 41919") into the digits wa.me needs. */
export function whatsappDigits(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`; // a plain Indian mobile number
  return digits.replace(/^0+/, "");
}

export function whatsappUrl(phone: string, message: string): string {
  const digits = whatsappDigits(phone);
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
