// 고른 이미지를 디스코드가 받는 data URI(PNG·JPEG·GIF)로 바꾼다.
//  - 움직이는 GIF는 캔버스를 거치면 멈춘 그림이 되므로 3MB 이하면 그대로 보낸다.
//  - 나머지는 프로필 사진은 정사각형 512px PNG, 배너는 5:2 960×384 JPEG로 가운데를 잘라 줄인다.
const MAX_BYTES = 3 * 1024 * 1024
const TARGET = {
  avatar: { width: 512, height: 512, type: 'image/png' },
  banner: { width: 960, height: 384, type: 'image/jpeg' },
}

function readAsDataUri(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('이미지를 읽지 못했어요.'))
    reader.readAsDataURL(file)
  })
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('이 이미지는 열 수 없어요. PNG·JPG·GIF·WEBP 파일을 골라주세요.'))
    img.src = src
  })
}

const bytesOf = (dataUri) => Math.floor(((dataUri.length - dataUri.indexOf(',') - 1) * 3) / 4)

export async function fileToDataUri(file, kind) {
  if (!/^image\/(png|jpeg|gif|webp)$/.test(file.type)) throw new Error('PNG·JPG·GIF·WEBP 이미지만 고를 수 있어요.')
  if (file.size > 20 * 1024 * 1024) throw new Error('20MB보다 큰 파일은 고를 수 없어요.')

  const original = await readAsDataUri(file)
  if (file.type === 'image/gif') {
    if (file.size > MAX_BYTES) throw new Error('움직이는 GIF는 3MB 이하만 올릴 수 있어요.')
    return original
  }

  const img = await loadImage(original)
  const { width, height, type } = TARGET[kind]
  const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight)
  const sw = width / scale
  const sh = height / scale
  const sx = (img.naturalWidth - sw) / 2
  const sy = (img.naturalHeight - sh) / 2

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, width, height)

  let result = canvas.toDataURL(type, 0.9)
  if (bytesOf(result) > MAX_BYTES) result = canvas.toDataURL('image/jpeg', 0.85)
  return result
}
