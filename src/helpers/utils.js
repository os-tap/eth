export function buf2hex(buffer) { // buffer is an ArrayBuffer
    return '0x' + [...new Uint8Array(buffer)]
        .map(x => x.toString(16).padStart(2, '0'))
        .join('')
  }
export function hex2buf(hex) {
    return new Uint8Array(hex.match(/[\da-f]{2}/gi).map(h => parseInt(h, 16))).buffer
}
export function serialize_form(from_data) {
    return Object.values(Object.fromEntries(from_data)).join(';')
}
export function serialize_forms(forms) {
    return forms.forEach(form => serialize_form(form)).join('/')
}
export function deserialize_form(str) {
    return str.split(';')
}
export function deserialize_forms(str) {
    return str.split('/').forEach(deserialize_form)
}

