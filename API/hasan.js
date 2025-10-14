const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");
const crypto = require('crypto');
const Link = require("./models/Link.js");
//const { GoogleGenAI, Modality } = require("@google/genai");
//const Link = require('./models/Link');
const { spawn } = require("child_process");
const {
  fallBack,
  getDataFromSeaArt,
  getOnceArtData,
  seaArtUploader,
  fluxproGen,
  getOnceArtUpscale,
  getRandomData,
  fileName,
  upload,
  downloadFromUrl,
  downloadImageAsBase64,
  api,
  grokStream
     } = require('./utils');
const { tokens, VYRO_API, HG_API } = require("./config");

const DOWNLOAD_FOLDER = path.join(__dirname, "downloads");
if (!fs.existsSync(DOWNLOAD_FOLDER)) {
    fs.mkdirSync(DOWNLOAD_FOLDER);
};
const uploadFolder = path.join(__dirname, 'images');
if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder);
};


async function smsboomber(number, limit) {
  if (!number || !limit) {
    return "📵 number and limit must be provided";
  }
  
  const isValid = /^[0-9]{11}$/.test(number);
  if (!isValid) {
    return "📵 Invalid number! Must be 11 digits and numeric (e.g. 01XXXXXXXXX)";
  }

  try {
    const { data } = await axios.get(`https://sms-boomber-production.up.railway.app/sms-boomber?number=${encodeURIComponent(number)}&limit=${encodeURIComponent(limit)}`);
    return data.response;
  } catch (error) {
    throw new Error(error)
  }
};

async function edit(url, prompt) {
  if (!url || !prompt) {
    return "url and prompt are required.";
  }
  try {
    const { data } = await axios.get(`${await api()}/edit?url=${encodeURIComponent(url)}&prompt=${encodeURIComponent(prompt)}`);
    if(data.status === "success") {
      return { response: data.response, url: data.url };
    } else {
      return { response: data.response };
    }
  } catch (error) {
    throw new Error(error)
  }
};


async function upscale_2(url) {
  if (!url) {
    return "url is missing!";
  }

  try {
    const { data } = await axios.post(
  'https://queue.fal.run/fal-ai/esrgan',
  {
    'image_url': url
  },
  {
    headers: {
      'sec-ch-ua': '"Chromium";v="137", "Not/A)Brand";v="24"',
      'sec-ch-ua-mobile': '?1',
      'Authorization': 'Key be2ef301-67be-4834-a9dc-485549cc1719:b54707a909af99411f1158ceb32184be',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Referer': 'https://www.onceart.com/',
      'sec-ch-ua-platform': '"Android"'
    }
  }
);
    console.log(data);
    const status = data.status_url;
    const response = data.response_url;
    const image = await getOnceArtUpscale(status, response);

    return image;
  } catch (e) {
    throw new Error(e);
  }
};

async function swap(swapFrom, swapTo, type) {
  if(!swapFrom || !swapTo || !type) {
    return "swapFrom, swapTo and type are required";
  }

  const sFrom = await seaArtUploader(swapFrom);
  const sTo = await seaArtUploader(swapTo);
  
  const applyMap = {
    face: "ct2qk8htbv3c73ck5g4g",
    cloth: "cusbdb5e878c73f5ob90",
    mix: "ct40sn5e878c738367f0"
  };
  const applyID = applyMap[type];

  const inputMap = {
    face: [
      {
        'field': 'image',
        'node_id': '10',
        'node_type': 'LoadImage',
        'val': sFrom
      },
      {
        'field': 'image',
        'node_id': '16',
        'node_type': 'LoadImage',
        'val': sTo
      }
    ],
    cloth: [
      {
        'field': 'image',
        'node_id': '60',
        'node_type': 'LoadImage',
        'val': sFrom
      },
      {
        'field': 'image',
        'node_id': '61',
        'node_type': 'LoadImage',
        'val': sTo
      }
    ],
    mix: [
        {
            'field': 'image',
            'node_id': '40',
            'node_type': 'LoadImage',
            'val': sFrom
        },
        {
            'field': 'image',
            'node_id': '47',
            'node_type': 'LoadImage',
            'val': sTo
        },
    ]
  };
  const input = inputMap[type];

  try {
    return await fallBack(async (token) => {
    const response = await axios.post(
  'https://www.seaart.ai/api/v1/creativity/generate/apply',
  {
    'apply_id': applyID,
    'inputs': input,
    'g_recaptcha_token': '03AFcWeA6O5AnymDxdmN-RrKVGLAiOCbUEwjX_IqB7auHKIqbVp8a6AxhJ-Bj6E3n6U_xgfTrr2KmhD7a3YKGAp8E6oXfTzQJWzPrGl_kcqEW6dbcoWqHxj-D8JvyHQKmLvhuoIZ7V3Xh0wm9smknsEoV009FaMwxf0vE0CyHV1AwKvcBEAahSILx8UCsokTf1o9Gwe27M9VQGl3lTQf_uAoHjh27OsF6LNhMnEcHXC_oIuid-RKHVxOh7djeVocMwqQdge0g7gKq_d_AdSdvPaYP0K8b3KydDii8hsiRe0vD8EkWdI7wPudqNMH4H9NqdT-mj91eJd5_xeQepw61yPHYvfiYX2x4XmXoq7sE7d33ySC9qHOO9d0gtBE8L6gyVpiS2r2nmeqxLPsMmRHctQngGPQ4FUkWDjAhItsXxhMdKXM-un04TKBRl7SwGV9kmiGqffo6KZRFMR6gqhc21c2DIG30emIT2G49ysas8yQctDJT3SmDz0y4MTDKBZfN8RjYRX96f9kcVGMj5Ew-YZ0RzfR81sOnCuLwQ6DANP1Yo-Rv6X19JvFJICUFHZAQKMS5FE8JvetEb1JSdNzgaADn_gJmwpwD8rqCGo-x39Cb9o31vU8Pg577iXk-nWTtz8ixQwdBLrKShvEMxpkIvtJv97Nof-cUpXPwXTnojAQ2BlTpJtHacvV8GOiU8JkVJS07ojjvTnvrp0wH0ms5lx5GaxATODyx91nIoXoEUOofW5VPeqW3Ran1Yur1TMYXfuMH6-Sp18NOnzmTrgWyGli1TtC11TTmcelXzXKaac31EDZw7H3KgKJ-Iinll-LmLCa8DWYIYkKkmJvGNZSL4OrgwxTeWC4vyR9awJ_qNPfulDCPgNhxHRmSafvfM3qrkeDahEdiiTsm7Q9qd1GV_csmol58V1YgYWY4f72dHvYEB0ZFzuSU8vk67dr1ZzsDf-otRpaPUOoU5B2XOhvfHrke2cvyw9LEgoBNaWnhtecuSnWllzdnBdwXeAapUaidjI9V9RPLuGf1yWQccNgLreZ4aui9TjthYu_rnn8GvubQnwJORFa5Ll3IikFqHFVjGga0dRWEpSAB70ap8oFkWbSsvT8UsWOIWJvHg_ebNse4Z_I6BsWVuiuhYhdyGCRy_i_ytn-Ot5g9Kj6XGy8gBGyaHJNBCeFP3QYCyly5TkSBhsJyHQKgFaf8JtPp2SkqcUYpUKTRLO5AhFqZwMf1zpbt5NTq_87amVjpfVQAXiUoNUSK6kahjJntHX81uCBMvgHdD0fUTgipAuVE-nhYJ51_bOjjRdvsr0zKUQjCasOUEF_UTAt2naBBWXjmIq2M2mLcPVC8u6n6mfWa2yA3oS4IegH4f1zUyJ2lZxSKMsg57_uJhrSAIcZsxDndTraVEg-2H_JD8yF1DzxQrtxhPqfka-NmhbQu42h3FpnJQ9Rr-olAVYGSs6CyYjKII3aCZ0n4TPpimktET7xZMGvdKQtim-vCM86jZggHlKKwXGgo1tm-BlfDvyIiuqtnljpwbz-sE825OTJJzLYOTaVX9vT5JhhrhItgkpVrbZukmEnZ6N7qvPvoscptBS6izrPaGJH8dDAmPg9pGnDnZE4PxpdYHvZXTQohYBXbHRyRAXBgL6k05TKj-8bWPiJGLLTu3yO4jAXpRF6dO2S3rRv_0WbHipfaCGuxrjeDZxGUbqb2_odtilTlBQzzEr_iZ3r--dxq-DDUmZdErRFLhT9jGodLANFtG55THk_sf4M0MIKoxjEGfjrKFS08ropA7F9ZLzMnDjVlIZMxnDouk1i8ou_o8OiIxkU5XL_YFwnLQF_4Lv4NWYysU9QFzFzkGKkaUZWT_1xXvYBC4cRXkpQLV-S_t8GxB28LV8epYeomkQ-bWF1T6OVc2FI3ECnJCOykOwz5GPjFSS56KGKzjox2_hr72C2dothALXOhP-R_MsHKVlMkcSsPD8Z-5wDzfBkYR3_xby6t09-WQsdJwdQeflIeFm8znNzyheOy3_tbRqnEhqHmIwbcM4XkTqP5mBR6yTt1K2K-eSirprOLK5p4iyTeyb8q-IobEtQ',
    'task_flow_version': 'v2'
    },
    {
     headers: {
       'authority': 'www.seaart.ai',
       'accept-language': 'en',
       'cookie': `_fbp=fb.1.1748332541103.161936213781524982; T=${token}; lang=en; X-Eyes=false; deviceId=71682b86-5e26-441c-a07a-007e87d34350; _ga=GA1.1.471471526.1748334600; _pin_unauth=dWlkPU1EaGlNemd6WmpBdE9EZGtPQzAwTnprekxXSTBObVF0WmpNNFpXVTFPV0ZrWWpObA; _gcl_au=1.1.749810034.1748334604; browserId=d51971dc459c87ce528af797217bc824; _uetsid=fc212df03acf11f086209d83494028c7; _uetvid=fc22cb803acf11f0a833b3237d732b73; enable_tavern=true; locaExpire=1748340501865; isDeadline=false; pageId=9c8551d7-a058-459d-b425-d4a7aadba1e7; _ga_YDMZ43CD3E=GS2.1.s1748340207$o2$g1$t1748340244$j23$l0$h0$dVcQudWXgBhXXodU4tFXop-E2pRKpTUqptQ; _ga_4X5PK5P053=GS2.1.s1748332478$o6$g1$t1748340244$j15$l0$h0$d9DoInIewfx-ECmyfcuZmPaJ4HtBAS_k46Q`,
       'origin': 'https://www.seaart.ai',
       'referer': 'https://www.seaart.ai/ai-tools/image-upscaler',
       'X-Timezone': 'Asia/Dhaka',
       'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
       'Token': token
      }
   }
);
      console.log(response.data.status);
    const status = response.data.status;
      if(status.code !== 10000) throw new Error(`retrying... ${status.msg}`);
    
    const id = response.data?.data?.id;
    const key = token;
    const [imageUrls] = await getDataFromSeaArt(id, key);
    return imageUrls;
    }, tokens);
  } catch (e) {
    throw new Error(e);
    }
};

