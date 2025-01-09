import { Readable } from 'stream'

export async function handleBody(body: any): Promise<Buffer> {
  if (body instanceof Readable) {
    // Node.js Readable Stream
    return new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = []
      body.on('data', chunk => chunks.push(chunk))
      body.on('end', () => resolve(Buffer.concat(chunks)))
      body.on('error', reject)
    })
  } else if (body?.getReader) {
    // Web Streams API
    const reader = body.getReader()
    const chunks: Uint8Array[] = []
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
    }
    return Buffer.concat(chunks.map(chunk => Buffer.from(chunk)))
  } else {
    throw new Error('Unsupported Body type.')
  }
}
