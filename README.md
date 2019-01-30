<p align="center"><img align="center" style="width:320px" src="http://www.uwyo.edu/reslife-dining/_files/re-design-images/dining-logos/rendezvouslogo_2016.png"/></p><br/>
<p align="center">
  <a href="https://circleci.com/gh/nuxt/nuxt.js"><img src="https://badgen.net/circleci/github/nuxt/nuxt.js/dev" alt="Build Status"></a>
  <a href="https://dev.azure.com/nuxt/nuxt.js/_build/latest?definitionId=1"><img src="https://dev.azure.com/nuxt/nuxt.js/_apis/build/status/nuxt.js" alt="Azure Build Status"></a>
  <a href="https://codecov.io/gh/nuxt/nuxt.js"><img src="https://badgen.net/codecov/c/github/nuxt/nuxt.js/dev" alt="Coverage Status"></a>
  <a href="https://www.npmjs.com/package/nuxt"><img src="https://badgen.net/npm/dm/nuxt" alt="Downloads"></a>
  <a href="https://www.npmjs.com/package/nuxt"><img src="https://badgen.net/npm/v/nuxt" alt="Version"></a>
  <a href="https://www.npmjs.com/package/nuxt"><img src="https://badgen.net/npm/license/nuxt" alt="License"></a>
  <a href="https://discord.nuxtjs.org/"><img src="https://badgen.net/badge/Discord/join-us/7289DA" alt="Discord"></a>
 </p>
 <p align="center">
  <a href="#partners" alt="Partner on Open Collective"><img src="https://opencollective.com/nuxtjs/tiers/partner/badge.svg" /></a>
  <a href="#sponsors" alt="Sponsors on Open Collective"><img src="https://opencollective.com/nuxtjs/tiers/sponsors/badge.svg" /></a>
  <a href="#backers" alt="Backers on Open Collective"><img src="https://opencollective.com/nuxtjs/tiers/backers/badge.svg" /></a>
  <a href="https://oc.nuxtjs.org/"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
</p>
<p align="center">
  <a href="https://otechie.com/nuxt?ref=badge"><img src="https://api.otechie.com/consultancy/nuxt/badge.svg" alt="Hire Nuxt"></a>
</p>

> 인증과 사용자권한 기능이 구현된 Nuxt.js 기반의 상용구 코드.

## Nuxt Links