async function removebg(url) {
  if(!url) {
    return "url is required";
  }

  const seaArtUrl = await seaArtUploader(url);
  try {
    return await fallBack(async (token) => {
    const response = await axios.post(
    'https://www.seaart.ai/api/v1/task/create',
    {
      'action': 19,
      'source': 8,
      'meta': {
        'remove_background': {
          'uri': seaArtUrl
        }
      }
    },
    {
     headers: {
       'authority': 'www.seaart.ai',
       'accept-language': 'en',
       'cookie': `_fbp=fb.1.1748332541103.161936213781524982; T=${token}; lang=en; X-Eyes=false; deviceId=71682b86-5e26-441c-a07a-007e87d34350; _ga=GA1.1.471471526.1748334600; _pin_unauth=dWlkPU1EaGlNemd6WmpBdE9EZGtPQzAwTnprekxXSTBObVF0WmpNNFpXVTFPV0ZrWWpObA; _gcl_au=1.1.749810034.1748334604; browserId=d51971dc459c87ce528af797217bc824; _uetsid=fc212df03acf11f086209d83494028c7; _uetvid=fc22cb803acf11f0a833b3237d732b73; enable_tavern=true; locaExpire=1748340501865; isDeadline=false; pageId=9c8551d7-a058-459d-b425-d4a7aadba1e7; _ga_YDMZ43CD3E=GS2.1.s1748340207$o2$g1$t1748340244$j23$l0$h0$dVcQudWXgBhXXodU4tFXop-E2pRKpTUqptQ; _ga_4X5PK5P053=GS2.1.s1748332478$o6$g1$t1748340244$j15$l0$h0$d9DoInIewfx-ECmyfcuZmPaJ4HtBAS_k46Q`,
       'origin': 'https://www.seaart.ai',
       'referer': 'https://www.seaart.ai/ai-tools/image-upscaler',
       'X-Timezone': 'Asia/Dhaka',
       'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
       'Token': token
      }
   }
);
      console.log(response.data.status);
    const status = response.data.status;
      if(status.code !== 10000) throw new Error(`retrying... ${status.msg}`);
    
    const id = response.data?.data?.id;
    const key = token;
    const [imageUrls] = await getDataFromSeaArt(id, key);
    return imageUrls;
    }, tokens);
  } catch (e) {
    throw new Error(e);
  }
};

async function tools(url, type, prompt) {
  if(!url || !type) {
    return "url and type are required";
  }
  
  if (!["upscale", "undress", "removebg", "changebg", "blurbg", "edit", "draw", "art", "upscale_2", "logo", "undresspro", "gta", "expend", "naked"].includes(type)) {
    return "Invalid type !?\nAvailable: upscale, upscale_2, undress, removebg, changebg, blurbg, edit, draw, art, gta, logo, undresspro, expend, naked .etc";
  };

  if (["changebg", "edit"].includes(type) && !prompt) {
    return "prompt are required";
  }

  const applyMap = {
    upscale: "d0gugqle878c73fhtctg",
    upscale_2: "d0gmq65e878c73dgca70",
    undress: "d0mo88le878c73es98s0",
    removebg: "cv7m4gte878c73edlg40",
    changebg: "cqacvqde878c73dj234g",
    blurbg: "cvd8ucte878c73dd45qg",
    edit: "d070sqhl2o2c73aou74g",
    draw: "cqtg92de878c7392oav0",
    art: "csc9l35e878c73cn55f0",
    logo: "d13nj3te878c7382r6mg",
    undresspro: "ctha0dde878c73dbt58g",
    gta: "d0dku45e878c73dnpgo0",
    expend: "cos9stle878c738ijfcg",
    naked: "cu0hf6de878c73c1qrag"
  };
    const typeID = applyMap[type];
     
    const seaArtUrl = await seaArtUploader(url);

  const inputMap = {
    expend: [
        {
            'field': 'image',
            'node_id': '5',
            'node_type': 'LoadImage',
            'val': seaArtUrl
        },
        {
            'field': 'left',
            'node_id': '50',
            'node_type': 'ImagePadForOutpaint',
            'val': 400,
        },
        {
            'field': 'right',
            'node_id': '50',
            'node_type': 'ImagePadForOutpaint',
            'val': 400,
        },
        {
            'field': 'top',
            'node_id': '50',
            'node_type': 'ImagePadForOutpaint',
            'val': 400,
        },
        {
            'field': 'bottom',
            'node_id': '50',
            'node_type': 'ImagePadForOutpaint',
            'val': 400,
        },
    ],
    upscale: [
      {
        'field': 'image',
        'node_id': '11',
        'node_type': 'LoadImage',
        'val': seaArtUrl
      },
      {
        'field': 'Number',
        'node_id': '54',
        'node_type': 'Int',
        'val': '1536'
      }
    ],
    upscale_2: [
      {
        'field': 'image',
        'node_id': '10',
        'node_type': 'LoadImage',
        'val': seaArtUrl
      },
      {
        'field': 'Number',
        'node_id': '80',
        'node_type': 'Float',
        'val': '0.25'
      }
    ],
    undress: [
      {
        'field': 'image',
        'node_id': '1',
        'node_type': 'LoadImage',
        'val': seaArtUrl
      }
    ],
    removebg: [
      {
        'field': 'image',
        'node_id': '2',
        'node_type': 'LoadImage',
        'val': seaArtUrl
      }
    ],
    changebg: [
      {
        'field': 'image',
        'node_id': '11',
        'node_type': 'LoadImage',
        'val': seaArtUrl
      },
      {
        'field': 'text',
        'node_id': '73',
        'node_type': 'CR Text',
        'val': prompt
      },
      {
        'field': 'batch_size',
        'node_id': '42',
        'node_type': 'EmptyLatentImage',
        'val': 1
      }
    ],
    blurbg: [
      {
        'field': 'image',
        'node_id': '1',
        'node_type': 'LoadImage',
        'val': seaArtUrl
      },
      {
        'field': 'angle',
        'node_id': '32',
        'node_type': 'LayerFilter: MotionBlur',
        'val': -15
      },
      {
        'field': 'blur',
        'node_id': '32',
        'node_type': 'LayerFilter: MotionBlur',
        'val': 25
      }
    ],
    edit: [
      {
        'field': 'image',
        'node_id': '2',
        'node_type': 'LoadImage',
        'val': seaArtUrl
      },
      {
        'field': 'prompt',
        'node_id': '1',
        'node_type': 'OpenSeaArtImageEdit',
        'val': prompt
      }
    ],
    draw: [
      {
        'field': 'image',
        'node_id': '33',
        'node_type': 'LoadImage',
        'val': seaArtUrl
      }
    ],
    art: [
      {
        'field': 'image',
        'node_id': '3',
        'node_type': 'LoadImage',
        'val': seaArtUrl
      }
    ],
    logo: [
        {
            'field': 'image',
            'node_id': '24',
            'node_type': 'LoadImage',
            'val': seaArtUrl
        },
    ],
    undresspro: [
        {
            'field': 'image',
            'node_id': '1',
            'node_type': 'LoadImage',
            'val': seaArtUrl
        },
    ],
    gta: [
        {
            'field': 'image',
            'node_id': '21',
            'node_type': 'LoadImage',
            'val': seaArtUrl
        },
    ],
    naked: [
        {
            'field': 'image',
            'node_id': '309',
            'node_type': 'OpenSeaArtLoadImageWithWH',
            'val': seaArtUrl
        },
        {
            'field': 'expand',
            'node_id': '170',
            'node_type': 'GrowMask',
            'val': 30,
        },
    ]
  };

  const input = inputMap[type];

  
  try {
    return await fallBack(async (token) => {
    const response = await axios.post(
  'https://www.seaart.ai/api/v1/creativity/generate/apply',
  {
    'apply_id': typeID,
    'inputs': input,
    'g_recaptcha_token': '03AFcWeA56LJmvQDnY-4OLt3dXamg5-GpaTebSiMTN_5DgywWhBUUn5mkNO5R1hvm3FLAu4KAMtWi1frSAoGA80VIzIhrD11SBbU1v-4nCuCaVa8VP0Za-WwjP6KuZnXInaMsTrR5ezpV-cOkwdVY9DWrmsEFLoa5Txd53jIgDL-axvIl1_1RRJP-T738uqsol8Mnaj-CcMQ26NmT-1zTz2ZVYuDmSmK8EKUePMyY1-Dk_N9pUtjY0p0j0ZqCzLcQqtQdNEqfciYnTugNOU6mcDfHhMkFqH4N9xLJx3EGg7hAdCltSP6QFDSR154S1AsR6WSMORV-EDy0DdZesxBdSFX4BGp_xXpewpZs6xJQKwpwdzPil1mhusMmlU0DF4uLLOHbv1Z21fsM92G4jy2DsLl0CRqiG-5ZBzaBcHs38I9pfn2thV1fEFlqIAAd6mMYHEGHTQCVdwX4PFcMJa3E2P_iapZgALrbQNMgRCfw1EC8k9btanJKR4NtusPSptJX8326Wznm-bDGqqq7YHHQBJRGV6Krl-j4m3GprQn6p495HOBH1B4mgZmyaH0LbWksVn4y0EaoqIssuafytAypSZhRX_-Er1lnpnhc6OG7dglBtKM6RPRXR_lZo542OrGjKrNKH6TM4AjkS-_pRFlrSrbva3EmxXqsS_HXpMIWJwnBuDdPzHQg6Pc_TP4Gd4bKxDtXGqwjK_QS9mmmzs4v7UCXb-M1z8JGjjG82iiNCdnZzGySR7TCXn-PpDGToTwle2FfLBwTS2B_ds6CVBILcZ9VAiTOEwzb77RHSt8WeM-yMWOZXpgITLxJxZs662dhdyfKBq68_Tf2Ur6atJit93R3teTlsDBoxTSbgnBVWUGC9vzJQkpiFGV2mGlF23_rYrXBwqPZed5FUcVK_Yk1MQKJPMRokZLkgmqCgj-Wa-Di9lc5t92VETpIh32US8apdFsQ3muFmLYFKcBehfOmOoMaQYoNGkHDEr3iudUa3gttEZ0-AGqW2v6Glr2r5qzruFVp0Y2baXUwhEWMRzQzz4IFarO6R5K7H5Eu7JuyGQP3hkLxKabF8VRmZi8QC-whpvHyD83ZPNyWd-yz9hPEgJ2cps9WjOVYnsypsHhU2yat3d_l70MnkOB-OkxQ0aT8htjDEibjwWH3p7YRLWyXdtllcp4WVeOt4scvupJWAMEs0A43CRotfv_crnKbZtEmuKCB02C0cWUpiPP5RDhGOXaHUB2d_FuH2FuoHZT9ffbuehpybFCDRiC7NcEZoqtgzGgKwXMWEA-0ePN4nDsi_wxY5vNBdNeqmEkjIC89dzP6IvLFuHhpJCcO3lUjJH_rFrX1l8ExIX4Tugpahbtr7BYqmrOlqtKtLdZYxcrfgt1KEQWN7q9w5yLpZQNcGnAL1B5AkRZxzD7Sa59g8pFJ8xNuKaCODSye6YHCT6jI8pOUvGNH_ngW6N_jBbFdNOdUtofeQXiRLvbisXwpe7x48gAXuSvaah7SPlhmIvFIae-3iZm7rPRapQowxbgTFgbeQGqzcbxQPXR1VXG5h_FhJg0KYUe3lYI2EcKqEu-5Kkb2eTnLQB3gDDBoIKMfvEuEfOtINBJYBotb53ndS_23Z9bHnzfZ3M6br7NEizzUlLRisVRmm0Jm-E9GOS7jmcohv9LigcsaM7Xi0ZUz3eqxy6RZWT3QW3VUf-JfiheubEuKvFn8iibr6GZO8TMLq4csIv-_j6S-F0RKcWWjrOPSg06BQttNfg1tu9XaS62zRiMvld0AvChBa6k94Qq8-rVEleTEMjbtMGungzH4-kteZ9uB5UmmduWC3WUHHdXy9NO4qiX9xWfSp4itganYtBEG2Xy3ODZlRopQGqX65Gwlw-wJdZ7ydAq2nsLwWfQsuD3GoOl7Nh1hcfFvHaZ121f6BNtE5afZATQ5pALe5raLSIpmLPc3ztJpSEt-xgwyIo2xJC_r0TKxorEHF5Mh8NNiR1x3_MRqllUKGK0crQGMtX2J-z4BJDkCTWFdLu-unXoH-JGhyb4LONoJiBQLJLbuGLP-rDJzihhF0',
    'task_flow_version': 'v2'
  },
  {
    headers: {
      'authority': 'www.seaart.ai',
      'accept-language': 'en',
      'cookie': `_fbp=fb.1.1748318094574.679225651710543005; T=${token}; lang=en; X-Eyes=true; deviceId=5edc8c93-cac4-406e-9568-10b7328d8d16; pageId=1465561b-c5ed-438c-b263-7146f19b40d8; browserId=d51971dc459c87ce528af797217bc824; _ga=GA1.1.796007903.1748320931; enable_tavern=true; _uetsid=f6061b903ab411f0a52e35fb33000708; _uetvid=f6075ba03ab411f08299a32e5fd816da; _gcl_au=1.1.1030346700.1748320935; _ga_YDMZ43CD3E=GS2.1.s1748320930$o1$g1$t1748320939$j51$l0$h0$dSfwV-8AqpNdbJJ5G6PXPwislQqoFHO6Y3Q; _ga_4X5PK5P053=GS2.1.s1748313152$o3$g1$t1748320939$j56$l0$h0$d9DoInIewfx-ECmyfcuZmPaJ4HtBAS_k46Q`,
      'origin': 'https://www.seaart.ai',
      'referer': 'https://www.seaart.ai/create/ai-app?id=d0fge2le878c73en9f9g',
      'token': token,
      'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
      }
  }
);
      console.log(response.data.status);
    const status = response.data.status;
      if(status.code !== 10000) throw new Error(`retrying... ${status.msg}`);
    
    const id = response.data?.data?.id;
    const key = token;
    const [imageUrls] = await getDataFromSeaArt(id, key);
    return imageUrls;
    }, tokens);
  } catch (e) {
    throw new Error(e);
    }
};

