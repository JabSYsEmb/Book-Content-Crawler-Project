const axios = require("axios");
const fs = require("fs");
const jsdom = require("jsdom");
const urls = require("./urls.json");

const domain = "https://www.kotobati.com";

const main =
  "#block-ktobati-content > article > div.article-body > div > div > div > div ";

const summary_selector = `div:nth-child(2) > div > div.tab-content`;
const meta_selector = {
  selector: `div.media.row > div.media-body.col-md-10`,
  sub: {
    header: `> h2`,
    author: `> p`,
    category: `> p`,
    meta: `> ul > li`,
  },
};

const image = `div.media.row > div.media-left.col-md-4.text-center > div > img`;
const download = `div:nth-child(2) > div > div.box-btn.mt-0.d-block.d-sm-flex.align-items-center.justify-content-center.text-align-center > a.btn.btn-icon.btn-1.download`;

const err_logger = (msg) => {
  console.error(`[logger - ${new Date().toLocaleTimeString()}]: ${msg}`);
};

const logger = (msg) => console.log(msg);

const document_builder = (html_as_string) =>
  new jsdom.JSDOM(html_as_string).window.document;
const main_selector = (document) => document.querySelector(main);

const get_url = (document) => {
  const { href: sub_url } = document.querySelector(download);
  const url = "https://www.kotobati.com" + sub_url;
  return [document, url];
};

const get_img = ([document, obj]) => {
  const regex = /data-src=\"(?<src>.*)\" a/;
  const {
    groups: { src, img = domain + src },
  } = document.querySelector(image).outerHTML.match(regex);
  return [document, { url: obj, img }];
};

const get_meta = ([document, obj]) => {
  const header = document
    .querySelector(meta_selector.selector + meta_selector.sub.header)
    .textContent.trim();
  const [{ textContent: _author }, { textContent: _category }] =
    document.querySelectorAll(
      meta_selector.selector + meta_selector.sub.author
    );
  const [author, category] = [_author.trim(), _category.trim()];
  const info = Array.from(
    document.querySelectorAll(meta_selector.selector + meta_selector.sub.meta)
  )
    .slice(0, 5)
    .map((item) => item.textContent.trim().replace("\n\n", "\n").split("\n"));
  const meta = { header, author, category, info };
  return [document, { ...obj, meta }];
};

const get_summary = ([document, obj]) => {
  const [{ textContent: summary }] = Array.from(
    document.querySelectorAll(summary_selector)
  ).map((item) => item);
  return [document, { ...obj, summary }];
};

const print_final = ([_document, info]) => {
  console.log(info);
  return info;
};

function url_decoder(url) {
  return decodeURI(url.split("/").pop()).replace(
    /-[\u{0041}-\u{007A}].*/gu,
    ""
  );
}

function pdf_downloader(url, path) {
  const name = url_decoder(path);
  axios
    .get(url, {
      responseType: "arraybuffer",
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    })
    .then((response) => response.data)
    .then((pdf) => fs.writeFileSync(`${path}/${name}.pdf`, pdf))
    .catch(err_logger);
}

function img_downloader(url, path) {
  const name = url_decoder(path);
  axios
    .get(url, {
      responseType: "arraybuffer",
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    })
    .then((response) => response.data)
    .then((img) => fs.writeFileSync(`${path}/${name}.jpg`, img))
    .catch(err_logger);
}

async function web_scraper_url(array_of_urls, idx) {
  await Promise.all(
    array_of_urls.map(url => {
      return axios
        .get(url)
        .then((response) => response.data)
        .then(document_builder)
        .then(main_selector)
        .then((item) => jsdom.JSDOM.fragment(item.outerHTML))
        .then(get_url)
        .then(get_img)
        .then(get_meta)
        .then(get_summary)
        .then(([_, res]) => {
          let path;
          if (res !== null) {
            const { author, header } = res.meta;
            path = `./books/${idx}/${author}/${header.trim()}`;
            fs.mkdirSync(path, { recursive: true }, err_logger);
            fs.writeFileSync(`${path}/meta_data.json`, JSON.stringify(res));
          } else {
            console.error("empty response...");
          }
          return [res, path];
        })
        .then(([res, path]) => {
          pdf_downloader(res.url, path);
          return [res, path];
        })
        .then(([res, path]) => {
          img_downloader(res.img, path);
        })
        .catch(() => {
          logger(url);
        });
    })
  );
}

async function yuzer_yuzer_calistir(urls){
  const start = 12000; 
  let idx = 12000;
  while(idx < start + 10000){
    await web_scraper_url(urls.slice(idx,idx+20), idx)
    idx = idx + 20;
    console.log(`=====================${idx}=========================`);
  }
}

yuzer_yuzer_calistir(urls);
