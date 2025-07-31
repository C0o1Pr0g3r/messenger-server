const BITS_PER_CHARACTER_BASE64 = 6;
const BITS_PER_BYTE = 8;

function getNumberOfBytesToStore(length: number) {
  return (length * BITS_PER_CHARACTER_BASE64) / BITS_PER_BYTE;
}

export { BITS_PER_BYTE, BITS_PER_CHARACTER_BASE64, getNumberOfBytesToStore };