async function text2song(lyrics, voice) {
   if (!lyrics || !voice) {
     return "lyrics and voice parameters are required";
   }
  
  try {
return await fallBack(async (token) => {
const response = await axios.post(
  'https://www.seaart.ai/api/v1/creativity/generate/apply',
  {
    'apply_id': 'd0fge2le878c73en9f9g',
    'inputs': [
      {
        'field': 'tags',
        'node_id': '14',
        'node_type': 'TextEncodeAceStepAudio',
        'val': `${voice} vocals, crystal clear tone, dreamy quality, electro-pop, upbeat rhythm, modern electronic effects, commercial quality`
      },
      {
        'field': 'lyrics',
        'node_id': '14',
        'node_type': 'TextEncodeAceStepAudio',
        'val': lyrics
      },
      {
        'field': 'seconds',
        'node_id': '17',
        'node_type': 'EmptyAceStepLatentAudio',
        'val': 40
      }
    ],
    'g_recaptcha_token': '03AFcWeA6H9KmejeaFSU_p4AO6RP9oS8J-X5TwSeQAW_D13LNlf3J5gvxt6oydvIOvvMXk8BMasrttHHWbshuew0tc8Y_eZF9wUDJCAZIlgtwWxo0tBYYQPjU5vYsnp5Qs4LQDeIJyqpYFzF_fst3UN0mDbIk0x7AhG-I7tp7sS4dqv_zpsiGFzlZpf99AJ_K5k5tUgfx6b0bWXuhRE4dbcEsaS--tn2cUY9iVypq0n5MzD0H2MVME7jeNataJGxSFcIqS6fjMMLaHqwnBABCY3CKMg2KOC8x9nRMyXihJfNO2BSuv5vkGYboDkMK-HlWQSMbhRJKSgAGE1DvoXRL7eRsjI0qCuOuUKaTjHilNzo4fmLzZpmqrUyTfD6Q1M-Eui6-FDFmVeUeJCKFRKbG_L2EltJp6klY2LsZqUmtP0usqx43s46pZH7wefiwDGvmva8g2zmijSR51_XuX8NdBg0RVaZKLMer03V2Qa35esM2T8O16qLY91dyNU7dptTcCylT35BRq2WTpIpFzF7B1o_450d7TcubsqNeezLnW5PzZbtL0awCzWkQMLCesms0L74O7SNagfWmdu3TkC-WrxrBF37JlxcwqrjieClVUUg1k1ORlNHL7Vv68I5689wZ5j9ikMzAeAihwp2G0HtDicQH4YHe_Zo5MC_se61cF0fpafT8fBIEzt3NbJYMyRTpcH3h8S7xC2JziMpa8YwUO0w8rydGXcNg_-DC3jkBuK9I_LT3b0ibS-kzUCHzDtL87VDZ16vZtSOc0aP69YB9issu28U-OoLuBi_6Xl3NAFpxk6_r-PgeuMmzUK0ooA3tCVI3UaKnT9uqRJqxQn3BNYZyIuojm-rys3OfVu4z7nVXc4HDw18gxwd3XRjBFqj1Mm4TuhvYZiSyiXuvCs1Doi_wN248R07fB48mFKv5YD7PTnHvq2igB2nZZv_zUA6vuCDbxnrX4__whdbdqh92nwlHel-kQjKR9wFurzve7EnWt_WYrHlvp_EdAdIbcX6Q47i-TULLhu9rYJR_hV706J_jdEXjg3E6ZaP5Z1chB49xG-fa5U7AzCBnJCQr07b6nxwV2ONKUQVnApvEHXmSlTBcFldYvuT31AkvkgiP6Xc4C0ZRD_jCPBBOtIs-MtJWCgFFDDK0fyhQtW40WQGh6GRT2oeCfHvTXibv19CsJEwCII0gjkfV7Oue_Z9IzgqPsUM2XC-cEXBEX6FqKlnmVfJlo_qegwh5Ihj_MKgvgXhJgMUyWCHps4Y0utLwhzlPmfVpE-Vw8UB6rCZiSNxXkD0nPN7vqNn4-Knk0SJDfS60_7eaQ7lYtAGUbP8kb6saT1UiIOzr7aU51K3Mkk3jKIDl73rsIQQRUceKAasRROOtfU-1MwTYb9xajpZrH5zPXDpbvQySSMWlwV--aCm7E7vYo1Nu8CenYcdxdZm-XuEz1tOv1v2afW7ZAuWEEw7ho24p5wF_bLaxK_8WRklgtNtjR4wIGCxqMxVOJPlUslm57JkGvG-WIDjwPLWL799cjzZlgi1w2xWufmJ0BbWAiBgZcbfQ1U-PQlTI29eGD3KTs7Ju39M5l-PfoZ3sSSC8hh1iwIFdJcBZpAqfPgaw4sVRO7w-_k7H2D80yYLy3SLOZrASh-pWP039wRk6Nel3-HxVnUIT8SzeI4mqD1vF0paC3cWo6ybrn15q3S1pwIsn8GuQ_G7plXDgpvKW8qeUvVwwqoRqdYkz6mP3Xzuc8CnI8eHA2Jc1yn2DvIWWiOhwy-Rtadib4kZS6JteDi8-zc2PGYBeR20vEo5TgbmqvdF-ZkZK-1T4xmL8q3Uc_URN_HNfNvbuzP2v0YtBo_FCl4ObFTTiv7vdGl7GvvDbBQcSSiP17Bk7Wzdyxlw4BLc5-u27Yz7udiWG8ty6HrxqMQBdbZaQ-n3fTBMPBoNAIV9vjLyXwOFE40G-IkpXy4x7WspXJrAop8F1uZes2q3i3ugxbcwRZJxz0POV7A0ZaHzjxrdcg9WF2W55ybUrmZ5OnLkEzAuqiHM0_3eNUJHEf3_bvNC4NCAad',
    'task_flow_version': 'v2'
  },
  {
    headers: {
      'authority': 'www.seaart.ai',
      'accept-language': 'en',
      'cookie': `_fbp=fb.1.1748318094574.679225651710543005; T=${token}; lang=en; X-Eyes=true; deviceId=5edc8c93-cac4-406e-9568-10b7328d8d16; pageId=1465561b-c5ed-438c-b263-7146f19b40d8; browserId=d51971dc459c87ce528af797217bc824; _ga=GA1.1.796007903.1748320931; enable_tavern=true; _uetsid=f6061b903ab411f0a52e35fb33000708; _uetvid=f6075ba03ab411f08299a32e5fd816da; _gcl_au=1.1.1030346700.1748320935; _ga_YDMZ43CD3E=GS2.1.s1748320930$o1$g1$t1748320939$j51$l0$h0$dSfwV-8AqpNdbJJ5G6PXPwislQqoFHO6Y3Q; _ga_4X5PK5P053=GS2.1.s1748313152$o3$g1$t1748320939$j56$l0$h0$d9DoInIewfx-ECmyfcuZmPaJ4HtBAS_k46Q`,
      'origin': 'https://www.seaart.ai',
      'referer': 'https://www.seaart.ai/create/ai-app?id=d0fge2le878c73en9f9g',
      'token': token,
      'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
    }
  }
);
      console.log(response.data.status);
    const status = response.data.status;
      if(status.code !== 10000) throw new Error(`retrying... ${status.msg}`);
    
    const id = response.data?.data?.id;
    const key = token;
    const [imageUrls] = await getDataFromSeaArt(id, key);
    return imageUrls;
    }, tokens);
  } catch (e) {
    throw new Error(e);
   }
};