- 📘 Documentation: [https://nuxtjs.org](https://nuxtjs.org)
- 👥 Community: [cmty.app/nuxt](https://cmty.app/nuxt)
- 🎬 Video: [1 minute demo](https://www.youtube.com/watch?v=kmf-p-pTi40)
- 🐦 Twitter: [@nuxt_js](https://twitter.nuxtjs.org/)
- 💬 Chat: [Discord](https://discord.nuxtjs.org/)
- 📦 [Nuxt.js Modules](https://github.com/nuxt-community/modules)
- 👉 [Play with Nuxt.js online](https://template.nuxtjs.org)

## Features

- Nuxt.js 기반( SSR, Module, Plugin, Middleware, Custom Layout, Static file serving ...)
- Node Application Server([Express](https://expressjs.com/))
- Query language for APIs([Graphql](https://graphql.org/), [Apollo](https://www.apollographql.com/))
- NoSQL Database([MongoDB](https://www.mongodb.com/))
- Material CSS Framework([vuetify](https://www.npmjs.com/package/vue-kindergarten))
- 토큰 기반 사용자 인증([Jwt](https://jwt.io/))
- 사용자/그룹 권한 관리([vue-kindergarten](https://www.npmjs.com/package/vue-kindergarten))
- 소셜 인증([Passport](http://www.passportjs.org/))
- 화면: 홈, 회원가입/로그인, 프로필, 어드민

## 설치

```
$ git clone https://github.com/she110ff/nuxt-vuetify-graphql-mongoDB.git
$ cd nuxt-vuetify-graphql-mongoDB
$ npm install
```

## 시작하기

```
$ npm run dev(or start)
```

## 테스트

```
$ npm test
```

참 쉽죠!

## nuxt.config.js 설정

```js
const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin')
const pkg = require('./package')

module.exports = {
  mode: 'universal',

  /*
  ** Headers of the page
  */
  head: {
    title: pkg.name,
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: pkg.description }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      {
        rel: 'stylesheet',
        href:
          'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons'
      }
    ]
  },

  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#fff' },

  /*
  ** Global CSS
  */
  css: ['~/assets/style/app.styl'],

  /*
  ** Plugins to load before mounting the App
  */
  plugins: ['@plugins/vuetify'],

  /*
  ** Nuxt.js modules
  */
  modules: [
    '@nuxtjs/pwa',
    [
      '@nuxtjs/apollo',
      {
        clientConfigs: {
          default: '~/graphql/apollo/defaultClient.js'
        }
      }
    ]
  ],

  router: {
    middleware: 'check-auth'
  },

  vendor: ['apollo-link-context'],
  /*
  ** Build configuration
  */
  build: {
    transpile: ['vuetify/lib'],
    plugins: [new VuetifyLoaderPlugin()],
    loaders: {
      stylus: {
        import: ['~assets/style/variables.styl']
      }
    },

    /*
    ** You can extend webpack config here
    */
    extend(config, ctx) {
      // Run ESLint on save
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    }
  }
}

```

Learn more: https://nuxtjs.org/guide/configuration


## .babelrc

You might want to use your own server with your configurations, your API and everything awesome your created with. That's why you can use nuxt.js as a middleware. It's recommended to use it at the end of your middleware since it will handle the rendering of your web application and won't call next().

```json
{
  "env": {
    "test": {
      "presets": [
        [
          "@babel/preset-env",
          {
            "targets": {
              "node": "current"
            }
          }
        ],
        "@nuxt/babel-preset-app"
      ]
    }
  },
  "plugins": ["babel-plugin-transform-runtime", "transform-async-to-generator"]
}

```

Learn more: https://babeljs.io/docs/en/config-files#root-babelconfigjs-files


## 데모 사이트

 https://nuxtjs.org/examples


## 배포하기

실행이 아닌 배포를 위해, 먼저 빌드를 실행해야 합니다. 따라서 빌드와 실행을 구분하여 스크립트를 작성하세요.

```bash
nuxt build
nuxt start
```

예를 들어,  [`now`](https://zeit.co/now)에 배포하기 위해서 `package.json`을 아래와 같이 사용하기를 권장합니다:
```json
{
  "name": "my-app",
  "dependencies": {
    "nuxt": "latest"
  },
  "scripts": {
    "dev": "nuxt",
    "build": "nuxt build",
    "start": "nuxt start"
  }
}
```
그 다음 `now` 그리고 즐겁게 놀아보세요!

노트:  `.nuxt` 를 `.npmignore` or `.gitignore` 에 추가하기를 권장합니다.

## Core team

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
| [<img src="https://avatars2.githubusercontent.com/u/904724?v=4" width="120px;"/><br /><sub><b>Sébastien Chopin</b></sub>](https://github.com/atinux)<br />[📝](#blog-Atinux "Blogposts") [🐛](https://github.com/Atinux/Nuxt.js/issues?q=author%3AAtinux "Bug reports") [💻](https://github.com/Atinux/Nuxt.js/commits?author=Atinux "Code") [🎨](#design-Atinux "Design") [📖](https://github.com/Atinux/Nuxt.js/commits?author=Atinux "Documentation") [💬](#question-Atinux "Answering Questions") [👀](#review-Atinux "Reviewed Pull Requests") [📢](#talk-Atinux "Talks") |
<!-- ALL-CONTRIBUTORS-LIST:END -->

## License

[MIT](https://github.com/nuxt/nuxt.js/blob/dev/LICENSE)
