import { unicodeMapping } from './emojione_light';
import Trie from 'substring-trie';

const trie = new Trie(Object.keys(unicodeMapping));

const emojify = (str, customEmojis = {}) => {
  // This walks through the string from start to end, ignoring any tags (<p>, <br>, etc.)
  // and replacing valid unicode strings
  // that _aren't_ within tags with an <img> version.
  // The goal is to be the same as an emojione.regUnicode replacement, but faster.
  let i = -1;
  let insideTag = false;
  let insideShortname = false;
  let shortnameStartIndex = -1;
  let match;
  while (++i < str.length) {
    const char = str.charAt(i);
    if (insideShortname && char === ':') {
      const shortname = str.substring(shortnameStartIndex, i + 1);
      if (shortname in customEmojis) {
        const replacement = `<img draggable="false" class="emojione" alt="${shortname}" title="${shortname}" src="${customEmojis[shortname]}" />`;
        str = str.substring(0, shortnameStartIndex) + replacement + str.substring(i + 1);
        i += (replacement.length - shortname.length - 1); // jump ahead the length we've added to the string
      } else {
        i--;
      }
      insideShortname = false;
    } else if (insideTag && char === '>') {
      insideTag = false;
    } else if (char === '<') {
      insideTag = true;
      insideShortname = false;
    } else if (!insideTag && char === ':') {
      insideShortname = true;
      shortnameStartIndex = i;
    } else if (!insideTag && (match = trie.search(str.substring(i)))) {
      const unicodeStr = match;
      if (unicodeStr in unicodeMapping) {
        const [filename, shortCode] = unicodeMapping[unicodeStr];
        const alt      = unicodeStr;
        const replacement =  `<img draggable="false" class="emojione" alt="${alt}" title=":${shortCode}:" src="/emoji/${filename}.svg" />`;
        str = str.substring(0, i) + replacement + str.substring(i + unicodeStr.length);
        i += (replacement.length - unicodeStr.length); // jump ahead the length we've added to the string
      }
    }
  }
  return str;
};

const emojify_knzk = (str, customEmojis) => [
  {re: /5,?000\s*兆円/g, file: '5000tyoen.svg', attrs: 'style="height: 1.8em;"'},
  {re: /ニコる/g, file: 'nicoru.svg', attrs: 'style="height: 1.5em;"'},
  {re: /バジリスク\s*タイム/g, file: 'basilisktime.png', attrs: 'height="40"'},
  {re: /熱盛/g, file: 'atumori.png', attrs: 'height="51"'},
  {re: /欲しい！/g, file: 'hosii.png', attrs: 'height="30"'},
].reduce((text, e) => text.replace(e.re, m => `<img alt="${m}" src="/emoji/${e.file}" ${e.attrs}/>`), emojify(str, customEmojis));

export default emojify_knzk;