async function editpro(url, prompt) {
  if(!url || !prompt) return "url and prompt are required";

  const seaArtUrl = await seaArtUploader(url);
  try {
    return await fallBack(async (token) => {
    const response = await axios.post(
  'https://www.seaart.ai/api/v1/creativity/generate/apply',
  {
    'apply_id': 'd017fv5e878c738ltm1g',
    'inputs': [
      {
        'field': 'image',
        'node_id': '2',
        'node_type': 'LoadImage',
        'val': seaArtUrl
      },
      {
        'field': 'prompt',
        'node_id': '1',
        'node_type': 'OpenSeaArtImageEdit',
        'val': prompt
      }
    ],
    'g_recaptcha_token': '03AFcWeA56LJmvQDnY-4OLt3dXamg5-GpaTebSiMTN_5DgywWhBUUn5mkNO5R1hvm3FLAu4KAMtWi1frSAoGA80VIzIhrD11SBbU1v-4nCuCaVa8VP0Za-WwjP6KuZnXInaMsTrR5ezpV-cOkwdVY9DWrmsEFLoa5Txd53jIgDL-axvIl1_1RRJP-T738uqsol8Mnaj-CcMQ26NmT-1zTz2ZVYuDmSmK8EKUePMyY1-Dk_N9pUtjY0p0j0ZqCzLcQqtQdNEqfciYnTugNOU6mcDfHhMkFqH4N9xLJx3EGg7hAdCltSP6QFDSR154S1AsR6WSMORV-EDy0DdZesxBdSFX4BGp_xXpewpZs6xJQKwpwdzPil1mhusMmlU0DF4uLLOHbv1Z21fsM92G4jy2DsLl0CRqiG-5ZBzaBcHs38I9pfn2thV1fEFlqIAAd6mMYHEGHTQCVdwX4PFcMJa3E2P_iapZgALrbQNMgRCfw1EC8k9btanJKR4NtusPSptJX8326Wznm-bDGqqq7YHHQBJRGV6Krl-j4m3GprQn6p495HOBH1B4mgZmyaH0LbWksVn4y0EaoqIssuafytAypSZhRX_-Er1lnpnhc6OG7dglBtKM6RPRXR_lZo542OrGjKrNKH6TM4AjkS-_pRFlrSrbva3EmxXqsS_HXpMIWJwnBuDdPzHQg6Pc_TP4Gd4bKxDtXGqwjK_QS9mmmzs4v7UCXb-M1z8JGjjG82iiNCdnZzGySR7TCXn-PpDGToTwle2FfLBwTS2B_ds6CVBILcZ9VAiTOEwzb77RHSt8WeM-yMWOZXpgITLxJxZs662dhdyfKBq68_Tf2Ur6atJit93R3teTlsDBoxTSbgnBVWUGC9vzJQkpiFGV2mGlF23_rYrXBwqPZed5FUcVK_Yk1MQKJPMRokZLkgmqCgj-Wa-Di9lc5t92VETpIh32US8apdFsQ3muFmLYFKcBehfOmOoMaQYoNGkHDEr3iudUa3gttEZ0-AGqW2v6Glr2r5qzruFVp0Y2baXUwhEWMRzQzz4IFarO6R5K7H5Eu7JuyGQP3hkLxKabF8VRmZi8QC-whpvHyD83ZPNyWd-yz9hPEgJ2cps9WjOVYnsypsHhU2yat3d_l70MnkOB-OkxQ0aT8htjDEibjwWH3p7YRLWyXdtllcp4WVeOt4scvupJWAMEs0A43CRotfv_crnKbZtEmuKCB02C0cWUpiPP5RDhGOXaHUB2d_FuH2FuoHZT9ffbuehpybFCDRiC7NcEZoqtgzGgKwXMWEA-0ePN4nDsi_wxY5vNBdNeqmEkjIC89dzP6IvLFuHhpJCcO3lUjJH_rFrX1l8ExIX4Tugpahbtr7BYqmrOlqtKtLdZYxcrfgt1KEQWN7q9w5yLpZQNcGnAL1B5AkRZxzD7Sa59g8pFJ8xNuKaCODSye6YHCT6jI8pOUvGNH_ngW6N_jBbFdNOdUtofeQXiRLvbisXwpe7x48gAXuSvaah7SPlhmIvFIae-3iZm7rPRapQowxbgTFgbeQGqzcbxQPXR1VXG5h_FhJg0KYUe3lYI2EcKqEu-5Kkb2eTnLQB3gDDBoIKMfvEuEfOtINBJYBotb53ndS_23Z9bHnzfZ3M6br7NEizzUlLRisVRmm0Jm-E9GOS7jmcohv9LigcsaM7Xi0ZUz3eqxy6RZWT3QW3VUf-JfiheubEuKvFn8iibr6GZO8TMLq4csIv-_j6S-F0RKcWWjrOPSg06BQttNfg1tu9XaS62zRiMvld0AvChBa6k94Qq8-rVEleTEMjbtMGungzH4-kteZ9uB5UmmduWC3WUHHdXy9NO4qiX9xWfSp4itganYtBEG2Xy3ODZlRopQGqX65Gwlw-wJdZ7ydAq2nsLwWfQsuD3GoOl7Nh1hcfFvHaZ121f6BNtE5afZATQ5pALe5raLSIpmLPc3ztJpSEt-xgwyIo2xJC_r0TKxorEHF5Mh8NNiR1x3_MRqllUKGK0crQGMtX2J-z4BJDkCTWFdLu-unXoH-JGhyb4LONoJiBQLJLbuGLP-rDJzihhF0',
    'task_flow_version': 'v2'
  },
  {
    headers: {
      'authority': 'www.seaart.ai',
      'accept-language': 'en',
      'cookie': `_fbp=fb.1.1748318094574.679225651710543005; T=${token}; lang=en; X-Eyes=true; deviceId=5edc8c93-cac4-406e-9568-10b7328d8d16; pageId=1465561b-c5ed-438c-b263-7146f19b40d8; browserId=d51971dc459c87ce528af797217bc824; _ga=GA1.1.796007903.1748320931; enable_tavern=true; _uetsid=f6061b903ab411f0a52e35fb33000708; _uetvid=f6075ba03ab411f08299a32e5fd816da; _gcl_au=1.1.1030346700.1748320935; _ga_YDMZ43CD3E=GS2.1.s1748320930$o1$g1$t1748320939$j51$l0$h0$dSfwV-8AqpNdbJJ5G6PXPwislQqoFHO6Y3Q; _ga_4X5PK5P053=GS2.1.s1748313152$o3$g1$t1748320939$j56$l0$h0$d9DoInIewfx-ECmyfcuZmPaJ4HtBAS_k46Q`,
      'origin': 'https://www.seaart.ai',
      'referer': 'https://www.seaart.ai/create/ai-app?id=d0fge2le878c73en9f9g',
      'token': token,
      'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
      }
  }
);
      console.log(response.data.status);
    const status = response.data.status;
      if(status.code !== 10000) throw new Error(`retrying... ${status.msg}`);
    
    const id = response.data?.data?.id;
    const key = token;
    const [imageUrls] = await getDataFromSeaArt(id, key);
    return imageUrls;
    }, tokens);
  } catch (e) {
    throw new Error(e);
   }
};

async function art(url, type) {
  if(!url || !type) return "url and type are required";
  if (!["anime", "ghibli", "cyberpunk", "comic", "anime_2", "anime_3", "ultra", "draw"].includes(type)) {
    return "Invalid type available: anime, ghibli, cyberpunk, comic, anime_2, anime_3, ultra, draw !?";
  }

  const nodeMap = {
    anime: "3",
    anime_2: "12",
    anime_3: "3",
    ghibli: "143",
    cyberpunk: "44",
    comic: "3",
    ultra: "31",
    draw: "90"
  };
    const nodeID = nodeMap[type];

  const typeMap = {
    anime: "cvub12le878c73drh7n0",
    anime_2: "cvuakcle878c73dqsdu0",
    anime_3: "cvub2hle878c7389d8gg",
    ghibli: "cvuae1te878c73dqie2g",
    cyberpunk: "cvualtte878c73dqutk0",
    comic: "cvuasnle878c73dr9tog",
    ultra: "d0ekc0te878c73flbvq0",
    draw: "d0hd2h5e878c7395pu80"
    };

    const typeID = typeMap[type];
  
  const seaArtUrl = await seaArtUploader(url);
  try {
    return await fallBack(async (token) => {
    const response = await axios.post(
  'https://www.seaart.ai/api/v1/creativity/generate/apply',
  {
    'apply_id': typeID,
    'inputs': [
      {
        'field': 'image',
        'node_id': nodeID,
        'node_type': 'LoadImage',
        'val': seaArtUrl
      }
    ]
  },
  {
    headers: {
      'authority': 'www.seaart.ai',
      'Accept-Language': 'en',
      'X-Timezone': 'Asia/Dhaka',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
      'origin': 'https://www.seaart.ai',
      'Referer': 'https://www.seaart.ai/ai-tools/ai-filter',
      'cookie': `_fbp=fb.1.1748332541103.161936213781524982; T=${token}; lang=en; X-Eyes=false; deviceId=71682b86-5e26-441c-a07a-007e87d34350; _ga=GA1.1.471471526.1748334600; _pin_unauth=dWlkPU1EaGlNemd6WmpBdE9EZGtPQzAwTnprekxXSTBObVF0WmpNNFpXVTFPV0ZrWWpObA; _gcl_au=1.1.749810034.1748334604; browserId=d51971dc459c87ce528af797217bc824; locaExpire=1748336434862; _uetsid=fc212df03acf11f086209d83494028c7; _uetvid=fc22cb803acf11f0a833b3237d732b73; enable_tavern=true; isDeadline=false; pageId=13ec00b7-af1a-48bd-b322-9a70d4b2aca0; _ga_YDMZ43CD3E=GS2.1.s1748334599$o1$g1$t1748336220$j60$l0$h0$dVcQudWXgBhXXodU4tFXop-E2pRKpTUqptQ; _ga_4X5PK5P053=GS2.1.s1748332478$o6$g1$t1748336238$j35$l0$h0$d9DoInIewfx-ECmyfcuZmPaJ4HtBAS_k46Q`,
      'Token': token
      }
  }
);
      console.log(response.data.status);
    const status = response.data.status;
      if(status.code !== 10000) throw new Error(`retrying... ${status.msg}`);
      
    const id = response.data?.data?.id;
    const key = token;
    const [imageUrls] = await getDataFromSeaArt(id, key);
    return imageUrls;
    }, tokens);
  } catch (e) {
    throw new Error(e);
  }
};

async function img2img(url, prompt) {
  if (!url || !prompt) {
    return "url and prompt is missing!";
  }

  try {
    const { data } = await axios.post(
      'https://queue.fal.run/fal-ai/fast-sdxl/image-to-image',
      {
        'image_url': url,
        'prompt': prompt,
        'num_inference_steps': 10,
        'guidance_scale': 7.5,
        'num_images': 4,
        'loras': [],
        'embeddings': [],
        'enable_safety_checker': true,
        'safety_checker_version': 'v1',
        'format': 'png'
      },
      {
        headers: {
          'sec-ch-ua': '"Chromium";v="137", "Not/A)Brand";v="24"',
          'sec-ch-ua-mobile': '?1',
          'Authorization': 'Key be2ef301-67be-4834-a9dc-485549cc1719:b54707a909af99411f1158ceb32184be',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Referer': 'https://www.onceart.com/',
          'sec-ch-ua-platform': '"Android"'
        }
      }
    );
       console.log(data);
    const status = data.status_url;
    const response = data.response_url;
    const images = await getOnceArtData(status, response);
    return images;
  } catch (e) {
    throw new Error(e);
  }
};

async function imagine_2(prompt, model) {
  if (!prompt || !model) {
    return "Prompt and model are missing!";
  }

  try {
    const { data } = await axios.post(
      'https://queue.fal.run/fal-ai/flux/schnell',
      {
        'prompt': `${prompt} style with ${model}`,
        'image_size': { 'width': 1024, 'height': 1024 },
        'num_inference_steps': 10,
        'num_images': 4,
        'loras': [],
        'embeddings': [],
        'enable_safety_checker': true,
        'safety_checker_version': 'v1',
        'format': 'png'
      },
      {
        headers: {
          'sec-ch-ua': '"Chromium";v="137", "Not/A)Brand";v="24"',
          'sec-ch-ua-mobile': '?1',
          'Authorization': 'Key be2ef301-67be-4834-a9dc-485549cc1719:b54707a909af99411f1158ceb32184be',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Referer': 'https://www.onceart.com/',
          'sec-ch-ua-platform': '"Android"'
        }
      }
    );
     console.log(data);
    const status = data.status_url;
    const response = data.response_url;
    const images = await getOnceArtData(status, response);

    return images;
  } catch (e) {
    throw new Error(e);
  }
};

