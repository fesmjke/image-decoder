import fs from 'fs/promises';

// png decoder
class Decoder {
  constructor(descriptor) {
    this.descriptor = descriptor;
    this.file = null;
  }

  #criticalChunks = {
    IHDR: {
      width: 4,
      height: 4,
      bitDepth: 1,
      colorType: 1,
      compressionMethod: 1,
      filterMethod: 1,
      interlaceMethod: 1,
    },
    PLTE: {
      red: 1,
      green: 1,
      blue: 1,
    },
  };

  parser = (type, buffer) => {
    const temp = {};
    let index = 0;

    if (Object.keys(this.#criticalChunks).indexOf(type) !== -1) {
      /* eslint-disable-next-line */
      for (const key of Object.keys(this.#criticalChunks[type])) {
        temp[key] = buffer.subarray(index, index + this.#criticalChunks[type][key]);
        index += this.#criticalChunks[type][key];
      }
      return temp;
    }

    return temp;
  };

  decode = async () => {
    this.file = await fs.readFile(this.descriptor);

    return new Promise((resolve, reject) => {
      const processed = {};
      const signature = this.file.subarray(0, 8); // https://www.w3.org/TR/2003/REC-PNG-20031110/#5PNG-file-signature

      processed.signature = signature;

      for (let index = 8; index < this.file.length;) {
        const lenght = this.file.subarray(index, index + 4).readInt32BE(0);
        const type = this.file.subarray(index + 4, index + 8).toString();
        const rawData = this.file.subarray(index + 8, index + 8 + lenght);
        const checksum = this.file.subarray(index + 8 + lenght, index + 12 + lenght);

        try {
          const parsed = this.parser(type, rawData);

          const data = Object.keys(parsed).length > 0 ? parsed : rawData;

          processed[type] = { lenght, data, checksum };

          index = index + lenght + 12;
        } catch (err) {
          reject(err);
        }
      }

      resolve(processed);
    });
  };
}

export { Decoder };