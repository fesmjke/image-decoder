import { Decoder } from "./src/decoder.js";

(async () => {
  const decoder = new Decoder('./samples/git.png');

  const data = await decoder.decode();

  console.dir(data);
})();