async function imagine(prompt, model) {
  const seed = Date.now();
  if (!prompt || !model) return 'Prompt and model are required';
  if (!["infinity", "hentai", "anime", "animeXL", "sci_fi", "anime_sci_fi", "x_niji", "xcvd", "fantasy", "hentaiXL", "nsfw", "nsfwXL", "anime_2", "anime_3", "animix", "animax"].includes(model)) {
    return "invalid model available: anime, hentai, infinity, animeXL, sci_fi, anime_sci_fi, x_niji, xcvd, fantasy, hentaiXL, nsfw, nsfwXL, anime_2, anime_3, animix, animax";
  }
  
    const modelMap = {
      animeXL: "f2755cd95dd840080d622ca62e381fc8",
      infinity: "f8172af6747ec762bcf847bd60fdf7cd",
      hentai: "d8300cd33eb1ab8018baa6685ec4a7e9",
      anime: "45a1f43f49dbbe2f6146194d4369f1ef",
      sci_fi: "79c49547b12c675723a96a8bcec218df",
      anime_sci_fi: "cvvjjg5e878c739g9r40",
      x_niji: "d0g7ride878c73e3rve0",
      xcvd: "9e582be894f813fb77a3e0ec2198e14f",
      fantasy: "cre68hte878c73b23nn0",
      hentaiXL: "d0pol75e878c73cto69g",
      nsfw: "d08cavle878c738jnqsg",
      nsfwXL: "2b64aeb365e0ca1abdc3c51caa3fcecb",
      anime_2: "cvria85e878c73dq36c0",
      anime_3: "d07jt1de878c739ekk3g",
      animix: "d089om5e878c739227s0",
      animax: "808f87d9c26f35625739f99f421ff289"
      
    };

    model = modelMap[model];
  
   try {
  return await fallBack(async (token) => {
   const response = await axios.post(
      'https://www.seaart.ai/api/v1/task/v2/text-to-img',
      {
        model_no: model,
        speed_type: 1,
        meta: {
          prompt: prompt,
          negative_prompt: "",
          width: 1024,
          height: 1024,
          steps: 30,
          cfg_scale: 7,
          sampler_name: "Euler",
          n_iter: 4,
          lora_models: [],
          vae: "None",
          clip_skip: 2,
          seed: seed,
          restore_faces: false,
          embeddings: [],
          generate: {
            anime_enhance: 2,
            mode: 0,
            gen_mode: 0,
            prompt_magic_mode: 2
          }
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://www.seaart.ai',
          'Referer': `https://www.seaart.ai/create/image?id=${model}`,
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
          'token': token,
          'Cookie': `deviceId=b22cba40-82e8-4a6c-b848-73cca5981832; browserId=ad76c755dbc5f95661f3966b89636995; enable_tavern=true; _fbp=fb.1.1747855321503.311337970280745383; T=${token}; lang=en; X-Eyes=false; locaExpire=1747855729248; enableAI=true; _pin_unauth=dWlkPVpERTVaR013TXpndE9EZzVOaTAwTmpCaUxUazFZall0TjJWa1pETmtaREV6TVRRMg; _ga=GA1.1.276754469.1747855464; pageId=159f4459-f5fa-4bc4-88bd-14ac8c15523c; isDeadline=false; _uetsid=f73af8e0367811f0bd3a9184f4cc5203; _uetvid=f73c4920367811f08b593126b804bb8f; _gcl_au=1.1.1331792051.1747855472; _ga_YDMZ43CD3E=GS2.1.s1747855463$o1$g1$t1747855523$j60$l0$h0$d6yRGdON-vVeizP__A09bqDF3J5_raAlwuw; _ga_4X5PK5P053=GS2.1.s1747854368$o4$g1$t1747855523$j22$l0$h0$dzRIoWr8gMFVSSY6tOrCd7ulrZZS3UpeoJg`
        }
      }
    );
    console.log(response.data.status);
    const status = response.data.status;
      if(status.code !== 10000) throw new Error(`retrying... ${status.msg}`);
    
    const id = response.data?.data?.id;
    const key = token;
    const imageUrls = await getDataFromSeaArt(id, key);
    return imageUrls;
     }, tokens);
  } catch (error) {
    throw new Error(error);
   }
};

