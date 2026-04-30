export function numberToWords(num: number): string {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if ((num = num.toString().replace(/[\, ]/g, '') as any) != parseFloat(num as any)) return 'not a number';
  let x = num.toString().indexOf('.');
  if (x == -1) x = num.toString().length;
  if (x > 15) return 'too big';
  const n = num.toString().split('');
  let str = '';
  let sk = 0;
  for (let i = 0; i < x; i++) {
    if ((x - i) % 3 == 2) {
      if (n[i] == '1') {
        str += a[Number(n[i] + n[i + 1])] + ' ';
        i++;
        sk = 1;
      } else if (n[i] !== '0') {
        str += b[n[i] as any] + ' ';
        sk = 1;
      }
    } else if (n[i] !== '0') {
      str += a[n[i] as any] + ' ';
      if ((x - i) % 3 == 0) str += 'Hundred ';
      sk = 1;
    }
    if ((x - i) % 3 == 1) {
      if (sk) str += (x - i - 1 == 9 ? 'Billion ' : x - i - 1 == 6 ? 'Million ' : x - i - 1 == 3 ? 'Thousand ' : '');
      sk = 0;
    }
  }
  if (x != num.toString().length) {
    const y = num.toString().length;
    str += 'point ';
    for (let i = x + 1; i < y; i++) str += a[n[i] as any] + ' ';
  }
  return str.replace(/\s+/g, ' ').trim();
}