async function dalle_3(prompt) {
  if (!prompt) {
    return "Prompt is required!";
  }

  try {
    const response = await axios.post(
      "https://api.gpt4-all.xyz/v1/images/generations",
      {
        model: "dall-e-3",
        prompt: prompt
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer g4a-CFyzgwYxOSbZetCnhdJWd5IE1FNoXF967zy`
        }
      }
    );

    return response.data.data[0].url;
  } catch (error) {
    throw new Error(error);
  }
};

async function imgur(url) {
  if (!url) {
    return "url is required";
  }
  try {
    const response = await axios.get(`${await api()}/imgur?url=${encodeURIComponent(url)}`);
    return response.data.url;
  } catch (error) {
      throw new Error(error);
  }
};

async function alldl(url, format) {
  if(!url) {
    return "Url is missing";
  }
  try {
    const { data } = await axios.get(`${await api()}/alldl?url=${encodeURIComponent(url)}&format=${format}`);
    return data.url;
  } catch (e) {
    throw new Error(e);
  }
};

async function prompt(url) {
  if(!url) {
    return "url must be provided";
  }
  try {
    const prompt = "Explain this image in prompt style";
    const { data } = await axios.get(`${await api()}/edit?url=${encodeURIComponent(url)}&prompt=${encodeURIComponent(prompt)}`);
    return data.response;
  } catch (e) {
    throw new Error(e);
  }
};

async function prompt_2(imageUrl) {
  if(!imageUrl) {
      return "imageUrl must needed";
    }
     
  try {
   const response = await axios.post(`https://api.gpt4-all.xyz/v1/chat/completions`, {
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Explain the image-only prompt style; just give me a gorgeous and fully details prompt without any text and also without any bracket just gimme the prompt." },
            {
              type: "image_url",
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ],
      max_tokens: 300
    }, {
      headers: {
        'Authorization': `Bearer g4a-CFyzgwYxOSbZetCnhdJWd5IE1FNoXF967zy`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    throw new Error(error);
  }
};

const userHistories = {};
async function gpt(userText, imageUrl, uid, model) {
  if (!uid || !userText || !model) {
    return "userText, uid and model are must be provided";
  }

  if (userText.toLowerCase() === 'clear') {
    userHistories[uid] = [];
    return `Chat history cleared for UID: ${uid}`;
  }

  if (!userHistories[uid]) {
    userHistories[uid] = [];
  }

  const contentArray = [{ type: 'text', text: userText }];
  if (imageUrl) {
    contentArray.push({ type: 'image_url', image_url: { url: imageUrl } });
  }

  userHistories[uid].push({ role: 'user', content: contentArray });

  try {
    const response = await axios.post(
      "https://api.gpt4-all.xyz/v1/chat/completions",
      {
        model: model,
        messages: userHistories[uid],
        max_tokens: 500
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer g4a-QXDV2prT7NfdKdR8DbZIl1lfaAmIbe7Cndr`
        }
      }
    );

    const reply = response.data.choices[0].message.content;

    userHistories[uid].push({
      role: 'assistant',
      content: [{ type: 'text', text: reply }]
    });

    return reply;
  } catch (error) {
    throw new Error(error);
  }
};

async function flux(prompt, model, ratio) {
  if (!prompt || !model || !ratio) {
      return "Prompt, model and ratio are required";
  }

  try {
    const form = new FormData();
    form.append("prompt", prompt);
    form.append("style", model);
    form.append("aspect_ratio", ratio);

    const response = await axios.post("https://api.vyro.ai/v2/image/generations", form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${VYRO_API}`
      },
      responseType: "stream",
    });
      const filename = await fileName(".jpg");
      const image = await upload(response.data, filename); 
      return image;
  } catch (error) {
    throw new Error(error);
  }
};



async function changebg(url, prompt) {
  if (!url || !prompt) {
        return "Please provide both url and prompt";
    }

    const img = await downloadFromUrl(url, "cbg.jpg");

    try {
        const form = new FormData();
        form.append("image", img);
        form.append("prompt", prompt);

        const response = await axios.post(
            "https://api.vyro.ai/v2/image/generations/ai-background",
            form,
            {
                headers: {
                    ...form.getHeaders(),
                    Authorization: `Bearer ${VYRO_API}`,
                },
                responseType: "stream",
            }
        );

        const filename = fileName(".jpg");
        const res = await upload(response.data, filename);
        return res;
      
    } catch (error) {
        throw new Error(error);
    }
};

async function flag(query) {
  if(!query) {
    return "please tell me what kind of need you? all countries flags or a random";
  };
  try {
        const response = await axios.get("https://restcountries.com/v3.1/all?fields=name,flags");
        const countries = response.data.map(item => ({ country: item.name.common, flag: item.flags.png }));
        const randomCountry = countries[Math.floor(Math.random() * countries.length)];
  if(query.toLowerCase() === "random") {
    return randomCountry;
  } else {
    return countries;
  };
    } catch (error) {
        throw new Error(error);
  }
};

function getCapitalVariant(fontData) {
     const capitalFont = {};
     for (const [key, value] of Object.entries(fontData.font)) {
       capitalFont[key.toUpperCase()] = value;
      }
  return capitalFont;
};
 
const fontFile = path.join(__dirname, 'font.json');
const fonts = JSON.parse(fs.readFileSync(fontFile, 'utf8'));
const font = { 
       convert(text, fontId) {
         if(!text || !fontId) {
           return "text and fontId are must be provided"
         }
         const font = fonts.find(f => f.id === fontId);
         if (!font) {
           return "Cannot find this fontId";
         }
         const fullFontMap = {
           ...font.font,
           ...getCapitalVariant(font)
         };
         let convertedText = text
           .split('')
           .map(char => fullFontMap[char] || char)
           .join('');

 
         const prefix = font.font._prefix || '';
         const suffix = font.font._suffix || '';
         convertedText = `${prefix}${convertedText}${suffix}`;
         return convertedText;
       },

      list() {
         const fontList = fonts.map(font => ({
            id: font.id,
            example: font.example
          }));
         return fontList;
       }
};

const quizFile = path.join(__dirname, 'quiz.json');
const quizes = JSON.parse(fs.readFileSync(quizFile, "utf8"));

function quiz(category) {
  if(!category) {
    return "Category must be needed";
  }
  const categories = ["general", "science", "person", "game", "history", "english", "july-24"];
  const type = category === "random"
    ? categories[Math.floor(Math.random() * categories.length)]
    : category;
  
  const filtered = quizes.filter(f => f.category === type);
  if (filtered.length === 0) {
    return "No quize found with this category";
  }
  const randomQuize = filtered[Math.floor(Math.random() * filtered.length)];
  return randomQuize;
};

const albumCategories = [
    "funny", "romantic", "lofi", "sad", "horny", "football", "anime", "cricket",
    "flowers", "islamic", "cartoon", "couple", "random", "sigma", "asthetic",
    "girls", "friends", "free fire", "18+", "lyrics", "photos", "cat", "meme", "caption", "july 2024"
  ];
const album = {
     async upload(url, category) {
        if(!url || !category) {
          return "url and category are must be required";
        };
        if(!albumCategories.includes(category)) {
          return "Invalid categories...!! Available are: " + albumCategories.join(", ");
        };
        try {
          const { data } = await axios.get(`https://www.noobx-api.rf.gd/api/imgur?url=${encodeURIComponent(url)}`);
          const link = data.url;

          const newLink = new Link({ category, link });
          await newLink.save();

          const videoCount = (await Link.find({ category })).length;
          const count = await Link.countDocuments({});

         return `✅ Successfully saved the video to ${category} category.\n🔖 Total videos: ${count}\n🎓 Videos on this category: ${videoCount}`;
       } catch (error) {
          throw new Error(error);
         }
      },

     async get(category, type) {
        if (!category || !type) {
          return "Category and type are must be needed...!!"
        } else if (!albumCategories.includes(category)) {
          return "Invalid categories...!! Available are: " + albumCategories.join(", ");
        } else if (type !== "all" && type !== "random") {
          return "Type must be between to all and random";
        };
        try {
        const links = await Link.find({ category });

        if (links.length === 0) {
           return 'No links found in this category';
        }
        if(type.toLowerCase() === "random") {
          const randomLink = links[Math.floor(Math.random() * links.length)];
          return randomLink;
        }
          return links;
        } catch (e) {
          throw new Error(e)
        }
      },

    async categoryList(type) {
       if(!type || (type !== "all" && type !== "available")) {
         return "Type must be needed between all and available";
       }
       const available = await Link.distinct('category');
       if(type.toLowerCase() === "available") {
        return available;
       } else {
        return albumCategories;
      }
    }
};

const permission = {
  async add(uid, type) {
    if (!uid || typeof type !== "boolean") {
      return "❌ Parameters 'uid' and valid boolean 'type' are required";
    }

    const user = await global.db.usersData.get(uid);

    user.isPermitted = type;

    const update = await global.db.usersData.set(uid, user);
    return update;
  },

 async check() {
   const userData = await global.db.usersData.get(global.event.senderID);
   const have = userData.isPermitted;
     return have;
    }
};


const xnxx = {
  async search(query) {
    if(!query) {
      return "query must be needed";
    }
    try {
       const { data } = await axios.get(`https://www.xnxx.tv/search/${encodeURIComponent(query)}`, { headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
       } });
       const $ = cheerio.load(data);

       let links = [];

       $(".thumb-block").each((i, el) => {
         const href = $(el).find(".thumb a").attr("href");
         const title = $(el).find(".thumb-under a").attr("title");
         const videoId = $(el).find("img").attr("data-videoid");
         const videoUrl = "https://www.xnxx.tv" + href;

       if (href && title && videoId) {
         links.push({ title: title, id: videoId, url: videoUrl });
       }
       });
      return links;
    } catch (e) {
      throw new Error(e);
    }
  },

  async download(id) {
     if (!id) return "id must be needed";
     try {
        const { data } = await axios.post(
           `https://www.xnxx.tv/video-download/${id}/`,
            '',
          {
          headers: {
              'authority': 'www.xnxx.tv',
              'accept': 'application/json, text/javascript, */*; q=0.01',
              'accept-language': 'en-US,en;q=0.9',
              'content-length': '0',
              'cookie': 'cit=51f19c63f43273b0OwQz5hb89loXmAXpNAA37Q%3D%3D; last_views=%5B%2274183059-1747741517%22%2C%2267789443-1747744917%22%2C%2285501597-1748684644%22%2C%2283695929-1748685431%22%2C%2281860929-1749737569%22%2C%2250484511-1749737699%22%2C%2281789093-1749785459%22%2C%2245865721-1749795323%22%2C%2283645841-1749816161%22%2C%2264095431-1749816547%22%2C%2266203957-1749968641%22%2C%2285673411-1750126545%22%2C%2278324243-1750127135%22%2C%2269184635-1751874533%22%2C%2281158057-1751874827%22%2C%2282286925-1751877865%22%5D; session_token=76e5208c80fe9f8bqSLKIU7Z2MO9qzRwdfKuhbsnwmctUUiEO6vS60da2jBXmKG48Tw9t9aKAoiOw9SuCMsWBtquqZ0j4HuPUAyGo4vrTo6-pMHVCoAE2J1Otjq8kFGP0xN23x8uBz3bH9bVZO2Ef7ab2YP_I8LBh34YFY63I8BofskZiFjWFolb9gZdH3Z5j-84dULKDx43VfklupxInGhReyBLtUlMy0Q_f1Mvx1raCIOCAV2m8D8rxcs%3D',
              'device-memory': '2',
              'origin': 'https://www.xnxx.tv',
              'referer': 'https://www.xnxx.tv/video-1czozx6a/the_pint-sized_arab-cuban_girl_featuring_violet_gems_with_brickzilla',
              'sec-ch-ua': '"Chromium";v="137", "Not/A)Brand";v="24"',
              'sec-ch-ua-arch': '""',
              'sec-ch-ua-bitness': '""',
              'sec-ch-ua-full-version': '"137.0.7337.0"',
              'sec-ch-ua-full-version-list': '"Chromium";v="137.0.7337.0", "Not/A)Brand";v="24.0.0.0"',
              'sec-ch-ua-mobile': '?1',
              'sec-ch-ua-model': '"ORBIT Y21"',
              'sec-ch-ua-platform': '"Android"',
              'sec-ch-ua-platform-version': '"12.0.0"',
              'sec-fetch-dest': 'empty',
              'sec-fetch-mode': 'cors',
              'sec-fetch-site': 'same-origin',
              'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
              'viewport-width': '360',
              'x-requested-with': 'XMLHttpRequest'
          }
        });
       const url = data.URL;
       const stream = await axios.get(url, { responseType: "stream" });
       const filename = fileName(".mp4");
       const video = await upload(stream.data, filename);
       return video;     
     } catch (e) {
    throw new Error(e);
    }
  }
};

async function getKey() {
  const response = await axios.get('https://api.mp3youtube.cc/v2/sanity/key', {
  headers: {
    'authority': 'api.mp3youtube.cc',
    'accept': '*/*',
    'accept-language': 'en-US,en;q=0.9',
    'content-type': 'application/json',
    'if-none-match': 'W/"7e-Xcrp6nLPTZPdL1e3Scx4/pfbzWg-gzip"',
    'origin': 'https://iframe.y2meta-uk.com',
    'referer': 'https://iframe.y2meta-uk.com/',
    'sec-ch-ua': '"Chromium";v="137", "Not/A)Brand";v="24"',
    'sec-ch-ua-mobile': '?1',
    'sec-ch-ua-platform': '"Android"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'cross-site',
    'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
  }
});
  return response.data.key;
};




const yt = {
  async search(songName) {
  if (!songName) {
        return "SongName must be required";
    }

    try {
        const response = await axios.get("https://www.googleapis.com/youtube/v3/search", {
            params: {
                part: "snippet",
                q: songName,
                type: "video",
                key: "AIzaSyAr5vEmnvwtmZmGODjCIZqmCGa9KXKEEdk",
                maxResults: 20
            }
        });

        
        const videos = response.data.items.map(item => ({
            title: item.snippet.title,
            videoId: item.id.videoId,
            videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            thumbnail: item.snippet.thumbnails.high.url
        }));

        return videos;
    } catch (error) {
       throw new Error(error);
    }
  },

  async download(url, format, quality) {
        if(!url || !format || !quality) {
           return "Please provide a youtube video url and also format and quality...!!";
        } else if (!["mp4", "mp3"].includes(format)) {
           return "Format must be between mp3 and mp4...!!";
        } else if (!["sd", "hd"].includes(quality)) {
           return "Quality must be between hd or sd";
        };
        const qualityMap = {
          sd: "360",
          hd: "720"
       };
       quality = qualityMap[quality];
    try {
         const key = await getKey();
         console.log(key);
         const { data } = await axios.post(
            'https://api.mp3youtube.cc/v2/converter',
            new URLSearchParams({
            'link': url,
            'format': format,
            'audioBitrate': '128',
            'videoQuality': quality,
            'filenameStyle': 'pretty',
            'vCodec': 'h264'
        }),
      {
       headers: {
           'authority': 'api.mp3youtube.cc',
           'accept': '*/*',
           'accept-language': 'en-US,en;q=0.9',
           'key': key,
           'origin': 'https://iframe.y2meta-uk.com',
           'referer': 'https://iframe.y2meta-uk.com/',
           'sec-ch-ua': '"Chromium";v="137", "Not/A)Brand";v="24"',
           'sec-ch-ua-mobile': '?1',           'sec-ch-ua-platform': '"Android"',
           'sec-fetch-dest': 'empty',
           'sec-fetch-mode': 'cors',
           'sec-fetch-site': 'cross-site',
           'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
        }
     });
         const stream = await axios.get(data.url, { responseType: "stream", headers: {
            'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
          }
         });
         let filename = fileName(".mp4");
         if(format === "mp3") {
          filename = fileName(".mp3");
         }
         const video = await upload(stream.data, filename);
         return video;
      } catch (e) {
      throw new Error(e);
     }
   }
};


async function tiktokVideo(query) {
  if (!query) {
    return "❌ Provide a search query";
  }

  try {
    const encodedQuery = encodeURIComponent(query);

    const url = `https://www.tiktok.com/api/search/general/full/?keyword=${encodedQuery}&offset=0&region=BD&search_source=search_sug&app_name=tiktok_web&device_platform=web_pc&browser_platform=Linux`;

    const response = await axios.get(url, {
      headers: {
        'authority': 'www.tiktok.com',
        'accept': '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'cookie': 'tt_chain_token=hQOuCUPAL7s5ANo3N/p7zg==; passport_csrf_token=d662f5a5c53bebd34be85afd3292dff1; passport_csrf_token_default=d662f5a5c53bebd34be85afd3292dff1; d_ticket=abd7a7b047f5c6ced2a0d2033cbf5699bc9f6; last_login_method=email; _ttp=2xhmzAYkTaOHvj5aAkStBH90NB7; delay_guest_mode_vid=3; perf_feed_cache={%22expireTimestamp%22:1752292800000%2C%22itemIds%22:[%227520979738614107399%22%2C%227520183872844270855%22]}; tt_csrf_token=V6Vwfsqi-bZpv8fGBwbGitMafHp3OTm9EKos; s_v_web_id=verify_mcwwhs6m_meWoC4V9_TGsw_40rW_AnLg_TVo3CSDdcQ2w; tiktok_webapp_theme=dark; multi_sids=7128444573172384774%3A806932624bc9502b9adb752c5d819a55; cmpl_token=AgQQAPNYF-RO0rLTvDWxMp0_8k2bBkjHf4XTYN4Ojw; uid_tt=3498daaa520044f4694a6fe20a796c79f477fd054273def0d6c2803b6537bb30; uid_tt_ss=3498daaa520044f4694a6fe20a796c79f477fd054273def0d6c2803b6537bb30; sid_tt=806932624bc9502b9adb752c5d819a55; sessionid=806932624bc9502b9adb752c5d819a55; sessionid_ss=806932624bc9502b9adb752c5d819a55; store-idc=alisg; store-country-code=bd; store-country-code-src=uid; tt-target-idc=alisg; tt-target-idc-sign=ugjGdD16CmaG6yAfq3S2VHdBcizphL0I-jJXYn7P-OYJVicZGdZibsPM43QTIb_fEW6_htH0Moo_Be9QpyXHcuz0YnUaJ6LV7SBEQNDAldPIGbCOSorKkmePfa2BLjuOXpTOMiJctPM6ObWuuZuQ4e1oTLiYL36p53B-8uOay6ZG_ITziWkgenYVFlhHCCpG8_VFKa3mns2xafmW9TGn0lyHkNuvNhDZ53PtkNIDY3ovmt4b3pBxXn6dEwF0SJnQ35QT8R6FCzlCTyaKgPKmQlsAQTxMqmtyOMLW4PZS44_n1pJH6umRnucMX7GEhvVnUZyYnVzGBZxwMi77CjDRDJVq_mGipRCw2mXe2_KNCENtszVygo8eV457iSxfhdlfpZn4LnPPMzeQsZuJXBqE2NwXsj5J4vUPU9id1LAtGf92ptnTn7rhCanU7bxT6FuhBPRReMqdOKtPSgxQ_drK-8ox43nuK2o4NfbRwMdVcQ9baRJPSaI6Qp38ekqaoWwi; tiktok_webapp_theme_source=auto; passport_fe_beating_status=true; ttwid=1%7CuS68HhFC_BddrWqmZWNujJSrJ0M0BwF5sKiR61adsBw%7C1752122600%7C0e79b333de14d174fd20112ab2e6a903c0cc31061b39ec12c70da37692fcc39b; sid_guard=806932624bc9502b9adb752c5d819a55%7C1752122600%7C15551988%7CTue%2C+06-Jan-2026+04%3A43%3A08+GMT; sid_ucp_v1=1.0.0-KGE1MmVhOThiNmRlZGI0MWQxNzg4NWU2Yzg1YmVhZjU5M2Q4MTJjNmYKGgiGiIHIo9LU9mIQ6Im9wwYYsws4AUDqB0gEEAMaAm15IiA4MDY5MzI2MjRiYzk1MDJiOWFkYjc1MmM1ZDgxOWE1NQ; ssid_ucp_v1=1.0.0-KGE1MmVhOThiNmRlZGI0MWQxNzg4NWU2Yzg1YmVhZjU5M2Q4MTJjNmYKGgiGiIHIo9LU9mIQ6Im9wwYYsws4AUDqB0gEEAMaAm15IiA4MDY5MzI2MjRiYzk1MDJiOWFkYjc1MmM1ZDgxOWE1NQ; odin_tt=2c02112e482afdf97858529e35e763f971e0a9dab2c5bf87c2bac22b531ffe16af1a08df708d0c3677f734a88b1844f0e6d462ca61a6e8c36de1f2e456b11766ab125b41f10b14b72d9dec6fb214d224; store-country-sign=MEIEDPV-Yu0Pvc6xxfhy3QQgeDfni-pIluiK6HM01MJlvzbl9jAobhOfhBYddkTmijAEEHmRRTjYFZ8fLfsi8NfFlKg; msToken=Aes7Y7p_GV90Zdmgs273a5TOquhj9Mc7IiNaF3us-Q2SdXbJmOpEG4HSIyH3How81iSLDBszhNrSBg-Qr4al4SZhrVHMoGbZ1od8GhCg7xASHOxdqSSpKWSIyJ6qcQP1jptpTkRecK83Nr2bzByZEMEScw==; msToken=B6nTOjsoaC5zQcCkg9_4T217IG69cT8M-Xo2a6ReNMswXvQIVxZWu-Q0goJnyuDQz9XyCQ_Z-eiDAYN0y_-I8nK1NWsWBOighvoDR7Syrier3rp78dlCu-Xns3Cm3Kk0hQWAaR-2lW920kT89X4fmdkkmw==',
        'referer': `https://www.tiktok.com/search/video?q=${encodedQuery}&t=1752122641477`,
        'sec-ch-ua': '"Chromium";v="137", "Not/A)Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Linux"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
        'x-mssdk-info': '9d5n02SyoWPFaLu4kFzjeHbJ2KWK7oO6bVks2lXCIJPkcLc.gMnIwp8rOUgFzMD8WYZU.zYORD6HAr4uGK0G9SFGEjirvDYPdHmMcwRCGI.3BAx0k4HRG0jfgHEDlK9.IlOWhxue30543n520MeheytgEhTZqIcDL9uDJ6GlD9WSLbsgq9MsAUP9L5lFO1BezX64cQK6hLQ9U3KVHybMyy1vGRG8cGRR3rAQbosJ0WBZ9wsvbAJ57Uux7PsuQ6Jq4GaRH1031Tn7NOQP30lHxARSYqN9QXJ5MQ1NH8if1aRmSWhhS9rHn6aCXAnGwRSpyDpKX.uKqQkrzI4jmAttKtfXTeeAlGcPWv0O8SayjfDwUwiQMjNVFzI61FmLV2zcY4XF8sor8ASsPOqWkNNEY1bYxewEoBcM1ilyX3sNDgeizwUTBwuDWUkZlWAWmbxp079FanvxV1MmhlpIFJlmMZE0uMcl1IeP4LcxUcRGhmzOadgeEdUjJLz6YJqD52AfT7H6615sVsxD9.3bEGEVVlLwe4Au8I1-IHHhNj9Itu50TeeK3LYoIIPcsRnc2Tj2FP-y2Di0dgXobYb1xVmM74qE4c9MwLx-Sio8i2oELmkIyzN84RdfllLUjsJy5ufLSJWnPg9nd9KXu68C.J9rPH8nXxR7YH6FjRmw68ZvJTvaHCopcwnv5AzNL9Kyo5pAjhjkVmI-aWu4RkjIBSs4QbjD3AYkZQVPMyZV37l8HRp6Rax8u5juHHTFgGKpZN8MfP5rkSZZLWKE4jIv8aLGUsW85S3nti2xqC-KfBbjzDnqB-S2V7fefi2oixxnIk-1ULHm3hbIkphKFkt8FvI3UWhKAEem9JwVhEMKo.CAzezILNEmqCc7xLWD.xZ5zq9e4QoTMbqhSEFLR7HHuTSL1cKPrQI9YhtzNUKsibzx7khufu9xThIzR8TR5x31dQxmlfexr0JBvQ6N8KDHcaz1KxYbVBkoccOQIuk8xaUMn8tGzFxZJnd1ugWjA7Pys8EAiDXRoIwzw5T7Gspnw00ER.ikJXXBUZr.iBxCbPsEuO6kcS1P22oDFPDhrGPg8IC1N0KIuI2ITx8a9CE1sBqjcdGox4bL1ndotvRV2-MvZi8tEWvRJZt.SNDv6Srx.a4.mA7oie45U-7zkTAxP2R.GkK3P8uW-1dZwkGyQxbRwB5FhLYnS3E5HK.0BNWXKiDQKy0b4ki5EgKCY5wJMOCOFLb8zRnjtukWBpNJmYL1KGTDM-gnB4dcRl2AItekSyRjnEFxrwXWeM6qs0t9Bp-Ow27ZmH041E5-MJQDqNsUxWax.52vmGVlU4FWTrkR9rN5WS2hi-G8OrmYVZuVWE.LA0mJdFmoXvEifvjY.ffHHKwDCvC0qB2.BeH5Ml-5Z9jdBSWxcqxq1BZFdH8WGgkih8nupSmGIslYTvwrIBuviwSo8xMIw88x61seo0hVReo7p0i9NLkHNLRkieBTQfYskwN5PeAB6WCwAH0FmkxnZ.lJNtB9kGBvBiad6ZY6nWTf0qS.DA3SVbAPJvabb20tgI3.w93YlPHXt6lSpRilxctP3SbhioXj1W85s8ztS2UNW8-0SAXB8K1u1YtK7jg7AuI-uoM5dyPjNW-nbqHJM8koJrTPks3WmNGaXm3rXs3.gkTM87CzYNaMcec2bMiH08y3qvYFzHCkuQNv0UPIuZJvtzdRrUXyGh3YCGWdbII7gHV10YhVj0FKGl.2YABXWkeKnpFEvPiW-QMlhub8pTbRWPdIEHSclmfHF.nHBX34dvd3Mf61QE8uHRywF72XYiJkYERQxMIv81h5Jq8Kr8Mnlb9FDJv3zyJaLAG.qCiSTvUwcmmlEh8Z5fi-APi4JOW2qDsqW8UDC4twDeSDak06RWXwPpk5Pk6KQloagCaoP3ds7FELdWAhJWdBRsa-H24x3F1jG8qyH8RMj-acnGsI6l1vOYh-VZYPFJWrXr7sEQbfFVYw05uaJdStXxV4BEb.CCo0KuqDCQ4LYFVNM4IjmF-xKpZBYq7ovxYqJFpM6iKliwd7l4fO22Hz7CBHF13qXbHbRevxMgs7oe30SLilUJBMnz25LB5-ADoM6XB5Kq48bUDY8w77RpWemPhZXcDzDCpwo6GcpqPTGnVx504KXg0ALnkQokpIeu0K-4ClA3B0OvzhpKZeduYvWtYVEUtz485VZuPoLzGowU79GGHag96bZcRqt24L.uizN8OQAcW6TMv28EwPpJc7-3vwqQHNLl6XO2j8VZUo-PmSRddDrWcMfDPrlDYBv-wozi6JRyYdYSEqVg-wpK6s3dyOanIAqjWnBW0vjdLwGh7jmN6NqL8xr5iPQMKt4.6d7WbRHPFj305nE7huCm.mtSzQifbJZN68bxzJYmAOdMcmqku287IC2k1ggXSbBBkjofp5Zdws-D1YDsEZCrn8Bx3fkKU8.Wp38uDxCVzjxeChoZCiE47nubErMT4lt-0GIAGzRjL4ziRRGP4ZljFkcUf2V7VEU9u7eVAX4.0j5KJAZuQlThKM.aIcYpdUnX05i-QVXUP4UCcfDyzAmlEYOSjNzA4MoD.Ux2llP3yIhzi1aP-ECEzQEFwGdEmL16JqpGfc.1dwtQ5XmxuvWP2nU.3D2-RApfGobqGzJvZupi5wQ-JE5cxKHYO8aBHDUhQdK.arL44wvbsT41usGi6StMPBhDcRY0KgM3hmseaAmjOnyzyk6rxk36Oge3lTLIq9P-UWQ0CPMDKZYUhcW8HBefkcZjlE7ry.NZ5EG4TmtpbhKUX5RmqmjFzX7owOj0TH4d1tJwdgekLpUAe43nSANNgRkOoXCmpftuzSA-xbRNqYiXRuBpHVuQHnLL18Os770IAUh0NuG7YNn4Q85lZzbFzKo4uxIAUygdYRPOH6NpEWGyd3hEQ='
      }
    });
    const videoUrl = response.data.data[0].item.video.playAddr;

    const stream = await axios.get(videoUrl, {                                    
         responseType: "stream",             
         headers: {                                  'authority': 'v16-webapp-prime.tiktok.com',
         'accept': '*/*',
         'accept-language': 'en-US,en;q=0.9',
         'cookie': 'tt_chain_token=hQOuCUPAL7s5ANo3N/p7zg==; passport_csrf_token=d662f5a5c53bebd34be85afd3292dff1; passport_csrf_token_default=d662f5a5c53bebd34be85afd3292dff1; d_ticket=abd7a7b047f5c6ced2a0d2033cbf5699bc9f6; _ttp=2xhmzAYkTaOHvj5aAkStBH90NB7; multi_sids=7128444573172384774%3A806932624bc9502b9adb752c5d819a55; cmpl_token=AgQQAPNYF-RO0rLTvDWxMp0_8k2bBkjHf4XTYN4Ojw; uid_tt=3498daaa520044f4694a6fe20a796c79f477fd054273def0d6c2803b6537bb30; uid_tt_ss=3498daaa520044f4694a6fe20a796c79f477fd054273def0d6c2803b6537bb30; sid_tt=806932624bc9502b9adb752c5d819a55; sessionid=806932624bc9502b9adb752c5d819a55; sessionid_ss=806932624bc9502b9adb752c5d819a55; store-idc=alisg; store-country-code=bd; store-country-code-src=uid; tt-target-idc=alisg; tt-target-idc-sign=ugjGdD16CmaG6yAfq3S2VHdBcizphL0I-jJXYn7P-OYJVicZGdZibsPM43QTIb_fEW6_htH0Moo_Be9QpyXHcuz0YnUaJ6LV7SBEQNDAldPIGbCOSorKkmePfa2BLjuOXpTOMiJctPM6ObWuuZuQ4e1oTLiYL36p53B-8uOay6ZG_ITziWkgenYVFlhHCCpG8_VFKa3mns2xafmW9TGn0lyHkNuvNhDZ53PtkNIDY3ovmt4b3pBxXn6dEwF0SJnQ35QT8R6FCzlCTyaKgPKmQlsAQTxMqmtyOMLW4PZS44_n1pJH6umRnucMX7GEhvVnUZyYnVzGBZxwMi77CjDRDJVq_mGipRCw2mXe2_KNCENtszVygo8eV457iSxfhdlfpZn4LnPPMzeQsZuJXBqE2NwXsj5J4vUPU9id1LAtGf92ptnTn7rhCanU7bxT6FuhBPRReMqdOKtPSgxQ_drK-8ox43nuK2o4NfbRwMdVcQ9baRJPSaI6Qp38ekqaoWwi; sid_guard=806932624bc9502b9adb752c5d819a55%7C1752122600%7C15551988%7CTue%2C+06-Jan-2026+04%3A43%3A08+GMT; sid_ucp_v1=1.0.0-KGE1MmVhOThiNmRlZGI0MWQxNzg4NWU2Yzg1YmVhZjU5M2Q4MTJjNmYKGgiGiIHIo9LU9mIQ6Im9wwYYsws4AUDqB0gEEAMaAm15IiA4MDY5MzI2MjRiYzk1MDJiOWFkYjc1MmM1ZDgxOWE1NQ; ssid_ucp_v1=1.0.0-KGE1MmVhOThiNmRlZGI0MWQxNzg4NWU2Yzg1YmVhZjU5M2Q4MTJjNmYKGgiGiIHIo9LU9mIQ6Im9wwYYsws4AUDqB0gEEAMaAm15IiA4MDY5MzI2MjRiYzk1MDJiOWFkYjc1MmM1ZDgxOWE1NQ; tt_csrf_token=CI4qbw8a-dkYI-Fxqyg_Gm7XWbufahxuEyHM; ttwid=1%7CuS68HhFC_BddrWqmZWNujJSrJ0M0BwF5sKiR61adsBw%7C1752124400%7Caacbf0b54b1b25243066d65a3c1805e4477d05dcc2784cb3287c293afd1dccf2; odin_tt=2de7fcc4ad202f029ac6a7001012f6cd1f786bb5b9d9c7f978c7cb78bfe5f58c937b34490bac2f878c626d95989bd497242f44a6e511e57b06a1ba7900f27a0042d5a0cd0e2af9933fad0b549b5ce48c; store-country-sign=MEIEDDMhONriQqVlssypFQQgWGWolvpc7IalWx1wnO3hmvK0P4VzltFWR9AjlkgAfi0EEJrbAWcCWDSukdPSrWOvnsY; s_v_web_id=verify_mcwxmpkg_hDgRTE0V_7VEX_4pzV_BfYD_AqMd4RLCyjwU; msToken=nCaTaVlUkdYHNCRhnHatuRukVYqcw5FQfiKjIURFB8TQeA1hLYCKHBqzeBWRDhgLuTsxrPUpleR4myXrZArg5RmPb9iCuma8JJEb-pSTHHq10VAwvngwLGy_xNdKaGk-7onDUXochJTaVt_Jx5FjqbqnlL4=',
         'range': 'bytes=0-',
         'referer': 'https://www.tiktok.com/',
         'sec-ch-ua': '"Chromium";v="137", "Not/A)Brand";v="24"',
         'sec-ch-ua-mobile': '?0',
         'sec-ch-ua-platform': '"Linux"',
         'sec-fetch-dest': 'video',
         'sec-fetch-mode': 'no-cors',
         'sec-fetch-site': 'same-site',
         'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36'
        }
    });

    const filename = fileName(".mp4");
    const video = await upload(stream.data, filename);
    return video;
  } catch (err) {
   throw new Error(err);
  }
};


const grokHistory = {};
async function grok(text, uid) {

  if (!text && !uid) {
    return "text and uid are required";
  } else if (text.toLowerCase() === "clear") {
    grokHistory[uid] = [];
    return { response: "🚮 | Grok history cleared for userID: " + uid };
  } else if (!grokHistory[uid]) {
    grokHistory[uid] = [];
  }
  grokHistory[uid].push({ message: text, sender: 1, fileAttachments: [{}] });


  try {
    const payload = {
      responses: grokHistory[uid],
      systemPromptName: "",
      grokModelOptionId: "grok-3",
      conversationId: "1945947919699640778",
      returnSearchResults: false,
      returnCitations: true,
      promptMetadata: {
        promptSource: "NATURAL",
        action: "INPUT"
      },
      imageGenerationCount: 4,
      requestFeatures: {
        eagerTweets: true,
        serverHistory: true
      },
      enableSideBySide: false,
      toolOverrides: {},
      isDeepsearch: false,
      isReasoning: false
    };

    const grokRes = await axios.post(
      "https://grok.x.com/2/grok/add_response.json",
      JSON.stringify(payload),
      {
        headers: {
          'authority': 'grok.x.com',
          'accept': '*/*',
          'accept-language': 'en-US,en;q=0.9',
          'authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
          'content-type': 'text/plain;charset=UTF-8',
          'cookie': 'guest_id_marketing=v1%3A174599842080746116; guest_id_ads=v1%3A174599842080746116; guest_id=v1%3A174599842080746116; gt=1945938025516872156; external_referer=padhuUp37zjgzgv1mFWxJ12Ozwit7owX|0|8e8t2xd8A2w%3D; att=1-YOsM8v9JAhFoXFLYILA906hm7u19oPozQeNewF8g; _ga=GA1.1.617179359.1752782852; _ga_BLY4P7T5KW=GS2.1.s1752782851$o1$g1$t1752782877$j34$l0$h0; personalization_id="v1_q8JwAIY07CIbRyO7MdmeGA=="; kdt=cEoLQ1UPzQ2iLdgCceX06OVLmKrQu4viNbAdWX4r; auth_token=e628596cf18ff62c3ff3580dc548465954409926; ct0=54e46ea2226ade219df0b810812a057d8c8c2d5ea46ff17c9519f47fe696aab9e8d4b5c1fd78953e19181aabf46e132544e3891431196f500b762e7313dd059bf9ae08c1aaf8050a26a3374ecfaec2ef; twid=u%3D1945938917443936256; __cf_bm=zQzAUn6h3tULdjKeUhFCwm4cmT7UEI.5e9YPBZiNx_I-1752785319-1.0.1.1-xxVFdIk8z4ATntMrdYe5QTteO1ZSt.mXSBjSA2S8yuCiEN1KTapI_.wgLfMQXpTW6eY9AKKk5UpBBzg7sQ5wT2nULiGNV02mTa1R7rlo5EY',
          'origin': 'https://x.com',
          'referer': 'https://x.com/',
          'sec-ch-ua': '"Chromium";v="137", "Not/A)Brand";v="24"',
          'sec-ch-ua-mobile': '?1',
          'sec-ch-ua-platform': '"Android"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-site',
          'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
          'x-client-transaction-id': 'IbLXMgWQNf+TM0Y2E40xszXhUoZXzBc20DODlmkkfU/+5K/yEeA0dPOr7UiZ7eH0r5vfCCVrvC69QBzz+Ac3mVAiutO/Ig',
          'x-csrf-token': '54e46ea2226ade219df0b810812a057d8c8c2d5ea46ff17c9519f47fe696aab9e8d4b5c1fd78953e19181aabf46e132544e3891431196f500b762e7313dd059bf9ae08c1aaf8050a26a3374ecfaec2ef',
          'x-twitter-active-user': 'yes',
          'x-twitter-auth-type': 'OAuth2Session',
          'x-xai-request-id': '9fcff1e5-396b-41d0-9c27-d006ad8d079a',
          'x-xp-forwarded-for': '5db1fafe5bf1ec82a33320d6a68b112b2929b8286f50028ac56da5a7cdb782229e918e5510756a0aa4f8b555964801794252df907f4f2c694c10426c76571493621b8ccfdff53b0ea5d902efd043c790e878895eb8b1012c4266b04f0e5036262f6dce6961611e9e706fb92a6212cb70d0d50def2b0ab7a2367a3bd969f6ba819720dcf81f8fd51fded99073eb1b80b83431c81a439b4053f24475be93a672a9f45445d833488b125b482db37b7bb560a6ba99c63e401eed396327c478ac3af5a3f06721fcab5895ee52e2f23a9e037e6ce5600d8051489aa964014d6cf346585b5f8b8cf4fe7b0ec34ef5e7e71aaf6469c759cecd626d456166'
        }
      }
    );


    const messages = grokRes.data.split("\n").map(line => {
    try {
      const obj = JSON.parse(line);
      if (obj?.result?.sender === "ASSISTANT" && obj.result?.message) {
        return obj.result.message;
      }
    } catch (e) {}
    return null;
  })
  .filter(Boolean);

const fullMessage = messages.join('');


  const imageUrls = grokRes.data
  .split('\n')
  .map(line => {
    try {;
      const obj = JSON.parse(line);
      const update = obj?.result?.event?.imageAttachmentUpdate;
      if (update?.progress === 100 && update?.imageUrl) {
        return update.imageUrl;
      }
    } catch (e) {}
    return null;
  })
  .filter(Boolean);

  grokHistory[uid].push({ message: fullMessage, sender: 2, fileAttachments: [{}] });
  const images = [];
    if (Array.isArray(imageUrls) && imageUrls.length > 0) {
      for (let i = 0; i < imageUrls.length; i++) {
        const imgData = await grokStream(imageUrls[i]);
        const filename = fileName(".jpg");
        const up = await upload(imgData, filename);
        images.push(up);
      }
    }
    

    return { response: fullMessage, images: images };
  } catch (e) {
   throw new Error(e);
  }
};





module.exports = {
  smsboomber,
  edit,
  editpro,
  upscale_2,
  imgur,
  dalle_3,
  imagine,
  imagine_2,
  art,
  img2img,
  text2song,
  swap,
  tools,
  removebg,
  alldl,
  prompt,
  prompt_2,
  gpt,
  flux,
  changebg,
  flag,
  font,
  quiz,
  album,
  permission,
  xnxx,
  yt,
  tiktokVideo,
  grok
};
